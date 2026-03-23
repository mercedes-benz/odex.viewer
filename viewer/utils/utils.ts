// SPDX-License-Identifier: AGPL-3.0-only
import { createHash } from 'crypto'

import { getKeyValue } from '@heroui/shared-utils'
import { AsyncListData } from '@react-stately/data'
import { Key, SortDescriptor } from '@react-types/shared'

import { ArrayValueExtractorFunc, ValueExtractorFunc } from '@/types'
import {
  CompuMethod,
  CompuScale,
  DiagCodedTypeUnionType,
  InternalConstr,
  isStandardLengthDiagCodedType,
  Limit,
  ScaleConstrValidType,
} from '@/api/api-hooks'

export function hashStringId(stringId: string): string {
  const hash = createHash('md5')

  hash.update(stringId)

  return hash.digest('hex')
}

export function arrayRange(start: number, stop: number, step: number) {
  return Array.from(
    { length: (stop - start) / step + 1 },
    (_, index) => start + index * step
  )
}

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
}

export function cleanupHtmlContent(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, '') // Remove <br>, <br/>, <br /> (case-insensitive)
    .replace(/[\n\t\r]+/g, '') // Remove newline, tab, and carriage return characters
    .trim()
}

export function constrainTextByLength(
  text: string,
  minLength: number | undefined,
  maxLength: number | undefined
) {
  const constrainIndex = Math.min(
    Math.max(
      text.indexOf('\n'),
      text.indexOf('>'),
      text.indexOf(')'),
      text.indexOf('}'),
      minLength ? minLength : 100
    ),
    maxLength ? maxLength : 200
  )

  return text.slice(0, constrainIndex)
}

export function sortItemsBySortDescriptor<T extends object>(
  a: T,
  b: T,
  sortDescriptor: SortDescriptor
): number {
  const first = String(getKeyValue(a, sortDescriptor.column) || '')
  const second = String(getKeyValue(b, sortDescriptor.column) || '')
  let cmp = first.localeCompare(second)

  if (sortDescriptor.direction === 'descending') {
    cmp *= -1
  }

  return cmp
}

export function sortItemsByNestedSortDescriptor<T extends object>(
  a: T,
  b: T,
  sortDescriptor: SortDescriptor
): number {
  const first = String(getNestedKeyValue(a, sortDescriptor.column) || '')
  const second = String(getNestedKeyValue(b, sortDescriptor.column) || '')
  let cmp = first.localeCompare(second)

  if (sortDescriptor.direction === 'descending') {
    cmp *= -1
  }

  return cmp
}

export function getNestedKeyValue(obj: any, key: Key): any | undefined {
  const keys = key.toString().split('.')
  var current = obj

  for (var k of keys) {
    current = getKeyValue(current, k)
    if (current === undefined) return undefined
  }

  return current
}

export function sortItemsWithExtractFuncBySortDescriptor<T extends object>(
  a: T,
  b: T,
  sortDescriptor: SortDescriptor,
  extractFunc: ValueExtractorFunc<T>
): number {
  const first = extractFunc(a)
  const second = extractFunc(b)
  let cmp = 1

  if (first !== undefined && second !== undefined) {
    cmp = first.localeCompare(second)
  }

  if (sortDescriptor.direction === 'descending') {
    cmp *= -1
  }

  return cmp
}

export function resolveFileType(file_name: string | undefined) {
  if (file_name) {
    if (file_name.toLowerCase().endsWith('pdx')) {
      return 'PDX'
    } else {
      return undefined
    }
  }

  return undefined
}

export function count_elements<Type extends object>(
  items: Type[],
  item: Type,
  key: string,
  propertyKey?: string
) {
  let count = 0

  let itemValue = getKeyValue(item, key)

  if (propertyKey && typeof itemValue == 'object') {
    itemValue = getKeyValue(itemValue, propertyKey)
  }

  items.forEach(function (value) {
    let valueProp = getKeyValue(value, key)

    if (propertyKey && typeof valueProp == 'object') {
      valueProp = getKeyValue(valueProp, propertyKey)
    }

    if (valueProp === itemValue) {
      count += 1
    }
  })

  return count
}

