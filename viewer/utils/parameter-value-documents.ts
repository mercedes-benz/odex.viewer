// SPDX-License-Identifier: AGPL-3.0-only
import {
  DataObjectPropertyResolved,
  DopBase,
  ParameterUnionType,
  Request,
  Response,
  isBasicStructureDop,
  isDataObjectPropertyDop,
  isDtcDop,
  isEndOfPduFieldDop,
  isEnvironmentDataDescriptionDop,
  isFieldDop,
  isMultiplexerDop,
  isStaticFieldDop,
  isValueParameterType,
} from '@/api/api-hooks'
import {
  getParameterValueInputSpec,
  validateParameterValue,
} from '@/utils/utils'

export type PhysicalValues = Record<string, unknown>
export type ParameterGuidance = {
  dop_name?: string
  dop_type?: string
  json_type: 'integer' | 'number' | 'string' | 'boolean' | 'object' | 'array'
  unit?: string
  required?: boolean
  default_value?: unknown
  examples?: unknown[]
  allowed_values?: unknown[]
  choices?: { value: string; label: string }[]
  known_values?: { value: number; display_code?: string; label?: string }[]
  minimum?: number
  maximum?: number
  exclusive_minimum?: boolean
  exclusive_maximum?: boolean
  step?: number | 'any'
  restricted_ranges?: unknown[]
  format?: string
  min_bytes?: number
  max_bytes?: number
  min_items?: number
  max_items?: number
  cases?: string[]
  selected_case?: string
  variants?: string[]
}
export type ParameterValueDocument = {
  parameter_values: PhysicalValues
  request_parameter_values?: PhysicalValues
  document_kind?: 'decoded-output'
  required_parameters?: string[]
  parameter_guidance?: Record<string, ParameterGuidance>
}
export type ParameterDocumentReview = {
  document: ParameterValueDocument
  errors: string[]
  warnings: string[]
}
export type ParameterDocumentChange = {
  path: string
  before: unknown
  after: unknown
}
export type PreparedParameterImport = ParameterDocumentReview & {
  changes: ParameterDocumentChange[]
  apply: () => void
}
export type ParameterImportMode = 'replace' | 'merge'
type LoadDop = (id: number) => Promise<DopBase | undefined>
type Context = {
  loadDop: LoadDop
  errors: string[]
  warnings: string[]
  required: string[]
  template: boolean
  decoded: boolean
  guidance: Record<string, ParameterGuidance>
}

