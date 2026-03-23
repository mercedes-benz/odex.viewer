// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { CircularProgress } from '@heroui/progress'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import client, { DiagnosticTroubleCode, ObjectMetadata } from '@/api/api-hooks'
import {
  DefaultBreadcrumbs,
  diagTroubleCodeStaticBreadcrumps,
  getDiagnosticTroubleCode_Breadcrumps,
} from '@/components/breadcrumps'
import {
  DiagTroubleCodesOverviewComponent,
  DtcMetadataComponent,
} from '@/components/dtcs'
import { headline, subtitle, title } from '@/components/primitives'
import { SpecialDataGroupsComponent } from '@/components/specialdatagroups'
import { ResetPageSettingsButton } from '@/storage/settings'
import { DiagnosticTroubleCodeTargetObjectIds } from '@/types/index'

export default function DtcsPage() {
  const pageId = 'dtcs'

  const searchParams = useSearchParams()
  const objectIdQueryParam = searchParams.has('objectId')
    ? searchParams.get('objectId')
    : null
  const variantIdQueryParam = searchParams.has('variantId')
    ? searchParams.get('variantId')
    : null
  const containerIdQueryParam = searchParams.has('containerId')
    ? searchParams.get('containerId')
    : null

  const objectId = objectIdQueryParam !== null ? objectIdQueryParam : undefined
  const variantId =
    variantIdQueryParam !== null ? variantIdQueryParam : undefined
  const containerId =
    containerIdQueryParam !== null ? containerIdQueryParam : undefined

  const [containerData, setContainerData] = React.useState<ObjectMetadata>()
  const [variantData, setVariantData] = React.useState<ObjectMetadata>()
  const [dtcData, setDtcData] = React.useState<DiagnosticTroubleCode>()

  const [targetObjectIds, setTargetObjectIds] =
    React.useState<DiagnosticTroubleCodeTargetObjectIds>({
      containerId: 'unresolved',
      variantId: 'unresolved',
      dtcId: 'unresolved',
    })

  React.useEffect(() => {
    const fetchMetaData = async () => {
      const containerResult = await client.GET(
        '/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}',
        {
          params: {
            path: {
              'diag-data-set-id': containerId ? containerId : 'unresolved',
              'perma-id': containerId ? containerId : 'unresolved',
            },
            query: { resolve_main_diag_layer: false },
          },
        }
      )

      if (containerResult.data && !containerResult.error) {
        setContainerData(containerResult.data)
      }

      const variantResult = await client.GET(
        '/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}',
        {
          params: {
            path: {
              'diag-data-set-id': containerId ? containerId : 'unresolved',
              'perma-id': variantId ? variantId : 'unresolved',
            },
            query: { resolve_main_diag_layer: false },
          },
        }
      )

      if (variantResult.data && !variantResult.error) {
        setVariantData(variantResult.data)
      }

      const dtcResult = await client.GET(
        '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dtcs/{dtc-perma-id}',
        {
          params: {
            path: {
              'diag-data-set-id': containerId ? containerId : 'unresolved',
              'variant-perma-id': variantId ? variantId : 'unresolved',
              'dtc-perma-id': objectId ? objectId : 'unresolved',
            },
          },
        }
      )

      if (dtcResult.data && !dtcResult.error) {
        setDtcData(dtcResult.data)
      }
    }

    if (containerId && variantId && objectId) {
      setTargetObjectIds({
        containerId: containerId ? containerId : 'unresolved',
        variantId: variantId ? variantId : 'unresolved',
        dtcId: objectId ? objectId : 'unresolved',
      })

      fetchMetaData()
    }
  }, [containerId, variantId, objectId])

  return objectId ? (
    dtcData !== undefined ? (
      <div>
        <DefaultBreadcrumbs
          breadcrumbs={getDiagnosticTroubleCode_Breadcrumps({
            odxd_shortName: containerData?.short_name
              ? containerData.short_name
              : '',
            odxd_objectId: containerId ? containerId : '',
            isLastBreadcrumbSegment: true,
            variant_shortName: variantData?.short_name
              ? variantData.short_name
              : '',
            variant_objectId: variantId ? variantId : 'unresolved',
            dtc_shortName: dtcData?.short_name ? dtcData.short_name : '',
            dtc_objectId: objectId,
          })}
        />

        <h1 className={title()}>Diagnostic Trouble Code</h1>
        <p className="mt-4" />
        <h2 className={headline()}>{dtcData.short_name}</h2>

        <ResetPageSettingsButton page={pageId} />

        <div className="min-w-4xl pt-5">
          <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
            Metadata
          </div>
          <DtcMetadataComponent
            dtcData={dtcData}
            targetObjectIds={targetObjectIds}
          />
        </div>
        {dtcData.sdgs && dtcData.sdgs.length > 0 ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Special Data Groups
            </div>
            <SpecialDataGroupsComponent
              pageId={pageId}
              sdgs={dtcData.sdgs}
              showExpandAllButton={true}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    ) : (
      <CircularProgress aria-label="Loading..." />
    )
  ) : (
    <div>
      <DefaultBreadcrumbs breadcrumbs={[...diagTroubleCodeStaticBreadcrumps]} />

      <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
        List of all Diagnostic Trouble Codes of all loaded ODX-Ds
      </div>

      <div className="mb-5">
        <ResetPageSettingsButton page={pageId} />
      </div>

      <DiagTroubleCodesOverviewComponent pageId={pageId} />
    </div>
  )
}