export function count_elements_with_extractFunc<Type extends object>(
  items: Type[],
  item: Type,
  extractFunc: ValueExtractorFunc<Type>
) {
  let count = 0

  let itemValue = extractFunc(item)

  items.forEach(function (value) {
    let valueProp = extractFunc(value)

    if (valueProp !== undefined && valueProp === itemValue) {
      count += 1
    }
  })

  return count
}

export function count_elements_in_object_collections_with_id<
  Type extends object,
>(items: Type[], id: string, propertyKey: string, objectPropertyName: string) {
  let count = 0

  items.forEach(function (value) {
    const propValue = getKeyValue(value, propertyKey)

    let resolved_list = []

    if (Array.isArray(propValue)) {
      resolved_list = propValue.flatMap((entry) => {
        if (typeof entry === 'string' || typeof entry === 'number') {
          return entry
        } else {
          if (Object.hasOwn(entry, objectPropertyName)) {
            return entry[objectPropertyName]
          }
        }
      })
    }

    if (resolved_list.includes(id)) {
      count += 1
    }
  })

  return count
}

export function count_elements_in_object_collections_with_extractFunc<
  Type extends object,
>(items: Type[], id: string, extractFunc: ArrayValueExtractorFunc<Type>) {
  let count = 0

  items.forEach(function (value) {
    const resolved_list = extractFunc(value)

    if (resolved_list !== undefined && resolved_list.includes(id.toString())) {
      count += 1
    }
  })

  return count
}

export function get_unique_items<Type extends object>(
  items: Type[],
  key: string,
  propertyKey?: string
) {
  const seen = new Set<Type>()

  return items
    .filter((item) => {
      let keyValue = getKeyValue(item, key)

      if (propertyKey && typeof keyValue == 'object') {
        keyValue = getKeyValue(keyValue, propertyKey)
      }

      if (keyValue === undefined || seen.has(keyValue)) {
        return false
      } else {
        seen.add(keyValue)

        return true
      }
    })
    .sort((a, b) =>
      sortItemsBySortDescriptor<Type>(a, b, {
        column: key,
        direction: 'ascending',
      })
    )
}

export function get_unique_items_withExtractorFunc<Type extends object>(
  items: Type[],
  valueExtractor: ValueExtractorFunc<Type>
) {
  const seen = new Set<string>()

  return items
    .filter((item) => {
      const keyValue = valueExtractor(item)

      if (keyValue === undefined || seen.has(keyValue)) {
        return false
      } else {
        seen.add(keyValue)

        return true
      }
    })
    .sort((a, b) =>
      sortItemsWithExtractFuncBySortDescriptor<Type>(
        a,
        b,
        {
          column: 'key',
          direction: 'ascending',
        },
        valueExtractor
      )
    )
}

export function isNumber(str: string) {
  if (typeof str != 'string') return false

  return !Number.isNaN(str) && !isNaN(parseFloat(str))
}

export function getHexRepresentation(value: any | undefined) {
  if (value && isNumber(value.toString())) {
    return `0x${Number.parseInt(value.toString()).toString(16).toUpperCase()}`
  }

  return ''
}

export function isAsyncListData<T>(
  element: AsyncListData<T> | Array<T>
): element is AsyncListData<T> {
  return typeof element === 'object' && Object.hasOwn(element, 'items')
}

