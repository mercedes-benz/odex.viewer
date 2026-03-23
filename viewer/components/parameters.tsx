// SPDX-License-Identifier: AGPL-3.0-only
'use client'

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

import {
  EnvironmentData,
  isCodedConstParameterType,
  isLengthKeyParameterType,
  isMatchingRequestParameterType,
  isNrcConstParameterType,
  isParameterTypeWithDopRef,
  isPhysicalConstantParameterType,
  isReservedParameter,
  isSystemParameterType,
  isTableEntryParameterType,
  isTableKeyParameterType,
  isTableStructParameterType,
  isValueParameterType,
  ParameterUnionType,
  Request,
  Response,
  Structure,
} from '@/api/api-hooks'
import {
  ActionDropdown,
  AddNewButton,
  DescriptionComponent,
  DiagCodedTypeComponent,
  DiagCodedTypePopoverComponent,
  NextPageButton,
  OdxLinkPopoverComponent,
  ParameterSemanticChip,
  ParameterTypeChip,
  PreviousPageButton,
} from '@/components/commons'
import {
  ParameterTableColumnDropdown,
  TableFilterDropdown,
} from '@/components/custom-dropdowns'
import { SearchIcon } from '@/components/icons'
import {
  ParameterColumnDefinition,
  ParameterTargetObjectIds,
  DiagnosticCommTargetObjectIds,
  DataObjectPropTargetObjectIds,
  isDiagnosticCommTargetObjectIds,
} from '@/types/index'
import { getHexRepresentation, sortItemsBySortDescriptor } from '@/utils/utils'
import { useSelectionWithIndexedDB } from '@/storage/settings'

