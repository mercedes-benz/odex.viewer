// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { CircularProgress } from '@heroui/progress'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import client, { ObjectMetadata, ParameterUnionType } from '@/api/api-hooks'
import {
  DefaultBreadcrumbs,
  getParameter_Breadcrumps,
} from '@/components/breadcrumps'
import { ParameterDetailsComponent } from '@/components/parameters'
import { headline, title } from '@/components/primitives'
import { ResetPageSettingsButton } from '@/storage/settings'
import { ParameterTargetObjectIds } from '@/types'

export default function ParameterPage() {
  const pageId = 'parameters'

  const searchParams = useSearchParams()
  const objectIdQueryParam = searchParams.has('objectId')
    ? searchParams.get('objectId')
    : null
  const elementChildIdQueryParam = searchParams.has('elementChildId')
    ? searchParams.get('elementChildId')
    : null
  const elementIdQueryParam = searchParams.has('elementId')
    ? searchParams.get('elementId')
    : null
  const variantIdQueryParam = searchParams.has('variantId')
    ? searchParams.get('variantId')
    : null
  const containerIdQueryParam = searchParams.has('containerId')
    ? searchParams.get('containerId')
    : null

  const objectId = objectIdQueryParam !== null ? objectIdQueryParam : undefined
  const elementChildId =
    elementChildIdQueryParam !== null ? elementChildIdQueryParam : undefined
  const elementId =
    elementIdQueryParam !== null ? elementIdQueryParam : undefined
  const variantId =
    variantIdQueryParam !== null ? variantIdQueryParam : undefined
  const containerId =
    containerIdQueryParam !== null ? containerIdQueryParam : undefined

  const [containerData, setContainerData] = React.useState<ObjectMetadata>()
  const [variantData, setVariantData] = React.useState<ObjectMetadata>()
  const [elementData, setElementData] = React.useState<ObjectMetadata>()
  const [elementChildData, setElementChildData] =
    React.useState<ObjectMetadata>()
  const [parameterData, setParameterData] = React.useState<ParameterUnionType>()

  const [targetObjectIds, setTargetObjectIds] =
    React.useState<ParameterTargetObjectIds>({
      containerId: 'unresolved',
      variantId: 'unresolved',
      elementId: 'unresolved',
      elementChildId: 'unresolved',
      parameterEphemeralId: 0,
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

      const diagCommResult = await client.GET(
        '/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}',
        {
          params: {
            path: {
              'diag-data-set-id': containerId ? containerId : 'unresolved',
              'perma-id': elementId ? elementId : 'unresolved',
            },
            query: { resolve_main_diag_layer: false },
          },
        }
      )

      if (diagCommResult.data && !diagCommResult.error) {
        setElementData(diagCommResult.data)
      }

      if (elementChildId !== undefined) {
        const elementChildResult = await client.GET(
          '/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}',
          {
            params: {
              path: {
                'diag-data-set-id': containerId ? containerId : 'unresolved',
                'perma-id': elementChildId ? elementChildId : 'unresolved',
              },
              query: { resolve_main_diag_layer: false },
            },
          }
        )

        if (elementChildResult.data && !elementChildResult.error) {
          setElementChildData(elementChildResult.data)
        }
      }

      const paramResult = await client.GET(
        '/structured-data/{schema-name}/{ephemeral-id}',
        {
          params: {
            path: {
              'schema-name': 'Parameter',
              'ephemeral-id': objectId ? Number(objectId) : 0,
            },
          },
        }
      )

      if (paramResult.data && !paramResult.error) {
        setParameterData(paramResult.data as ParameterUnionType)
      }
    }

    if (containerId && variantId && objectId) {
      setTargetObjectIds({
        containerId: containerId ? containerId : 'unresolved',
        variantId: variantId ? variantId : 'unresolved',
        elementId: elementId ? elementId : 'unresolved',
        elementChildId: elementChildId ? elementChildId : 'unresolved',
        parameterEphemeralId: objectId ? Number(objectId) : 0,
      })

      fetchMetaData()
    }
  }, [containerId, variantId, elementId, elementChildId, objectId])

  return parameterData ? (
    <div>
      <DefaultBreadcrumbs
        breadcrumbs={getParameter_Breadcrumps({
          odxd_shortName: containerData?.short_name
            ? containerData.short_name
            : '',
          odxd_objectId: containerId ? containerId : '',
          isLastBreadcrumbSegment: true,
          variant_shortName: variantData?.short_name
            ? variantData.short_name
            : '',
          variant_objectId: variantId ? variantId : 'unresolved',
          element:
            elementChildData !== undefined && elementChildId !== 'unresolved'
              ? 'DiagComm'
              : 'DOP',
          element_shortName: elementData?.short_name
            ? elementData.short_name
            : '',
          element_objectId: elementId ? elementId : 'unresolved',
          reqOrResponse: elementChildData?.class_name
            ? elementChildData.class_name === 'Request'
              ? 'Request'
              : elementChildData.class_name === 'Response'
                ? 'Response'
                : 'UNKNOWN'
            : 'UNKNOWN',
          reqResp_shortName: elementChildData?.short_name
            ? elementChildData?.short_name
            : '',
          reqResp_objectId: elementChildId ? elementChildId : 'unresolved',
          param_shortName: parameterData?.short_name
            ? parameterData?.short_name
            : '',
          param_objectId: objectId ? objectId : 'unresolved',
        })}
      />

      <h1 className={title()}>Parameter</h1>
      <p className="mt-4" />
      <h2 className={headline()}>{parameterData.short_name}</h2>

      <ResetPageSettingsButton page={pageId} />

      <div className="mt-5">
        <ParameterDetailsComponent
          parameterData={parameterData}
          targetObjectIds={targetObjectIds}
        />
      </div>
    </div>
  ) : (
    <CircularProgress aria-label="Loading..." />
  )
}