function translateLimitToLatexString(
  limit: Limit | undefined,
  limitType: 'lower' | 'upper'
) {
  let latexLimitString: string | undefined = undefined

  if (limit !== undefined) {
    if (limitType === 'upper') {
      // Add interval end characters
      if (limit.interval_type !== undefined) {
        if (limit.interval_type == 'CLOSED') {
          latexLimitString = ']'
        } else if (limit.interval_type == 'OPEN') {
          latexLimitString = ')'
        } else if (limit.interval_type == 'INFINITE') {
          latexLimitString = '+\\infty)'
        }
      } else {
        // Use default 'CLOSED' interval type
        latexLimitString = ']'
      }

      if (limit.value !== undefined) {
        latexLimitString = limit.value.toString() + latexLimitString
      }
    } else if (limitType === 'lower') {
      // Add interval start characters
      if (limit.interval_type !== undefined) {
        if (limit.interval_type == 'CLOSED') {
          latexLimitString = '['
        } else if (limit.interval_type == 'OPEN') {
          latexLimitString = '('
        } else if (limit.interval_type == 'INFINITE') {
          latexLimitString = '(-\\infty'
        }
      } else {
        // Use default 'CLOSED' interval type
        latexLimitString = '['
      }

      if (limit.value !== undefined) {
        latexLimitString = latexLimitString + limit.value.toString()
      }
    }
  }

  return latexLimitString
}

function translateLinearScaleToLatexString(scaleDef: CompuScale): {
  lowerLimit: string | undefined
  upperLimit: string | undefined
  numerator: string | undefined
  denominator: string | undefined
  function_string: string | undefined
} {
  const lowerLimit = translateLimitToLatexString(scaleDef.lower_limit, 'lower')
  const upperLimit = translateLimitToLatexString(scaleDef.upper_limit, 'upper')

  let numerator: string | undefined = undefined
  let denominator: string | undefined = undefined
  let function_string: string | undefined = undefined

  if (scaleDef.compu_rational_coeffs !== undefined) {
    if (
      scaleDef.compu_rational_coeffs.numerators !== undefined &&
      scaleDef.compu_rational_coeffs.numerators.length == 2
    ) {
      numerator = `${scaleDef.compu_rational_coeffs.numerators[0]} + ${scaleDef.compu_rational_coeffs.numerators[1]}x`
    }

    if (
      scaleDef.compu_rational_coeffs.denominators !== undefined &&
      scaleDef.compu_rational_coeffs.denominators.length == 1
    ) {
      denominator = `${scaleDef.compu_rational_coeffs.denominators[0]}`
    }

    if (numerator !== undefined && denominator !== undefined) {
      function_string = `\\frac{${numerator}}{${denominator}}`
    } else if (numerator !== undefined) {
      function_string = `${numerator}`
    }
  }

  return {
    lowerLimit: lowerLimit,
    upperLimit: upperLimit,
    numerator: numerator,
    denominator: denominator,
    function_string: function_string,
  }
}

