// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Button } from '@heroui/button'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from '@heroui/dropdown'
import { Input } from '@heroui/input'
import { Link } from '@heroui/link'
import { Pagination } from '@heroui/pagination'
import { CircularProgress } from '@heroui/progress'
import {
  Selection,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import React from 'react'

import client, { DiagnosticDataSetDescriptor, useQuery } from '@/api/api-hooks'
import ApiError from '@/components/api-error'
import {
  ActionDropdown,
  NextPageButton,
  PreviousPageButton,
} from '@/components/commons'
import { ChevronDownIcon, SearchIcon, TrashIcon } from '@/components/icons'
import { useSelectionWithIndexedDB } from '@/storage/settings'

export const columns = [
  { name: 'PERMA ID', uid: 'perma_id', sortable: true },
  { name: 'EPHEMERAL ID', uid: 'ephemeral_id', sortable: true },
  { name: 'FILE NAME', uid: 'file_name', sortable: true },
  { name: 'DISPLAY NAME', uid: 'display_name', sortable: true },
  { name: 'CREATION DATE', uid: 'creation_date', sortable: true },
  { name: 'LAST MODIFIED', uid: 'last_modified', sortable: true },
  { name: 'VERSION', uid: 'version', sortable: true },
  { name: 'ACTIONS', uid: 'actions' },
]

const INITIAL_VISIBLE_COLUMNS = new Set([
  'file_name',
  'creation_date',
  'version',
  'actions',
])

export default function DiagnosticDataSetsComponent({
  pageId,
}: {
  pageId: string
}) {
  const { data, error, isLoading, mutate } = useQuery(
    '/diagnostic-data-sets/{data-type}',
    {
      params: { path: { 'data-type': 'PDX' } },
    }
  )

  // Get loaded diagnostic data sets or set an empty array as backup
  const diagDataSets = data ? data.items : []

  const [filterValue, setFilterValue] = React.useState('')
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]))
  const [visibleColumns, setVisibleColumns] = useSelectionWithIndexedDB(
    pageId,
    'diagDataSets#table-visibleColumns',
    INITIAL_VISIBLE_COLUMNS
  )

  const [rowsPerPage, setRowsPerPage] = React.useState(5)
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: 'file_name',
    direction: 'ascending',
  })

  const [page, setPage] = React.useState(1)

  const hasSearchFilter = Boolean(filterValue)

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === 'all') return columns

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    )
  }, [visibleColumns])

  const filteredItems = React.useMemo(() => {
    let filteredFiles = [...diagDataSets]

    if (hasSearchFilter) {
      filteredFiles = filteredFiles.filter(
        (file) =>
          file.display_name
            ?.toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          file.file_name?.toLowerCase().includes(filterValue.toLowerCase())
      )
    }

    return filteredFiles
  }, [diagDataSets, filterValue])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const sortedItems = React.useMemo(() => {
    return [...items].sort(
      (a: DiagnosticDataSetDescriptor, b: DiagnosticDataSetDescriptor) => {
        const first = a[
          sortDescriptor.column as keyof DiagnosticDataSetDescriptor
        ] as number
        const second = b[
          sortDescriptor.column as keyof DiagnosticDataSetDescriptor
        ] as number
        const cmp = first < second ? -1 : first > second ? 1 : 0

        return sortDescriptor.direction === 'descending' ? -cmp : cmp
      }
    )
  }, [sortDescriptor, items])

  const renderCell = React.useCallback(
    (dSet: DiagnosticDataSetDescriptor, columnKey: React.Key) => {
      switch (columnKey) {
        case 'file_name':
          return (
            <Link href={`/odx-d?objectId=${dSet.perma_id}`}>
              {dSet.file_name}
            </Link>
          )
        case 'display_name':
          return <p>{dSet.display_name}</p>
        case 'ephemeral_id':
          return <p>{dSet.ephemeral_id}</p>
        case 'perma_id':
          return <p>{dSet.perma_id}</p>
        case 'version':
          return <p>{dSet.version}</p>
        case 'creation_date':
          return <p>{dSet.creation_date}</p>
        case 'last_modified':
          return <p>{dSet.last_modified}</p>
        case 'actions':
          return (
            <div className="relative flex justify-end items-center gap-2">
              <ActionDropdown
                deleteFunc={async () => {
                  await client.DELETE(
                    '/diagnostic-data-sets/{data-type}/{diag-data-set-id}',
                    {
                      params: {
                        path: {
                          'data-type': 'PDX',
                          'diag-data-set-id': dSet.perma_id,
                        },
                      },
                    }
                  )
                  mutate()
                }}
                view_href={`/odx-d?objectId=${dSet.perma_id}`}
              />
            </div>
          )
        default:
          return <></>
      }
    },
    []
  )

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1)
    }
  }, [page, pages])

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1)
    }
  }, [page])

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value))
      setPage(1)
    },
    []
  )

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value)
      setPage(1)
    } else {
      setFilterValue('')
    }
  }, [])

  const onClear = React.useCallback(() => {
    setFilterValue('')
    setPage(1)
  }, [])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  color={
                    visibleColumns !== 'all' &&
                    visibleColumns.difference(INITIAL_VISIBLE_COLUMNS).size == 0
                      ? 'default'
                      : 'warning'
                  }
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="shadow"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                classNames={{
                  list: 'max-h-[250px] overflow-y-auto',
                }}
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onAction={(key) => {
                  if (key === 'reset-to-default') {
                    setVisibleColumns(new Set(INITIAL_VISIBLE_COLUMNS))
                  } else if (key === 'select-all') {
                    setVisibleColumns(
                      new Set(columns.flatMap((entry) => entry.uid))
                    )
                  }
                }}
                onSelectionChange={setVisibleColumns}
              >
                <DropdownSection showDivider>
                  {columns.map((column) => (
                    <DropdownItem key={column.uid}>{column.name}</DropdownItem>
                  ))}
                </DropdownSection>
                <DropdownSection title="Selection">
                  <DropdownItem key="select-all">Select all</DropdownItem>
                  <DropdownItem key="reset-to-default">
                    Reset to default
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              endContent={<TrashIcon size={20} />}
              onPress={async () => {
                await client.DELETE('/diagnostic-data-sets/{data-type}', {
                  params: { path: { 'data-type': 'PDX' } },
                })
                mutate()
              }}
            >
              Clear all loaded data sets
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-small">Total {diagDataSets.length} files</span>
          <label className="flex items-center text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    )
  }, [
    filterValue,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    diagDataSets.length,
    hasSearchFilter,
  ])

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small">
          {selectedKeys === 'all'
            ? 'All items selected'
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <PreviousPageButton
            isDisabled={pages === 1}
            onPress={onPreviousPage}
          />
          <NextPageButton isDisabled={pages === 1} onPress={onNextPage} />
        </div>
      </div>
    )
  }, [selectedKeys, items.length, page, pages, hasSearchFilter])

  if (error) return <ApiError error={error} />
  if (isLoading || !data) return <CircularProgress aria-label="Loading..." />

  return (
    <Table
      isHeaderSticky
      isStriped
      aria-label="Loaded diagnostic data sets table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[382px]',
      }}
      id="diag-data-set-table"
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === 'actions' ? 'center' : 'start'}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={'No loaded diagnostic data sets found'}
        items={sortedItems}
      >
        {(item) => (
          <TableRow key={item.ephemeral_id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