function scalarGuidance(
  dop: DataObjectPropertyResolved,
  value: unknown
): ParameterGuidance {
  const spec = getParameterValueInputSpec(dop)
  const base: ParameterGuidance = {
    dop_name: dop.short_name,
    dop_type: dop.class_name,
    json_type: 'string',
    unit: dop.unit?.display_name ?? dop.unit?.short_name,
    required: value === undefined,
    ...(value === undefined ? {} : { default_value: value }),
  }

  if (spec?.kind === 'select') {
    return {
      ...base,
      allowed_values: spec.options.map((option) => option.value),
      choices: spec.options.map(({ value, label }) => ({ value, label })),
      examples: spec.options.slice(0, 1).map((option) => option.value),
    }
  }
  if (spec?.kind === 'boolean')
    return {
      ...base,
      json_type: 'boolean',
      allowed_values: [true, false],
      examples: [false],
    }
  if (spec?.kind === 'number') {
    const increment = typeof spec.step === 'number' ? spec.step : 1
    const lower = spec.min
      ? spec.isInteger
        ? Math.floor(spec.min.value) +
          (spec.min.exclusive || !Number.isInteger(spec.min.value) ? 1 : 0)
        : spec.min.value +
          (spec.min.exclusive
            ? Math.max(increment, Math.abs(spec.min.value) * 1e-6)
            : 0)
      : 0
    const candidates = [
      value,
      0,
      1,
      lower,
      ...spec.restrictedRanges.flatMap((range) =>
        range.upper ? [range.upper.value + increment] : []
      ),
      spec.max?.value,
    ]
    const examples = candidates
      .filter(
        (candidate): candidate is number =>
          typeof candidate === 'number' &&
          Number.isFinite(candidate) &&
          validateParameterValue(spec, String(candidate)) === undefined
      )
      .slice(0, 1)

    return {
      ...base,
      json_type: spec.isInteger ? 'integer' : 'number',
      minimum: spec.min?.value,
      maximum: spec.max?.value,
      exclusive_minimum: spec.min?.exclusive,
      exclusive_maximum: spec.max?.exclusive,
      step: spec.step,
      restricted_ranges: spec.restrictedRanges.length
        ? spec.restrictedRanges
        : undefined,
      examples: examples.length ? examples : undefined,
    }
  }
  if (spec?.kind === 'text') {
    const length = Math.max(
      0,
      Math.min(64, spec.maxBytes ?? 64, Math.max(spec.minBytes ?? 0, 2))
    )
    const example =
      spec.dataType === 'A_BYTEFIELD'
        ? Array.from({ length }, () => '00').join(' ')
        : 'A'.repeat(
            spec.dataType === 'A_UNICODE2STRING'
              ? Math.ceil(length / 2)
              : length
          )

    return {
      ...base,
      format:
        spec.dataType === 'A_BYTEFIELD'
          ? 'Complete hexadecimal byte pairs, for example "0A FF"; no 0x prefix.'
          : spec.dataType,
      min_bytes: spec.minBytes,
      max_bytes: spec.maxBytes,
      examples:
        validateParameterValue(spec, example) === undefined &&
        (spec.maxBytes === undefined || length <= spec.maxBytes)
          ? [example]
          : undefined,
    }
  }

  return base
}

function templateGuidance(dop: DopBase, value: unknown): ParameterGuidance {
  const base: ParameterGuidance = {
    dop_name: dop.short_name,
    dop_type: dop.class_name,
    json_type: 'object',
  }

  if (isDtcDop(dop)) {
    const guidance = scalarGuidance(dop as DataObjectPropertyResolved, value)
    const known = (dop.dtcs ?? []).flatMap((dtc) =>
      dtc.trouble_code === undefined
        ? []
        : [
            {
              value: dtc.trouble_code,
              display_code: dtc.display_trouble_code,
              label: dtc.text?.text ?? dtc.short_name,
            },
          ]
    )
    const spec = getParameterValueInputSpec(dop as DataObjectPropertyResolved)
    const example = known.find(
      (entry) =>
        !spec || validateParameterValue(spec, String(entry.value)) === undefined
    )

    return {
      ...guidance,
      json_type: 'integer',
      known_values: known,
      examples: example ? [example.value] : guidance.examples,
    }
  }
  if (isDataObjectPropertyDop(dop))
    return scalarGuidance(dop as DataObjectPropertyResolved, value)
  if (isFieldDop(dop)) {
    const fixed = isStaticFieldDop(dop) ? dop.fixed_number_of_items : undefined

    return {
      ...base,
      json_type: 'array',
      min_items:
        fixed ??
        (isEndOfPduFieldDop(dop) ? dop.min_number_of_items : undefined) ??
        0,
      max_items:
        fixed ??
        (isEndOfPduFieldDop(dop) ? dop.max_number_of_items : undefined),
      format:
        'Array of physical item values. The template includes an example item where permitted; repeat or remove items within the item-count limits.',
    }
  }
  if (isMultiplexerDop(dop)) {
    const cases = [
      ...(dop.cases ?? []),
      ...(dop.default_case ? [dop.default_case] : []),
    ]
      .map((item) => item.short_name)
      .filter((name): name is string => name !== undefined)

    return {
      ...base,
      json_type: 'array',
      format: '[case short name, physical values for that case]',
      cases,
      selected_case: cases[0],
    }
  }
  if (isEnvironmentDataDescriptionDop(dop)) {
    return {
      ...base,
      variants: [
        ...(dop.env_datas ?? []).map((item) => item.short_name),
        ...(dop.env_data_refs ?? []).map(
          (reference) => reference.resolved_object_short_name
        ),
      ].filter((name): name is string => name !== undefined),
      format:
        'Object containing physical values for exactly one editable environment-data variant.',
    }
  }

  return base
}