export function generateLatexFuncFromCompuMethod(
  compuMethod: CompuMethod | undefined,
  diagCodedType: DiagCodedTypeUnionType | undefined,
  internalConstraint: InternalConstr | undefined
): string | undefined {
  let result: string | undefined
  let mapping = undefined

  const validInterval = extractValidValuesConstraintFromInternalConstraints(
    internalConstraint,
    diagCodedType
  )

  if (compuMethod !== undefined) {
    if (compuMethod.category === 'IDENTICAL') {
      if (
        validInterval !== undefined &&
        !Number.isNaN(validInterval[0]) &&
        !Number.isNaN(validInterval[1])
      ) {
        result = `f(x) = x, \\quad x \\in [${validInterval[0]},${validInterval[1]}]`
      } else {
        result = 'f(x) = x'
      }
    } else if (
      compuMethod.category === 'COMPUCODE' ||
      compuMethod.category === 'TEXTTABLE'
    ) {
      return undefined
    }

    if (compuMethod.compu_internal_to_phys !== undefined) {
      mapping = compuMethod.compu_internal_to_phys
    } else if (compuMethod.compu_phys_to_internal !== undefined) {
      mapping = compuMethod.compu_phys_to_internal
    }

    if (mapping !== undefined && mapping.compu_scales !== undefined) {
      switch (compuMethod.category) {
        case 'LINEAR':
          if (
            mapping.compu_scales.length == 1 &&
            mapping.compu_scales[0] !== undefined
          ) {
            const scale = translateLinearScaleToLatexString(
              mapping.compu_scales[0]
            )

            if (
              validInterval !== undefined &&
              !Number.isNaN(validInterval[0]) &&
              !Number.isNaN(validInterval[1])
            ) {
              result = `f(x) = ${scale.function_string}, \\quad x \\in [${validInterval[0]},${validInterval[1]}]`
            } else {
              result = `f(x) = ${scale.function_string}, \\quad x \\in ${scale.lowerLimit},${scale.upperLimit}`
            }
          }
          break
        case 'SCALE-LINEAR':
          if (mapping.compu_scales.length >= 1) {
            const scales = mapping.compu_scales.map((scaleDef) => {
              return translateLinearScaleToLatexString(scaleDef)
            })

            let scales_string = ''

            scales.forEach((value, index) => {
              if (index == scales.length - 1) {
                scales_string =
                  scales_string +
                  `${value.function_string} & , \\quad x \\in ${value.lowerLimit},${value.upperLimit}`
              } else {
                scales_string =
                  scales_string +
                  `${value.function_string} & , \\quad x \\in ${value.lowerLimit},${value.upperLimit} \\\\`
              }
            })

            if (scales.length == 1) {
              result = `f(x) = ${scales_string.replace('&', '')}`
            } else {
              result = `f(x) = \\begin{cases} ${scales_string} \\end{cases}`
            }
          }
          break
        case 'RAT-FUNC':
          result = 'not supported yet'
          // TODO: Implement
          break
        case 'SCALE-RAT-FUNC':
          result = 'not supported yet'
          // TODO: Implement
          break
        case 'TAB-INTP':
          result = 'not supported yet'
          // TODO: Implement
          break
      }
    }
  }

  return result
}

type ScaleRenderingData = {
  xValues: number[]
  yValues: number[] | string[]
  lowerLimit: number | undefined
  upperLimit: number | undefined
  mappingFunction:
    | CompuMethodNumberFunction
    | CompuMethodStringFunction
    | undefined
}
export type CompuMethodRenderingData = {
  scales: ScaleRenderingData[]
}

type CompuMethodNumberFunction = (input: number) => number | string | undefined
type CompuMethodStringFunction = (input: string) => number | string | undefined

function extractLimitInfo(
  limit: Limit | undefined,
  limitType: 'lower' | 'upper'
) {
  let resultingLimit: number | undefined

  if (limit !== undefined) {
    if (limit.value !== undefined && typeof limit.value === 'number') {
      resultingLimit = limit.value
    }

    if (resultingLimit !== undefined) {
      if (limit.interval_type == 'INFINITE') {
        if (limitType === 'lower') {
          resultingLimit = Number.NEGATIVE_INFINITY
        } else {
          resultingLimit = Number.POSITIVE_INFINITY
        }
      } else {
        resultingLimit = resultingLimit
      }
    }
  }

  return resultingLimit
}

