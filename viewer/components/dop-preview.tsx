'use client'

import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Link } from '@heroui/link'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import client, {
  DataObjectPropertyResolved,
  DopBase,
  DtcDop,
  EnvironmentData,
  EnvironmentDataDescription,
  Field,
  isBasicStructureDop,
  isCodedConstParameterType,
  isComplexDop,
  isDataObjectPropertyDop,
  isDtcDop,
  isEnvironmentDataDescriptionDop,
  isEndOfPduFieldDop,
  isFieldDop,
  isLengthKeyParameterType,
  isNrcConstParameterType,
  isParameterTypeWithDopRef,
  isPhysicalConstantParameterType,
  isMultiplexerDop,
  isReservedParameter,
  isStaticFieldDop,
  isStructureDop,
  isValueParameterType,
  Multiplexer,
  MultiplexerCase,
  OdxLinkRef,
  OdxSchemaName,
  ParameterUnionType,
} from '@/api/api-hooks'
import {
  DescriptionComponent,
  OdxLinkPopoverComponent,
} from '@/components/commons'
import { ChevronDownIcon } from '@/components/icons'
import {
  describeParameterValueInputSpec,
  getHexRepresentation,
  getParameterValueInputSpec,
  validateParameterValue,
} from '@/utils/utils'

export type AtomicParameterValue = string | boolean

export type ParameterValueStore = {
  getValue: (path: string) => AtomicParameterValue | undefined
  setValue: (path: string, value: AtomicParameterValue) => void
  subscribe: (listener: () => void) => () => void
  loadDop: (ephemeralId: number) => Promise<DopBase | undefined>
}

function useParameterValue(path: string): AtomicParameterValue | undefined {
  const store = useParameterValueStore()

  return React.useSyncExternalStore(
    store.subscribe,
    () => store.getValue(path),
    () => store.getValue(path)
  )
}

type ValueTreePosition = {
  path: string
  ancestorDopIds: number[]
  depth: number
}

export const ParameterValueStoreContext = React.createContext<
  ParameterValueStore | undefined
>(undefined)

function useParameterValueStore(): ParameterValueStore {
  const store = React.useContext(ParameterValueStoreContext)

  if (store === undefined) {
    throw new Error('ParameterValueStoreContext provider is missing')
  }

  return store
}

// 'structure' renders the tree read-only, listing all fields, cases and variants
type ValueTreeMode = 'edit' | 'structure'

const ValueTreeModeContext = React.createContext<ValueTreeMode>('edit')

export function DopRefPopover({
  dopRef,
  href,
}: {
  dopRef: OdxLinkRef
  href: string
}) {
  const dopEphemeralId = dopRef.resolved_object_ephemeral_id

  if (dopEphemeralId === undefined) {
    return (
      <OdxLinkPopoverComponent href={href} label="Show DOP" odxLink={dopRef} />
    )
  }

  return (
    <DopRefPopoverWithPreview
      dopEphemeralId={dopEphemeralId}
      dopRef={dopRef}
      href={href}
    />
  )
}

function DopRefPopoverWithPreview({
  dopRef,
  href,
  dopEphemeralId,
}: {
  dopRef: OdxLinkRef
  href: string
  dopEphemeralId: number
}) {
  // Shares the table's DOP cache, so the VALUE column usually has it loaded already
  const { dop } = useDop(dopEphemeralId)

  return (
    <OdxLinkPopoverComponent href={href} label="Show DOP" odxLink={dopRef}>
      {dop !== undefined &&
      (isComplexDop(dop) || isDataObjectPropertyDop(dop) || isDtcDop(dop)) ? (
        <DopCompactPreview dopEphemeralId={dopEphemeralId} />
      ) : undefined}
    </OdxLinkPopoverComponent>
  )
}

export function DopStructureSummary({
  dopEphemeralId,
}: {
  dopEphemeralId: number
}) {
  const dopCache = React.useRef(new Map<number, Promise<DopBase | undefined>>())
  const previewStore = React.useMemo<ParameterValueStore>(
    () => ({
      getValue: () => undefined,
      setValue: () => undefined,
      subscribe: () => () => undefined,
      loadDop: (ephemeralId) => {
        let pendingDop = dopCache.current.get(ephemeralId)

        if (pendingDop === undefined) {
          pendingDop = fetchDop(ephemeralId).catch(() => undefined)
          dopCache.current.set(ephemeralId, pendingDop)
        }

        return pendingDop
      },
    }),
    []
  )

  return (
    <section
      aria-label="DOP structure summary"
      className="flex w-full min-w-0 flex-col items-start gap-2 text-left"
    >
      <ParameterValueStoreContext.Provider value={previewStore}>
        <DopCompactPreview dopEphemeralId={dopEphemeralId} title={undefined} />
      </ParameterValueStoreContext.Provider>
    </section>
  )
}