export function isValueObject(value: unknown): value is PhysicalValues {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function mergePhysicalValues(
  current: PhysicalValues,
  incoming: PhysicalValues
): PhysicalValues {
  const merged = { ...current }

  for (const [key, value] of Object.entries(incoming)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype')
      continue
    const previous = merged[key]

    merged[key] =
      isValueObject(previous) && isValueObject(value)
        ? mergePhysicalValues(previous, value)
        : value
  }

  return merged
}

async function requireDop(
  id: number | undefined,
  path: string,
  context: Context
) {
  const dop = id === undefined ? undefined : await context.loadDop(id)

  if (!dop) context.errors.push(`${path}: DOP definition is unavailable.`)

  return dop
}

async function visitParameters(
  parameters: ParameterUnionType[],
  values: unknown,
  path: string,
  context: Context,
  depth: number
): Promise<PhysicalValues> {
  const result: PhysicalValues = {}

  if (!isValueObject(values)) {
    context.errors.push(`${path}: expected an object.`)

    return result
  }
  const definitions = new Map(
    parameters.map((parameter) => [parameter.short_name, parameter])
  )

  for (const key of Object.keys(values)) {
    if (!definitions.has(key))
      context.errors.push(`${path}.${key}: unknown parameter.`)
  }
  for (const parameter of parameters) {
    const name = parameter.short_name

    if (!name) continue
    const fullPath = `${path}.${name}`
    const provided = Object.hasOwn(values, name)

    if (!isValueParameterType(parameter)) {
      if (provided) {
        const message = `${fullPath}: constant, derived, or non-editable parameter.`

        if (context.decoded) context.warnings.push(message)
        else context.errors.push(message)
      }
      continue
    }
    if (!provided && !context.template) continue
    const dop = await requireDop(
      parameter.dop_ref?.resolved_object_ephemeral_id,
      fullPath,
      context
    )

    if (!dop) continue
    let value = values[name]

    if (
      context.template &&
      !provided &&
      parameter.physical_default_value !== undefined &&
      parameter.physical_default_value !== null
    ) {
      const spec = isDataObjectPropertyDop(dop)
        ? getParameterValueInputSpec(dop)
        : undefined

      value =
        spec?.kind === 'number' || isDtcDop(dop)
          ? Number(parameter.physical_default_value)
          : parameter.physical_default_value
    }
    result[name] = await visitDop(dop, value, fullPath, context, depth + 1)
  }

  return result
}

async function visitDop(
  dop: DopBase,
  value: unknown,
  path: string,
  context: Context,
  depth: number
): Promise<unknown> {
  if (depth > 32) {
    context.errors.push(
      `${path}: recursive parameter definition exceeds 32 levels.`
    )

    return null
  }
  if (context.template && !Object.hasOwn(context.guidance, path))
    context.guidance[path] = templateGuidance(dop, value)
  if (isDtcDop(dop) || isDataObjectPropertyDop(dop)) {
    if (context.template && value === undefined) {
      context.required.push(path)

      return null
    }
    const spec = getParameterValueInputSpec(dop as DataObjectPropertyResolved)
    let issue: string | undefined

    if (value === null || value === undefined)
      issue = 'a physical value is required; null is a template placeholder.'
    else if (isDtcDop(dop)) {
      if (
        typeof value !== 'number' ||
        !Number.isSafeInteger(value) ||
        value < 0
      )
        issue = 'expected a nonnegative integer DTC code.'
      else if (spec) issue = validateParameterValue(spec, String(value))
    } else if (!spec) issue = 'this DOP has no editable physical value.'
    else if (spec.kind === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value))
        issue = 'expected a JSON number.'
      else issue = validateParameterValue(spec, String(value))
    } else if (spec.kind === 'boolean') {
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false')
        issue = 'expected true or false.'
    } else if (typeof value !== 'string') issue = 'expected a JSON string.'
    else if (
      spec.kind === 'select' &&
      !spec.options.some((option) => option.value === value)
    )
      issue = 'select one of the defined physical values.'
    else if (spec.kind === 'text' && value === '' && (spec.minBytes ?? 0) > 0)
      issue = `value requires at least ${spec.minBytes} bytes.`
    else if (
      spec.kind === 'text' &&
      spec.dataType === 'A_BYTEFIELD' &&
      !/^[ \t\r\n]*(?:[0-9a-fA-F]{2}[ \t\r\n]*)*$/.test(value)
    )
      issue = 'expected complete hexadecimal byte pairs.'
    else issue = validateParameterValue(spec, value)
    if (issue) context.errors.push(`${path}: ${issue}`)

    return value
  }
  if (isBasicStructureDop(dop)) {
    return visitParameters(
      (dop.parameters ?? []) as ParameterUnionType[],
      context.template && value === undefined ? {} : value,
      path,
      context,
      depth
    )
  }
  if (isFieldDop(dop)) {
    const fixed = isStaticFieldDop(dop) ? dop.fixed_number_of_items : undefined
    const minimum =
      fixed ??
      (isEndOfPduFieldDop(dop) ? dop.min_number_of_items : undefined) ??
      0
    const maximum =
      fixed ?? (isEndOfPduFieldDop(dop) ? dop.max_number_of_items : undefined)
    const items =
      context.template && value === undefined
        ? Array.from({
            length:
              fixed ?? Math.min(maximum ?? Infinity, Math.max(1, minimum)),
          })
        : value

    if (!Array.isArray(items)) {
      context.errors.push(`${path}: expected an array of field items.`)

      return []
    }
    if (
      items.length < minimum ||
      (maximum !== undefined && items.length > maximum)
    )
      context.errors.push(
        `${path}: expected ${fixed === undefined ? `${minimum} to ${maximum ?? 'unlimited'}` : fixed} items.`
      )
    const item = await requireDop(
      (dop.structure_ref ?? dop.env_data_desc_ref)
        ?.resolved_object_ephemeral_id,
      path,
      context
    )

    return item
      ? Promise.all(
          items.map((entry, index) =>
            visitDop(item, entry, `${path}[${index}]`, context, depth + 1)
          )
        )
      : []
  }
  if (isMultiplexerDop(dop)) {
    const pair =
      context.template && value === undefined
        ? [
            dop.cases?.[0]?.short_name ?? dop.default_case?.short_name,
            undefined,
          ]
        : value

    if (
      !Array.isArray(pair) ||
      pair.length !== 2 ||
      typeof pair[0] !== 'string'
    ) {
      context.errors.push(
        `${path}: expected [case short name, physical values].`
      )

      return null
    }
    const selected =
      dop.cases?.find((item) => item.short_name === pair[0]) ??
      (dop.default_case?.short_name === pair[0] ? dop.default_case : undefined)

    if (!selected) {
      context.errors.push(`${path}[0]: unknown multiplexer case '${pair[0]}'.`)

      return null
    }
    const id = selected.structure_ref?.resolved_object_ephemeral_id

    if (id === undefined) {
      if (
        pair[1] !== undefined &&
        (!isValueObject(pair[1]) || Object.keys(pair[1]).length)
      )
        context.errors.push(`${path}[1]: the selected case has no fields.`)

      return [pair[0], {}]
    }
    const structure = await requireDop(id, path, context)

    return [
      pair[0],
      structure
        ? await visitDop(
            structure,
            pair[1],
            `${path}.${pair[0]}`,
            context,
            depth + 1
          )
        : {},
    ]
  }
  if (isEnvironmentDataDescriptionDop(dop)) {
    const candidates: DopBase[] = [...(dop.env_datas ?? [])]

    for (const reference of dop.env_data_refs ?? []) {
      const candidate = await requireDop(
        reference.resolved_object_ephemeral_id,
        path,
        context
      )

      if (candidate) candidates.push(candidate)
    }
    const matches = context.template
      ? candidates.slice(0, 1)
      : candidates.filter(
          (candidate) =>
            isBasicStructureDop(candidate) &&
            isValueObject(value) &&
            Object.keys(value).every((key) =>
              candidate.parameters?.some(
                (parameter) => parameter.short_name === key
              )
            )
        )

    const selected = matches.length === 1 ? matches[0] : undefined

    if (!selected) {
      context.errors.push(
        `${path}: values must identify exactly one editable environment-data variant.`
      )

      return null
    }

    return visitDop(selected, value, path, context, depth + 1)
  }
  context.errors.push(`${path}: DOP type '${dop.class_name}' is not editable.`)

  return null
}

