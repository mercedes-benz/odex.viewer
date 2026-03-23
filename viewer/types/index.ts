// SPDX-License-Identifier: AGPL-3.0-only
import { SVGProps } from 'react'

import { DopType, ParameterType } from '@/api/api-hooks'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number
}

export interface ColumnDefinition {
  key: string
  label: string
  sortable?: boolean
  group?: string
  filter?: React.JSX.Element
}

export interface ParameterColumnDefinition extends ColumnDefinition {
  relatedParameterTypes?: ParameterType[]
  keyAliases?: string[]
}

export interface DopColumnDefinition extends ColumnDefinition {
  relatedDopTypes?: DopType[]
  keyAliases?: string[]
}

export type DiagnosticCommTargetObjectIds = {
  diagCommId: string
  variantId: string
  containerId: string
}

export function isDiagnosticCommTargetObjectIds(
  element: DiagnosticCommTargetObjectIds | DataObjectPropTargetObjectIds
): element is DiagnosticCommTargetObjectIds {
  return (element as DiagnosticCommTargetObjectIds).diagCommId !== undefined
}

export type DiagnosticTroubleCodeTargetObjectIds = {
  dtcId: string
  variantId: string
  containerId: string
}

export type DataObjectPropTargetObjectIds = {
  dopId: string
  variantId: string
  containerId: string
}

export type DiagCodedTypeTargetObjectIds = {
  diagCodedTypeId: string
  variantId: string
  containerId: string
}

export type ParameterTargetObjectIds = {
  parameterEphemeralId: number
  elementChildId?: string
  elementId: string
  variantId: string
  containerId: string
}

export type ValueExtractorFunc<Type extends object> = (
  filterItem: Type
) => string | undefined

export type ArrayValueExtractorFunc<Type extends object> = (
  filterItems: Type
) => string[] | undefined
