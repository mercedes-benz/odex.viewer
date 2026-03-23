// SPDX-License-Identifier: AGPL-3.0-only
import { BreadcrumbItem, Breadcrumbs } from '@heroui/breadcrumbs'

interface BreadcrumbEntry {
  label: string
  href?: string
  key?: string
  isCurrent?: boolean
  isDisabled?: boolean
}

export function DefaultBreadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: BreadcrumbEntry[]
}) {
  return (
    <Breadcrumbs
      className="-mt-8 pb-5"
      classNames={{
        list: 'bg-gradient-to-br from-blue-800 to-blue-500 shadow-small',
      }}
      color="foreground"
      itemClasses={{
        item: 'text-white/90 data-[current=true]:text-white',
        separator: 'text-white/40',
      }}
      itemsAfterCollapse={5}
      itemsBeforeCollapse={1}
      maxItems={10}
      size="lg"
      underline="hover"
      variant="bordered"
    >
      {breadcrumbs.map((breadcrumb, index) => (
        <BreadcrumbItem
          key={breadcrumb.key ? breadcrumb.key : index}
          href={breadcrumb.href}
          isCurrent={breadcrumb.isCurrent}
          isDisabled={breadcrumb.isDisabled}
        >
          {breadcrumb.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  )
}

export const odxdStaticBreadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'ODX-D', href: '/odx-d', isDisabled: true },
]

export const diagVariantStaticBreadcrumps = [
  { label: 'Home', href: '/' },
  {
    label: 'Diagnostic Variants',
    href: '/diagnostic-variant',
    isDisabled: true,
  },
]

export const diagCommStaticBreadcrumps = [
  { label: 'Home', href: '/' },
  {
    label: 'Diagnostic Communications',
    href: '/diagnostic-comm',
    isDisabled: true,
  },
]

export const diagTroubleCodeStaticBreadcrumps = [
  { label: 'Home', href: '/' },
  {
    label: 'Diagnostic Trouble Codes',
    href: '/dtcs',
    isDisabled: true,
  },
]

export const dataObjectPropertyStaticBreadcrumps = [
  { label: 'Home', href: '/' },
  {
    label: 'Data Object Properties',
    href: '/dops',
    isDisabled: true,
  },
]

export const stateChartStaticBreadcrumps = [
  { label: 'Home', href: '/' },
  {
    label: 'State Charts',
    href: '/state-charts',
    isDisabled: true,
  },
]

export function getOdxD_Breadcrumps({
  odxd_shortName,
  odxd_objectId,
  isLastBreadcrumbSegment,
}: {
  odxd_shortName: string
  odxd_objectId: string
  isLastBreadcrumbSegment: boolean
}): BreadcrumbEntry[] {
  return [
    ...odxdStaticBreadcrumbs,
    {
      label: `${odxd_shortName}`,
      href: `/odx-d?objectId=${odxd_objectId}`,
      isCurrent: isLastBreadcrumbSegment,
    },
  ]
}

export function getDiagnosticVariant_Breadcrumps({
  odxd_shortName,
  odxd_objectId,
  variant_shortName,
  variant_objectId,
  isLastBreadcrumbSegment,
}: {
  odxd_shortName: string
  odxd_objectId: string
  variant_shortName: string
  variant_objectId: string
  isLastBreadcrumbSegment: boolean
}): BreadcrumbEntry[] {
  return [
    ...getOdxD_Breadcrumps({
      odxd_shortName: odxd_shortName,
      odxd_objectId: odxd_objectId,
      isLastBreadcrumbSegment: false,
    }),
    {
      label: 'Diagnostic Variants',
      href: `/odx-d?objectId=${odxd_objectId}`,
    },
    {
      label: `${variant_shortName}`,
      href: `/diagnostic-variant?objectId=${variant_objectId}&containerId=${odxd_objectId}`,
      isCurrent: isLastBreadcrumbSegment,
    },
  ]
}

export function getRevisionHistory_Breadcrumps({
  odxd_shortName,
  odxd_objectId,
  isLastBreadcrumbSegment,
  variant_shortName,
  variant_objectId,
}: {
  odxd_shortName: string
  odxd_objectId: string
  isLastBreadcrumbSegment: boolean
  variant_shortName?: string
  variant_objectId?: string
}): BreadcrumbEntry[] {
  return variant_shortName && variant_objectId
    ? [
        ...getDiagnosticVariant_Breadcrumps({
          odxd_shortName: odxd_shortName,
          odxd_objectId: odxd_objectId,
          variant_shortName: variant_shortName,
          variant_objectId: variant_objectId,
          isLastBreadcrumbSegment: false,
        }),
        {
          label: 'Revision History',
          href: `/revision?objectId=${variant_objectId}&containerId=${odxd_objectId}`,
          isCurrent: isLastBreadcrumbSegment,
        },
      ]
    : [
        ...getOdxD_Breadcrumps({
          odxd_shortName: odxd_shortName,
          odxd_objectId: odxd_objectId,
          isLastBreadcrumbSegment: false,
        }),
        {
          label: 'Revision History',
          href: `/revision?objectId=${odxd_objectId}`,
          isCurrent: isLastBreadcrumbSegment,
        },
      ]
}

export function getRevision_Breadcrumps({
  odxd_shortName,
  odxd_objectId,
  revision_objectId,
  revision_label,
  isLastBreadcrumbSegment,
  variant_shortName,
  variant_objectId,
}: {
  odxd_shortName: string
  odxd_objectId: string
  revision_objectId: string
  revision_label: string
  isLastBreadcrumbSegment: boolean
  variant_shortName?: string
  variant_objectId?: string
}): BreadcrumbEntry[] {
  return [
    ...getRevisionHistory_Breadcrumps({
      odxd_shortName: odxd_shortName,
      odxd_objectId: odxd_objectId,
      isLastBreadcrumbSegment: false,
      variant_shortName: variant_shortName,
      variant_objectId: variant_objectId,
    }),
    variant_shortName && variant_objectId
      ? {
          label: `${revision_label}`,
          href: `/revision/details?objectId=${revision_objectId}&revisionLabel=${revision_label}&containerId=${odxd_objectId}`,
          isCurrent: isLastBreadcrumbSegment,
        }
      : {
          label: `${revision_label}`,
          href: `/revision/details?objectId=${revision_objectId}&revisionLabel=${revision_label}`,
          isCurrent: isLastBreadcrumbSegment,
        },
  ]
}

export function getDiagnosticComm_Breadcrumps({
  odxd_shortName,
  odxd_objectId,
  variant_shortName,
  variant_objectId,
  diagComm_shortName,
  diagComm_objectId,
  isLastBreadcrumbSegment,
}: {
  odxd_shortName: string
  odxd_objectId: string
  variant_shortName: string
  variant_objectId: string
  diagComm_shortName: string
  diagComm_objectId: string
  isLastBreadcrumbSegment: boolean
}): BreadcrumbEntry[] {
  return [
    ...getDiagnosticVariant_Breadcrumps({
      odxd_shortName: odxd_shortName,
      odxd_objectId: odxd_objectId,
      variant_shortName: variant_shortName,
      variant_objectId: variant_objectId,
      isLastBreadcrumbSegment: false,
    }),
    {
      label: 'Diagnostic Communications',
      href: `/diagnostic-variant?objectId=${variant_objectId}&containerId=${odxd_objectId}`,
    },
    {
      label: `${diagComm_shortName}`,
      href: `/diagnostic-comm?objectId=${diagComm_objectId}&variantId=${variant_objectId}&containerId=${odxd_objectId}`,
      isCurrent: isLastBreadcrumbSegment,
    },
  ]
}

export function getParameter_Breadcrumps({
  odxd_shortName,
  odxd_objectId,
  variant_shortName,
  variant_objectId,
  element,
  element_shortName,
  element_objectId,
  reqResp_shortName,
  reqResp_objectId,
  param_shortName,
  param_objectId,
  reqOrResponse,
  isLastBreadcrumbSegment,
}: {
  odxd_shortName: string
  odxd_objectId: string
  variant_shortName: string
  variant_objectId: string
  element: 'DiagComm' | 'DOP'
  element_shortName: string
  element_objectId: string
  reqOrResponse: 'Request' | 'Response' | 'UNKNOWN'
  reqResp_shortName: string
  reqResp_objectId: string
  param_shortName: string
  param_objectId: string
  isLastBreadcrumbSegment: boolean
}): BreadcrumbEntry[] {
  return element === 'DiagComm'
    ? [
        ...getDiagnosticComm_Breadcrumps({
          odxd_shortName: odxd_shortName,
          odxd_objectId: odxd_objectId,
          variant_shortName: variant_shortName,
          variant_objectId: variant_objectId,
          diagComm_shortName: element_shortName,
          diagComm_objectId: element_objectId,
          isLastBreadcrumbSegment: false,
        }),
        {
          label: `${reqOrResponse}`,
          isDisabled: true,
        },
        {
          label: `${reqResp_shortName}`,
          isDisabled: true,
        },
        {
          label: 'Parameters',
          isDisabled: true,
        },
        {
          label: `${param_shortName}`,
          href: `/parameter?objectId=${param_objectId}&elementChildId=${reqResp_objectId}&elementId=${element_objectId}&variantId=${variant_objectId}&containerId=${odxd_objectId}`,
          isCurrent: isLastBreadcrumbSegment,
        },
      ]
    : [
        ...getDataObjectProp_Breadcrumps({
          odxd_shortName: odxd_shortName,
          odxd_objectId: odxd_objectId,
          variant_shortName: variant_shortName,
          variant_objectId: variant_objectId,
          dop_shortName: element_shortName,
          dop_objectId: element_objectId,
          isLastBreadcrumbSegment: false,
        }),
        {
          label: 'Parameters',
          isDisabled: true,
        },
        {
          label: `${param_shortName}`,
          href: `/parameter?objectId=${param_objectId}&elementId=${element_objectId}&variantId=${variant_objectId}&containerId=${odxd_objectId}`,
          isCurrent: isLastBreadcrumbSegment,
        },
      ]
}

export function getDiagnosticTroubleCode_Breadcrumps({
  odxd_shortName,
  odxd_objectId,
  variant_shortName,
  variant_objectId,
  dtc_shortName,
  dtc_objectId,
  isLastBreadcrumbSegment,
}: {
  odxd_shortName: string
  odxd_objectId: string
  variant_shortName: string
  variant_objectId: string
  dtc_shortName: string
  dtc_objectId: string
  isLastBreadcrumbSegment: boolean
}): BreadcrumbEntry[] {
  return [
    ...getDiagnosticVariant_Breadcrumps({
      odxd_shortName: odxd_shortName,
      odxd_objectId: odxd_objectId,
      variant_shortName: variant_shortName,
      variant_objectId: variant_objectId,
      isLastBreadcrumbSegment: false,
    }),
    {
      label: 'Diagnostic Trouble Codes',
      href: `/diagnostic-variant?objectId=${variant_objectId}&containerId=${odxd_objectId}`,
    },
    {
      label: `${dtc_shortName}`,
      href: `/dtcs?objectId=${dtc_objectId}&variantId=${variant_objectId}&containerId=${odxd_objectId}`,
      isCurrent: isLastBreadcrumbSegment,
    },
  ]
}

export function getStateCharts_Breadcrumbs({
  odxd_shortName,
  odxd_objectId,
  variant_shortName,
  variant_objectId,
  isLastBreadcrumbSegment,
}: {
  odxd_shortName: string
  odxd_objectId: string
  variant_shortName: string
  variant_objectId: string
  isLastBreadcrumbSegment: boolean
}): BreadcrumbEntry[] {
  return odxd_objectId !== '' && variant_objectId !== ''
    ? [
        ...getDiagnosticVariant_Breadcrumps({
          odxd_shortName: odxd_shortName,
          odxd_objectId: odxd_objectId,
          variant_shortName: variant_shortName,
          variant_objectId: variant_objectId,
          isLastBreadcrumbSegment: false,
        }),
        {
          label: 'State Charts',
          href: '/state-charts',
          isCurrent: isLastBreadcrumbSegment,
        },
      ]
    : [
        {
          label: 'State Charts',
          href: '/state-charts',
          isCurrent: isLastBreadcrumbSegment,
        },
      ]
}

export function getStateChartsOfVariant_Breadcrumbs({
  odxd_shortName,
  odxd_objectId,
  variant_shortName,
  variant_objectId,
  isLastBreadcrumbSegment,
}: {
  odxd_shortName: string
  odxd_objectId: string
  variant_shortName: string
  variant_objectId: string
  isLastBreadcrumbSegment: boolean
}): BreadcrumbEntry[] {
  return [
    ...getStateCharts_Breadcrumbs({
      odxd_shortName: odxd_shortName,
      odxd_objectId: odxd_objectId,
      variant_shortName: variant_shortName,
      variant_objectId: variant_objectId,
      isLastBreadcrumbSegment: false,
    }),
    {
      label: `${variant_shortName}/State Charts`,
      href: `/state-charts?variantId=${variant_objectId}&containerId=${odxd_objectId}`,
      isCurrent: isLastBreadcrumbSegment,
    },
  ]
}

export function getStateChart_Breadcrumbs({
  odxd_shortName,
  odxd_objectId,
  variant_shortName,
  variant_objectId,
  state_chart_id,
  state_chart_shortName,
  isLastBreadcrumbSegment,
}: {
  odxd_shortName: string
  odxd_objectId: string
  variant_shortName: string
  variant_objectId: string
  state_chart_id: string
  state_chart_shortName: string
  isLastBreadcrumbSegment: boolean
}): BreadcrumbEntry[] {
  return [
    ...getStateChartsOfVariant_Breadcrumbs({
      odxd_shortName: odxd_shortName,
      odxd_objectId: odxd_objectId,
      variant_shortName: variant_shortName,
      variant_objectId: variant_objectId,
      isLastBreadcrumbSegment: false,
    }),
    {
      label: `${state_chart_shortName}`,
      href: `/state-charts?objectId=${state_chart_id}&variantId=${variant_objectId}&containerId=${odxd_objectId}`,
      isCurrent: isLastBreadcrumbSegment,
    },
  ]
}

export function getDataObjectProp_Breadcrumps({
  odxd_shortName,
  odxd_objectId,
  variant_shortName,
  variant_objectId,
  dop_shortName,
  dop_objectId,
  isLastBreadcrumbSegment,
}: {
  odxd_shortName: string
  odxd_objectId: string
  variant_shortName: string
  variant_objectId: string
  dop_shortName: string
  dop_objectId: string
  isLastBreadcrumbSegment: boolean
}): BreadcrumbEntry[] {
  return [
    ...getDiagnosticVariant_Breadcrumps({
      odxd_shortName: odxd_shortName,
      odxd_objectId: odxd_objectId,
      variant_shortName: variant_shortName,
      variant_objectId: variant_objectId,
      isLastBreadcrumbSegment: false,
    }),
    {
      label: 'Diagnostic Object Properties',
      href: `/diagnostic-variant?objectId=${variant_objectId}&containerId=${odxd_objectId}`,
    },
    {
      label: `${dop_shortName}`,
      href: `/dops?objectId=${dop_objectId}&variantId=${variant_objectId}&containerId=${odxd_objectId}`,
      isCurrent: isLastBreadcrumbSegment,
    },
  ]
}
