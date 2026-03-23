// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Link } from '@heroui/link'
import { CircularProgress } from '@heroui/progress'
import {
  getKeyValue,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import client, { ObjectMetadata, Revision, useQuery } from '@/api/api-hooks'
import ApiError from '@/components/api-error'
import {
  DefaultBreadcrumbs,
  getRevisionHistory_Breadcrumps,
} from '@/components/breadcrumps'
import { LinkButton } from '@/components/commons'
import CompanyDataComponent from '@/components/company-data'
import { TableColumnDropdown } from '@/components/custom-dropdowns'
import { headline, subtitle, title } from '@/components/primitives'
import {
  ResetPageSettingsButton,
  useSelectionWithIndexedDB,
} from '@/storage/settings'
import { ColumnDefinition } from '@/types/index'

export default function RevisionPage() {
  const pageId = 'revision'

  const searchParams = useSearchParams()
  const objectIdQueryParam = searchParams.has('objectId')
    ? searchParams.get('objectId')
    : null
  const containerIdQueryParam = searchParams.has('containerId')
    ? searchParams.get('containerId')
    : null

  const objectId = objectIdQueryParam !== null ? objectIdQueryParam : undefined
  const containerId =
    containerIdQueryParam !== null ? containerIdQueryParam : undefined

  const {
    data: revisionHistory,
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

  // Get revision list or set an empty array as backup
  const items = revisionHistory
    ? revisionHistory.revisions
      ? revisionHistory.revisions
      : []
    : []

  const revisionColumns: ColumnDefinition[] = [
    {
      key: 'revision_label',
      label: 'REVISION LABEL',
      sortable: true,
    },
    {
      key: 'state',
      label: 'STATE',
      sortable: true,
    },
    {
      key: 'date',
      label: 'DATE',
      sortable: true,
    },
    {
      key: 'name',
      label: 'TEAM MEMBER',
      sortable: true,
    },
    {
      key: 'tool',
      label: 'TOOL',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'ACTIONS',
    },
  ]

  const INITIAL_VISIBLE_REVISION_COLUMNS = new Set([
    'revision_label',
    'state',
    'date',
    'actions',
  ])

  const [visibleRevisionColumns, setVisibleRevisionColumns] =
    useSelectionWithIndexedDB(
      pageId,
      'table-visibleRevisionColumns',
      INITIAL_VISIBLE_REVISION_COLUMNS
    )

  const [revisionSortDescriptor, setRevisionSortDescriptor] =
    React.useState<SortDescriptor>({
      column: 'name',
      direction: 'ascending',
    })

  const revisionHeaderColumns = React.useMemo(() => {
    if (visibleRevisionColumns === 'all') return revisionColumns

    return revisionColumns.filter((column) =>
      Array.from(visibleRevisionColumns).includes(column.key)
    )
  }, [visibleRevisionColumns])

  const sortedRevisionItems = React.useMemo(() => {
    return [...items].sort((a: Revision, b: Revision) => {
      const first = a[revisionSortDescriptor.column as keyof Revision]
      const second = b[revisionSortDescriptor.column as keyof Revision]

      if (first && second) {
        const cmp = first < second ? -1 : first > second ? 1 : 0

        return revisionSortDescriptor.direction === 'descending' ? -cmp : cmp
      }

      return 0
    })
  }, [revisionSortDescriptor, items])

  const revisionsTopContent = React.useMemo(() => {
    return (
      <div className="flex flex-row justify-between">
        <div className="text-start">
          <div
            className={subtitle({ class: 'mt-4' })}
            data-testid="revisions-subtitle"
          >
            Revisions
          </div>
        </div>
        <div>
          <TableColumnDropdown
            columnList={revisionColumns}
            defaultVisibleColumns={INITIAL_VISIBLE_REVISION_COLUMNS}
            tableName="revisions"
            visibleColumns={visibleRevisionColumns}
            visibleColumnsHandler={setVisibleRevisionColumns}
          />
        </div>
      </div>
    )
  }, [visibleRevisionColumns])

  if (error) return <ApiError error={error} />
  if (isLoading || !revisionHistory)
    return <CircularProgress aria-label="Loading..." />

  return (
    <div>
      <DefaultBreadcrumbs
        breadcrumbs={
          revisionHistory.container_type == 'ECU_VARIANT'
            ? getRevisionHistory_Breadcrumps({
                odxd_shortName: containerData?.short_name
                  ? containerData.short_name
                  : '',
                odxd_objectId: contextObjectId ? contextObjectId : '',
                isLastBreadcrumbSegment: true,
                variant_shortName: revisionHistory.container_name
                  ? revisionHistory.container_name
                  : '',
                variant_objectId: revisionHistory.container_perma_id
                  ? revisionHistory.container_perma_id
                  : 'unresolved',
              })
            : getRevisionHistory_Breadcrumps({
                odxd_shortName: containerData?.short_name
                  ? containerData.short_name
                  : '',
                odxd_objectId: contextObjectId ? contextObjectId : '',
                isLastBreadcrumbSegment: true,
              })
        }
      />

      <section>
        <h1
          className={`${title()} whitespace-nowrap`}
          data-testid="revision-history-title"
        >
          Revision History
        </h1>
        <p className="mt-4" />
        <h2
          className={headline()}
          data-testid="revision-history-container-name"
        >
          {revisionHistory.container_name}
        </h2>

        <ResetPageSettingsButton page={pageId} />

        <div className="flex flex-col gap-4">
          <div className="pb-5">
            <div className="text-start">
              <div
                className={subtitle({ class: 'mt-4' })}
                data-testid="revision-history-metadata-subtitle"
              >
                Metadata
              </div>
            </div>

            <div className="flex table-auto justify-start">
              <Table
                hideHeader
                isStriped
                aria-label="Revision history metadata table"
              >
                <TableHeader>
                  <TableColumn>First</TableColumn>
                  <TableColumn>Second</TableColumn>
                </TableHeader>
                <TableBody>
                  <TableRow key="1">
                    <TableCell width="150">
                      <b>Name</b>
                    </TableCell>
                    <TableCell>
                      {revisionHistory ? (
                        revisionHistory.container_name
                      ) : (
                        <div>Unknown</div>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow key="2">
                    <TableCell>
                      <b>Type</b>
                    </TableCell>
                    <TableCell>
                      {revisionHistory ? (
                        revisionHistory.container_type
                      ) : (
                        <div>Unknown</div>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow key="3">
                    <TableCell>
                      <b>Language</b>
                    </TableCell>
                    <TableCell>
                      {revisionHistory ? (
                        revisionHistory.language
                      ) : (
                        <div>Unknown</div>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex table-auto pb-5">
            <Table
              isHeaderSticky
              isStriped
              aria-label="Revision history table"
              classNames={{
                wrapper: 'max-h-[382px]',
              }}
              sortDescriptor={revisionSortDescriptor}
              topContent={revisionsTopContent}
              topContentPlacement="outside"
              onSortChange={setRevisionSortDescriptor}
            >
              <TableHeader columns={revisionHeaderColumns}>
                {(column) => (
                  <TableColumn key={column.key} allowsSorting={column.sortable}>
                    {column.label}
                  </TableColumn>
                )}
              </TableHeader>
              {!revisionHistory || error ? (
                <TableBody emptyContent={'No rows to display.'}>{[]}</TableBody>
              ) : (
                <TableBody items={sortedRevisionItems}>
                  {(item) => (
                    <TableRow
                      key={`${item.revision_label} ${item.date}`}
                      data-testid="revisions-row"
                    >
                      {(columnKey) => (
                        <TableCell>
                          {columnKey === 'actions' ? (
                            <div className="flex space-x-2">
                              <LinkButton
                                href={
                                  revisionHistory.container_type ==
                                  'ECU_VARIANT'
                                    ? `/revision/details?objectId=${objectId}&revisionLabel=${item.revision_label}&containerId=${contextObjectId}`
                                    : `/revision/details?objectId=${objectId}&revisionLabel=${item.revision_label}`
                                }
                                label="Details"
                              />
                            </div>
                          ) : columnKey === 'name' ? (
                            getKeyValue(item.team_member_ref, columnKey)
                          ) : columnKey === 'revision_label' ? (
                            <Link
                              href={
                                revisionHistory.container_type == 'ECU_VARIANT'
                                  ? `/revision/details?objectId=${objectId}&revisionLabel=${item.revision_label}&containerId=${contextObjectId}`
                                  : `/revision/details?objectId=${objectId}&revisionLabel=${item.revision_label}`
                              }
                            >
                              {getKeyValue(item, columnKey)}
                            </Link>
                          ) : (
                            getKeyValue(item, columnKey)
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              )}
            </Table>
          </div>
          {
            // Display company data table, if the revision history provides company data
            revisionHistory.company_datas ? (
              revisionHistory.company_datas.length > 0 ? (
                <CompanyDataComponent
                  companyDatas={revisionHistory.company_datas}
                  pageId={pageId}
                />
              ) : (
                <div />
              )
            ) : (
              <div />
            )
          }
        </div>
      </section>
    </div>
  )
}
