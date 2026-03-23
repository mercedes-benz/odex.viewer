// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { CircularProgress } from '@heroui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@heroui/table'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import client, { ObjectMetadata, useQuery } from '@/api/api-hooks'
import ApiError from '@/components/api-error'
import {
  DefaultBreadcrumbs,
  getRevision_Breadcrumps,
} from '@/components/breadcrumps'
import { headline, subtitle, title } from '@/components/primitives'

export default function RevisionDetailsPage() {
  const searchParams = useSearchParams()
  const objectIdQueryParam = searchParams.has('objectId')
    ? searchParams.get('objectId')
    : null
  const containerIdQueryParam = searchParams.has('containerId')
    ? searchParams.get('containerId')
    : null
  const revisionLabelQueryParam = searchParams.has('revisionLabel')
    ? searchParams.get('revisionLabel')
    : null

  const objectId = objectIdQueryParam !== null ? objectIdQueryParam : undefined
  const containerId =
    containerIdQueryParam !== null ? containerIdQueryParam : undefined
  const revisionLabel =
    revisionLabelQueryParam !== null ? revisionLabelQueryParam : undefined

  const {
    data: revision,
    error,
    isLoading,
  } = useQuery(
    containerId
      ? '/diagnostic-data-sets/{diag-data-set-id}/revision-history/{perma-id}'
      : '/diagnostic-data-sets/{diag-data-set-id}/revision-history',
    {
      params: {
        path: {
          'diag-data-set-id': containerId
            ? containerId
            : objectId
              ? objectId
              : 'unresolved',
          'perma-id': objectId ? objectId : 'unresolved',
        },
      },
    }
  )

  const [containerData, setContainerData] = React.useState<ObjectMetadata>()
  const [contextObjectId, setContextObjectId] = React.useState<
    string | undefined
  >(containerId)

  React.useEffect(() => {
    const fetchMetaData = async () => {
      if (!containerId) {
        setContextObjectId(objectId)
      }

      const containerResult = await client.GET(
        '/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}',
        {
          params: {
            path: {
              'diag-data-set-id': containerId
                ? containerId
                : objectId
                  ? objectId
                  : 'unresolved',
              'perma-id': containerId
                ? containerId
                : objectId
                  ? objectId
                  : 'unresolved',
            },
            query: { resolve_main_diag_layer: false },
          },
        }
      )

      if (containerResult.data && !containerResult.error) {
        setContainerData(containerResult.data)
      }
    }

    fetchMetaData()
  }, [])

  const rows = [
    {
      key: 'container_name',
      label: 'Name',
    },
    {
      key: 'container_type',
      label: 'Type',
    },
    {
      key: 'revision_label',
      label: 'REVISION LABEL',
    },
    {
      key: 'state',
      label: 'STATE',
    },
    {
      key: 'date',
      label: 'DATE',
    },
    {
      key: 'name',
      label: 'TEAM MEMBER',
    },
    {
      key: 'tool',
      label: 'TOOL',
    },
  ]

  const items = revision ? revision.revisions : []
  const item = items?.find((item) => item.revision_label === revisionLabel)
  const modifications = item?.modifications?.map((mod, index) => {
    return { key: index, change: mod.change, reason: mod.reason }
  })

  if (error) return <ApiError error={error} />
  if (isLoading || !revision || !item)
    return <CircularProgress aria-label="Loading..." />

  return (
    <div>
      <DefaultBreadcrumbs
        breadcrumbs={
          revision.container_type == 'ECU_VARIANT'
            ? getRevision_Breadcrumps({
                odxd_shortName: containerData?.short_name
                  ? containerData.short_name
                  : '',
                odxd_objectId: contextObjectId ? contextObjectId : '',
                revision_objectId: item.ephemeral_id
                  ? item.ephemeral_id.toString()
                  : '',
                revision_label: item.revision_label ? item.revision_label : '',
                variant_shortName: revision.container_name
                  ? revision.container_name
                  : '',
                variant_objectId: revision.container_perma_id
                  ? revision.container_perma_id
                  : 'unresolved',
                isLastBreadcrumbSegment: true,
              })
            : getRevision_Breadcrumps({
                odxd_shortName: containerData?.short_name
                  ? containerData.short_name
                  : '',
                odxd_objectId: contextObjectId ? contextObjectId : '',
                revision_objectId: item.ephemeral_id
                  ? item.ephemeral_id.toString()
                  : '',
                revision_label: item.revision_label ? item.revision_label : '',
                isLastBreadcrumbSegment: true,
              })
        }
      />

      <h1
        className={`${title()} whitespace-nowrap`}
        data-testid="revision-title"
      >
        Details of Revision
      </h1>
      <p className="mt-4" />
      <h2 className={headline()} data-testid="revision-label-heading">
        {revisionLabel}
      </h2>

      <div className="pb-5">
        <div className="text-start">
          <div
            className={subtitle({ class: 'mt-4' })}
            data-testid="revision-metadata-subtitle"
          >
            Metadata
          </div>
        </div>

        <Table hideHeader isStriped aria-label="Revision details table">
          <TableHeader>
            <TableColumn>ROW_NAME</TableColumn>
            <TableColumn>DETAILS</TableColumn>
          </TableHeader>
          {items && item ? (
            <TableBody items={rows}>
              {(row) => (
                <TableRow key={getKeyValue(item, row.key)}>
                  <TableCell width="150">{row.label}</TableCell>
                  <TableCell>
                    {row.key === 'name'
                      ? getKeyValue(item.team_member_ref, row.key)
                      : getKeyValue(item, row.key)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          ) : (
            <TableBody emptyContent={'No rows to display.'}>{[]}</TableBody>
          )}
        </Table>
      </div>

      <div className="">
        <div className="text-start">
          <div
            className={subtitle({ class: 'mt-4' })}
            data-testid="revision-modifications-subtitle"
          >
            Modifications
          </div>
        </div>

        <Table
          isHeaderSticky
          isStriped
          aria-label="Revision modifications table"
        >
          <TableHeader>
            <TableColumn className="w-1/2">CHANGE</TableColumn>
            <TableColumn className="w-1/2">REASON</TableColumn>
          </TableHeader>
          {items && item ? (
            <TableBody items={modifications ? modifications : []}>
              {(mod) => (
                <TableRow
                  key={mod.key}
                  data-testid="revision-modifications-row"
                >
                  <TableCell className="align-top">{mod.change}</TableCell>
                  <TableCell className="align-top">{mod.reason}</TableCell>
                </TableRow>
              )}
            </TableBody>
          ) : (
            <TableBody emptyContent={'No rows to display.'}>{[]}</TableBody>
          )}
        </Table>
      </div>
    </div>
  )
}