function extractLinearScaleInfo(
  scaleDef: CompuScale,
  diagCodedType: DiagCodedTypeUnionType | undefined,
  validInterval: [number, number] | undefined
): ScaleRenderingData {
  let lowerLimit = extractLimitInfo(scaleDef.lower_limit, 'lower')
  let upperLimit = extractLimitInfo(scaleDef.upper_limit, 'upper')

  // TODO: Handle all possible combinations of kinds of diagCodedType types, encodings, etc.
  if (
    diagCodedType !== undefined &&
    isStandardLengthDiagCodedType(diagCodedType) &&
    (diagCodedType.base_data_type == 'A_FLOAT32' ||
      diagCodedType.base_data_type === 'A_FLOAT64' ||
      diagCodedType.base_data_type === 'A_UINT32' ||
      diagCodedType.base_data_type === 'A_INT32') &&
    diagCodedType.bit_length !== undefined
  ) {
    if (lowerLimit === undefined || lowerLimit === Number.NEGATIVE_INFINITY) {
      if (validInterval !== undefined && !Number.isNaN(validInterval[0])) {
        lowerLimit = validInterval[0]
      } else {
        lowerLimit = 0
      }
    }
    if (upperLimit === undefined || upperLimit === Number.POSITIVE_INFINITY) {
      if (validInterval !== undefined && !Number.isNaN(validInterval[1])) {
        upperLimit = validInterval[1]
      } else {
        upperLimit = 2 ** diagCodedType.bit_length - 1
      }
    }
  }

  let numerators: number[] | undefined = undefined
  let denominator: number | undefined = undefined
  let mappingFunction: CompuMethodNumberFunction | undefined = undefined

  if (scaleDef.compu_rational_coeffs !== undefined) {
    if (
      scaleDef.compu_rational_coeffs.numerators !== undefined &&
      scaleDef.compu_rational_coeffs.numerators.length == 2
    ) {
      numerators = scaleDef.compu_rational_coeffs.numerators
    }

    if (
      scaleDef.compu_rational_coeffs.denominators !== undefined &&
      scaleDef.compu_rational_coeffs.denominators.length == 1
    ) {
      denominator = scaleDef.compu_rational_coeffs.denominators[0]
    }

    mappingFunction = (input: number) => {
      if (
        numerators !== undefined &&
        denominator !== undefined &&
        numerators[0] !== undefined &&
        numerators[1] !== undefined
      ) {
        if (lowerLimit !== undefined && upperLimit !== undefined) {
          if (lowerLimit <= input && input <= upperLimit) {
            return (numerators[0] + numerators[1] * input) / denominator
          }

          return undefined
        } else {
          return (numerators[0] + numerators[1] * input) / denominator
        }
      } else if (
        numerators !== undefined &&
        numerators[0] !== undefined &&
        numerators[1] !== undefined
      ) {
        if (lowerLimit !== undefined && upperLimit !== undefined) {
          if (lowerLimit <= input && input <= upperLimit) {
            return numerators[0] + numerators[1] * input
          }

          return undefined
        } else {
          return numerators[0] + numerators[1] * input
        }
      } else {
        return undefined
      }
    }
  }

  const values =
    lowerLimit !== undefined && upperLimit !== undefined
      ? [lowerLimit, upperLimit]
      : []

  return {
    xValues: values,
    yValues:
      mappingFunction !== undefined
        ? values.map((value) => {
            const result = mappingFunction(value)

            return result !== undefined && typeof result === 'number'
              ? result
              : NaN
          })
        : [],
    lowerLimit: lowerLimit,
    upperLimit: upperLimit,
    mappingFunction: mappingFunction,
  }
}

function extractTexttableScaleInfo(scaleDef: CompuScale): ScaleRenderingData {
  let lowerLimit = extractLimitInfo(scaleDef.lower_limit, 'lower')
  let upperLimit = extractLimitInfo(scaleDef.upper_limit, 'upper')
  let valueText = undefined

  if (lowerLimit !== undefined) {
    // Set upperLimit to lowerLimit, if no upperLimit is given
    if (upperLimit === undefined) {
      upperLimit = lowerLimit
    }
  }

  if (scaleDef.compu_const !== undefined) {
    valueText = scaleDef.compu_const.vt
  }

  return {
    xValues:
      lowerLimit !== undefined && upperLimit !== undefined
        ? lowerLimit === upperLimit
          ? [lowerLimit]
          : [lowerLimit, upperLimit]
        : [],
    yValues: valueText ? [valueText] : [],
    lowerLimit: lowerLimit,
    upperLimit: upperLimit,
    mappingFunction: (input: number) => {
      if (lowerLimit !== undefined && upperLimit !== undefined) {
        if (lowerLimit < input && input < upperLimit) {
          return valueText
        }

        return undefined
      } else {
        return valueText
      }
    },
  }
}

