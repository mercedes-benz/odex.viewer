// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Input } from '@heroui/input'
import { Link } from '@heroui/link'
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
  DopBase,
  EnvironmentData,
  isBasicStructureDop,
  isCodedConstParameterType,
  isDataObjectPropertyDop,
  isDtcDop,
  isEnvironmentDataDescriptionDop,
  isEndOfPduFieldDop,
  isFieldDop,
  isLengthKeyParameterType,
  isMatchingRequestParameterType,
  isNrcConstParameterType,
  isParameterTypeWithDopRef,
  isPhysicalConstantParameterType,
  isMultiplexerDop,
  isReservedParameter,
  isStaticFieldDop,
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
  OdxLinkPopoverComponent,
  ParameterSemanticChip,
  ParameterTypeChip,
} from '@/components/commons'
import {
  ParameterTableColumnDropdown,
  TableFilterDropdown,
} from '@/components/custom-dropdowns'
import { subtitleWithSize } from '@/components/primitives'
import {
  DiagnosticMessageCodecControls,
  DiagnosticMessageKind,
  useMessageValueStore,
} from '@/components/diagnostic-message-codec'
import { SearchIcon } from '@/components/icons'
import { useSelectionWithIndexedDB } from '@/storage/settings'
import {
  DataObjectPropTargetObjectIds,
  DiagnosticCommTargetObjectIds,
  isDiagnosticCommTargetObjectIds,
  ParameterColumnDefinition,
  ParameterTargetObjectIds,
} from '@/types/index'
import {
  getHexRepresentation,
  getParameterValueInputSpec,
  sortItemsBySortDescriptor,
} from '@/utils/utils'
import {
  AtomicParameterValue,
  ParameterValueStore,
  ParameterValueStoreContext,
  DopRefPopover,
  fetchDop,
  ParameterValueCell,
  getParameterValueKey,
} from '@/components/dop-preview'