export async function reviewParameterDocument(
  input: unknown,
  message: Request | Response,
  triggeringRequest: Request | undefined,
  loadDop: LoadDop,
  template = false
): Promise<ParameterDocumentReview> {
  const context: Context = {
    loadDop,
    errors: [],
    warnings: [],
    required: [],
    template,
    decoded: false,
    guidance: {},
  }
  const empty: ParameterValueDocument = { parameter_values: {} }

  if (!isValueObject(input))
    return {
      document: empty,
      errors: ['The JSON document must be an object.'],
      warnings: [],
    }
  const allowed = new Set([
    'parameter_values',
    'request_parameter_values',
    'document_kind',
    'required_parameters',
    'parameter_guidance',
  ])

  for (const key of Object.keys(input)) {
    if (!allowed.has(key))
      context.errors.push(`${key}: unknown document field.`)
  }
  if (
    input.document_kind !== undefined &&
    input.document_kind !== 'decoded-output'
  )
    context.errors.push('document_kind: expected decoded-output or no marker.')
  context.decoded = input.document_kind === 'decoded-output'
  if (!triggeringRequest && input.request_parameter_values !== undefined)
    context.errors.push(
      'request_parameter_values must be omitted for a request message.'
    )
  const document: ParameterValueDocument = {
    parameter_values: await visitParameters(
      (message.parameters ?? []) as ParameterUnionType[],
      template ? {} : input.parameter_values,
      'parameter_values',
      context,
      0
    ),
  }

  if (
    triggeringRequest &&
    (template || input.request_parameter_values !== undefined)
  ) {
    document.request_parameter_values = await visitParameters(
      (triggeringRequest.parameters ?? []) as ParameterUnionType[],
      template ? {} : input.request_parameter_values,
      'request_parameter_values',
      context,
      0
    )
  }
  if (template) {
    document.required_parameters = context.required
    document.parameter_guidance = context.guidance
  }

  return { document, errors: context.errors, warnings: context.warnings }
}

export function downloadParameterDocument(filename: string, document: unknown) {
  const url = URL.createObjectURL(
    new Blob([`${JSON.stringify(document, null, 2)}\n`], {
      type: 'application/json',
    })
  )
  const link = window.document.createElement('a')

  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function parameterDocumentChanges(
  before: unknown,
  after: unknown,
  path = ''
): ParameterDocumentChange[] {
  if (JSON.stringify(before) === JSON.stringify(after)) return []
  if (isValueObject(before) && isValueObject(after)) {
    return Array.from(
      new Set([...Object.keys(before), ...Object.keys(after)])
    ).flatMap((key) =>
      parameterDocumentChanges(
        before[key],
        after[key],
        path ? `${path}.${key}` : key
      )
    )
  }
  if (Array.isArray(before) && Array.isArray(after)) {
    return Array.from(
      { length: Math.max(before.length, after.length) },
      (_, index) =>
        parameterDocumentChanges(
          before[index],
          after[index],
          `${path}[${index}]`
        )
    ).flat()
  }

  return [{ path, before, after }]
}
