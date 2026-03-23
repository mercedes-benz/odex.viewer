// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Chip } from '@heroui/chip'
import { Link } from '@heroui/link'
import { CircularProgress } from '@heroui/progress'
import {
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import { useAsyncList } from '@react-stately/data'
import React from 'react'

import {
  DiagnosticDataSetDescriptor,
  DiagnosticLayerContainerInfo,
  useQuery,
} from '@/api/api-hooks'
import ApiError from '@/components/api-error'
import { LinkButton } from '@/components/commons'
import { TableColumnDropdown } from '@/components/custom-dropdowns'
import { CheckIcon } from '@/components/icons'
import { subtitle } from '@/components/primitives'
import { ColumnDefinition } from '@/types/index'
import { sortItemsBySortDescriptor } from '@/utils/utils'
import { useSelectionWithIndexedDB } from '@/storage/settings'

type PlainDatasetType = Omit<
  DiagnosticDataSetDescriptor,
  'diagnostic_layer_containers'
>
type CombinedDatasetDlcType = PlainDatasetType & {
  [Property in keyof DiagnosticLayerContainerInfo as `dlc_${string & Property}`]: DiagnosticLayerContainerInfo[Property]
}

function resolveDLCBasedDatabaseInfo(
  databases: DiagnosticDataSetDescriptor[]
): CombinedDatasetDlcType[] {
  const result: CombinedDatasetDlcType[] = []

  for (let entry of databases) {
    if (entry.diagnostic_layer_containers) {
      for (let dlc of entry.diagnostic_layer_containers) {
        result.push({
          perma_id: entry.perma_id,
          ephemeral_id: entry.ephemeral_id,
          file_name: entry.file_name,
          dlc_ephemeral_id: dlc.ephemeral_id,
          dlc_perma_id: dlc.perma_id,
          dlc_short_name: dlc.short_name,
          dlc_isMainContainer: dlc.isMainContainer,
        })
      }
    } else {
      result.push({
        perma_id: entry.perma_id,
        ephemeral_id: entry.ephemeral_id,
        file_name: entry.file_name,
        dlc_ephemeral_id: 0,
        dlc_perma_id: 'unresolved',
        dlc_short_name: '',
        dlc_isMainContainer: false,
      })
    }
  }

  return result
}

export function OdxDatabasesComponent({ pageId }: { pageId: string }) {
  const {
    data: odx_databases,
    error: error_databases,
    isLoading: isLoading_databases,
  } = useQuery('/diagnostic-data-sets/{data-type}', {
    params: { path: { 'data-type': 'PDX' } },
  })

  let list = useAsyncList({
    async load() {
      return {
        items: odx_databases
          ? resolveDLCBasedDatabaseInfo(odx_databases.items)
          : [],
      }
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) =>
          sortItemsBySortDescriptor<CombinedDatasetDlcType>(
            a,
            b,
            sortDescriptor
          )
        ),
      }
    },
  })

  const columns: ColumnDefinition[] = [
    { label: 'PERMA ID', key: 'perma_id', sortable: true },
    { label: 'EPHEMERAL ID', key: 'ephemeral_id', sortable: true },
    { label: 'FILE NAME', key: 'file_name', sortable: true },
    {
      key: 'dlc_perma_id',
      label: 'DLC PERMA ID',
      sortable: true,
    },
    {
      key: 'dlc_ephemeral_id',
      label: 'DLC EPHEMERAL ID',
      sortable: true,
    },
    {
      key: 'dlc_short_name',
      label: 'DLC SHORT-NAME',
      sortable: true,
    },
    {
      key: 'dlc_isMainContainer',
      label: 'DLC MAIN CONTAINER',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'ACTIONS',
    },
  ]

  const INITIAL_VISIBLE_COLUMNS = new Set([
    'file_name',
    'dlc_short_name',
    'dlc_isMainContainer',
    'actions',
  ])
  const [visibleColumns, setVisibleColumns] = useSelectionWithIndexedDB(
    pageId,
    'databases#table-visibleColumns',
    INITIAL_VISIBLE_COLUMNS
  )

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === 'all') return columns

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.key)
    )
  }, [visibleColumns])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-row justify-between">
        <div className="text-start">
          <div
            className={subtitle({ class: 'mt-4' })}
            data-testid="odx-databases-subtitle"
          >
            Overview of loaded Diagnostic Layer Containers
          </div>
        </div>
        <div>
          <TableColumnDropdown
            columnList={columns}
            defaultVisibleColumns={INITIAL_VISIBLE_COLUMNS}
            tableName="odxDatabases"
            visibleColumns={visibleColumns}
            visibleColumnsHandler={setVisibleColumns}
          />
        </div>
      </div>
    )
  }, [visibleColumns])

  React.useEffect(() => {
    if (odx_databases) {
      // If you want the list to update whenever data changes, reload it.
      list.reload()
    }
  }, [odx_databases])

  if (isLoading_databases) return <CircularProgress aria-label="Loading..." />
  if (error_databases) return <ApiError error={error_databases} />

  return (
    <div className="flex table-auto">
      <Table
        isHeaderSticky
        isStriped
        aria-label="Diagnostic layer containers table"
        id="database-diaglayercontainer-table"
        sortDescriptor={list.sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={list.sort}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.key}
              allowsSorting={column.key !== 'actions'}
              className="text-left justify-left"
            >
              {column.label}
              {column.filter ? (
                <span className="ml-2">{column.filter}</span>
              ) : null}
            </TableColumn>
          )}
        </TableHeader>
        {!list.items || error_databases ? (
          <TableBody emptyContent={'No rows to display.'}>{[]}</TableBody>
        ) : (
          <TableBody items={list.items}>
            {(item) => (
              <TableRow
                key={item.perma_id + item.dlc_perma_id}
                aria-label={item.file_name + '-' + item.dlc_short_name}
              >
                {(columnKey) => (
                  <TableCell>
                    {columnKey === 'actions' ? (
                      <div className="flex space-x-2">
                        <LinkButton
                          href={`/odx-d?objectId=${item.perma_id}`}
                          label="Show ODX-D"
                        />
                      </div>
                    ) : columnKey === 'dlc_isMainContainer' ? (
                      <div className="flex align-center gap-2">
                        {item.dlc_isMainContainer ? (
                          <Chip
                            color="success"
                            radius="sm"
                            startContent={<CheckIcon size={18} />}
                            variant="bordered"
                          >
                            TRUE
                          </Chip>
                        ) : (
                          <Chip color="danger" radius="sm" variant="bordered">
                            FALSE
                          </Chip>
                        )}
                      </div>
                    ) : columnKey === 'dlc_short_name' ||
                      columnKey === 'dlc_perma_id' ? (
                      <div className="flex align-center gap-2">
                        {item.dlc_isMainContainer ? (
                          <Link href={`/odx-d?objectId=${item.perma_id}`}>
                            {getKeyValue(item, columnKey)}
                          </Link>
                        ) : (
                          getKeyValue(item, columnKey)
                        )}
                      </div>
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
  )
}