export function ParametersComponent({
  parentObject,
  targetObjectIds,
  pageId,
  messageKind,
  triggeringRequest,
}: {
  parentObject: Request | Response | Structure | EnvironmentData
  targetObjectIds: DiagnosticCommTargetObjectIds | DataObjectPropTargetObjectIds
  pageId: string
  messageKind?: DiagnosticMessageKind
  triggeringRequest?: Request
}) {
  const parameters = parentObject.parameters as ParameterUnionType[]
  const messageValueStore = useMessageValueStore()
  const messageId =
    messageKind !== undefined &&
    isDiagnosticCommTargetObjectIds(targetObjectIds)
      ? parentObject.perma_id
      : undefined
  const [, refreshMessageValues] = React.useReducer(
    (revision: number) => revision + 1,
    0
  )
  const localValueListeners = React.useRef(new Set<() => void>())

  React.useEffect(() => {
    if (!messageId || !messageValueStore) return

    return messageValueStore.subscribe(messageId, refreshMessageValues)
  }, [messageId, messageValueStore, refreshMessageValues])

  // Introduce all state variables for searching and filtering the parameters
  const [searchValue, setSearchValue] = React.useState('')

  const [selectedSemantics, setSelectedSemantics] = React.useState<Selection>(
    new Set([])
  )
  const selectedSemanticValues = React.useMemo(() => {
    const arr = Array.from(selectedSemantics)

    return arr
  }, [selectedSemantics])

  const [selectedParamTypes, setSelectedParamTypes] = React.useState<Selection>(
    new Set([])
  )
  const selectedParamTypeValues = React.useMemo(() => {
    const arr = Array.from(selectedParamTypes)

    return arr
  }, [selectedParamTypes])

  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: 'byte_position',
    direction: 'ascending',
  })
  const parameterValues = React.useRef<Record<string, AtomicParameterValue>>({})
  const valueStore = React.useMemo<ParameterValueStore>(() => {
    // Ephemeral ids are only stable per server session, so the cache lives with the table
    const dopCache = new Map<number, Promise<DopBase | undefined>>()

    return {
      getValue: (path) =>
        (messageId && messageValueStore?.getValue(messageId, path)) ??
        parameterValues.current[path],
      setValue: (path, value) => {
        parameterValues.current[path] = value
        if (messageId) messageValueStore?.setValue(messageId, path, value)
        else localValueListeners.current.forEach((listener) => listener())
      },
      subscribe: (listener) => {
        if (messageId && messageValueStore) {
          return messageValueStore.subscribe(messageId, listener)
        }
        localValueListeners.current.add(listener)

        return () => localValueListeners.current.delete(listener)
      },
      loadDop: (ephemeralId) => {
        let pendingDop = dopCache.get(ephemeralId)

        if (pendingDop === undefined) {
          pendingDop = fetchDop(ephemeralId).catch(() => undefined)
          dopCache.set(ephemeralId, pendingDop)
        }

        return pendingDop
      },
    }
  }, [messageId, messageValueStore, refreshMessageValues])

  const buildParameterValues = React.useCallback(
    async (message: Request | Response) => {
      if (!messageValueStore || !message.perma_id) {
        throw new Error('Message values are not available.')
      }

      return serializeMessageParameters(
        message.parameters as ParameterUnionType[],
        message.perma_id,
        '',
        messageValueStore,
        valueStore
      )
    },
    [messageValueStore, valueStore]
  )

  const applyDecodedValues = React.useCallback(
    async (
      message: Request | Response,
      decodedValues: Record<string, unknown>
    ) => {
      if (!messageValueStore || !message.perma_id) {
        throw new Error('Message values are not available.')
      }

      const hydratedValues: Record<string, AtomicParameterValue> = {}
      const updatedValueCount = await hydrateMessageParameters(
        (message.parameters ?? []) as ParameterUnionType[],
        decodedValues,
        '',
        hydratedValues,
        valueStore
      )

      parameterValues.current = { ...hydratedValues }
      messageValueStore.setValues(message.perma_id, hydratedValues)

      return updatedValueCount
    },
    [messageValueStore, valueStore]
  )

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
    { label: 'VALUE', key: 'value', sortable: false },
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
    'dop_ref',
    'value',
  ])
  const [visibleColumns, setVisibleColumns] = useSelectionWithIndexedDB(
    pageId,
    'parameters#table-visibleColumns',
    INITIAL_VISIBLE_COLUMNS
  )

  const visibleColumnsValues = React.useMemo(() => {
    const arr = Array.from(visibleColumns)

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

  // Define state variables for row selection
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]))

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
        case 'value':
          return (
            <ParameterValueCell
              ancestorDopIds={[]}
              depth={0}
              parameter={param}
              path={getParameterValueKey(param)}
            />
          )
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
              <DopRefPopover
                dopRef={param.dop_ref}
                href={`/dops?objectId=${param.dop_ref.resolved_object_perma_id}&variantId=${targetObjectIds.variantId}&containerId=${targetObjectIds.containerId}`}
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

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setSearchValue(value)
    } else {
      setSearchValue('')
    }
  }, [])

  const onClear = React.useCallback(() => {
    setSearchValue('')
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
              tableName="parameters"
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
        </div>
      </div>
    )
  }, [searchValue, visibleColumns, onSearchChange, filteredItems])

  return (
    <ParameterValueStoreContext.Provider value={valueStore}>
      <Table
        isHeaderSticky
        isStriped
        aria-label="Diagnostic communications table"
        classNames={{
          wrapper: 'max-h-[min(500px,60vh)] min-w-full overflow-y-auto',
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
          items={filteredItems}
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
      {messageKind !== undefined && messageId !== undefined ? (
        <div className="mt-6 w-full text-left">
          <div className="pb-2 text-start">
            <div className={subtitleWithSize({ size: 'md' })}>
              Encoding/Decoding
            </div>
          </div>
          <DiagnosticMessageCodecControls
            applyDecodedValues={applyDecodedValues}
            buildParameterValues={buildParameterValues}
            message={parentObject as Request | Response}
            messageKind={messageKind}
            targetObjectIds={targetObjectIds as DiagnosticCommTargetObjectIds}
            triggeringRequest={triggeringRequest}
          />
        </div>
      ) : null}
    </ParameterValueStoreContext.Provider>
  )
}

async function serializeMessageParameters(
  parameters: ParameterUnionType[],
  messageId: string,
  parentPath: string,
  messageValueStore: NonNullable<ReturnType<typeof useMessageValueStore>>,
  valueStore: ParameterValueStore
): Promise<Record<string, unknown>> {
  const values: Record<string, unknown> = {}

  for (let index = 0; index < parameters.length; index += 1) {
    const parameter = parameters[index]

    if (
      parameter === undefined ||
      !isValueParameterType(parameter) ||
      !parameter.short_name
    ) {
      continue
    }

    const path = parentPath
      ? `${parentPath}.${parameter.short_name}`
      : getParameterValueKey(parameter)

    const dopId = parameter.dop_ref?.resolved_object_ephemeral_id

    if (dopId === undefined) continue

    const dop = await valueStore.loadDop(dopId)

    if (dop === undefined) {
      throw new Error(`Could not load the DOP for ${parameter.short_name}.`)
    }

    const serializedValue = await serializeDopTree(
      dop,
      messageId,
      path,
      messageValueStore,
      valueStore
    )

    if (serializedValue !== undefined)
      values[parameter.short_name] = serializedValue
  }

  return values
}

async function serializeDopValue(
  dop: DopBase,
  value: AtomicParameterValue | undefined,
  messageId: string,
  path: string,
  messageValueStore: NonNullable<ReturnType<typeof useMessageValueStore>>,
  valueStore: ParameterValueStore
): Promise<unknown> {
  if (isDtcDop(dop)) {
    if (value === undefined || value === '') return undefined

    const code = Number(value)

    if (!Number.isInteger(code))
      throw new Error('Select a valid diagnostic trouble code.')

    return code
  }

  if (isDataObjectPropertyDop(dop)) {
    if (value === undefined || value === '') return undefined

    const inputSpec = getParameterValueInputSpec(dop)

    if (inputSpec?.kind === 'number') {
      const numericValue = Number(value)

      if (!Number.isFinite(numericValue)) {
        throw new Error(
          `${dop.short_name ?? 'Parameter'} must be a valid number.`
        )
      }

      return numericValue
    }

    return value
  }

  if (isBasicStructureDop(dop)) {
    return serializeMessageParameters(
      (dop.parameters ?? []) as ParameterUnionType[],
      messageId,
      path,
      messageValueStore,
      valueStore
    )
  }

  if (isFieldDop(dop)) {
    const itemRef = dop.structure_ref ?? dop.env_data_desc_ref

    const itemDopId = itemRef?.resolved_object_ephemeral_id

    if (itemDopId === undefined) {
      throw new Error(
        `${dop.short_name ?? 'Repeated field'} has no resolved item definition.`
      )
    }

    const itemDop = await valueStore.loadDop(itemDopId)

    if (itemDop === undefined) {
      throw new Error(
        `Could not load an item definition for ${dop.short_name ?? 'repeated field'}.`
      )
    }

    const fixedCount = isStaticFieldDop(dop)
      ? dop.fixed_number_of_items
      : undefined
    const minItems = isEndOfPduFieldDop(dop)
      ? (dop.min_number_of_items ?? 0)
      : 0
    const storedCount = Number(
      messageValueStore.getValue(messageId, `${path}#count`)
    )
    const itemCount =
      fixedCount ??
      (Number.isInteger(storedCount) && storedCount >= minItems
        ? storedCount
        : minItems)

    return Promise.all(
      Array.from({ length: itemCount }, (_, index) =>
        serializeDopTree(
          itemDop,
          messageId,
          `${path}[${index}]`,
          messageValueStore,
          valueStore
        )
      )
    )
  }

  if (isMultiplexerDop(dop)) {
    const selectedKey = messageValueStore.getValue(messageId, `${path}#case`)

    if (typeof selectedKey !== 'string' || selectedKey === '') return undefined

    const selectedCase =
      selectedKey === '#default'
        ? dop.default_case
        : dop.cases?.find((item) => item.short_name === selectedKey)
    const structureId =
      selectedCase?.structure_ref?.resolved_object_ephemeral_id

    if (selectedCase?.short_name === undefined || structureId === undefined) {
      throw new Error(
        `The selected case for ${dop.short_name ?? 'multiplexer'} is incomplete.`
      )
    }

    const structure = await valueStore.loadDop(structureId)

    if (structure === undefined) {
      throw new Error(
        `Could not load the selected case for ${dop.short_name ?? 'multiplexer'}.`
      )
    }

    return [
      selectedCase.short_name,
      await serializeDopTree(
        structure,
        messageId,
        `${path}.${selectedKey}`,
        messageValueStore,
        valueStore
      ),
    ]
  }

  if (isEnvironmentDataDescriptionDop(dop)) {
    const selectedKey = messageValueStore.getValue(messageId, `${path}#envData`)

    if (typeof selectedKey !== 'string' || selectedKey === '') return undefined

    const inlineIndex = selectedKey.startsWith('inline-')
      ? Number(selectedKey.slice('inline-'.length))
      : undefined
    const selectedData =
      inlineIndex === undefined ? undefined : dop.env_datas?.[inlineIndex]
    const selectedReference =
      inlineIndex === undefined
        ? dop.env_data_refs?.[Number(selectedKey.slice('ref-'.length))]
        : undefined

    const selectedName =
      selectedData?.short_name ?? selectedReference?.resolved_object_short_name

    if (!selectedName || (!selectedData && !selectedReference)) {
      throw new Error(
        `The selected environment data for ${dop.short_name ?? 'parameter'} is unavailable.`
      )
    }

    if (selectedData !== undefined) {
      return serializeMessageParameters(
        (selectedData.parameters ?? []) as ParameterUnionType[],
        messageId,
        `${path}.${selectedName}`,
        messageValueStore,
        valueStore
      )
    }

    const selectedDopId = selectedReference?.resolved_object_ephemeral_id

    const selectedDop =
      selectedDopId === undefined
        ? undefined
        : await valueStore.loadDop(selectedDopId)

    return selectedDop === undefined
      ? undefined
      : serializeDopTree(
          selectedDop,
          messageId,
          `${path}.${selectedName}`,
          messageValueStore,
          valueStore
        )
  }

  return undefined
}

async function serializeDopTree(
  dop: DopBase,
  messageId: string,
  path: string,
  messageValueStore: NonNullable<ReturnType<typeof useMessageValueStore>>,
  valueStore: ParameterValueStore
): Promise<unknown> {
  const value = messageValueStore.getValue(messageId, path)

  return serializeDopValue(
    dop,
    value,
    messageId,
    path,
    messageValueStore,
    valueStore
  )
}

async function hydrateMessageParameters(
  parameters: ParameterUnionType[],
  physicalValues: Record<string, unknown>,
  parentPath: string,
  hydratedValues: Record<string, AtomicParameterValue>,
  valueStore: ParameterValueStore
): Promise<number> {
  let updatedValueCount = 0

  for (const parameter of parameters) {
    if (
      !isValueParameterType(parameter) ||
      !parameter.short_name ||
      !Object.prototype.hasOwnProperty.call(
        physicalValues,
        parameter.short_name
      )
    ) {
      continue
    }

    const path = parentPath
      ? `${parentPath}.${parameter.short_name}`
      : getParameterValueKey(parameter)
    const dopId = parameter.dop_ref?.resolved_object_ephemeral_id

    if (dopId === undefined) continue

    const dop = await valueStore.loadDop(dopId)

    if (dop === undefined) continue

    updatedValueCount += await hydrateDopValue(
      dop,
      physicalValues[parameter.short_name],
      path,
      hydratedValues,
      valueStore
    )
  }

  return updatedValueCount
}

async function hydrateDopValue(
  dop: DopBase,
  physicalValue: unknown,
  path: string,
  hydratedValues: Record<string, AtomicParameterValue>,
  valueStore: ParameterValueStore
): Promise<number> {
  if (physicalValue === undefined || physicalValue === null) return 0

  if (isDtcDop(dop)) {
    const troubleCode = Number(physicalValue)

    if (!Number.isInteger(troubleCode)) return 0
    hydratedValues[path] = troubleCode.toString()

    return 1
  }

  if (isDataObjectPropertyDop(dop)) {
    const inputSpec = getParameterValueInputSpec(dop)

    if (inputSpec === undefined) return 0

    if (inputSpec.kind === 'boolean') {
      if (typeof physicalValue === 'boolean') {
        hydratedValues[path] = physicalValue

        return 1
      }
      if (physicalValue === 'true' || physicalValue === 'false') {
        hydratedValues[path] = physicalValue === 'true'

        return 1
      }

      return 0
    }

    if (
      typeof physicalValue === 'string' ||
      typeof physicalValue === 'number'
    ) {
      hydratedValues[path] = physicalValue.toString()

      return 1
    }

    return 0
  }

  if (isBasicStructureDop(dop)) {
    if (!isRecord(physicalValue)) return 0
    if (Object.keys(physicalValue).length > 0) {
      hydratedValues[`${path}#expanded`] = true
    }

    return hydrateMessageParameters(
      (dop.parameters ?? []) as ParameterUnionType[],
      physicalValue,
      path,
      hydratedValues,
      valueStore
    )
  }

  if (isFieldDop(dop)) {
    if (!Array.isArray(physicalValue)) return 0

    const itemRef = dop.structure_ref ?? dop.env_data_desc_ref
    const itemDopId = itemRef?.resolved_object_ephemeral_id

    if (itemDopId === undefined) return 0

    const itemDop = await valueStore.loadDop(itemDopId)

    if (itemDop === undefined) return 0

    hydratedValues[`${path}#count`] = physicalValue.length.toString()
    if (physicalValue.length > 0) hydratedValues[`${path}#expanded`] = true

    let updatedValueCount = 0

    for (let index = 0; index < physicalValue.length; index += 1) {
      updatedValueCount += await hydrateDopValue(
        itemDop,
        physicalValue[index],
        `${path}[${index}]`,
        hydratedValues,
        valueStore
      )
    }

    return updatedValueCount
  }

  if (isMultiplexerDop(dop)) {
    if (
      !Array.isArray(physicalValue) ||
      physicalValue.length !== 2 ||
      typeof physicalValue[0] !== 'string'
    ) {
      return 0
    }

    const caseName = physicalValue[0]
    const useDefaultCase = dop.default_case?.short_name === caseName
    const caseKey = useDefaultCase ? '#default' : caseName
    const selectedCase = useDefaultCase
      ? dop.default_case
      : dop.cases?.find((item) => item.short_name === caseName)
    const structureId =
      selectedCase?.structure_ref?.resolved_object_ephemeral_id

    if (selectedCase === undefined || structureId === undefined) return 0

    const structure = await valueStore.loadDop(structureId)

    if (structure === undefined) return 0

    hydratedValues[`${path}#case`] = caseKey
    hydratedValues[`${path}#expanded`] = true

    return hydrateDopValue(
      structure,
      physicalValue[1],
      `${path}.${caseKey}`,
      hydratedValues,
      valueStore
    )
  }

  return 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function ParameterDetailsComponent({
  parameterData,
  targetObjectIds,
}: {
  parameterData: ParameterUnionType
  targetObjectIds: ParameterTargetObjectIds
}) {
  return (
    <Table
      hideHeader
      isStriped
      aria-label="Parameter details table"
      data-testid="parameter-details-table"
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
