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

import client, {
  DiagnosticDataSetDescriptor,
  DiagComm,
  DiagCommDetails,
  DiagCommGenericInfo,
  DiagCommInfo,
  DiagCommsOfVariantsOfDataSetsCollection,
  DiagnosticVariant,
  isDiagService,
  useQuery,
} from '@/api/api-hooks'
import ApiError from '@/components/api-error'
import {
  ActionDropdown,
  AddNewButton,
  AddressingChip,
  DescriptionComponent,
  DiagCommSemanticChip,
  DiagCommTypeChip,
  DiagnosticClassChip,
  FunctionalClassChip,
  TransmissionModeChip,
  NextPageButton,
  PreviousPageButton,
} from '@/components/commons'
import {
  TableColumnDropdown,
  TableFilterDropdown,
  TableFilterDropdownWithExtractorFunc,
  TableFilterObjectCollectionDropdown,
  TableFilterObjectCollectionWithExtractorFuncDropdown,
  TableFilterObjectDropdown,
} from '@/components/custom-dropdowns'
import { SearchIcon } from '@/components/icons'
import { ColumnDefinition } from '@/types'
import { getHexRepresentation, sortItemsBySortDescriptor } from '@/utils/utils'
import { useSelectionWithIndexedDB } from '@/storage/settings'