function DopCompactPreview({
  dopEphemeralId,
  title = 'DOP Preview',
}: {
  dopEphemeralId: number
  title?: string
}) {
  const tableStore = useParameterValueStore()
  const { dop, isLoading } = useDop(dopEphemeralId)
  const previewStore = React.useMemo<ParameterValueStore>(() => {
    const previewState: Record<string, AtomicParameterValue> = {
      'preview#expanded': true,
    }
    const listeners = new Set<() => void>()

    return {
      getValue: (path) => previewState[path],
      setValue: (path, value) => {
        previewState[path] = value
        listeners.forEach((listener) => listener())
      },
      subscribe: (listener) => {
        listeners.add(listener)

        return () => listeners.delete(listener)
      },
      loadDop: tableStore.loadDop,
    }
  }, [tableStore])

  if (isLoading) {
    return <span className="text-xs text-default-500">Loading preview...</span>
  }
  if (dop === undefined) return null

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-2 text-left">
      {title ? <h4 className="text-sm font-bold">{title}</h4> : null}
      {isDataObjectPropertyDop(dop) ? (
        <DopLeafSummary dop={dop as DataObjectPropertyResolved} />
      ) : isDtcDop(dop) ? (
        <DtcDopPreview dop={dop} />
      ) : isComplexDop(dop) ? (
        <div className="w-full min-w-0 rounded-medium border border-default-200 bg-default-50 p-3 text-left dark:bg-default-100/5">
          <h5 className="mb-2 text-left text-sm font-semibold">
            Structure hierarchy
          </h5>
          <ParameterValueStoreContext.Provider value={previewStore}>
            <ValueTreeModeContext.Provider value="structure">
              <DopValueEditor
                ancestorDopIds={[]}
                depth={0}
                dopEphemeralId={dopEphemeralId}
                path="preview"
              />
            </ValueTreeModeContext.Provider>
          </ParameterValueStoreContext.Provider>
        </div>
      ) : null}
    </div>
  )
}

