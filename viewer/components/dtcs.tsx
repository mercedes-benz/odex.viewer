// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Card, CardBody } from '@heroui/card'
import { Input } from '@heroui/input'
import { Link } from '@heroui/link'
import { Pagination } from '@heroui/pagination'
import { CircularProgress } from '@heroui/progress'
import {
  Selection,
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
  DtcWithDopInfo,
  DtcsOfVariantsOfDataSetsCollection,
  DiagnosticVariant,
  useQuery,
} from '@/api/api-hooks'
import ApiError from '@/components/api-error'
import {
  ActionDropdown,
  AddNewButton,
  DescriptionComponent,
  DtcLevelChip,
  NextPageButton,
  PreviousPageButton,
} from '@/components/commons'
import {
  TableColumnDropdown,
  TableFilterDropdownWithExtractorFunc,
  TableFilterObjectCollectionWithExtractorFuncDropdown,
} from '@/components/custom-dropdowns'
import { SearchIcon } from '@/components/icons'
import { ColumnDefinition } from '@/types'
import { getHexRepresentation, sortItemsBySortDescriptor } from '@/utils/utils'
import { DiagnosticTroubleCodeTargetObjectIds } from '@/types/index'
import { useSelectionWithIndexedDB } from '@/storage/settings'

export function DtcMetadataComponent({
  dtcData,
  targetObjectIds,
}: {
  dtcData: DtcWithDopInfo
  targetObjectIds: DiagnosticTroubleCodeTargetObjectIds
}) {
  return (
    <Table
      hideHeader
      isStriped
      aria-label="Diagnostic Trouble Code metadata table"
    >
      <TableHeader>
        <TableColumn width={200}>KEY</TableColumn>
        <TableColumn>VALUE</TableColumn>
      </TableHeader>
      <TableBody>
        <TableRow key="short_name">
          <TableCell className="font-bold" width={200}>
            Short Name
          </TableCell>
          <TableCell>
            <p>{dtcData.short_name}</p>
          </TableCell>
        </TableRow>
        <TableRow key="long_name">
          <TableCell className="font-bold">Long Name</TableCell>
          <TableCell>
            <p>{dtcData.long_name}</p>
          </TableCell>
        </TableRow>
        {dtcData.description ? (
          <TableRow key="description">
            <TableCell className="font-bold">Description</TableCell>
            <TableCell>
              <DescriptionComponent
                description={dtcData.description}
                enableUnfolding={true}
                initialState={'uncollapsed'}
                maxDisplayLengthLimit={200}
              />
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        <TableRow key="trouble_code">
          <TableCell className="font-bold">Trouble Code</TableCell>
          <TableCell>
            <p>
              {dtcData.trouble_code} <br />[
              {getHexRepresentation(dtcData.trouble_code)}]
            </p>
          </TableCell>
        </TableRow>
        <TableRow key="display_trouble_code">
          <TableCell className="font-bold">Display Trouble Code</TableCell>
          <TableCell>
            <p>{dtcData.display_trouble_code}</p>
          </TableCell>
        </TableRow>
        <TableRow key="text">
          <TableCell className="font-bold">Text</TableCell>
          <TableCell>
            <DescriptionComponent
              description={dtcData.text}
              enableUnfolding={true}
              maxDisplayLengthLimit={200}
              minDisplayLength={150}
            />
          </TableCell>
        </TableRow>
        <TableRow key="level">
          <TableCell className="font-bold">Level</TableCell>
          <TableCell>
            <DtcLevelChip level={dtcData.level} />
          </TableCell>
        </TableRow>
        <TableRow key="is_temporary">
          <TableCell className="font-bold">is_temporary</TableCell>
          <TableCell>
            {dtcData.is_temporary !== undefined ? (
              <p>{dtcData.is_temporary.toString()}</p>
            ) : (
              ''
            )}
          </TableCell>
        </TableRow>
        {dtcData.origin_dtc_dop_short_name ? (
          <TableRow key="origin_dtc_dop_short_name">
            <TableCell className="font-bold">Origin DTC DOP Name</TableCell>
            <TableCell>
              <div>
                <Link
                  href={`/dops?objectId=${dtcData.origin_dtc_dop_perma_id}&variantId=${dtcData.origin_layer_perma_id}&containerId=${targetObjectIds.containerId}`}
                >
                  {dtcData.origin_dtc_dop_short_name}
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {dtcData.origin_layer_perma_id ? (
          <TableRow key="origin_layer">
            <TableCell className="font-bold">Origin Layer Name</TableCell>
            <TableCell>
              <div>
                <Link
                  href={`/diagnostic-variant?objectId=${dtcData.origin_layer_perma_id}&containerId=${targetObjectIds.containerId}`}
                >
                  {dtcData.origin_layer_short_name}
                </Link>
                <p className="text-small">({dtcData.origin_layer_type})</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
      </TableBody>
    </Table>
  )
}

export function DtcsVariantComponent({
  variantId,
  containerId,
  pageId,
}: {
  variantId: string
  containerId: string
  pageId: string
}) {
  const INITIAL_VISIBLE_COLUMNS = new Set([
    'short_name',
    'trouble_code',
    'display_trouble_code',
    'text',
    'level',
    'actions',
  ])

  const [visibleColumns, setVisibleColumns] = useSelectionWithIndexedDB(
    pageId,
    'variantDtcs#table-visibleColumns',
    INITIAL_VISIBLE_COLUMNS
  )

  const visibleColumnsValues = React.useMemo(() => {
    let arr = Array.from(visibleColumns)

    return arr
  }, [visibleColumns])

  // Query data from API and provide as async list for local processing
  const {
    data: dtc_collection,
    error,
    isLoading,
  } = useQuery(
    '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dtcs',
    {
      params: {
        path: {
          'diag-data-set-id': containerId,
          'variant-perma-id': variantId,
        },
        query: {
          fields: visibleColumnsValues.map((entry) => entry.toString()),
        },
      },
      querySerializer: {
        array: {
          style: 'form',
          explode: false,
        },
      },
    },
    { keepPreviousData: true }
  )

  const dtcs = useAsyncList({
    async load() {
      return {
        items: dtc_collection
          ? dtc_collection.items.sort((a, b) =>
              sortItemsBySortDescriptor<DtcWithDopInfo>(a, b, {
                column: 'short_name',
                direction: 'ascending',
              })
            )
          : [],
      }
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) =>
          sortItemsBySortDescriptor<DtcWithDopInfo>(a, b, sortDescriptor)
        ),
      }
    },
  })

  // Reload the async list items, when the queried dtcs change
  React.useEffect(() => {
    if (dtc_collection) {
      dtcs.reload()
    }
  }, [dtc_collection])

  // Introduce all state variables for searching and filtering the diagnostic trouble codes
  const [searchValue, setSearchValue] = React.useState('')

  const [selectedLevels, setSelectedLevels] = React.useState<Selection>(
    new Set([])
  )
  const selectedLevelValues = React.useMemo(() => {
    let arr = Array.from(selectedLevels)

    return arr
  }, [selectedLevels])

  const [selectedOriginDtcDop, setSelectedOriginDtcDop] =
    React.useState<Selection>(new Set([]))
  const selectedOriginDtcDopValues = React.useMemo(() => {
    let arr = Array.from(selectedOriginDtcDop)

    return arr
  }, [selectedOriginDtcDop])

  const [selectedOriginLayers, setSelectedOriginLayers] =
    React.useState<Selection>(new Set([]))
  const selectedOriginLayerValues = React.useMemo(() => {
    let arr = Array.from(selectedOriginLayers)

    return arr
  }, [selectedOriginLayers])

  // Jump back to page 1, if one of the column filters is changed
  React.useEffect(() => {
    setPage(1)
  }, [selectedLevels, selectedOriginDtcDop, selectedOriginLayers])

  // Define the table columns, the list of initially visible columns and a related state variable
  const columns: ColumnDefinition[] = [
    { label: 'PERMA_ID', key: 'perma_id', sortable: true },
    { label: 'EPHEMERAL_ID', key: 'ephemeral_id', sortable: true },
    { label: 'SHORT_NAME', key: 'short_name', sortable: true },
    { label: 'LONG_NAME', key: 'long_name', sortable: true },
    { label: 'DESCRIPTION', key: 'description', sortable: false },
    { label: 'TROUBLE_CODE', key: 'trouble_code', sortable: true },
    {
      label: 'DISPLAY_TROUBLE_CODE',
      key: 'display_trouble_code',
      sortable: true,
    },
    { label: 'TEXT', key: 'text', sortable: false },
    {
      label: 'LEVEL',
      key: 'level',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DtcWithDopInfo>
          filterItems={dtcs}
          filterLabel="LEVEL"
          filterValueExtractorFunc={(obj) =>
            obj.level ? obj.level.toString() : undefined
          }
          selectedFilters={selectedLevels}
          selectedFiltersHandler={setSelectedLevels}
        />
      ),
    },
    { label: 'IS_TEMPORARY', key: 'is_temporary', sortable: true },
    {
      label: 'ORIGIN_DTC_DOP',
      key: 'origin_dtc_dop_short_name',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DtcWithDopInfo>
          filterItems={dtcs}
          filterLabel="ORIGIN_DTC_DOP"
          filterValueExtractorFunc={(obj) =>
            obj.origin_dtc_dop_short_name
              ? obj.origin_dtc_dop_short_name
              : undefined
          }
          selectedFilters={selectedOriginDtcDop}
          selectedFiltersHandler={setSelectedOriginDtcDop}
        />
      ),
    },
    {
      label: 'ORIGIN_LAYER',
      key: 'origin_layer_short_name',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DtcWithDopInfo>
          filterItems={dtcs}
          filterLabel="ORIGIN_LAYER"
          filterValueExtractorFunc={(obj) =>
            obj.origin_layer_short_name
              ? obj.origin_layer_short_name
              : undefined
          }
          selectedFilters={selectedOriginLayers}
          selectedFiltersHandler={setSelectedOriginLayers}
        />
      ),
    },
    { label: 'ACTIONS', key: 'actions' },
  ]

  // Define a memo for table data filtering
  const filteredItems = React.useMemo(() => {
    let filteredDtcs = [...dtcs.items]

    // Filter all dtcs based on visibleColumns list
    if (searchValue && searchValue.length > 0) {
      filteredDtcs = filteredDtcs.filter((dtc) => {
        let result = false

        if (
          !result &&
          visibleColumnsValues.includes('perma_id') &&
          dtc.perma_id !== undefined
        ) {
          result = dtc.perma_id.toString().includes(searchValue.toLowerCase())
        }

        if (
          !result &&
          visibleColumnsValues.includes('ephemeral_id') &&
          dtc.ephemeral_id !== undefined
        ) {
          result = dtc.ephemeral_id
            .toString()
            .includes(searchValue.toLowerCase())
        }

        if (
          !result &&
          visibleColumnsValues.includes('short_name') &&
          dtc.short_name !== undefined
        ) {
          result = dtc.short_name
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        }

        if (!result && visibleColumnsValues.includes('long_name')) {
          result = dtc.long_name
            ? dtc.long_name.toLowerCase().includes(searchValue.toLowerCase())
            : false
        }

        if (
          !result &&
          visibleColumnsValues.includes('description') &&
          dtc.description !== undefined
        ) {
          result = dtc.description.text
            ? dtc.description.text
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (!result && visibleColumnsValues.includes('trouble_code')) {
          result = dtc.trouble_code
            ? dtc.trouble_code
                .toString()
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (!result && visibleColumnsValues.includes('display_trouble_code')) {
          result = dtc.display_trouble_code
            ? dtc.display_trouble_code
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (!result && visibleColumnsValues.includes('text')) {
          result =
            dtc.text && dtc.text.text
              ? dtc.text.text.toLowerCase().includes(searchValue.toLowerCase())
              : false
        }

        if (!result && visibleColumnsValues.includes('level')) {
          result = dtc.level
            ? dtc.level
                .toString()
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (!result && visibleColumnsValues.includes('is_temporary')) {
          result =
            dtc.is_temporary !== undefined
              ? dtc.is_temporary
                  .toString()
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
        }

        if (
          !result &&
          visibleColumnsValues.includes('origin_dtc_dop_short_name')
        ) {
          result = dtc.origin_dtc_dop_short_name
            ? dtc.origin_dtc_dop_short_name
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (
          !result &&
          visibleColumnsValues.includes('origin_layer_short_name')
        ) {
          result = dtc.origin_layer_short_name
            ? dtc.origin_layer_short_name
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        return result
      })
    }
    if (selectedLevelValues && selectedLevelValues.length > 0) {
      filteredDtcs = filteredDtcs.filter((dtc) =>
        dtc.level ? selectedLevelValues.includes(dtc.level.toString()) : false
      )
    }
    if (selectedOriginDtcDopValues && selectedOriginDtcDopValues.length > 0) {
      filteredDtcs = filteredDtcs.filter((dtc) =>
        dtc.origin_dtc_dop_short_name
          ? selectedOriginDtcDopValues.includes(dtc.origin_dtc_dop_short_name)
          : false
      )
    }
    if (selectedOriginLayerValues && selectedOriginLayerValues.length > 0) {
      filteredDtcs = filteredDtcs.filter((dtc) =>
        dtc.origin_layer_short_name
          ? selectedOriginLayerValues.includes(dtc.origin_layer_short_name)
          : false
      )
    }

    return filteredDtcs
  }, [
    dtcs,
    searchValue,
    selectedLevelValues,
    selectedOriginDtcDopValues,
    selectedOriginLayerValues,
  ])

  // Define state variables for pagination and row selection
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]))
  const [rowsPerPage, setRowsPerPage] = React.useState(25)
  const [page, setPage] = React.useState(1)
  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const visible_items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const renderCell = React.useCallback(
    (dtc: DtcWithDopInfo, columnKey: React.Key) => {
      const cellValue = dtc[columnKey as keyof DtcWithDopInfo]

      switch (columnKey) {
        case 'perma_id':
          return <p>{dtc.perma_id}</p>
        case 'ephemeral_id':
          return <p>{dtc.ephemeral_id}</p>
        case 'short_name':
          return (
            <Link
              href={`/dtcs?objectId=${dtc.perma_id}&variantId=${variantId}&containerId=${containerId}`}
            >
              {dtc.short_name}
            </Link>
          )
        case 'long_name':
          return <p>{dtc.long_name}</p>
        case 'description':
          return (
            <DescriptionComponent
              description={dtc.description}
              enableUnfolding={true}
              maxDisplayLengthLimit={200}
            />
          )
        case 'trouble_code':
          return dtc.trouble_code ? (
            <p>
              {dtc.trouble_code} <br />[{getHexRepresentation(dtc.trouble_code)}
              ]
            </p>
          ) : null
        case 'display_trouble_code':
          return <p>{dtc.display_trouble_code}</p>
        case 'text':
          return (
            <DescriptionComponent
              description={dtc.text}
              enableUnfolding={true}
              maxDisplayLengthLimit={200}
              minDisplayLength={150}
            />
          )
        case 'level':
          return <DtcLevelChip level={dtc.level} />
        case 'is_temporary':
          return dtc.is_temporary !== undefined ? (
            <p>{dtc.is_temporary.toString()}</p>
          ) : null
        case 'origin_dtc_dop_short_name':
          return (
            <div>
              <Link
                href={`/dops?objectId=${dtc.origin_dtc_dop_perma_id}&variantId=${variantId}&containerId=${containerId}`}
              >
                {dtc.origin_dtc_dop_short_name}
              </Link>
            </div>
          )
        case 'origin_layer_short_name':
          return (
            <div>
              <Link
                href={`/diagnostic-variant?objectId=${dtc.origin_layer_perma_id}&containerId=${containerId}`}
              >
                {dtc.origin_layer_short_name}
              </Link>
              <p className="text-small">({dtc.origin_layer_type})</p>
            </div>
          )
        case 'actions':
          return (
            <div className="relative flex justify-end items-center gap-2">
              <ActionDropdown
                view_href={`/dtcs?objectId=${dtc.perma_id}&variantId=${variantId}&containerId=${containerId}`}
              />
            </div>
          )
        default:
          return cellValue?.toString()
      }
    },
    [dtcs]
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
      setSearchValue(value)
      setPage(1)
    } else {
      setSearchValue('')
    }
  }, [])

  const onClear = React.useCallback(() => {
    setSearchValue('')
    setPage(1)
  }, [])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search in visible columns..."
            startContent={<SearchIcon />}
            value={searchValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <TableColumnDropdown
              columnList={columns}
              defaultVisibleColumns={INITIAL_VISIBLE_COLUMNS}
              tableName="dtcs"
              visibleColumns={visibleColumns}
              visibleColumnsHandler={setVisibleColumns}
            />
            <AddNewButton />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-small">
            {filteredItems.length} of total {dtcs.items.length} diagnostic
            trouble codes
          </span>
          <label className="flex items-center text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="25">25</option>
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
            </select>
          </label>
        </div>
      </div>
    )
  }, [
    searchValue,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    filteredItems,
    dtcs,
  ])

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
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
  }, [selectedKeys, filteredItems, page, pages])

  if (error) return <ApiError error={error} />
  if (isLoading || !dtcs) return <CircularProgress aria-label="Loading..." />

  return (
    <Table
      isHeaderSticky
      isStriped
      aria-label="Diagnostic trouble codes table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[382px], min-w-full',
      }}
      selectedKeys={selectedKeys}
      selectionMode="none"
      sortDescriptor={dtcs.sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={dtcs.sort}
    >
      <TableHeader
        columns={
          visibleColumns === 'all'
            ? columns
            : columns.filter((column) =>
                Array.from(visibleColumns).includes(column.key)
              )
        }
      >
        {(column) => (
          <TableColumn
            key={column.key}
            align={column.key === 'actions' ? 'center' : 'start'}
            allowsSorting={column.sortable}
          >
            {column.label}
            {column.filter ? (
              <span className="ml-2">{column.filter}</span>
            ) : null}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={'No DTCs found'}
        isLoading={isLoading}
        items={visible_items}
        loadingContent={<CircularProgress aria-label="Loading..." />}
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

type DtcWithVariantDatasetInfo = {
  dataSet: DiagnosticDataSetDescriptor | undefined
  referencingVariants: DiagnosticVariant[] | undefined
  dtc: DtcWithDopInfo
}

export function DiagTroubleCodesOverviewComponent({
  pageId,
}: {
  pageId: string
}) {
  const INITIAL_VISIBLE_COLUMNS = new Set([
    'short_name',
    'trouble_code',
    'display_trouble_code',
    'text',
    'level',
    'actions',
  ])

  const [visibleColumns, setVisibleColumns] = useSelectionWithIndexedDB(
    pageId,
    'allDtcs#table-visibleColumns',
    INITIAL_VISIBLE_COLUMNS
  )

  const visibleColumnsValues = React.useMemo(() => {
    let arr = Array.from(visibleColumns)

    return arr
  }, [visibleColumns])

  const {
    data: data_collection,
    error: error,
    isLoading: isLoading,
  } = useQuery(
    '/dtcs',
    {
      params: {
        query: {
          fields: visibleColumnsValues.map((entry) => entry.toString()),
        },
      },
      querySerializer: {
        array: {
          style: 'form',
          explode: false,
        },
      },
    },
    { keepPreviousData: true }
  )

  const dtcCollection = useAsyncList({
    async load() {
      return {
        items:
          data_collection && data_collection.dtcs
            ? data_collection.dtcs
                .map((entry): DtcWithVariantDatasetInfo | undefined => {
                  return entry.dtc !== undefined
                    ? {
                        dataSet: data_collection.diagnostic_data_sets?.find(
                          (element) =>
                            element.perma_id === entry.diagnostic_data_set_id
                        ),
                        referencingVariants: entry.referencing_variant_perma_ids
                          ?.map((varId) => {
                            return data_collection.variants?.find(
                              (element) => element.perma_id === varId
                            )
                          })
                          .filter((value) => value !== undefined),
                        dtc: entry.dtc,
                      }
                    : undefined
                })
                .flat()
                .filter((value) => value !== undefined)
                .sort((a, b) =>
                  sortItemsBySortDescriptor<DtcWithDopInfo>(a.dtc, b.dtc, {
                    column: 'short_name',
                    direction: 'ascending',
                  })
                )
            : [],
      }
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) =>
          sortItemsBySortDescriptor<DtcWithDopInfo>(
            a.dtc,
            b.dtc,
            sortDescriptor
          )
        ),
      }
    },
  })

  // Reload the async list items, when the queried dataCollection change
  React.useEffect(() => {
    if (data_collection !== undefined) {
      dtcCollection.reload()

      if (
        data_collection.dtcs !== undefined &&
        data_collection.dtcs.length > 0
      ) {
        resolveVariantMappings(data_collection)
      }
    }
  }, [data_collection])

  const [variantMap, setVariantMap] = React.useState<Map<string, string>>(
    new Map<string, string>()
  )

  const resolveVariantMappings = (
    dcvCollection: DtcsOfVariantsOfDataSetsCollection
  ) => {
    if (dcvCollection) {
      const mappingResult = new Map<string, string>(variantMap)

      dcvCollection.variants?.forEach((variant) =>
        mappingResult.set(variant.perma_id, variant.short_name)
      )

      setVariantMap(mappingResult)
    }
  }

  // Introduce all state variables for searching and filtering the DTCs
  const [searchValue, setSearchValue] = React.useState('')

  const [selectedLevels, setSelectedLevels] = React.useState<Selection>(
    new Set([])
  )
  const selectedLevelValues = React.useMemo(() => {
    let arr = Array.from(selectedLevels)

    return arr
  }, [selectedLevels])

  const [selectedOriginDtcDop, setSelectedOriginDtcDop] =
    React.useState<Selection>(new Set([]))
  const selectedOriginDtcDopValues = React.useMemo(() => {
    let arr = Array.from(selectedOriginDtcDop)

    return arr
  }, [selectedOriginDtcDop])

  const [selectedOriginLayers, setSelectedOriginLayers] =
    React.useState<Selection>(new Set([]))
  const selectedOriginLayerValues = React.useMemo(() => {
    let arr = Array.from(selectedOriginLayers)

    return arr
  }, [selectedOriginLayers])

  const [selectedUsedInVariants, setSelectedUsedInVariants] =
    React.useState<Selection>(new Set([]))
  const selectedUsedInVariantValues = React.useMemo(() => {
    let arr = Array.from(selectedUsedInVariants)

    return arr
  }, [selectedUsedInVariants])

  // Jump back to page 1, if one of the column filters is changed
  React.useEffect(() => {
    setPage(1)
  }, [
    selectedLevels,
    selectedOriginDtcDop,
    selectedOriginLayers,
    selectedUsedInVariants,
  ])

  // Define the table columns, the list of initially visible columns and a related state variable
  const columns: ColumnDefinition[] = [
    { label: 'PERMA_ID', key: 'perma_id', sortable: true },
    { label: 'EPHEMERAL_ID', key: 'ephemeral_id', sortable: true },
    { label: 'SHORT_NAME', key: 'short_name', sortable: true },
    { label: 'LONG_NAME', key: 'long_name', sortable: true },
    { label: 'DESCRIPTION', key: 'description', sortable: false },
    { label: 'TROUBLE_CODE', key: 'trouble_code', sortable: true },
    {
      label: 'DISPLAY_TROUBLE_CODE',
      key: 'display_trouble_code',
      sortable: true,
    },
    { label: 'TEXT', key: 'text', sortable: false },
    {
      label: 'LEVEL',
      key: 'level',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DtcWithVariantDatasetInfo>
          filterItems={dtcCollection}
          filterLabel="LEVEL"
          filterValueExtractorFunc={(obj) =>
            obj.dtc.level ? obj.dtc.level.toString() : undefined
          }
          selectedFilters={selectedLevels}
          selectedFiltersHandler={setSelectedLevels}
        />
      ),
    },
    { label: 'IS_TEMPORARY', key: 'is_temporary', sortable: true },
    {
      label: 'ORIGIN_DTC_DOP',
      key: 'origin_dtc_dop_short_name',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DtcWithVariantDatasetInfo>
          filterItems={dtcCollection}
          filterLabel="ORIGIN_DTC_DOP"
          filterValueExtractorFunc={(obj) =>
            obj.dtc.origin_dtc_dop_short_name
              ? obj.dtc.origin_dtc_dop_short_name
              : undefined
          }
          selectedFilters={selectedOriginDtcDop}
          selectedFiltersHandler={setSelectedOriginDtcDop}
        />
      ),
    },
    {
      label: 'ORIGIN_LAYER',
      key: 'origin_layer_short_name',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DtcWithVariantDatasetInfo>
          filterItems={dtcCollection}
          filterLabel="ORIGIN_LAYER"
          filterValueExtractorFunc={(obj) =>
            obj.dtc.origin_layer_short_name
              ? obj.dtc.origin_layer_short_name
              : undefined
          }
          selectedFilters={selectedOriginLayers}
          selectedFiltersHandler={setSelectedOriginLayers}
        />
      ),
    },
    {
      label: 'USED_IN_VARIANTS',
      key: 'used_in_variants',
      sortable: false,
      filter: (
        <TableFilterObjectCollectionWithExtractorFuncDropdown<DtcWithVariantDatasetInfo>
          filterItems={dtcCollection}
          filterLabel="USED_IN_VARIANTS"
          filterValueExtractorFunc={(obj) =>
            obj.referencingVariants
              ? obj.referencingVariants.map((value) =>
                  value.perma_id ? value.perma_id.toString() : ''
                )
              : undefined
          }
          idLabelMappings={variantMap}
          selectedFilters={selectedUsedInVariants}
          selectedFiltersHandler={setSelectedUsedInVariants}
        />
      ),
    },
    { label: 'ACTIONS', key: 'actions' },
  ]

  // Define a memo for table data filtering
  const filteredItems = React.useMemo(() => {
    let filteredCollectionItems = [...dtcCollection.items]

    // Filter all dtcs based on visibleColumns list
    if (searchValue && searchValue.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dtcWithVarDb) => {
          let result = false

          if (
            !result &&
            visibleColumnsValues.includes('perma_id') &&
            dtcWithVarDb.dtc.perma_id !== undefined
          ) {
            result = dtcWithVarDb.dtc.perma_id
              .toString()
              .includes(searchValue.toLowerCase())
          }

          if (
            !result &&
            visibleColumnsValues.includes('ephemeral_id') &&
            dtcWithVarDb.dtc.ephemeral_id !== undefined
          ) {
            result = dtcWithVarDb.dtc.ephemeral_id
              .toString()
              .includes(searchValue.toLowerCase())
          }

          if (
            !result &&
            visibleColumnsValues.includes('short_name') &&
            dtcWithVarDb.dtc.short_name !== undefined
          ) {
            result = dtcWithVarDb.dtc.short_name
              .toLowerCase()
              .includes(searchValue.toLowerCase())
          }

          if (!result && visibleColumnsValues.includes('long_name')) {
            result = dtcWithVarDb.dtc.long_name
              ? dtcWithVarDb.dtc.long_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (
            !result &&
            visibleColumnsValues.includes('description') &&
            dtcWithVarDb.dtc.description !== undefined
          ) {
            result = dtcWithVarDb.dtc.description.text
              ? dtcWithVarDb.dtc.description.text
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (!result && visibleColumnsValues.includes('trouble_code')) {
            result = dtcWithVarDb.dtc.trouble_code
              ? dtcWithVarDb.dtc.trouble_code
                  .toString()
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (
            !result &&
            visibleColumnsValues.includes('display_trouble_code')
          ) {
            result = dtcWithVarDb.dtc.display_trouble_code
              ? dtcWithVarDb.dtc.display_trouble_code
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (!result && visibleColumnsValues.includes('text')) {
            result =
              dtcWithVarDb.dtc.text && dtcWithVarDb.dtc.text.text
                ? dtcWithVarDb.dtc.text.text
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
                : false
          }

          if (!result && visibleColumnsValues.includes('level')) {
            result = dtcWithVarDb.dtc.level
              ? dtcWithVarDb.dtc.level
                  .toString()
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (!result && visibleColumnsValues.includes('is_temporary')) {
            result =
              dtcWithVarDb.dtc.is_temporary !== undefined
                ? dtcWithVarDb.dtc.is_temporary
                    .toString()
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
                : false
          }

          if (
            !result &&
            visibleColumnsValues.includes('origin_dtc_dop_short_name')
          ) {
            result = dtcWithVarDb.dtc.origin_dtc_dop_short_name
              ? dtcWithVarDb.dtc.origin_dtc_dop_short_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (
            !result &&
            visibleColumnsValues.includes('origin_layer_short_name')
          ) {
            result = dtcWithVarDb.dtc.origin_layer_short_name
              ? dtcWithVarDb.dtc.origin_layer_short_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (!result && visibleColumnsValues.includes('used_in_variants')) {
            result = dtcWithVarDb.referencingVariants
              ? dtcWithVarDb.referencingVariants.some((item) => {
                  const short_name = item.perma_id
                    ? variantMap.get(item.perma_id)
                    : item.short_name

                  return short_name
                    ? short_name
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
                    : false
                })
              : false
          }

          return result
        }
      )
    }
    if (selectedLevelValues && selectedLevelValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dtcWithVarDb) =>
          dtcWithVarDb.dtc.level
            ? selectedLevelValues.includes(dtcWithVarDb.dtc.level.toString())
            : false
      )
    }
    if (selectedOriginDtcDopValues && selectedOriginDtcDopValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dtcWithVarDb) =>
          dtcWithVarDb.dtc.origin_dtc_dop_short_name
            ? selectedOriginDtcDopValues.includes(
                dtcWithVarDb.dtc.origin_dtc_dop_short_name
              )
            : false
      )
    }
    if (selectedOriginLayerValues && selectedOriginLayerValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dtcWithVarDb) =>
          dtcWithVarDb.dtc.origin_layer_short_name
            ? selectedOriginLayerValues.includes(
                dtcWithVarDb.dtc.origin_layer_short_name
              )
            : false
      )
    }
    if (selectedUsedInVariantValues && selectedUsedInVariantValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dtcWithVarDb) =>
          dtcWithVarDb.referencingVariants
            ? dtcWithVarDb.referencingVariants.some((item) =>
                item.perma_id
                  ? selectedUsedInVariantValues.includes(
                      item.perma_id.toString()
                    )
                  : false
              )
            : false
      )
    }

    return filteredCollectionItems
  }, [
    dtcCollection,
    searchValue,
    selectedLevelValues,
    selectedOriginDtcDopValues,
    selectedOriginLayerValues,
    selectedUsedInVariantValues,
  ])

  // Define state variables for pagination and row selection
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]))
  const [rowsPerPage, setRowsPerPage] = React.useState(25)
  const [page, setPage] = React.useState(1)
  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const visible_items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const renderCell = React.useCallback(
    (dtcWithVarDb: DtcWithVariantDatasetInfo, columnKey: React.Key) => {
      const cellValue = dtcWithVarDb.dtc[columnKey as keyof DtcWithDopInfo]

      switch (columnKey) {
        case 'perma_id':
          return <p>{dtcWithVarDb.dtc.perma_id}</p>
        case 'ephemeral_id':
          return <p>{dtcWithVarDb.dtc.ephemeral_id}</p>
        case 'short_name':
          return (
            <Link
              href={`/dtcs?objectId=${dtcWithVarDb.dtc.perma_id}&variantId=${dtcWithVarDb.dtc.origin_layer_perma_id}&containerId=${dtcWithVarDb.dataSet?.perma_id}`}
            >
              {dtcWithVarDb.dtc.short_name}
            </Link>
          )
        case 'long_name':
          return <p>{dtcWithVarDb.dtc.long_name}</p>
        case 'description':
          return (
            <DescriptionComponent
              description={dtcWithVarDb.dtc.description}
              enableUnfolding={true}
              maxDisplayLengthLimit={200}
            />
          )
        case 'trouble_code':
          return dtcWithVarDb.dtc.trouble_code ? (
            <p>
              {dtcWithVarDb.dtc.trouble_code} <br />[
              {getHexRepresentation(dtcWithVarDb.dtc.trouble_code)}]
            </p>
          ) : null
        case 'display_trouble_code':
          return <p>{dtcWithVarDb.dtc.display_trouble_code}</p>
        case 'text':
          return (
            <DescriptionComponent
              description={dtcWithVarDb.dtc.text}
              enableUnfolding={true}
              maxDisplayLengthLimit={200}
              minDisplayLength={150}
            />
          )
        case 'level':
          return <DtcLevelChip level={dtcWithVarDb.dtc.level} />
        case 'is_temporary':
          return dtcWithVarDb.dtc.is_temporary !== undefined ? (
            <p>{dtcWithVarDb.dtc.is_temporary.toString()}</p>
          ) : null
        case 'origin_dtc_dop_short_name':
          return (
            <div>
              <Link
                href={`/dops?objectId=${dtcWithVarDb.dtc.origin_dtc_dop_perma_id}&variantId=${dtcWithVarDb.dtc.origin_layer_perma_id}&containerId=${dtcWithVarDb.dataSet?.perma_id}`}
              >
                {dtcWithVarDb.dtc.origin_dtc_dop_short_name}
              </Link>
            </div>
          )
        case 'origin_layer_short_name':
          return (
            <div>
              <Link
                href={`/diagnostic-variant?objectId=${dtcWithVarDb.dtc.origin_layer_perma_id}&containerId=${dtcWithVarDb.dataSet?.perma_id}`}
              >
                {dtcWithVarDb.dtc.origin_layer_short_name}
              </Link>
              <p className="text-small">
                ({dtcWithVarDb.dtc.origin_layer_type})
              </p>
            </div>
          )
        case 'used_in_variants':
          return (
            <div className="min-w-[400] gap-2 grid grid-cols-2">
              {dtcWithVarDb.referencingVariants?.map((entry, index) => {
                return (
                  <Card key={entry.ephemeral_id + index}>
                    <CardBody>
                      <Link
                        href={`/diagnostic-variant?objectId=${entry.perma_id}&containerId=${dtcWithVarDb.dataSet?.perma_id}`}
                      >
                        {entry.short_name}
                      </Link>
                      <span className="text-small">({entry.variant_type})</span>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          )
        case 'actions':
          return (
            <div className="relative flex justify-end items-center gap-2">
              <ActionDropdown
                view_href={`/dtcs?objectId=${dtcWithVarDb.dtc.perma_id}&variantId=${dtcWithVarDb.dtc.origin_layer_perma_id}&containerId=${dtcWithVarDb.dataSet?.perma_id}`}
              />
            </div>
          )
        default:
          return cellValue?.toString()
      }
    },
    [dtcCollection]
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
      setSearchValue(value)
      setPage(1)
    } else {
      setSearchValue('')
    }
  }, [])

  const onClear = React.useCallback(() => {
    setSearchValue('')
    setPage(1)
  }, [])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search in visible columns..."
            startContent={<SearchIcon />}
            value={searchValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <TableColumnDropdown
              columnList={columns}
              defaultVisibleColumns={INITIAL_VISIBLE_COLUMNS}
              tableName="dtcs"
              visibleColumns={visibleColumns}
              visibleColumnsHandler={setVisibleColumns}
            />
            <AddNewButton />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-small">
            {filteredItems.length} of total {dtcCollection.items.length}{' '}
            diagnostic trouble codes
          </span>
          <label className="flex items-center text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="25">25</option>
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
            </select>
          </label>
        </div>
      </div>
    )
  }, [
    searchValue,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    filteredItems,
    dtcCollection,
  ])

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
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
  }, [selectedKeys, filteredItems, page, pages])

  if (error) return <ApiError error={error} />
  if (isLoading || !data_collection)
    return <CircularProgress aria-label="Loading..." />

  return (
    <Table
      isHeaderSticky
      isStriped
      aria-label="Diagnostic trouble code table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[382px], min-w-full',
      }}
      selectedKeys={selectedKeys}
      selectionMode="none"
      sortDescriptor={dtcCollection.sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={dtcCollection.sort}
    >
      <TableHeader
        columns={
          visibleColumns === 'all'
            ? columns
            : columns.filter((column) =>
                Array.from(visibleColumns).includes(column.key)
              )
        }
      >
        {(column) => (
          <TableColumn
            key={column.key}
            align={column.key === 'actions' ? 'center' : 'start'}
            allowsSorting={column.sortable}
          >
            {column.label}
            {column.filter ? (
              <span className="ml-2">{column.filter}</span>
            ) : null}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={'No DTCs found'}
        isLoading={isLoading}
        items={visible_items}
        loadingContent={<CircularProgress aria-label="Loading..." />}
      >
        {(item) => (
          <TableRow key={item.dtc.ephemeral_id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