export function ParametersComponent({
  parentObject,
  targetObjectIds,
  pageId,
}: {
  parentObject: Request | Response | Structure | EnvironmentData
  targetObjectIds: DiagnosticCommTargetObjectIds | DataObjectPropTargetObjectIds
  pageId: string
}) {
  const parameters = parentObject.parameters as ParameterUnionType[]

  // Introduce all state variables for searching and filtering the parameters
  const [searchValue, setSearchValue] = React.useState('')

  const [selectedSemantics, setSelectedSemantics] = React.useState<Selection>(
    new Set([])
  )
  const selectedSemanticValues = React.useMemo(() => {
    let arr = Array.from(selectedSemantics)

    return arr
  }, [selectedSemantics])

  const [selectedParamTypes, setSelectedParamTypes] = React.useState<Selection>(
    new Set([])
  )
  const selectedParamTypeValues = React.useMemo(() => {
    let arr = Array.from(selectedParamTypes)

    return arr
  }, [selectedParamTypes])

  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: 'byte_position',
    direction: 'ascending',
  })

  // Jump back to page 1, if one of the column filters is changed
  React.useEffect(() => {
    setPage(1)
  }, [selectedSemantics, selectedParamTypes])

  // Define the table columns, the list of initially visible columns and a related state variable
  const columns: ParameterColumnDefinition[] = [
    { label: 'OBJECT_ID', key: 'ephemeral_id', sortable: true },
    { label: 'SHORT_NAME', key: 'short_name', sortable: true },
    { label: 'LONG_NAME', key: 'long_name', sortable: true },
    { label: 'DESCRIPTION', key: 'description', sortable: false },
    {
      label: 'TYPE',
      key: 'parameter_type',
      sortable: true,
      filter: (
        <TableFilterDropdown<ParameterUnionType>
          filterItems={parameters}
          filterKey="class_name"
          filterLabel="TYPE"
          selectedFilters={selectedParamTypes}
          selectedFiltersHandler={setSelectedParamTypes}
        />
      ),
    },
    {
      label: 'SEMANTIC',
      key: 'semantic',
      sortable: true,
      filter: (
        <TableFilterDropdown<ParameterUnionType>
          filterItems={parameters}
          filterKey="semantic"
          filterLabel="SEMANTIC"
          selectedFilters={selectedSemantics}
          selectedFiltersHandler={setSelectedSemantics}
        />
      ),
    },
    { label: 'BYTE POSITION', key: 'byte_position', sortable: true },
    { label: 'BIT POSITION', key: 'bit_position', sortable: true },
    {
      label: 'PHYSICAL DEFAULT VALUE',
      key: 'physical_default_value',
      relatedParameterTypes: ['ValueParameter'],
      sortable: false,
    },
    {
      label: 'DOP REF',
      key: 'dop_ref',
      keyAliases: ['dop_snref'],
      relatedParameterTypes: [
        'ValueParameter',
        'LengthKeyParameter',
        'PhysicalConstantParameter',
        'SystemParameter',
      ],
      sortable: false,
    },
    {
      label: 'PHYSICAL CONSTANT VALUE',
      key: 'physical_constant_value',
      relatedParameterTypes: ['PhysicalConstantParameter'],
      sortable: false,
    },
    {
      label: 'CODED VALUE',
      key: 'coded_value',
      relatedParameterTypes: ['CodedConstParameter'],
      sortable: false,
    },
    {
      label: 'DIAG CODED TYPE',
      key: 'diag_coded_type',
      relatedParameterTypes: ['CodedConstParameter', 'NrcConstParameter'],
      sortable: false,
    },
    {
      label: 'BYTE LENGTH',
      key: 'byte_length',
      relatedParameterTypes: ['MatchingRequestParameter'],
      sortable: false,
    },
    {
      label: 'BIT LENGTH',
      key: 'bit_length',
      relatedParameterTypes: ['ReservedParameter'],
      sortable: false,
    },
    {
      label: 'REQUEST BYTE POSITION',
      key: 'request_byte_position',
      relatedParameterTypes: ['MatchingRequestParameter'],
      sortable: false,
    },
    {
      label: 'TABLE REF',
      key: 'table_ref',
      keyAliases: ['table_snref'],
      relatedParameterTypes: ['TableKeyParameter'],
      sortable: false,
    },
    {
      label: 'TABLE ROW REF',
      key: 'table_row_ref',
      keyAliases: ['table_row_snref'],
      relatedParameterTypes: ['TableKeyParameter', 'TableEntryParameter'],
      sortable: false,
    },
    {
      label: 'TABLE KEY REF',
      key: 'table_key_ref',
      keyAliases: ['table_key_snref'],
      relatedParameterTypes: ['TableStructParameter'],
      sortable: false,
    },
    {
      label: 'TABLE ENTRY TARGET',
      key: 'target',
      relatedParameterTypes: ['TableEntryParameter'],
      sortable: false,
    },
    {
      label: 'SYSTEM PARAM',
      key: 'sysparam',
      relatedParameterTypes: ['SystemParameter'],
      sortable: false,
    },
    {
      label: 'CODED VALUES',
      key: 'coded_values',
      relatedParameterTypes: ['NrcConstParameter'],
      sortable: false,
    },
    { label: 'ACTIONS', key: 'actions' },
  ]

  const INITIAL_VISIBLE_COLUMNS = new Set([
    'short_name',
    'semantic',
    'parameter_type',
    'byte_position',
    'bit_position',
    'actions',
  ])
  const [visibleColumns, setVisibleColumns] = useSelectionWithIndexedDB(
    pageId,
    'parameters#table-visibleColumns',
    INITIAL_VISIBLE_COLUMNS
  )

  const visibleColumnsValues = React.useMemo(() => {
    let arr = Array.from(visibleColumns)

    return arr
  }, [visibleColumns])

  // Define a memo for table data filtering
  const filteredItems = React.useMemo(() => {
    let filteredParameters = [...parameters]

    // Filter all parameters based on visibleColumns list
    if (searchValue && searchValue.length > 0) {
      filteredParameters = filteredParameters.filter((param) => {
        let result = false

        if (
          !result &&
          visibleColumnsValues.includes('ephemeral_id') &&
          param.ephemeral_id !== undefined
        ) {
          result = param.ephemeral_id
            .toString()
            .includes(searchValue.toLowerCase())
        }

        if (
          !result &&
          visibleColumnsValues.includes('short_name') &&
          param.short_name !== undefined
        ) {
          result = param.short_name
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        }

        if (!result && visibleColumnsValues.includes('long_name')) {
          result = param.long_name
            ? param.long_name.toLowerCase().includes(searchValue.toLowerCase())
            : false
        }

        if (
          !result &&
          visibleColumnsValues.includes('description') &&
          param.description !== undefined
        ) {
          result = param.description.text
            ? param.description.text
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            : false
        }

        if (!result && visibleColumnsValues.includes('semantic')) {
          result = param.semantic
            ? param.semantic.toLowerCase().includes(searchValue.toLowerCase())
            : false
        }

        if (!result && visibleColumnsValues.includes('parameter_type')) {
          result = param.class_name
            ? param.class_name.toLowerCase().includes(searchValue.toLowerCase())
            : false
        }

        if (
          !result &&
          visibleColumnsValues.includes('physical_default_value')
        ) {
          result =
            isValueParameterType(param) && param.physical_default_value
              ? param.physical_default_value
                  .toString()
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
        }

        if (!result && visibleColumnsValues.includes('dop_ref')) {
          result = isParameterTypeWithDopRef(param)
            ? param.dop_ref && param.dop_ref.resolved_object_short_name
              ? param.dop_ref.resolved_object_short_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : param.dop_snref
                ? param.dop_snref
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
                : false
            : false
        }

        if (
          !result &&
          visibleColumnsValues.includes('physical_constant_value')
        ) {
          result =
            isPhysicalConstantParameterType(param) &&
            param.physical_constant_value
              ? param.physical_constant_value
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
        }

        if (!result && visibleColumnsValues.includes('coded_value')) {
          result =
            isCodedConstParameterType(param) && param.coded_value
              ? param.semantic &&
                ['service-id', 'id'].includes(param.semantic.toLowerCase())
                ? getHexRepresentation(param.coded_value)
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
                : param.coded_value
                    .toString()
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
              : false
        }

        if (!result && visibleColumnsValues.includes('diag_coded_type')) {
          if (
            (isCodedConstParameterType(param) ||
              isNrcConstParameterType(param)) &&
            param.diag_coded_type
          ) {
            const ires =
              param.diag_coded_type.base_data_type
                ?.toLowerCase()
                .includes(searchValue.toLowerCase()) ||
              param.diag_coded_type.base_type_encoding
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

            result = ires !== undefined ? ires : false
          }
        }

        if (!result && visibleColumnsValues.includes('byte_length')) {
          result =
            isMatchingRequestParameterType(param) && param.byte_length
              ? param.byte_length.toString() === searchValue
              : false
        }

        if (!result && visibleColumnsValues.includes('bit_length')) {
          result =
            isReservedParameter(param) && param.bit_length
              ? param.bit_length.toString() === searchValue
              : false
        }

        if (!result && visibleColumnsValues.includes('request_byte_position')) {
          result =
            isMatchingRequestParameterType(param) && param.request_byte_position
              ? param.request_byte_position.toString() === searchValue
              : false
        }

        if (!result && visibleColumnsValues.includes('table_ref')) {
          result = isTableKeyParameterType(param)
            ? param.table_ref && param.table_ref.resolved_object_short_name
              ? param.table_ref.resolved_object_short_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : param.table_snref
                ? param.table_snref
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
                : false
            : false
        }

        if (!result && visibleColumnsValues.includes('table_row_ref')) {
          result =
            isTableKeyParameterType(param) || isTableEntryParameterType(param)
              ? param.table_row_ref &&
                param.table_row_ref.resolved_object_short_name
                ? param.table_row_ref.resolved_object_short_name
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
                : isTableKeyParameterType(param) && param.table_row_snref
                  ? param.table_row_snref
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  : false
              : false
        }

        if (!result && visibleColumnsValues.includes('table_key_ref')) {
          result = isTableStructParameterType(param)
            ? param.table_key_ref &&
              param.table_key_ref.resolved_object_short_name
              ? param.table_key_ref.resolved_object_short_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : param.table_key_snref
                ? param.table_key_snref
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
                : false
            : false
        }

        if (!result && visibleColumnsValues.includes('target')) {
          result =
            isTableEntryParameterType(param) && param.target
              ? param.target.toLowerCase().includes(searchValue.toLowerCase())
              : false
        }

        if (!result && visibleColumnsValues.includes('sysparam')) {
          result =
            isSystemParameterType(param) && param.sysparam
              ? param.sysparam.toLowerCase().includes(searchValue.toLowerCase())
              : false
        }

        if (!result && visibleColumnsValues.includes('coded_values')) {
          result =
            isNrcConstParameterType(param) && param.coded_values
              ? param.coded_values.some((value) =>
                  value
                    .toString()
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
                )
              : false
        }

        return result
      })
    }
    if (selectedSemanticValues && selectedSemanticValues.length > 0) {
      filteredParameters = filteredParameters.filter((param) =>
        param.semantic ? selectedSemanticValues.includes(param.semantic) : false
      )
    }

    if (selectedParamTypeValues && selectedParamTypeValues.length > 0) {
      filteredParameters = filteredParameters.filter((param) =>
        param.class_name
          ? selectedParamTypeValues.includes(param.class_name)
          : false
      )
    }

    // Sort the filtered list with current sortDescriptor
    if (filteredParameters && sortDescriptor) {
      filteredParameters.sort((a, b) =>
        sortItemsBySortDescriptor<ParameterUnionType>(a, b, sortDescriptor)
      )
    }

    return filteredParameters
  }, [
    parameters,
    searchValue,
    selectedSemanticValues,
    selectedParamTypeValues,
    sortDescriptor,
  ])

  // Define state variables for pagination and row selection
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]))
  const [rowsPerPage, setRowsPerPage] = React.useState(5)
  const [page, setPage] = React.useState(1)
  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const visible_items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const renderCell = React.useCallback(
    (param: ParameterUnionType, columnKey: React.Key) => {
      const cellValue = param[columnKey as keyof ParameterUnionType]

      switch (columnKey) {
        case 'ephemeral_id':
          return <p>{param.ephemeral_id}</p>
        case 'short_name':
          return isDiagnosticCommTargetObjectIds(targetObjectIds) ? (
            <Link
              href={`/parameter?objectId=${param.ephemeral_id}&elementChildId=${parentObject.perma_id}&elementId=${targetObjectIds.diagCommId}&variantId=${targetObjectIds.variantId}&containerId=${targetObjectIds.containerId}`}
            >
              {param.short_name}
            </Link>
          ) : (
            <Link
              href={`/parameter?objectId=${param.ephemeral_id}&elementId=${parentObject.perma_id}&variantId=${targetObjectIds.variantId}&containerId=${targetObjectIds.containerId}`}
            >
              {param.short_name}
            </Link>
          )
        case 'long_name':
          return <p>{param.long_name}</p>
        case 'description':
          return (
            <DescriptionComponent
              description={param.description}
              enableUnfolding={true}
              maxDisplayLengthLimit={200}
            />
          )
        case 'semantic':
          return <ParameterSemanticChip semantic={param.semantic} />
        case 'parameter_type':
          return <ParameterTypeChip paramType={param.class_name} />
        case 'byte_position':
          return <p>{param.byte_position}</p>
        case 'bit_position':
          return <p>{param.bit_position}</p>
        case 'physical_default_value':
          return isValueParameterType(param) ? (
            <p>{param.physical_default_value}</p>
          ) : (
            <></>
          )
        case 'dop_ref':
          return isValueParameterType(param) ||
            isLengthKeyParameterType(param) ||
            isPhysicalConstantParameterType(param) ||
            isSystemParameterType(param) ? (
            param.dop_snref ? (
              <p>{param.dop_snref}</p>
            ) : param.dop_ref ? (
              <OdxLinkPopoverComponent
                href={`/dops?objectId=${param.dop_ref.resolved_object_perma_id}&variantId=${targetObjectIds.variantId}&containerId=${targetObjectIds.containerId}`}
                label="Show DOP"
                odxLink={param.dop_ref}
              />
            ) : (
              <></>
            )
          ) : (
            <></>
          )
        case 'physical_constant_value':
          return isPhysicalConstantParameterType(param) ? (
            <p>{param.physical_constant_value}</p>
          ) : (
            <></>
          )
        case 'coded_value':
          return isCodedConstParameterType(param) ? (
            param.semantic &&
            ['service-id', 'id'].includes(param.semantic.toLowerCase()) ? (
              <p>
                {param.coded_value} [{getHexRepresentation(param.coded_value)}]
              </p>
            ) : (
              <p>{param.coded_value}</p>
            )
          ) : (
            <></>
          )
        case 'diag_coded_type':
          return (isCodedConstParameterType(param) ||
            isNrcConstParameterType(param)) &&
            param.diag_coded_type ? (
            <DiagCodedTypePopoverComponent
              diagCodedType={param.diag_coded_type}
            />
          ) : (
            <></>
          )
        case 'byte_length':
          return isMatchingRequestParameterType(param) ? (
            <p>{param.byte_length}</p>
          ) : (
            <></>
          )
        case 'bit_length':
          return isReservedParameter(param) ? <p>{param.bit_length}</p> : <></>
        case 'request_byte_position':
          return isMatchingRequestParameterType(param) ? (
            <p>{param.request_byte_position}</p>
          ) : (
            <></>
          )
        case 'table_ref':
          return isTableKeyParameterType(param) ? (
            param.table_snref ? (
              <p>{param.table_snref}</p>
            ) : param.table_ref ? (
              <OdxLinkPopoverComponent
                href={`/tables?objectId=${param.table_ref.resolved_object_perma_id}`}
                label="Show Table"
                odxLink={param.table_ref}
              />
            ) : (
              <></>
            )
          ) : (
            <></>
          )
        case 'table_row_ref':
          return isTableKeyParameterType(param) ||
            isTableEntryParameterType(param) ? (
            isTableKeyParameterType(param) && param.table_row_snref ? (
              <p>{param.table_row_snref}</p>
            ) : param.table_row_ref ? (
              <OdxLinkPopoverComponent
                href={`/tables?table-row-id=${param.table_row_ref.resolved_object_perma_id}`}
                label="Show Table Row"
                odxLink={param.table_row_ref}
              />
            ) : (
              <></>
            )
          ) : (
            <></>
          )
        case 'table_key_ref':
          return isTableStructParameterType(param) ? (
            param.table_key_snref ? (
              <p>{param.table_key_snref}</p>
            ) : param.table_key_ref ? (
              <OdxLinkPopoverComponent
                href={`/tables?table-key-id=${param.table_key_ref.resolved_object_perma_id}`}
                label="Show Table Key"
                odxLink={param.table_key_ref}
              />
            ) : (
              <></>
            )
          ) : (
            <></>
          )
        case 'target':
          return isTableEntryParameterType(param) ? (
            <p>{param.target}</p>
          ) : (
            <></>
          )
        case 'sysparam':
          return isSystemParameterType(param) ? <p>{param.sysparam}</p> : <></>
        case 'coded_values':
          return isNrcConstParameterType(param) ? (
            <ul>
              {param.coded_values?.map((entry, index) => (
                <li key={index}>
                  <p>{entry}</p>
                </li>
              ))}
            </ul>
          ) : (
            <></>
          )
        case 'actions':
          return isDiagnosticCommTargetObjectIds(targetObjectIds) ? (
            <div className="relative flex justify-end items-center gap-2">
              <ActionDropdown
                view_href={`/parameter?objectId=${param.ephemeral_id}&elementChildId=${parentObject.perma_id}&elementId=${targetObjectIds.diagCommId}&variantId=${targetObjectIds.variantId}&containerId=${targetObjectIds.containerId}`}
              />
            </div>
          ) : (
            <div className="relative flex justify-end items-center gap-2">
              <ActionDropdown
                view_href={`/parameter?objectId=${param.ephemeral_id}&elementId=${parentObject.perma_id}&variantId=${targetObjectIds.variantId}&containerId=${targetObjectIds.containerId}`}
              />
            </div>
          )
        default:
          return <p>{cellValue?.toString()}</p>
      }
    },
    [filteredItems]
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
            <ParameterTableColumnDropdown
              columnList={columns}
              defaultVisibleColumns={INITIAL_VISIBLE_COLUMNS}
              visibleColumns={visibleColumns}
              visibleColumnsHandler={setVisibleColumns}
            />
            <AddNewButton />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-small">
            {filteredItems.length} of total {parameters.length} parameters
          </span>
          <label className="flex items-center text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
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
      selectedKeys={selectedKeys}
      selectionMode="none"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
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
        emptyContent={'No PARAMs found'}
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

export function ParameterDetailsComponent({
  parameterData,
  targetObjectIds,
}: {
  parameterData: ParameterUnionType
  targetObjectIds: ParameterTargetObjectIds
}) {
  return (
    <Table hideHeader isStriped aria-label="Parameter details table">
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
            <p>{parameterData.short_name}</p>
          </TableCell>
        </TableRow>
        <TableRow key="long_name">
          <TableCell className="font-bold">Long Name</TableCell>
          <TableCell>
            <p>{parameterData.long_name}</p>
          </TableCell>
        </TableRow>
        {parameterData.description ? (
          <TableRow key="description">
            <TableCell className="font-bold">Description</TableCell>
            <TableCell>
              <DescriptionComponent
                description={parameterData.description}
                enableUnfolding={true}
                initialState={'uncollapsed'}
                maxDisplayLengthLimit={200}
              />
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {parameterData.class_name ? (
          <TableRow key="parameter_type">
            <TableCell className="font-bold">Type</TableCell>
            <TableCell>
              <ParameterTypeChip paramType={parameterData.class_name} />
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {parameterData.semantic ? (
          <TableRow key="semantic">
            <TableCell className="font-bold">Semantic</TableCell>
            <TableCell>
              <ParameterSemanticChip semantic={parameterData.semantic} />
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        <TableRow key="byte_position">
          <TableCell className="font-bold">Byte Position</TableCell>
          <TableCell>
            <p>{parameterData.byte_position}</p>
          </TableCell>
        </TableRow>
        <TableRow key="bit_position">
          <TableCell className="font-bold">Bit Position</TableCell>
          <TableCell>
            <p>{parameterData.bit_position}</p>
          </TableCell>
        </TableRow>
        {isValueParameterType(parameterData) &&
        parameterData.physical_default_value ? (
          <TableRow key="physical_default_value">
            <TableCell className="font-bold">Physical Default Value</TableCell>
            <TableCell>
              <p>{parameterData.physical_default_value}</p>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isValueParameterType(parameterData) ||
        isLengthKeyParameterType(parameterData) ||
        isPhysicalConstantParameterType(parameterData) ||
        isSystemParameterType(parameterData) ? (
          <TableRow key="dop_ref">
            <TableCell className="font-bold">DOP Reference</TableCell>
            <TableCell>
              {parameterData.dop_snref ? (
                <p>{parameterData.dop_snref}</p>
              ) : parameterData.dop_ref ? (
                <Link
                  href={`/dops?objectId=${parameterData.dop_ref.resolved_object_perma_id}&variantId=${targetObjectIds.variantId}&containerId=${targetObjectIds.containerId}`}
                >
                  {parameterData.dop_ref.resolved_object_short_name}
                </Link>
              ) : (
                <></>
              )}
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isPhysicalConstantParameterType(parameterData) ? (
          <TableRow key="physical_constant_value">
            <TableCell className="font-bold">Physical Constant Value</TableCell>
            <TableCell>
              <p>{parameterData.physical_constant_value}</p>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isCodedConstParameterType(parameterData) ? (
          <TableRow key="coded_value">
            <TableCell className="font-bold">Coded Value</TableCell>
            <TableCell>
              {parameterData.semantic &&
              ['service-id', 'id'].includes(
                parameterData.semantic.toLowerCase()
              ) ? (
                <p>
                  {parameterData.coded_value} [
                  {getHexRepresentation(parameterData.coded_value)}]
                </p>
              ) : (
                <p>{parameterData.coded_value}</p>
              )}
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {(isCodedConstParameterType(parameterData) ||
          isNrcConstParameterType(parameterData)) &&
        parameterData.diag_coded_type ? (
          <TableRow key="diag_coded_type">
            <TableCell className="font-bold">Diag Coded Type</TableCell>
            <TableCell>
              <DiagCodedTypeComponent
                diagCodedType={parameterData.diag_coded_type}
              />
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isMatchingRequestParameterType(parameterData) ? (
          <TableRow key="byte_length">
            <TableCell className="font-bold">Byte Length</TableCell>
            <TableCell>
              <p>{parameterData.byte_length}</p>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isReservedParameter(parameterData) ? (
          <TableRow key="bit_length">
            <TableCell className="font-bold">Bit Length</TableCell>
            <TableCell>
              <p>{parameterData.bit_length}</p>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isMatchingRequestParameterType(parameterData) ? (
          <TableRow key="request_byte_position">
            <TableCell className="font-bold">Request Byte Position</TableCell>
            <TableCell>
              <p>{parameterData.request_byte_position}</p>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isTableKeyParameterType(parameterData) ? (
          <TableRow key="table_ref">
            <TableCell className="font-bold">Table Reference</TableCell>
            <TableCell>
              {parameterData.table_snref ? (
                <p>{parameterData.table_snref}</p>
              ) : parameterData.table_ref ? (
                <OdxLinkPopoverComponent
                  href={`/tables?objectId=${parameterData.table_ref.resolved_object_perma_id}`}
                  label="Show Table"
                  odxLink={parameterData.table_ref}
                />
              ) : (
                <></>
              )}
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isTableKeyParameterType(parameterData) ||
        isTableEntryParameterType(parameterData) ? (
          <TableRow key="table_row_ref">
            <TableCell className="font-bold">Table Row Reference</TableCell>
            <TableCell>
              {isTableKeyParameterType(parameterData) &&
              parameterData.table_row_snref ? (
                <p>{parameterData.table_row_snref}</p>
              ) : parameterData.table_row_ref ? (
                <OdxLinkPopoverComponent
                  href={`/tables?table-row-id=${parameterData.table_row_ref.resolved_object_perma_id}`}
                  label="Show Table Row"
                  odxLink={parameterData.table_row_ref}
                />
              ) : (
                <></>
              )}
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isTableStructParameterType(parameterData) ? (
          <TableRow key="table_key_ref">
            <TableCell className="font-bold">Table Key Reference</TableCell>
            <TableCell>
              {parameterData.table_key_snref ? (
                <p>{parameterData.table_key_snref}</p>
              ) : parameterData.table_key_ref ? (
                <OdxLinkPopoverComponent
                  href={`/tables?table-key-id=${parameterData.table_key_ref.resolved_object_perma_id}`}
                  label="Show Table Key"
                  odxLink={parameterData.table_key_ref}
                />
              ) : (
                <></>
              )}
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isTableEntryParameterType(parameterData) ? (
          <TableRow key="target">
            <TableCell className="font-bold">Table Entry Target</TableCell>
            <TableCell>
              <p>{parameterData.target}</p>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isSystemParameterType(parameterData) ? (
          <TableRow key="sysparam">
            <TableCell className="font-bold">System Parameter</TableCell>
            <TableCell>
              <p>{parameterData.sysparam}</p>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {isNrcConstParameterType(parameterData) ? (
          <TableRow key="coded_values">
            <TableCell className="font-bold">Coded Values</TableCell>
            <TableCell>
              <ul>
                {parameterData.coded_values?.map((entry, index) => (
                  <li key={index}>
                    <p>{entry}</p>
                  </li>
                ))}
              </ul>
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
      </TableBody>
    </Table>
  )
}