function DopLabel({
  dop,
  children,
}: {
  dop: DopBase
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const variantId = searchParams.get('variantId')
  const containerId = searchParams.get('containerId')

  if (!dop.perma_id || !variantId || !containerId) return <>{children}</>

  const query = new URLSearchParams({
    objectId: dop.perma_id,
    variantId,
    containerId,
  })

  return (
    <Link
      className="min-w-0 break-words text-sm"
      href={`/dops?${query}`}
      size="sm"
    >
      {children}
    </Link>
  )
}

function DopLeafSummary({ dop }: { dop: DataObjectPropertyResolved }) {
  const inputSpec = getParameterValueInputSpec(dop)
  const unit = dop.unit?.display_name ?? dop.unit?.short_name
  const dataType = dop.physical_type?.base_data_type

  return (
    <div className="grid min-w-0 grid-cols-[110px_minmax(0,_1fr)] gap-x-2 gap-y-1 text-sm">
      {dop.short_name ? (
        <>
          <p className="font-medium">DOP:</p>
          <p className="min-w-0 break-words">
            <DopLabel dop={dop}>{dop.short_name}</DopLabel>
          </p>
        </>
      ) : null}
      {dataType ? (
        <>
          <p className="font-medium">Physical type:</p>
          <p className="min-w-0 break-words">{dataType}</p>
        </>
      ) : null}
      {dop.compu_method?.category ? (
        <>
          <p className="font-medium">Compu method:</p>
          <p className="min-w-0 break-words">{dop.compu_method.category}</p>
        </>
      ) : null}
      {unit ? (
        <>
          <p className="font-medium">Unit:</p>
          <p className="min-w-0 break-words">{unit}</p>
        </>
      ) : null}
      {inputSpec ? (
        <>
          <p className="font-medium">Value guidance:</p>
          <div className="min-w-0 break-words">
            {inputSpec.kind === 'select' ? (
              <ul className="list-disc pl-4">
                {inputSpec.options.map((option) => (
                  <li key={`${option.value}-${option.internalValue ?? ''}`}>
                    {option.label}
                    {option.internalValue !== undefined
                      ? ` (${option.internalValue})`
                      : ''}
                  </li>
                ))}
              </ul>
            ) : inputSpec.kind === 'number' ? (
              <div className="flex flex-col gap-1">
                <p>
                  Allowed range:{' '}
                  {describeParameterValueInputSpec(inputSpec) ??
                    'not specified'}
                </p>
                <p>
                  {inputSpec.isInteger
                    ? 'Whole number values'
                    : `Step: ${inputSpec.step}`}
                </p>
                {inputSpec.restrictedRanges.map((range, index) => (
                  <p key={`${range.validity}-${range.label ?? index}`}>
                    {describeRestrictedValueRange(range)}
                  </p>
                ))}
              </div>
            ) : inputSpec.kind === 'boolean' ? (
              <p>True or false</p>
            ) : (
              <div className="flex flex-col gap-1">
                <p>
                  {inputSpec.dataType === 'A_BYTEFIELD'
                    ? 'Hex bytes, e.g. 0A FF'
                    : inputSpec.dataType === 'A_ASCIISTRING'
                      ? 'ASCII text'
                      : inputSpec.dataType === 'A_UTF8STRING'
                        ? 'UTF-8 text'
                        : inputSpec.dataType === 'A_UNICODE2STRING'
                          ? 'Unicode text'
                          : 'Text'}
                </p>
                {describeParameterValueInputSpec(inputSpec) ? (
                  <p>Length: {describeParameterValueInputSpec(inputSpec)}</p>
                ) : null}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

function DtcDopPreview({ dop }: { dop: DtcDop }) {
  const dtcs = dop.dtcs ?? []

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-2 text-sm">
      <p className="break-words font-medium">
        <DopLabel dop={dop}>{dop.short_name ?? 'DtcDop'}</DopLabel>:{' '}
        {dtcs.length} DTCs
      </p>
      {dtcs.length === 0 ? (
        <p>No DTCs defined</p>
      ) : (
        <div className="w-full min-w-0 max-w-full overflow-x-auto">
          <table
            aria-label={`DTCs in ${dop.short_name ?? 'DtcDop'}`}
            className="w-full table-fixed text-left text-sm"
          >
            <thead>
              <tr className="border-b border-default-200">
                <th className="break-words p-2 font-medium">Trouble code</th>
                <th className="break-words p-2 font-medium">Display code</th>
                <th className="break-words p-2 font-medium">Name</th>
                <th className="break-words p-2 font-medium">Text</th>
                <th className="break-words p-2 font-medium">Level</th>
                <th className="break-words p-2 font-medium">Temporary</th>
              </tr>
            </thead>
            <tbody>
              {dtcs.map((dtc, index) => (
                <tr
                  key={dtc.ephemeral_id ?? dtc.perma_id ?? index}
                  className="border-b border-default-200 align-top last:border-b-0"
                >
                  <td className="break-words p-2">
                    {dtc.trouble_code !== undefined
                      ? `${dtc.trouble_code} [${getHexRepresentation(dtc.trouble_code) || '0x0'}]`
                      : 'Not specified'}
                  </td>
                  <td className="break-words p-2">
                    {dtc.display_trouble_code}
                  </td>
                  <td className="break-words p-2">
                    <p className="break-words font-medium">{dtc.short_name}</p>
                    {dtc.long_name ? <p>{dtc.long_name}</p> : null}
                  </td>
                  <td className="break-words p-2">
                    <p>{dtc.text?.text}</p>
                    <DescriptionComponent
                      description={dtc.description}
                      initialState="uncollapsed"
                    />
                  </td>
                  <td className="break-words p-2">{dtc.level}</td>
                  <td className="break-words p-2">
                    {dtc.is_temporary === undefined
                      ? 'Not specified'
                      : dtc.is_temporary
                        ? 'Yes'
                        : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function DtcDopValueInput({ dop, path }: { dop: DtcDop; path: string }) {
  const store = useParameterValueStore()
  const value = useParameterValue(path) ?? ''
  const selectableDtcs = (dop.dtcs ?? []).filter(
    (dtc) => dtc.trouble_code !== undefined
  )

  return (
    <select
      aria-label={`DTC for ${dop.short_name ?? 'parameter'}`}
      className={VALUE_SELECT_CLASS_NAME}
      disabled={selectableDtcs.length === 0}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => {
        store.setValue(path, event.target.value)
      }}
    >
      <option value="">
        {selectableDtcs.length === 0 ? 'No selectable DTCs' : 'Select DTC'}
      </option>
      {selectableDtcs.map((dtc, index) => (
        <option
          key={dtc.ephemeral_id ?? dtc.perma_id ?? index}
          value={dtc.trouble_code?.toString()}
        >
          {[
            dtc.display_trouble_code || dtc.short_name || dtc.long_name,
            dtc.text?.text,
          ]
            .filter((part) => part !== undefined && part !== '')
            .join(' - ')}
        </option>
      ))}
    </select>
  )
}

function describeRestrictedValueRange(range: {
  lower?: { value: number; exclusive: boolean }
  upper?: { value: number; exclusive: boolean }
  validity?: string
  label?: string
}) {
  const lower = range.lower
    ? `${range.lower.exclusive ? '(' : '['}${range.lower.value}`
    : '(-∞'
  const upper = range.upper
    ? `${range.upper.value}${range.upper.exclusive ? ')' : ']'}`
    : '∞)'

  return `Restricted range ${lower}, ${upper}: ${range.validity ?? 'restricted'}${range.label ? ` (${range.label})` : ''}`
}

const MAX_VALUE_TREE_DEPTH = 10

const VALUE_SELECT_CLASS_NAME =
  'min-w-36 rounded-medium border border-primary-400 bg-content1 px-2 py-1.5 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-200'

const COMPLEX_DOP_SCHEMAS: string[] = [
  'Structure',
  'EnvironmentData',
  'StaticField',
  'DynamicLengthField',
  'DynamicEndmarkerField',
  'EndOfPduField',
  'Multiplexer',
  'EnvironmentDataDescription',
]

export async function fetchDop(
  ephemeralId: number
): Promise<DopBase | undefined> {
  const metadata = await client.GET('/metadata/{ephemeral-id}', {
    params: {
      path: { 'ephemeral-id': ephemeralId },
      query: { resolve_main_diag_layer: false },
    },
  })
  const className = metadata.data?.class_name

  if (className === undefined) return undefined

  const schemaName: OdxSchemaName | undefined =
    className === 'DataObjectProperty'
      ? 'DataObjectPropertyResolved'
      : className === 'DtcDop'
        ? 'DtcDop'
        : COMPLEX_DOP_SCHEMAS.includes(className)
          ? (className as OdxSchemaName)
          : undefined

  if (schemaName === undefined) {
    return { class_name: className, short_name: metadata.data?.short_name }
  }

  const result = await client.GET(
    '/structured-data/{schema-name}/{ephemeral-id}',
    {
      params: {
        path: { 'schema-name': schemaName, 'ephemeral-id': ephemeralId },
      },
    }
  )

  return result.error ? undefined : (result.data as DopBase | undefined)
}

function useDop(dopEphemeralId: number) {
  const store = useParameterValueStore()
  const [state, setState] = React.useState<{
    dop?: DopBase
    isLoading: boolean
  }>({ isLoading: true })

  React.useEffect(() => {
    let isCurrent = true

    setState({ isLoading: true })
    store.loadDop(dopEphemeralId).then((dop) => {
      if (isCurrent) setState({ dop, isLoading: false })
    })

    return () => {
      isCurrent = false
    }
  }, [dopEphemeralId, store])

  return state
}

function ValueCellNote({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}) {
  return (
    <span className="text-xs text-default-400" title={title}>
      {children}
    </span>
  )
}

function FixedValue({ value }: { value: string | number | undefined }) {
  if (value === undefined || value === '') {
    return <ValueCellNote>Not editable</ValueCellNote>
  }

  return (
    <span className="text-sm" title="Constant value defined by the ODX data">
      {value} <span className="text-xs text-default-400">(fixed)</span>
    </span>
  )
}

function ValueTreeNode({
  label,
  dop,
  summary,
  stateKey,
  children,
}: {
  label: string
  dop?: DopBase
  summary?: string
  stateKey: string
  children: React.ReactNode
}) {
  const store = useParameterValueStore()
  const mode = React.useContext(ValueTreeModeContext)
  const expandedKey = `${stateKey}#expanded`
  const isExpanded = useParameterValue(expandedKey) === true

  const toggleExpanded = () => {
    store.setValue(expandedKey, !isExpanded)
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-1">
      {mode === 'structure' && dop?.perma_id ? (
        <div className="flex w-full min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-1 rounded-small border border-default-200 bg-content1 px-2 py-1.5 text-left text-sm text-foreground">
          <button
            aria-expanded={isExpanded}
            aria-label={`Toggle ${label}`}
            className="shrink-0"
            type="button"
            onClick={toggleExpanded}
          >
            <ChevronDownIcon
              className={clsx(
                'transition-transform',
                !isExpanded && '-rotate-90'
              )}
            />
          </button>
          <DopLabel dop={dop}>{label}</DopLabel>
          {summary ? (
            <span className="ml-auto min-w-0 max-w-full break-words text-left text-xs text-default-500">
              {summary}
            </span>
          ) : null}
        </div>
      ) : (
        <button
          aria-expanded={isExpanded}
          className={clsx(
            'flex min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-1 text-left text-sm',
            mode === 'structure'
              ? 'w-full rounded-small border border-default-200 bg-content1 px-2 py-1.5 text-foreground'
              : 'self-start rounded-small px-1 text-primary hover:bg-primary-50 dark:hover:bg-primary-950/30'
          )}
          type="button"
          onClick={toggleExpanded}
        >
          <ChevronDownIcon
            className={clsx(
              'transition-transform',
              !isExpanded && '-rotate-90'
            )}
          />
          <span className="min-w-0 break-words font-medium">{label}</span>
          {summary ? (
            <span className="ml-auto min-w-0 max-w-full break-words text-left text-xs text-default-500">
              {summary}
            </span>
          ) : null}
        </button>
      )}
      {isExpanded ? (
        <div
          className={clsx(
            'ml-2 flex min-w-0 max-w-full self-stretch flex-col gap-2 border-l-2 pl-3',
            mode === 'structure'
              ? 'border-primary-200 dark:border-primary-800'
              : 'border-default-200'
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function ParameterValueCell({
  parameter,
  ...position
}: { parameter: ParameterUnionType } & ValueTreePosition) {
  if (isCodedConstParameterType(parameter)) {
    return <FixedValue value={parameter.coded_value} />
  }
  if (isNrcConstParameterType(parameter)) {
    return <FixedValue value={parameter.coded_values?.join(', ')} />
  }
  if (isPhysicalConstantParameterType(parameter)) {
    return <FixedValue value={parameter.physical_constant_value} />
  }
  if (isReservedParameter(parameter)) {
    return <ValueCellNote>Reserved</ValueCellNote>
  }
  if (isLengthKeyParameterType(parameter)) {
    return (
      <ValueCellNote title="Derived from the length of the referencing parameter">
        Derived
      </ValueCellNote>
    )
  }
  if (isParameterTypeWithDopRef(parameter)) {
    const dopEphemeralId = parameter.dop_ref?.resolved_object_ephemeral_id

    if (dopEphemeralId !== undefined) {
      return (
        <DopValueEditor
          {...position}
          dopEphemeralId={dopEphemeralId}
          parameter={parameter}
        />
      )
    }
    if (parameter.dop_snref) {
      return <ValueCellNote>Unresolved DOP reference</ValueCellNote>
    }
  }

  return <ValueCellNote title="Value not editable">Not editable</ValueCellNote>
}

function DopValueEditor({
  dopEphemeralId,
  parameter,
  label,
  path,
  ancestorDopIds,
  depth,
}: {
  dopEphemeralId: number
  parameter?: ParameterUnionType
  label?: string
} & ValueTreePosition) {
  const { dop, isLoading } = useDop(dopEphemeralId)
  const mode = React.useContext(ValueTreeModeContext)

  if (isLoading) {
    return <span className="text-xs text-default-500">Checking type...</span>
  }

  if (dop === undefined) {
    return <ValueCellNote>Not editable</ValueCellNote>
  }

  if (isDtcDop(dop)) {
    return mode === 'structure' ? (
      <DtcDopPreview dop={dop} />
    ) : (
      <DtcDopValueInput dop={dop} path={path} />
    )
  }

  if (isDataObjectPropertyDop(dop) && mode === 'structure') {
    return <DopLeafSummary dop={dop as DataObjectPropertyResolved} />
  }

  if (isDataObjectPropertyDop(dop)) {
    return (
      <AtomicParameterValueInput
        defaultValue={
          parameter && isValueParameterType(parameter)
            ? parameter.physical_default_value?.toString()
            : undefined
        }
        dop={dop as DataObjectPropertyResolved}
        label={parameter?.short_name ?? label ?? 'parameter'}
        path={path}
      />
    )
  }

  if (
    ancestorDopIds.includes(dopEphemeralId) ||
    depth >= MAX_VALUE_TREE_DEPTH
  ) {
    return (
      <ValueCellNote title="The DOP references itself through its children">
        Recursive DOP reference
      </ValueCellNote>
    )
  }

  const childPosition: ValueTreePosition = {
    path,
    ancestorDopIds: [...ancestorDopIds, dopEphemeralId],
    depth: depth + 1,
  }
  const nodeLabel = label ?? dop.short_name ?? 'DOP'

  if (isBasicStructureDop(dop)) {
    const childParameters = (dop.parameters ?? []) as ParameterUnionType[]

    return (
      <ValueTreeNode
        dop={dop}
        label={nodeLabel}
        stateKey={path}
        summary={`${isStructureDop(dop) ? 'Structure' : 'Environment data'} · ${childParameters.length} params`}
      >
        <StructureValueTree {...childPosition} parameters={childParameters} />
      </ValueTreeNode>
    )
  }
  if (isFieldDop(dop)) {
    return <FieldValueTree {...childPosition} field={dop} label={nodeLabel} />
  }
  if (isMultiplexerDop(dop)) {
    return (
      <MultiplexerValueTree
        {...childPosition}
        label={nodeLabel}
        multiplexer={dop}
      />
    )
  }
  if (isEnvironmentDataDescriptionDop(dop)) {
    return (
      <EnvironmentDataDescriptionValueTree
        {...childPosition}
        envDataDesc={dop}
        label={nodeLabel}
      />
    )
  }

  return (
    <ValueCellNote title={`DOPs of type ${dop.class_name} are not editable`}>
      Not editable
    </ValueCellNote>
  )
}

function StructureValueTree({
  parameters,
  path,
  ...position
}: { parameters: ParameterUnionType[] } & ValueTreePosition) {
  const mode = React.useContext(ValueTreeModeContext)

  if (parameters.length === 0) {
    return <ValueCellNote>No parameters</ValueCellNote>
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {parameters.map((child, index) => {
        const childName = child.short_name ?? `#${index}`

        return (
          <div
            key={`${childName}-${index}`}
            className={clsx(
              'flex flex-col gap-1',
              mode === 'structure' &&
                'rounded-small border border-default-200 bg-content1 p-2'
            )}
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="min-w-0 break-words font-semibold">
                {childName}
              </span>
              <span className="rounded-small bg-default-100 px-1.5 py-0.5 text-xs text-default-600 dark:bg-default-50/10 dark:text-default-400">
                {child.class_name}
              </span>
              {child.byte_position !== undefined ? (
                <span className="text-xs text-default-500">
                  byte {child.byte_position}
                </span>
              ) : null}
            </div>
            <div
              className={clsx(
                mode === 'structure' &&
                  'ml-1 min-w-0 border-l border-default-200 pl-2'
              )}
            >
              <ParameterValueCell
                {...position}
                parameter={child}
                path={`${path}.${childName}`}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FieldValueTree({
  field,
  label,
  path,
  ...position
}: { field: Field; label: string } & ValueTreePosition) {
  const store = useParameterValueStore()
  const mode = React.useContext(ValueTreeModeContext)
  const countKey = `${path}#count`
  const fixedCount = isStaticFieldDop(field)
    ? field.fixed_number_of_items
    : undefined
  const minItems =
    fixedCount ??
    (isEndOfPduFieldDop(field) ? field.min_number_of_items : undefined) ??
    0
  const maxItems =
    fixedCount ??
    (isEndOfPduFieldDop(field) ? field.max_number_of_items : undefined)
  const storedCount = Number(useParameterValue(countKey))
  const itemCount =
    fixedCount ??
    (Number.isInteger(storedCount) && storedCount >= minItems
      ? storedCount
      : minItems)

  const updateItemCount = (nextCount: number) => {
    store.setValue(countKey, nextCount.toString())
  }

  const itemRef: OdxLinkRef | undefined =
    field.structure_ref ?? field.env_data_desc_ref
  const itemDopId = itemRef?.resolved_object_ephemeral_id
  const itemName =
    itemRef?.resolved_object_short_name ??
    field.structure_snref ??
    field.env_data_desc_snref ??
    'item'

  if (mode === 'structure') {
    const itemRange =
      fixedCount !== undefined
        ? `${fixedCount}`
        : `${minItems}–${maxItems ?? '∞'}`

    return (
      <ValueTreeNode
        dop={field}
        label={label}
        stateKey={path}
        summary={`${field.class_name ?? 'Field'} · ${itemRange} × ${itemName}`}
      >
        {itemDopId === undefined ? (
          <ValueCellNote>Unresolved item structure reference</ValueCellNote>
        ) : (
          <DopValueEditor
            {...position}
            dopEphemeralId={itemDopId}
            label={`[item] ${itemName}`}
            path={`${path}[item]`}
          />
        )}
      </ValueTreeNode>
    )
  }

  return (
    <ValueTreeNode
      label={label}
      stateKey={path}
      summary={`${field.class_name ?? 'Field'} · ${itemCount}${maxItems !== undefined && fixedCount === undefined ? `/${maxItems}` : ''} item(s)`}
    >
      {itemDopId === undefined ? (
        <ValueCellNote>Unresolved item structure reference</ValueCellNote>
      ) : (
        Array.from({ length: itemCount }, (_, index) => (
          <DopValueEditor
            key={index}
            {...position}
            dopEphemeralId={itemDopId}
            label={`[${index}] ${itemName}`}
            path={`${path}[${index}]`}
          />
        ))
      )}
      {fixedCount === undefined && itemDopId !== undefined ? (
        <div className="flex gap-2">
          <Button
            isDisabled={maxItems !== undefined && itemCount >= maxItems}
            size="sm"
            variant="flat"
            onPress={() => updateItemCount(itemCount + 1)}
          >
            Add item
          </Button>
          <Button
            isDisabled={itemCount <= minItems}
            size="sm"
            variant="flat"
            onPress={() => updateItemCount(itemCount - 1)}
          >
            Remove last
          </Button>
        </div>
      ) : null}
    </ValueTreeNode>
  )
}

function formatCaseRange(muxCase: MultiplexerCase) {
  const lower = muxCase.lower_limit?.value
  const upper = muxCase.upper_limit?.value

  if (lower === undefined) return ''

  return upper === undefined || upper === lower
    ? ` (${lower})`
    : ` (${lower}–${upper})`
}

function MultiplexerValueTree({
  multiplexer,
  label,
  path,
  ...position
}: { multiplexer: Multiplexer; label: string } & ValueTreePosition) {
  const store = useParameterValueStore()
  const mode = React.useContext(ValueTreeModeContext)
  const caseKey = `${path}#case`
  const storedCase = useParameterValue(caseKey)
  const selectedCaseKey = typeof storedCase === 'string' ? storedCase : ''

  const cases = multiplexer.cases ?? []
  const caseOptions = cases.map((muxCase, index) => ({
    key: muxCase.short_name ?? `case-${index}`,
    label: `${muxCase.short_name ?? `Case ${index}`}${formatCaseRange(muxCase)}`,
    structureRef: muxCase.structure_ref,
  }))

  if (multiplexer.default_case !== undefined) {
    caseOptions.push({
      key: '#default',
      label: `${multiplexer.default_case.short_name ?? 'Default'} (default)`,
      structureRef: multiplexer.default_case.structure_ref,
    })
  }

  const selectedCase = caseOptions.find(
    (option) => option.key === selectedCaseKey
  )
  const selectedStructureId =
    selectedCase?.structureRef?.resolved_object_ephemeral_id

  if (mode === 'structure') {
    return (
      <ValueTreeNode
        dop={multiplexer}
        label={label}
        stateKey={path}
        summary={`Multiplexer · ${cases.length} cases`}
      >
        {caseOptions.map((option) =>
          option.structureRef?.resolved_object_ephemeral_id === undefined ? (
            <ValueCellNote key={option.key}>
              {option.label}: no resolvable structure
            </ValueCellNote>
          ) : (
            <DopValueEditor
              key={option.key}
              {...position}
              dopEphemeralId={option.structureRef.resolved_object_ephemeral_id}
              label={option.label}
              path={`${path}.${option.key}`}
            />
          )
        )}
      </ValueTreeNode>
    )
  }

  return (
    <ValueTreeNode
      label={label}
      stateKey={path}
      summary={`Multiplexer · ${cases.length} cases`}
    >
      <select
        aria-label={`Case for ${label}`}
        className={VALUE_SELECT_CLASS_NAME}
        value={selectedCaseKey}
        onChange={(event) => {
          store.setValue(caseKey, event.target.value)
        }}
      >
        <option value="">Select case</option>
        {caseOptions.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      {selectedCase === undefined ? null : selectedStructureId === undefined ? (
        <ValueCellNote>Case without resolvable structure</ValueCellNote>
      ) : (
        <DopValueEditor
          key={selectedCase.key}
          {...position}
          dopEphemeralId={selectedStructureId}
          label={selectedCase.label}
          path={`${path}.${selectedCase.key}`}
        />
      )}
    </ValueTreeNode>
  )
}

function formatDtcValues(envData: EnvironmentData) {
  if (envData.all_value) return ' (all DTCs)'
  if (envData.dtc_values && envData.dtc_values.length > 0) {
    return ` (DTC ${envData.dtc_values.map((dtc) => getHexRepresentation(dtc)).join(', ')})`
  }

  return ''
}

function EnvironmentDataDescriptionValueTree({
  envDataDesc,
  label,
  path,
  ...position
}: {
  envDataDesc: EnvironmentDataDescription
  label: string
} & ValueTreePosition) {
  const store = useParameterValueStore()
  const mode = React.useContext(ValueTreeModeContext)
  const envDataKey = `${path}#envData`
  const storedKey = useParameterValue(envDataKey)
  const selectedKey = typeof storedKey === 'string' ? storedKey : ''

  const inlineOptions = (envDataDesc.env_datas ?? []).map((envData, index) => ({
    key: `inline-${index}`,
    name: envData.short_name ?? `env-data-${index}`,
    label: `${envData.short_name ?? `Environment data ${index}`}${formatDtcValues(envData)}`,
    envData,
    refId: undefined as number | undefined,
  }))
  const refOptions = (envDataDesc.env_data_refs ?? []).map((ref, index) => ({
    key: `ref-${index}`,
    name: ref.resolved_object_short_name ?? `env-data-ref-${index}`,
    label: ref.resolved_object_short_name ?? `Environment data ref ${index}`,
    envData: undefined as EnvironmentData | undefined,
    refId: ref.resolved_object_ephemeral_id,
  }))
  const options = [...inlineOptions, ...refOptions]
  const selected = options.find((option) => option.key === selectedKey)

  if (mode === 'structure') {
    return (
      <ValueTreeNode
        dop={envDataDesc}
        label={label}
        stateKey={path}
        summary={`Environment data description · ${options.length} variants`}
      >
        {options.map((option) =>
          option.envData !== undefined ? (
            <ValueTreeNode
              key={option.key}
              dop={option.envData}
              label={option.label}
              stateKey={`${path}.${option.name}`}
              summary={`${option.envData.parameters?.length ?? 0} params`}
            >
              <StructureValueTree
                {...position}
                parameters={
                  (option.envData.parameters ?? []) as ParameterUnionType[]
                }
                path={`${path}.${option.name}`}
              />
            </ValueTreeNode>
          ) : option.refId !== undefined ? (
            <DopValueEditor
              key={option.key}
              {...position}
              dopEphemeralId={option.refId}
              label={option.label}
              path={`${path}.${option.name}`}
            />
          ) : (
            <ValueCellNote key={option.key}>
              {option.label}: unresolved reference
            </ValueCellNote>
          )
        )}
      </ValueTreeNode>
    )
  }

  return (
    <ValueTreeNode
      label={label}
      stateKey={path}
      summary={`Environment data description · ${options.length} variants`}
    >
      <select
        aria-label={`Environment data for ${label}`}
        className={VALUE_SELECT_CLASS_NAME}
        value={selectedKey}
        onChange={(event) => {
          store.setValue(envDataKey, event.target.value)
        }}
      >
        <option value="">Select environment data</option>
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      {selected === undefined ? null : selected.envData !== undefined ? (
        <StructureValueTree
          {...position}
          parameters={
            (selected.envData.parameters ?? []) as ParameterUnionType[]
          }
          path={`${path}.${selected.name}`}
        />
      ) : selected.refId !== undefined ? (
        <DopValueEditor
          key={selected.key}
          {...position}
          dopEphemeralId={selected.refId}
          label={selected.label}
          path={`${path}.${selected.name}`}
        />
      ) : (
        <ValueCellNote>Unresolved environment data reference</ValueCellNote>
      )}
    </ValueTreeNode>
  )
}

export function getParameterValueKey(parameter: ParameterUnionType): string {
  return (
    parameter.ephemeral_id?.toString() ??
    parameter.perma_id ??
    `${parameter.short_name ?? 'parameter'}-${parameter.byte_position ?? ''}-${parameter.bit_position ?? ''}`
  )
}

function AtomicParameterValueInput({
  dop,
  label,
  defaultValue,
  path,
}: {
  dop: DataObjectPropertyResolved
  label: string
  defaultValue?: string
  path: string
}) {
  const store = useParameterValueStore()
  const localValue = useParameterValue(path) ?? ''

  const updateValue = (nextValue: AtomicParameterValue) => {
    store.setValue(path, nextValue)
  }

  const inputSpec = React.useMemo(() => getParameterValueInputSpec(dop), [dop])

  if (inputSpec === undefined) {
    return (
      <ValueCellNote title="Value not editable">Not editable</ValueCellNote>
    )
  }

  const ariaLabel = `Value for ${label}`
  const unit = dop.unit?.display_name ?? dop.unit?.short_name
  const validationError = validateParameterValue(inputSpec, localValue)
  const hint = describeParameterValueInputSpec(inputSpec)
  const selectClassName = VALUE_SELECT_CLASS_NAME

  if (inputSpec.kind === 'select') {
    return (
      <select
        aria-label={ariaLabel}
        className={selectClassName}
        value={typeof localValue === 'string' ? localValue : ''}
        onChange={(event) => updateValue(event.target.value)}
      >
        <option value="">
          {defaultValue ? `Default: ${defaultValue}` : 'Select value'}
        </option>
        {inputSpec.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.internalValue !== undefined
              ? `${option.label} (${option.internalValue})`
              : option.label}
          </option>
        ))}
      </select>
    )
  }

  if (inputSpec.kind === 'boolean') {
    return (
      <select
        aria-label={ariaLabel}
        className={selectClassName}
        value={typeof localValue === 'boolean' ? localValue.toString() : ''}
        onChange={(event) => updateValue(event.target.value === 'true')}
      >
        <option disabled value="">
          Select value
        </option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    )
  }

  const isNumber = inputSpec.kind === 'number'

  return (
    <Input
      aria-label={ariaLabel}
      className="min-w-44"
      classNames={{
        inputWrapper:
          'border-primary-400 bg-primary-50/50 dark:bg-primary-950/20',
      }}
      description={validationError ? undefined : hint}
      endContent={
        unit ? (
          <span className="text-xs text-default-500 whitespace-nowrap">
            {unit}
          </span>
        ) : undefined
      }
      errorMessage={validationError}
      isInvalid={validationError !== undefined}
      max={isNumber ? inputSpec.max?.value : undefined}
      min={isNumber ? inputSpec.min?.value : undefined}
      placeholder={
        defaultValue
          ? `Default: ${defaultValue}`
          : inputSpec.kind === 'text' && inputSpec.dataType === 'A_BYTEFIELD'
            ? 'Hex bytes, e.g. 0A FF'
            : 'Enter value'
      }
      size="sm"
      step={isNumber ? inputSpec.step : undefined}
      type={isNumber ? 'number' : 'text'}
      value={typeof localValue === 'string' ? localValue : ''}
      onValueChange={updateValue}
    />
  )
}