function extractValidValuesConstraintFromInternalConstraints(
  internalConstraint: InternalConstr | undefined,
  diagCodedType: DiagCodedTypeUnionType | undefined
) {
  let validInterval: [number, number] = [NaN, NaN]

  if (internalConstraint !== undefined) {
    const constraintData = getInternalConstraintDataForRendering(
      internalConstraint,
      diagCodedType
    )

    if (constraintData !== undefined) {
      const validConstraint = constraintData?.constraints.find(
        (value) => value.validity === 'VALID'
      )

      if (validConstraint !== undefined) {
        const startIndex = validConstraint.data.indexOf(1)
        const endIndex = validConstraint.data.lastIndexOf(1)

        if (
          startIndex >= 0 &&
          endIndex >= 0 &&
          constraintData.labels[startIndex] !== undefined &&
          constraintData.labels[endIndex] !== undefined
        ) {
          validInterval = [
            constraintData.labels[startIndex],
            constraintData.labels[endIndex],
          ]
        }
      }
    }
  }

  return validInterval
}

export function getCompuMethodDataForRendering(
  compuMethod: CompuMethod | undefined,
  diagCodedType: DiagCodedTypeUnionType | undefined,
  internalConstraint: InternalConstr | undefined
): CompuMethodRenderingData | undefined {
  let result: CompuMethodRenderingData | undefined
  let mapping = undefined

  const validInterval = extractValidValuesConstraintFromInternalConstraints(
    internalConstraint,
    diagCodedType
  )

  if (compuMethod !== undefined) {
    if (compuMethod.category === 'IDENTICAL') {
      // TODO: Handle all possible combinations of kinds of diagCodedType types, encodings, etc.
      if (
        diagCodedType !== undefined &&
        isStandardLengthDiagCodedType(diagCodedType) &&
        (diagCodedType.base_data_type == 'A_FLOAT32' ||
          diagCodedType.base_data_type === 'A_FLOAT64' ||
          diagCodedType.base_data_type === 'A_UINT32' ||
          diagCodedType.base_data_type === 'A_INT32') &&
        diagCodedType.bit_length !== undefined
      ) {
        if (
          validInterval !== undefined &&
          !Number.isNaN(validInterval[0]) &&
          !Number.isNaN(validInterval[1])
        ) {
          result = {
            scales: [
              {
                xValues: [validInterval[0], validInterval[1]],
                yValues: [validInterval[0], validInterval[1]],
                lowerLimit: validInterval[0],
                upperLimit: validInterval[1],
                mappingFunction: (input: number) => {
                  return input
                },
              },
            ],
          }
        } else {
          result = {
            scales: [
              {
                xValues: [0, 2 ** diagCodedType.bit_length - 1],
                yValues: [0, 2 ** diagCodedType.bit_length - 1],
                lowerLimit: 0,
                upperLimit: 2 ** diagCodedType.bit_length - 1,
                mappingFunction: (input: number) => {
                  return input
                },
              },
            ],
          }
        }
      } else {
        result = {
          scales: [
            {
              xValues: [],
              yValues: [],
              lowerLimit: undefined,
              upperLimit: undefined,
              mappingFunction: (input: string) => {
                return input
              },
            },
          ],
        }
      }
    } else if (compuMethod.category === 'COMPUCODE') {
      return undefined
    }

    if (compuMethod.compu_internal_to_phys !== undefined) {
      mapping = compuMethod.compu_internal_to_phys
    } else if (compuMethod.compu_phys_to_internal !== undefined) {
      mapping = compuMethod.compu_phys_to_internal
    }

    if (mapping !== undefined && mapping.compu_scales !== undefined) {
      switch (compuMethod.category) {
        case 'TEXTTABLE':
          if (mapping.compu_scales.length > 0) {
            const scales = mapping.compu_scales.map((scaleDef) => {
              return extractTexttableScaleInfo(scaleDef)
            })

            result = { scales: scales }
          }
          break
        case 'LINEAR':
          if (
            mapping.compu_scales.length == 1 &&
            mapping.compu_scales[0] !== undefined
          ) {
            const scale = extractLinearScaleInfo(
              mapping.compu_scales[0],
              diagCodedType,
              validInterval
            )

            result = { scales: [scale] }
          }
          break
        case 'SCALE-LINEAR':
          if (mapping.compu_scales.length >= 1) {
            const scales = mapping.compu_scales.map((scaleDef) => {
              return extractLinearScaleInfo(scaleDef, diagCodedType, undefined)
            })

            const scalesMappingFunction: CompuMethodNumberFunction = (
              input: number
            ) => {
              const matching_scale = scales.find((scale) => {
                if (
                  scale.lowerLimit !== undefined &&
                  scale.lowerLimit <= input &&
                  scale.upperLimit !== undefined &&
                  scale.upperLimit >= input
                ) {
                  return scale
                }
              })

              return matching_scale !== undefined &&
                matching_scale.mappingFunction !== undefined
                ? (matching_scale.mappingFunction as CompuMethodNumberFunction)(
                    input
                  )
                : undefined
            }

            const xValues = Array.from(
              new Set(scales.flatMap((scale) => scale.xValues))
            )

            const yValues = xValues.map((value) => {
              const result = scalesMappingFunction(value)

              return result !== undefined && typeof result !== 'string'
                ? result
                : NaN
            })

            const consolidatedScaleData: ScaleRenderingData = {
              xValues,
              yValues,
              lowerLimit: NaN,
              upperLimit: NaN,
              mappingFunction: scalesMappingFunction,
            }

            result = { scales: [consolidatedScaleData] }
          }
          break
        case 'RAT-FUNC':
          result = undefined
          // TODO: Implement
          break
        case 'SCALE-RAT-FUNC':
          result = undefined
          // TODO: Implement
          break
        case 'TAB-INTP':
          result = undefined
          // TODO: Implement
          break
      }
    }
  }

  return result
}