export function DiagCommMetadata({
  diagCommData,
  containerId,
}: {
  diagCommData: DiagCommDetails
  containerId: string
}) {
  return (
    <Table
      hideHeader
      isStriped
      aria-label="Diagnostic Communication metadata table"
      data-testid="diag-comm-metadata-table"
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
            <p>{diagCommData.short_name}</p>
          </TableCell>
        </TableRow>
        <TableRow key="long_name">
          <TableCell className="font-bold">Long Name</TableCell>
          <TableCell>
            <p>{diagCommData.long_name}</p>
          </TableCell>
        </TableRow>
        {diagCommData.description ? (
          <TableRow key="description">
            <TableCell className="font-bold">Description</TableCell>
            <TableCell>
              <DescriptionComponent
                description={diagCommData.description}
                enableUnfolding={true}
                initialState={'uncollapsed'}
                maxDisplayLengthLimit={200}
              />
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {diagCommData.origin_layer_perma_id ? (
          <TableRow key="origin_layer">
            <TableCell className="font-bold">Origin Layer Name</TableCell>
            <TableCell>
              <div>
                <Link
                  href={`/diagnostic-variant?objectId=${diagCommData.origin_layer_perma_id}&containerId=${containerId}`}
                >
                  {diagCommData.origin_layer_short_name}
                </Link>
                <p className="text-small">({diagCommData.origin_layer_type})</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {diagCommData.uds_service ? (
          <TableRow key="uds_service">
            <TableCell className="font-bold">UDS Service</TableCell>
            <TableCell>
              <p>
                {diagCommData.uds_service?.service_name} [
                {getHexRepresentation(diagCommData.uds_service?.service_id)}]
              </p>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        <TableRow key="comm_type">
          <TableCell className="font-bold">Communication Type</TableCell>
          <TableCell>
            <DiagCommTypeChip commType={diagCommData.class_name} />
          </TableCell>
        </TableRow>
        <TableRow key="semantic">
          <TableCell className="font-bold">Semantic</TableCell>
          <TableCell>
            <DiagCommSemanticChip semantic={diagCommData.semantic} />
          </TableCell>
        </TableRow>
        {isDiagService(diagCommData) && diagCommData.addressing ? (
          <TableRow key="addressing">
            <TableCell className="font-bold">Addressing</TableCell>
            <TableCell>
              <AddressingChip addressing={diagCommData.addressing} />
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isDiagService(diagCommData) && diagCommData.transmission_mode ? (
          <TableRow key="transmission_mode">
            <TableCell className="font-bold">Transmission Mode</TableCell>
            <TableCell>
              <TransmissionModeChip mode={diagCommData.transmission_mode} />
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {diagCommData.diagnostic_class ? (
          <TableRow key="diagnostic_class">
            <TableCell className="font-bold">Diagnostic Class</TableCell>
            <TableCell>
              <p>{diagCommData.diagnostic_class}</p>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {diagCommData.functional_classes ? (
          <TableRow key="functional_classes">
            <TableCell className="font-bold">Functional Classes</TableCell>
            <TableCell>
              <div>
                {diagCommData.functional_classes.map((entry, index) => (
                  <FunctionalClassChip
                    key={entry.short_name ? entry.short_name : '' + index}
                    functionalClass={entry.short_name}
                  />
                ))}
              </div>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {diagCommData.is_executable !== undefined ||
        diagCommData.is_mandatory !== undefined ||
        diagCommData.is_final !== undefined ? (
          <TableRow key="props">
            <TableCell className="font-bold">Properties</TableCell>
            <TableCell>
              <Table hideHeader isCompact aria-label="DiagComm Property Table">
                <TableHeader>
                  <TableColumn>KEY</TableColumn>
                  <TableColumn>VALUE</TableColumn>
                </TableHeader>
                <TableBody>
                  <TableRow key="is-mandatory">
                    <TableCell className="font-bold" width={150}>
                      is-mandatory
                    </TableCell>
                    <TableCell>
                      {diagCommData.is_mandatory !== undefined
                        ? diagCommData.is_mandatory.toString()
                        : 'undefined'}
                    </TableCell>
                  </TableRow>
                  <TableRow key="is-executable">
                    <TableCell className="font-bold">is-executable</TableCell>
                    <TableCell>
                      {diagCommData.is_executable !== undefined
                        ? diagCommData.is_executable.toString()
                        : 'undefined'}
                    </TableCell>
                  </TableRow>
                  <TableRow key="is-final">
                    <TableCell className="font-bold">is-final</TableCell>
                    <TableCell>
                      {diagCommData.is_final !== undefined
                        ? diagCommData.is_final.toString()
                        : 'undefined'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
      </TableBody>
    </Table>
  )
}

export function DiagComms({
  objectId,
  containerId,
  pageId,
}: {
  objectId: string
  containerId: string
  pageId: string
}) {
  const INITIAL_VISIBLE_COLUMNS = new Set([
    'short_name',
    'semantic',
    'comm_type',
    'actions',
  ])

  const [visibleColumns, setVisibleColumns] = useSelectionWithIndexedDB(
    pageId,
    'variantDiagComms#table-visibleColumns',
    INITIAL_VISIBLE_COLUMNS
  )

  const visibleColumnsValues = React.useMemo(() => {
    let arr = Array.from(visibleColumns)

    return arr
  }, [visibleColumns])

  // Query data from API and provide as async list for local processing
  const {
    data: diag_comms,
    error,
    isLoading,
  } = useQuery(
    '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms',
    {
      params: {
        path: { 'diag-data-set-id': containerId, 'variant-perma-id': objectId },
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

  const diagComms = useAsyncList({
    async load() {
      return {
        items: diag_comms
          ? diag_comms.items.sort((a, b) =>
              sortItemsBySortDescriptor<DiagCommInfo>(a, b, {
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
          sortItemsBySortDescriptor<DiagCommInfo>(a, b, sortDescriptor)
        ),
      }
    },
  })

  // Reload the async list items, when the queried diag_comms change
  React.useEffect(() => {
    if (diag_comms) {
      diagComms.reload()
      resolveFunctionalClassMappings(diag_comms.items)
    }
  }, [diag_comms])

  const [functionalClassMap, setFunctionalClassMap] = React.useState<
    Map<string, string>
  >(new Map<string, string>())

  const resolveFunctionalClassMappings = (diagComms: DiagComm[]) => {
    if (diagComms) {
      const functional_class_ids = new Set<string>(
        diagComms.flatMap(({ functional_class_refs }) =>
          functional_class_refs
            ? functional_class_refs.flatMap(({ resolved_object_perma_id }) =>
                resolved_object_perma_id
                  ? resolved_object_perma_id
                  : 'unresolved'
              )
            : []
        )
      )

      const respPromises = Array.from(functional_class_ids).map(
        (func_class_id) => {
          return client.GET(
            '/diagnostic-data-sets/{diag-data-set-id}/objects/{perma-id}',
            {
              params: {
                path: {
                  'diag-data-set-id': containerId,
                  'perma-id': func_class_id,
                },
              },
            }
          )
        }
      )

      const results = Promise.all(respPromises)

      results.then((responses) => {
        const mappingResult = new Map<string, string>(functionalClassMap)

        for (const response of responses) {
          const func_class_name = response.data?.short_name
          const func_class_id = response.response.url.split('/').pop()

          mappingResult.set(
            func_class_id ? func_class_id : 'unresolved',
            func_class_name ? func_class_name : 'UNKNOWN'
          )
        }

        setFunctionalClassMap(mappingResult)
      })
    }
  }

  // Introduce all state variables for searching and filtering the diag_comms
  const [searchValue, setSearchValue] = React.useState('')

  const [selectedCommTypes, setSelectedCommTypes] = React.useState<Selection>(
    new Set([])
  )
  const selectedCommTypeValues = React.useMemo(() => {
    let arr = Array.from(selectedCommTypes)

    return arr
  }, [selectedCommTypes])

  const [selectedOriginLayers, setSelectedOriginLayers] =
    React.useState<Selection>(new Set([]))
  const selectedOriginLayerValues = React.useMemo(() => {
    let arr = Array.from(selectedOriginLayers)

    return arr
  }, [selectedOriginLayers])

  const [selectedUdsServices, setSelectedUdsServices] =
    React.useState<Selection>(new Set([]))
  const selectedUdsServiceValues = React.useMemo(() => {
    let arr = Array.from(selectedUdsServices)

    return arr
  }, [selectedUdsServices])

  const [selectedSemantics, setSelectedSemantics] = React.useState<Selection>(
    new Set([])
  )
  const selectedSemanticValues = React.useMemo(() => {
    let arr = Array.from(selectedSemantics)

    return arr
  }, [selectedSemantics])

  const [selectedAddressings, setSelectedAddressings] =
    React.useState<Selection>(new Set([]))
  const selectedAddressingValues = React.useMemo(() => {
    let arr = Array.from(selectedAddressings)

    return arr
  }, [selectedAddressings])

  const [selectedDiagClasses, setSelectedDiagClasses] =
    React.useState<Selection>(new Set([]))
  const selectedDiagClassValues = React.useMemo(() => {
    let arr = Array.from(selectedDiagClasses)

    return arr
  }, [selectedDiagClasses])

  const [selectedFunctClasses, setSelectedFunctClasses] =
    React.useState<Selection>(new Set([]))

  const selectedFunctClassValues = React.useMemo(() => {
    let arr = Array.from(selectedFunctClasses)

    return arr
  }, [selectedFunctClasses])

  // Jump back to page 1, if one of the column filters is changed
  React.useEffect(() => {
    setPage(1)
  }, [
    selectedSemantics,
    selectedAddressings,
    selectedCommTypes,
    selectedDiagClasses,
    selectedFunctClasses,
    selectedOriginLayers,
    selectedUdsServices,
  ])

  // Define the table columns, the list of initially visible columns and a related state variable
  const columns: ColumnDefinition[] = [
    { label: 'OBJECT_ID', key: 'object_id', sortable: true },
    { label: 'SHORT_NAME', key: 'short_name', sortable: true },
    { label: 'LONG_NAME', key: 'long_name', sortable: true },
    { label: 'DESCRIPTION', key: 'description', sortable: false },
    {
      label: 'ORIGIN_LAYER',
      key: 'origin_layer_short_name',
      sortable: true,
      filter: (
        <TableFilterDropdown<DiagComm>
          filterItems={diagComms}
          filterKey="origin_layer_short_name"
          filterLabel="ORIGIN_LAYER"
          selectedFilters={selectedOriginLayers}
          selectedFiltersHandler={setSelectedOriginLayers}
        />
      ),
    },
    {
      label: 'UDS_SERVICE',
      key: 'uds_service',
      sortable: true,
      filter: (
        <TableFilterObjectDropdown<DiagComm>
          filterItems={diagComms}
          filterKey="uds_service"
          filterLabel="UDS_SERVICE"
          filterObjectProperty="service_name"
          selectedFilters={selectedUdsServices}
          selectedFiltersHandler={setSelectedUdsServices}
        />
      ),
    },
    {
      label: 'COMM_TYPE',
      key: 'comm_type',
      sortable: true,
      filter: (
        <TableFilterDropdown<DiagComm>
          filterItems={diagComms}
          filterKey="class_name"
          filterLabel="COMM_TYPE"
          selectedFilters={selectedCommTypes}
          selectedFiltersHandler={setSelectedCommTypes}
        />
      ),
    },
    {
      label: 'SEMANTIC',
      key: 'semantic',
      sortable: true,
      filter: (
        <TableFilterDropdown<DiagComm>
          filterItems={diagComms}
          filterKey="semantic"
          filterLabel="SEMANTIC"
          selectedFilters={selectedSemantics}
          selectedFiltersHandler={setSelectedSemantics}
        />
      ),
    },
    {
      label: 'ADDRESSING',
      key: 'addressing',
      sortable: true,
      filter: (
        <TableFilterDropdown<DiagComm>
          filterItems={diagComms}
          filterKey="addressing"
          filterLabel="ADDRESSING"
          selectedFilters={selectedAddressings}
          selectedFiltersHandler={setSelectedAddressings}
        />
      ),
    },
    {
      label: 'DIAGNOSTIC_CLASS',
      key: 'diagnostic_class',
      sortable: true,
      filter: (
        <TableFilterDropdown<DiagComm>
          filterItems={diagComms}
          filterKey="diagnostic_class"
          filterLabel="DIAGNOSTIC_CLASS"
          selectedFilters={selectedDiagClasses}
          selectedFiltersHandler={setSelectedDiagClasses}
        />
      ),
    },
    {
      label: 'FUNCTIONAL_CLASSES',
      key: 'functional_class_refs',
      sortable: true,
      filter: (
        <TableFilterObjectCollectionDropdown<DiagComm>
          filterItems={diagComms}
          filterKey="functional_class_refs"
          filterLabel="FUNCTIONAL_CLASSES"
          idLabelMappings={functionalClassMap}
          objectPropertyName="resolved_object_id"
          selectedFilters={selectedFunctClasses}
          selectedFiltersHandler={setSelectedFunctClasses}
        />
      ),
    },
    { label: 'ACTIONS', key: 'actions' },
  ]

  // Define a memo for table data filtering
  const filteredItems = React.useMemo(() => {
    let filteredDiagComms = [...diagComms.items]

    // Filter all diagComms based on visibleColumns list
    if (searchValue && searchValue.length > 0) {
      filteredDiagComms = filteredDiagComms.filter((diagComm) => {
        let result = false

        if (
          !result &&
          visibleColumnsValues.includes('object_id') &&
          diagComm.perma_id !== undefined
        ) {
          result = diagComm.perma_id
            .toString()
            .includes(searchValue.toLowerCase())
        }

        if (
          !result &&
          visibleColumnsValues.includes('short_name') &&
          diagComm.short_name !== undefined
        ) {
          result = diagComm.short_name
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        }

        if (!result && visibleColumnsValues.includes('long_name')) {
          result = diagComm.long_name
            ? diagComm.long_name
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (
          !result &&
          visibleColumnsValues.includes('description') &&
          diagComm.description !== undefined
        ) {
          result = diagComm.description.text
            ? diagComm.description.text
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (
          !result &&
          visibleColumnsValues.includes('origin_layer_short_name')
        ) {
          result = diagComm.origin_layer_short_name
            ? diagComm.origin_layer_short_name
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (!result && visibleColumnsValues.includes('semantic')) {
          result = diagComm.semantic
            ? diagComm.semantic
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (
          !result &&
          isDiagService(diagComm) &&
          visibleColumnsValues.includes('addressing')
        ) {
          result = diagComm.addressing
            ? diagComm.addressing
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (!result && visibleColumnsValues.includes('comm_type')) {
          result = diagComm.class_name
            ? diagComm.class_name
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (!result && visibleColumnsValues.includes('diagnostic_class')) {
          result = diagComm.diagnostic_class
            ? diagComm.diagnostic_class
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (!result && visibleColumnsValues.includes('functional_class_refs')) {
          result = diagComm.functional_class_refs
            ? diagComm.functional_class_refs.some((item) => {
                const class_name = item.resolved_object_perma_id
                  ? functionalClassMap.get(item.resolved_object_perma_id)
                  : undefined

                return class_name
                  ? class_name.toLowerCase().includes(searchValue.toLowerCase())
                  : false
              })
            : false
        }

        if (!result && visibleColumnsValues.includes('uds_service')) {
          result = diagComm.uds_service
            ? getHexRepresentation(diagComm.uds_service.service_id).includes(
                searchValue.toLowerCase()
              ) ||
              diagComm.uds_service.service_name
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        return result
      })
    }
    if (selectedUdsServiceValues && selectedUdsServiceValues.length > 0) {
      filteredDiagComms = filteredDiagComms.filter((diagComm) =>
        diagComm.uds_service
          ? selectedUdsServiceValues.includes(diagComm.uds_service.service_name)
          : false
      )
    }
    if (selectedCommTypeValues && selectedCommTypeValues.length > 0) {
      filteredDiagComms = filteredDiagComms.filter((diagComm) =>
        diagComm.class_name
          ? selectedCommTypeValues.includes(diagComm.class_name)
          : false
      )
    }
    if (selectedOriginLayerValues && selectedOriginLayerValues.length > 0) {
      filteredDiagComms = filteredDiagComms.filter((diagComm) =>
        diagComm.origin_layer_short_name
          ? selectedOriginLayerValues.includes(diagComm.origin_layer_short_name)
          : false
      )
    }
    if (selectedDiagClassValues && selectedDiagClassValues.length > 0) {
      filteredDiagComms = filteredDiagComms.filter((diagComm) =>
        diagComm.diagnostic_class
          ? selectedDiagClassValues.includes(diagComm.diagnostic_class)
          : false
      )
    }
    if (selectedFunctClassValues && selectedFunctClassValues.length > 0) {
      filteredDiagComms = filteredDiagComms.filter((diagComm) =>
        diagComm.functional_class_refs
          ? diagComm.functional_class_refs.some((item) =>
              item.resolved_object_perma_id
                ? selectedFunctClassValues.includes(
                    item.resolved_object_perma_id.toString()
                  )
                : false
            )
          : false
      )
    }
    if (selectedSemanticValues && selectedSemanticValues.length > 0) {
      filteredDiagComms = filteredDiagComms.filter((diagComm) =>
        diagComm.semantic
          ? selectedSemanticValues.includes(diagComm.semantic)
          : false
      )
    }
    if (selectedAddressingValues && selectedAddressingValues.length > 0) {
      filteredDiagComms = filteredDiagComms.filter((diagComm) =>
        isDiagService(diagComm) && diagComm.addressing
          ? selectedAddressingValues.includes(diagComm.addressing)
          : false
      )
    }

    return filteredDiagComms
  }, [
    diagComms,
    searchValue,
    selectedUdsServiceValues,
    selectedCommTypeValues,
    selectedOriginLayerValues,
    selectedDiagClassValues,
    selectedFunctClassValues,
    selectedSemanticValues,
    selectedAddressingValues,
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
    (diagComm: DiagComm, columnKey: React.Key) => {
      const cellValue = diagComm[columnKey as keyof DiagComm]

      switch (columnKey) {
        case 'perma_id':
          return <p>{diagComm.perma_id}</p>
        case 'ephemeral_id':
          return <p>{diagComm.ephemeral_id}</p>
        case 'short_name':
          return (
            <Link
              href={`/diagnostic-comm?objectId=${diagComm.perma_id}&variantId=${objectId}&containerId=${containerId}`}
            >
              {diagComm.short_name}
            </Link>
          )
        case 'long_name':
          return <p>{diagComm.long_name}</p>
        case 'description':
          return (
            <DescriptionComponent
              description={diagComm.description}
              enableUnfolding={true}
              maxDisplayLengthLimit={200}
            />
          )
        case 'uds_service':
          return diagComm.uds_service ? (
            <p>
              {diagComm.uds_service?.service_name} [
              {getHexRepresentation(diagComm.uds_service?.service_id)}]
            </p>
          ) : null
        case 'comm_type':
          return <DiagCommTypeChip commType={diagComm.class_name} />
        case 'origin_layer_short_name':
          return diagComm.origin_layer_perma_id !== objectId ? (
            <div>
              <Link
                href={`/diagnostic-variant?objectId=${diagComm.origin_layer_perma_id}&containerId=${containerId}`}
              >
                {diagComm.origin_layer_short_name}
              </Link>
              <p className="text-small">({diagComm.origin_layer_type})</p>
            </div>
          ) : (
            <div>
              <p>{diagComm.origin_layer_short_name}</p>
              <p className="text-small">({diagComm.origin_layer_type})</p>
            </div>
          )
        case 'diagnostic_class':
          return <DiagnosticClassChip diagClass={diagComm.diagnostic_class} />
        case 'functional_class_refs':
          const result = diagComm.functional_class_refs?.map((key) => {
            const res = key.resolved_object_perma_id
              ? functionalClassMap.get(key.resolved_object_perma_id)
              : undefined

            return res ? res : key.toString()
          })

          return (
            <div>
              {result
                ? result.map((entry, index) => (
                    <FunctionalClassChip
                      key={entry + index}
                      functionalClass={entry}
                    />
                  ))
                : null}
            </div>
          )
        case 'semantic':
          return <DiagCommSemanticChip semantic={diagComm.semantic} />
        case 'addressing':
          return isDiagService(diagComm) ? (
            <AddressingChip addressing={diagComm.addressing} />
          ) : null
        case 'actions':
          return (
            <div className="relative flex justify-end items-center gap-2">
              <ActionDropdown
                view_href={`/diagnostic-comm?objectId=${diagComm.perma_id}&variantId=${objectId}&containerId=${containerId}`}
              />
            </div>
          )
        default:
          return cellValue?.toString()
      }
    },
    [diagComms, functionalClassMap]
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
              tableName="diagComms"
              visibleColumns={visibleColumns}
              visibleColumnsHandler={setVisibleColumns}
            />
            <AddNewButton />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-small">
            {filteredItems.length} of total {diagComms.items.length} diagnostic
            communications
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
    diagComms,
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
  if (isLoading || !diag_comms)
    return <CircularProgress aria-label="Loading..." />

  return (
    <Table
      isHeaderSticky
      isStriped
      aria-label="Diagnostic communications table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[382px], min-w-full',
      }}
      data-testid="diag-comm-table"
      selectedKeys={selectedKeys}
      selectionMode="none"
      sortDescriptor={diagComms.sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={diagComms.sort}
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
        emptyContent={'No DIAG-COMMs found'}
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

type DiagCommWithVariantDatasetInfo = {
  dataSet: DiagnosticDataSetDescriptor | undefined
  referencingVariants: DiagnosticVariant[] | undefined
  diagComm: DiagCommGenericInfo
}

export function DiagCommsOverviewComponent({ pageId }: { pageId: string }) {
  const INITIAL_VISIBLE_COLUMNS = new Set([
    'short_name',
    'semantic',
    'comm_type',
    'actions',
  ])

  const [visibleColumns, setVisibleColumns] = useSelectionWithIndexedDB(
    pageId,
    'allDiagComms#table-visibleColumns',
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
    '/diag-comms',
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

  const diagCollection = useAsyncList({
    async load() {
      return {
        items:
          data_collection && data_collection.diag_comms
            ? data_collection.diag_comms
                .map((entry): DiagCommWithVariantDatasetInfo | undefined => {
                  return entry.diagComm
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
                        diagComm: entry.diagComm,
                      }
                    : undefined
                })
                .flat()
                .filter((value) => value !== undefined)
                .sort((a, b) =>
                  sortItemsBySortDescriptor<DiagCommGenericInfo>(
                    a.diagComm,
                    b.diagComm,
                    {
                      column: 'short_name',
                      direction: 'ascending',
                    }
                  )
                )
            : [],
      }
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) =>
          sortItemsBySortDescriptor<DiagCommGenericInfo>(
            a.diagComm,
            b.diagComm,
            sortDescriptor
          )
        ),
      }
    },
  })

  // Reload the async list items, when the queried dataCollection change
  React.useEffect(() => {
    if (data_collection !== undefined) {
      diagCollection.reload()

      if (
        data_collection.diag_comms !== undefined &&
        data_collection.diag_comms.length > 0
      ) {
        resolveFunctionalClassMappings(
          data_collection.diag_comms
            .map((entry) => entry.diagComm)
            .filter((entry) => entry !== undefined)
        )
        resolveVariantMappings(data_collection)
      }
    }
  }, [data_collection])

  const [functionalClassMap, setFunctionalClassMap] = React.useState<
    Map<string, string>
  >(new Map<string, string>())

  const resolveFunctionalClassMappings = (diagComms: DiagCommGenericInfo[]) => {
    if (diagComms && diagComms) {
      const functional_class_ids = new Set<number>(
        diagComms.flatMap(({ functional_class_refs }) =>
          functional_class_refs
            ? functional_class_refs.flatMap(
                ({ resolved_object_ephemeral_id }) =>
                  resolved_object_ephemeral_id
                    ? resolved_object_ephemeral_id
                    : 0
              )
            : []
        )
      )

      const respPromises = Array.from(functional_class_ids).map(
        (func_class_id) => {
          return client.GET('/objects/{ephemeral-id}', {
            params: {
              path: { 'ephemeral-id': func_class_id },
            },
          })
        }
      )

      const results = Promise.all(respPromises)

      results.then((responses) => {
        const mappingResult = new Map<string, string>(functionalClassMap)

        for (const response of responses) {
          const func_class_name = response.data?.short_name
          const func_class_id = response.response.url.split('/').pop()

          mappingResult.set(
            func_class_id ? func_class_id : 'unresolved',
            func_class_name ? func_class_name : 'UNKNOWN'
          )
        }

        setFunctionalClassMap(mappingResult)
      })
    }
  }

  const [variantMap, setVariantMap] = React.useState<Map<string, string>>(
    new Map<string, string>()
  )

  const resolveVariantMappings = (
    dcvCollection: DiagCommsOfVariantsOfDataSetsCollection
  ) => {
    if (dcvCollection) {
      const mappingResult = new Map<string, string>(variantMap)

      dcvCollection.variants?.forEach((variant) =>
        mappingResult.set(variant.perma_id, variant.short_name)
      )

      setVariantMap(mappingResult)
    }
  }

  // Introduce all state variables for searching and filtering the diag_comms
  const [searchValue, setSearchValue] = React.useState('')

  const [selectedCommTypes, setSelectedCommTypes] = React.useState<Selection>(
    new Set([])
  )
  const selectedCommTypeValues = React.useMemo(() => {
    let arr = Array.from(selectedCommTypes)

    return arr
  }, [selectedCommTypes])

  const [selectedOriginLayers, setSelectedOriginLayers] =
    React.useState<Selection>(new Set([]))
  const selectedOriginLayerValues = React.useMemo(() => {
    let arr = Array.from(selectedOriginLayers)

    return arr
  }, [selectedOriginLayers])

  const [selectedUdsServices, setSelectedUdsServices] =
    React.useState<Selection>(new Set([]))
  const selectedUdsServiceValues = React.useMemo(() => {
    let arr = Array.from(selectedUdsServices)

    return arr
  }, [selectedUdsServices])

  const [selectedSemantics, setSelectedSemantics] = React.useState<Selection>(
    new Set([])
  )
  const selectedSemanticValues = React.useMemo(() => {
    let arr = Array.from(selectedSemantics)

    return arr
  }, [selectedSemantics])

  const [selectedDiagClasses, setSelectedDiagClasses] =
    React.useState<Selection>(new Set([]))
  const selectedDiagClassValues = React.useMemo(() => {
    let arr = Array.from(selectedDiagClasses)

    return arr
  }, [selectedDiagClasses])

  const [selectedFunctClasses, setSelectedFunctClasses] =
    React.useState<Selection>(new Set([]))

  const selectedFunctClassValues = React.useMemo(() => {
    let arr = Array.from(selectedFunctClasses)

    return arr
  }, [selectedFunctClasses])

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
    selectedSemantics,
    selectedUsedInVariants,
    selectedCommTypes,
    selectedDiagClasses,
    selectedFunctClasses,
    selectedOriginLayers,
    selectedUdsServices,
  ])

  // Define the table columns, the list of initially visible columns and a related state variable
  const columns: ColumnDefinition[] = [
    { label: 'PERMA_ID', key: 'perma_id', sortable: true },
    { label: 'EPHEMERAL_ID', key: 'ephemeral_id', sortable: true },
    { label: 'SHORT_NAME', key: 'short_name', sortable: true },
    { label: 'LONG_NAME', key: 'long_name', sortable: true },
    { label: 'DESCRIPTION', key: 'description', sortable: false },
    {
      label: 'ORIGIN_LAYER',
      key: 'origin_layer_short_name',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DiagCommWithVariantDatasetInfo>
          filterItems={diagCollection}
          filterLabel="ORIGIN_LAYER"
          filterValueExtractorFunc={(obj) =>
            obj.diagComm.origin_layer_short_name
              ? obj.diagComm.origin_layer_short_name
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
        <TableFilterObjectCollectionWithExtractorFuncDropdown<DiagCommWithVariantDatasetInfo>
          filterItems={diagCollection}
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
    {
      label: 'UDS_SERVICE',
      key: 'uds_service',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DiagCommWithVariantDatasetInfo>
          filterItems={diagCollection}
          filterLabel="UDS_SERVICE"
          filterValueExtractorFunc={(obj) =>
            obj.diagComm.uds_service?.service_name
              ? obj.diagComm.uds_service?.service_name
              : undefined
          }
          selectedFilters={selectedUdsServices}
          selectedFiltersHandler={setSelectedUdsServices}
        />
      ),
    },
    {
      label: 'COMM_TYPE',
      key: 'comm_type',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DiagCommWithVariantDatasetInfo>
          filterItems={diagCollection}
          filterLabel="COMM_TYPE"
          filterValueExtractorFunc={(obj) =>
            obj.diagComm.class_name ? obj.diagComm.class_name : undefined
          }
          selectedFilters={selectedCommTypes}
          selectedFiltersHandler={setSelectedCommTypes}
        />
      ),
    },
    {
      label: 'SEMANTIC',
      key: 'semantic',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DiagCommWithVariantDatasetInfo>
          filterItems={diagCollection}
          filterLabel="SEMANTIC"
          filterValueExtractorFunc={(obj) =>
            obj.diagComm.semantic ? obj.diagComm.semantic : undefined
          }
          selectedFilters={selectedSemantics}
          selectedFiltersHandler={setSelectedSemantics}
        />
      ),
    },
    {
      label: 'DIAGNOSTIC_CLASS',
      key: 'diagnostic_class',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DiagCommWithVariantDatasetInfo>
          filterItems={diagCollection}
          filterLabel="DIAGNOSTIC_CLASS"
          filterValueExtractorFunc={(obj) =>
            obj.diagComm.diagnostic_class
              ? obj.diagComm.diagnostic_class
              : undefined
          }
          selectedFilters={selectedDiagClasses}
          selectedFiltersHandler={setSelectedDiagClasses}
        />
      ),
    },
    {
      label: 'FUNCTIONAL_CLASSES',
      key: 'functional_class_refs',
      sortable: true,
      filter: (
        <TableFilterObjectCollectionWithExtractorFuncDropdown<DiagCommWithVariantDatasetInfo>
          filterItems={diagCollection}
          filterLabel="FUNCTIONAL_CLASSES"
          filterValueExtractorFunc={(obj) =>
            obj.diagComm.functional_class_refs
              ? obj.diagComm.functional_class_refs
                  .map((value) => {
                    value.resolved_object_perma_id?.toString()
                  })
                  .filter((value) => value !== undefined)
              : []
          }
          idLabelMappings={functionalClassMap}
          selectedFilters={selectedFunctClasses}
          selectedFiltersHandler={setSelectedFunctClasses}
        />
      ),
    },
    { label: 'ACTIONS', key: 'actions' },
  ]

  // Define a memo for table data filtering
  const filteredItems = React.useMemo(() => {
    let filteredCollectionItems = [...diagCollection.items]

    // Filter all diagComms based on visibleColumns list
    if (searchValue && searchValue.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (diagCommWithVarDb) => {
          let result = false

          if (
            !result &&
            visibleColumnsValues.includes('perma_id') &&
            diagCommWithVarDb.diagComm.perma_id !== undefined
          ) {
            result = diagCommWithVarDb.diagComm.perma_id
              .toString()
              .includes(searchValue.toLowerCase())
          }

          if (
            !result &&
            visibleColumnsValues.includes('short_name') &&
            diagCommWithVarDb.diagComm.short_name !== undefined
          ) {
            result = diagCommWithVarDb.diagComm.short_name
              .toLowerCase()
              .includes(searchValue.toLowerCase())
          }

          if (!result && visibleColumnsValues.includes('long_name')) {
            result = diagCommWithVarDb.diagComm.long_name
              ? diagCommWithVarDb.diagComm.long_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (
            !result &&
            visibleColumnsValues.includes('description') &&
            diagCommWithVarDb.diagComm.description !== undefined
          ) {
            result = diagCommWithVarDb.diagComm.description.text
              ? diagCommWithVarDb.diagComm.description.text
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (
            !result &&
            visibleColumnsValues.includes('origin_layer_short_name')
          ) {
            result = diagCommWithVarDb.diagComm.origin_layer_short_name
              ? diagCommWithVarDb.diagComm.origin_layer_short_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (!result && visibleColumnsValues.includes('semantic')) {
            result = diagCommWithVarDb.diagComm.semantic
              ? diagCommWithVarDb.diagComm.semantic
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (!result && visibleColumnsValues.includes('comm_type')) {
            result = diagCommWithVarDb.diagComm.class_name
              ? diagCommWithVarDb.diagComm.class_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (!result && visibleColumnsValues.includes('diagnostic_class')) {
            result = diagCommWithVarDb.diagComm.diagnostic_class
              ? diagCommWithVarDb.diagComm.diagnostic_class
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (
            !result &&
            visibleColumnsValues.includes('functional_class_refs')
          ) {
            result = diagCommWithVarDb.diagComm.functional_class_refs
              ? diagCommWithVarDb.diagComm.functional_class_refs.some(
                  (item) => {
                    const class_name = item.resolved_object_perma_id
                      ? functionalClassMap.get(item.resolved_object_perma_id)
                      : undefined

                    return class_name
                      ? class_name
                          .toLowerCase()
                          .includes(searchValue.toLowerCase())
                      : false
                  }
                )
              : false
          }

          if (!result && visibleColumnsValues.includes('used_in_variants')) {
            result = diagCommWithVarDb.referencingVariants
              ? diagCommWithVarDb.referencingVariants.some((item) => {
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

          if (!result && visibleColumnsValues.includes('uds_service')) {
            result = diagCommWithVarDb.diagComm.uds_service
              ? getHexRepresentation(
                  diagCommWithVarDb.diagComm.uds_service.service_id
                ).includes(searchValue.toLowerCase()) ||
                diagCommWithVarDb.diagComm.uds_service.service_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          return result
        }
      )
    }
    if (selectedUdsServiceValues && selectedUdsServiceValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (diagCommWithVarDb) =>
          diagCommWithVarDb.diagComm.uds_service
            ? selectedUdsServiceValues.includes(
                diagCommWithVarDb.diagComm.uds_service.service_name
              )
            : false
      )
    }
    if (selectedCommTypeValues && selectedCommTypeValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (diagCommWithVarDb) =>
          diagCommWithVarDb.diagComm.class_name
            ? selectedCommTypeValues.includes(
                diagCommWithVarDb.diagComm.class_name
              )
            : false
      )
    }
    if (selectedOriginLayerValues && selectedOriginLayerValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (diagCommWithVarDb) =>
          diagCommWithVarDb.diagComm.origin_layer_short_name
            ? selectedOriginLayerValues.includes(
                diagCommWithVarDb.diagComm.origin_layer_short_name
              )
            : false
      )
    }
    if (selectedDiagClassValues && selectedDiagClassValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (diagCommWithVarDb) =>
          diagCommWithVarDb.diagComm.diagnostic_class
            ? selectedDiagClassValues.includes(
                diagCommWithVarDb.diagComm.diagnostic_class
              )
            : false
      )
    }
    if (selectedFunctClassValues && selectedFunctClassValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (diagCommWithVarDb) =>
          diagCommWithVarDb.diagComm.functional_class_refs
            ? diagCommWithVarDb.diagComm.functional_class_refs.some((item) =>
                item.resolved_object_perma_id
                  ? selectedFunctClassValues.includes(
                      item.resolved_object_perma_id.toString()
                    )
                  : false
              )
            : false
      )
    }
    if (selectedUsedInVariantValues && selectedUsedInVariantValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (diagCommWithVarDb) =>
          diagCommWithVarDb.referencingVariants
            ? diagCommWithVarDb.referencingVariants.some((item) =>
                item.perma_id
                  ? selectedUsedInVariantValues.includes(
                      item.perma_id.toString()
                    )
                  : false
              )
            : false
      )
    }
    if (selectedSemanticValues && selectedSemanticValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (diagCommWithVarDb) =>
          diagCommWithVarDb.diagComm.semantic
            ? selectedSemanticValues.includes(
                diagCommWithVarDb.diagComm.semantic
              )
            : false
      )
    }

    return filteredCollectionItems
  }, [
    diagCollection,
    searchValue,
    selectedUdsServiceValues,
    selectedCommTypeValues,
    selectedOriginLayerValues,
    selectedDiagClassValues,
    selectedFunctClassValues,
    selectedSemanticValues,
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
    (
      diagCommWithVarDb: DiagCommWithVariantDatasetInfo,
      columnKey: React.Key
    ) => {
      const cellValue = diagCommWithVarDb.diagComm[columnKey as keyof DiagComm]

      switch (columnKey) {
        case 'perma_id':
          return <p>{diagCommWithVarDb.diagComm.perma_id}</p>
        case 'ephemeral_id':
          return <p>{diagCommWithVarDb.diagComm.ephemeral_id}</p>
        case 'short_name':
          return (
            <Link
              href={`/diagnostic-comm?objectId=${diagCommWithVarDb.diagComm.perma_id}&variantId=${diagCommWithVarDb.diagComm.origin_layer_perma_id}&containerId=${diagCommWithVarDb.dataSet?.perma_id}`}
            >
              {diagCommWithVarDb.diagComm.short_name}
            </Link>
          )
        case 'long_name':
          return <p>{diagCommWithVarDb.diagComm.long_name}</p>
        case 'description':
          return (
            <DescriptionComponent
              description={diagCommWithVarDb.diagComm.description}
              enableUnfolding={true}
              maxDisplayLengthLimit={200}
            />
          )
        case 'uds_service':
          return diagCommWithVarDb.diagComm.uds_service ? (
            <p>
              {diagCommWithVarDb.diagComm.uds_service?.service_name} [
              {getHexRepresentation(
                diagCommWithVarDb.diagComm.uds_service?.service_id
              )}
              ]
            </p>
          ) : null
        case 'comm_type':
          return (
            <DiagCommTypeChip
              commType={diagCommWithVarDb.diagComm.class_name}
            />
          )
        case 'origin_layer_short_name':
          return (
            <div>
              <Link
                href={`/diagnostic-variant?objectId=${diagCommWithVarDb.diagComm.origin_layer_perma_id}&containerId=${diagCommWithVarDb.dataSet?.perma_id}`}
              >
                {diagCommWithVarDb.diagComm.origin_layer_short_name}
              </Link>
              <p className="text-small">
                ({diagCommWithVarDb.diagComm.origin_layer_type})
              </p>
            </div>
          )
        case 'diagnostic_class':
          return (
            <DiagnosticClassChip
              diagClass={diagCommWithVarDb.diagComm.diagnostic_class}
            />
          )
        case 'functional_class_refs':
          const fcRefs = diagCommWithVarDb.diagComm.functional_class_refs?.map(
            (key) => {
              const res = key.resolved_object_ephemeral_id
                ? functionalClassMap.get(
                    key.resolved_object_ephemeral_id.toString()
                  )
                : undefined

              return res ? res : key.toString()
            }
          )

          return (
            <div>
              {fcRefs
                ? fcRefs.map((entry, index) => (
                    <FunctionalClassChip
                      key={entry + index}
                      functionalClass={entry}
                    />
                  ))
                : null}
            </div>
          )
        case 'used_in_variants':
          return (
            <div className="min-w-[400] gap-2 grid grid-cols-2">
              {diagCommWithVarDb.referencingVariants?.map((entry, index) => {
                return (
                  <Card key={entry.ephemeral_id + index}>
                    <CardBody>
                      <Link
                        href={`/diagnostic-variant?objectId=${entry.perma_id}&containerId=${diagCommWithVarDb.dataSet?.perma_id}`}
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
        case 'semantic':
          return (
            <DiagCommSemanticChip
              semantic={diagCommWithVarDb.diagComm.semantic}
            />
          )
        case 'actions':
          return (
            <div className="relative flex justify-end items-center gap-2">
              <ActionDropdown
                view_href={`/diagnostic-comm?objectId=${diagCommWithVarDb.diagComm.perma_id}&variantId=${diagCommWithVarDb.diagComm.origin_layer_perma_id}&containerId=${diagCommWithVarDb.dataSet?.perma_id}`}
              />
            </div>
          )
        default:
          return cellValue?.toString()
      }
    },
    [diagCollection, functionalClassMap]
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
              tableName="diagComms"
              visibleColumns={visibleColumns}
              visibleColumnsHandler={setVisibleColumns}
            />
            <AddNewButton />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-small">
            {filteredItems.length} of total {diagCollection.items.length}{' '}
            diagnostic communications
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
    diagCollection,
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
      aria-label="Diagnostic communications table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[382px], min-w-full',
      }}
      data-testid="diag-comm-table"
      selectedKeys={selectedKeys}
      selectionMode="none"
      sortDescriptor={diagCollection.sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={diagCollection.sort}
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
        emptyContent={'No DIAG-COMMs found'}
        isLoading={isLoading}
        items={visible_items}
        loadingContent={<CircularProgress aria-label="Loading..." />}
      >
        {(item) => (
          <TableRow key={item.diagComm.ephemeral_id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