type InternalConstraintRenderingData = {
  labels: number[]
  constraints: InternalConstraintData[]
}
type InternalConstraintInterval = {
  interval: [number, number]
  validity: ScaleConstrValidType | undefined
}

type InternalConstraintData = {
  data: number[]
  validity: ScaleConstrValidType | undefined
}

function findMatchingScaleConstraint(
  value: number,
  scaleConstraints: InternalConstraintInterval[]
): InternalConstraintInterval | undefined {
  let result = scaleConstraints.find(
    (constraint) =>
      value >= constraint.interval[0] && value <= constraint.interval[1]
  )

  return result
}

export function getInternalConstraintDataForRendering(
  internalConstraint: InternalConstr,
  diagCodedType: DiagCodedTypeUnionType | undefined
): InternalConstraintRenderingData | undefined {
  let validInterval: InternalConstraintInterval | undefined = undefined

  // Check if the internal constraint defines itself a valid value domain via an interval
  if (
    internalConstraint.lower_limit !== undefined &&
    typeof internalConstraint.lower_limit.value === 'number' &&
    internalConstraint.upper_limit !== undefined &&
    typeof internalConstraint.upper_limit.value === 'number'
  ) {
    validInterval = {
      interval: [
        internalConstraint.lower_limit.value,
        internalConstraint.upper_limit.value,
      ],
      validity: 'VALID',
    }
  }

  // Check the diagCodedType for getting the underlying valid value domain if no interval is given
  // TODO: Handle all possible combinations of kinds of diagCodedType types, encodings, etc.
  if (
    validInterval === undefined &&
    diagCodedType !== undefined &&
    isStandardLengthDiagCodedType(diagCodedType) &&
    (diagCodedType.base_data_type == 'A_FLOAT32' ||
      diagCodedType.base_data_type === 'A_FLOAT64' ||
      diagCodedType.base_data_type === 'A_UINT32' ||
      diagCodedType.base_data_type === 'A_INT32') &&
    diagCodedType.bit_length !== undefined
  ) {
    validInterval = {
      interval: [0, 2 ** diagCodedType.bit_length - 1],
      validity: 'VALID',
    }
  }

  const scaleConstraints: InternalConstraintInterval[] | undefined =
    internalConstraint.scale_constrs?.map((entry) => {
      let intervalTuple: [number, number] = [0, 0]

      if (
        entry.lower_limit !== undefined &&
        typeof entry.lower_limit.value === 'number' &&
        entry.upper_limit !== undefined &&
        typeof entry.upper_limit.value === 'number'
      ) {
        intervalTuple = [entry.lower_limit.value, entry.upper_limit.value]
      }

      return {
        interval: intervalTuple,
        validity: entry.validity,
      }
    })

  const labelValues: Set<number> = new Set()

  if (validInterval !== undefined) {
    labelValues.add(validInterval.interval[0])
    labelValues.add(validInterval.interval[1])
  }

  if (scaleConstraints !== undefined) {
    scaleConstraints.forEach((interval) => {
      labelValues.add(interval.interval[0])
      labelValues.add(interval.interval[1])
    })
  }

  // Sort the labels array and add for each entry an +1 increment to the array
  const sortedLabels = Array.from(
    new Set(
      Array.from(labelValues.values())
        .sort((a, b) => a - b)
        .flatMap((value, index, array) => {
          const resultingItems = [value]

          // Add an element before the given interval boundary, if possible
          if (index !== 0 && array.indexOf(value - 1) === -1) {
            resultingItems.push(value - 1)
          }

          // Add an element after the given interval boundary, if possible
          if (index !== array.length - 1 && array.indexOf(value + 1) === -1) {
            resultingItems.push(value + 1)
          }

          return resultingItems
        })
        .sort((a, b) => a - b)
    )
  )

  const validValues: InternalConstraintData = {
    data: [],
    validity: 'VALID',
  }
  const notValidValues: InternalConstraintData = {
    data: [],
    validity: 'NOT-VALID',
  }
  const notAvailableValues: InternalConstraintData = {
    data: [],
    validity: 'NOT-AVAILABLE',
  }
  const notDefinedValues: InternalConstraintData = {
    data: [],
    validity: 'NOT-DEFINED',
  }

  sortedLabels.forEach((labelValue) => {
    if (scaleConstraints !== undefined) {
      const scale = findMatchingScaleConstraint(labelValue, scaleConstraints)

      if (scale !== undefined) {
        switch (scale.validity) {
          case 'NOT-AVAILABLE':
            notAvailableValues.data.push(1)
            notDefinedValues.data.push(0)
            notValidValues.data.push(0)
            break
          case 'NOT-DEFINED':
            notDefinedValues.data.push(1)
            notAvailableValues.data.push(0)
            notValidValues.data.push(0)
            break
          case 'NOT-VALID':
            notValidValues.data.push(1)
            notAvailableValues.data.push(0)
            notDefinedValues.data.push(0)
            break
        }
        validValues.data.push(0)
      } else {
        notAvailableValues.data.push(0)
        notDefinedValues.data.push(0)
        notValidValues.data.push(0)

        if (validInterval !== undefined) {
          if (
            labelValue >= validInterval.interval[0] &&
            labelValue <= validInterval.interval[1]
          ) {
            validValues.data.push(1)
          } else {
            validValues.data.push(0)
          }
        } else {
          validValues.data.push(0)
        }
      }
    } else {
      notAvailableValues.data.push(0)
      notDefinedValues.data.push(0)
      notValidValues.data.push(0)

      if (validInterval !== undefined) {
        if (
          labelValue >= validInterval.interval[0] &&
          labelValue <= validInterval.interval[1]
        ) {
          validValues.data.push(1)
        } else {
          validValues.data.push(0)
        }
      } else {
        validValues.data.push(0)
      }
    }
  })

  return {
    labels: sortedLabels,
    constraints: [
      validValues,
      notValidValues,
      notAvailableValues,
      notDefinedValues,
    ],
  }
}
