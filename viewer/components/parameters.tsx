// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Button } from '@heroui/button'
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
import clsx from 'clsx'
import React from 'react'

import client, {
  DataObjectPropertyResolved,
  DopBase,
  DtcDop,
  EnvironmentData,
  EnvironmentDataDescription,
  Field,
  isBasicStructureDop,
  isCodedConstParameterType,
  isComplexDop,
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
  isStructureDop,
  isSystemParameterType,
  isTableEntryParameterType,
  isTableKeyParameterType,
  isTableStructParameterType,
  isValueParameterType,
  Multiplexer,
  MultiplexerCase,
  OdxLinkRef,
  OdxSchemaName,
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
import { ChevronDownIcon, SearchIcon } from '@/components/icons'
import { useSelectionWithIndexedDB } from '@/storage/settings'
import {
  DataObjectPropTargetObjectIds,
  DiagnosticCommTargetObjectIds,
  isDiagnosticCommTargetObjectIds,
  ParameterColumnDefinition,
  ParameterTargetObjectIds,
} from '@/types/index'
import {
  describeParameterValueInputSpec,
  getHexRepresentation,
  getParameterValueInputSpec,
  sortItemsBySortDescriptor,
  validateParameterValue,
} from '@/utils/utils'

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
        <div className="mt-4 w-full text-left">
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

type AtomicParameterValue = string | boolean

type ParameterValueStore = {
  getValue: (path: string) => AtomicParameterValue | undefined
  setValue: (path: string, value: AtomicParameterValue) => void
  subscribe: (listener: () => void) => () => void
  loadDop: (ephemeralId: number) => Promise<DopBase | undefined>
}

function useParameterValue(path: string): AtomicParameterValue | undefined {
  const store = useParameterValueStore()

  return React.useSyncExternalStore(
    store.subscribe,
    () => store.getValue(path),
    () => store.getValue(path)
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

type ValueTreePosition = {
  path: string
  ancestorDopIds: number[]
  depth: number
}

const ParameterValueStoreContext = React.createContext<
  ParameterValueStore | undefined
>(undefined)

function useParameterValueStore(): ParameterValueStore {
  const store = React.useContext(ParameterValueStoreContext)

  if (store === undefined) {
    throw new Error('ParameterValueStoreContext provider is missing')
  }

  return store
}

// 'structure' renders the tree read-only, listing all fields, cases and variants
type ValueTreeMode = 'edit' | 'structure'

const ValueTreeModeContext = React.createContext<ValueTreeMode>('edit')

function DopRefPopover({ dopRef, href }: { dopRef: OdxLinkRef; href: string }) {
  const dopEphemeralId = dopRef.resolved_object_ephemeral_id

  if (dopEphemeralId === undefined) {
    return (
      <OdxLinkPopoverComponent href={href} label="Show DOP" odxLink={dopRef} />
    )
  }

  return (
    <DopRefPopoverWithPreview
      dopEphemeralId={dopEphemeralId}
      dopRef={dopRef}
      href={href}
    />
  )
}

function DopRefPopoverWithPreview({
  dopRef,
  href,
  dopEphemeralId,
}: {
  dopRef: OdxLinkRef
  href: string
  dopEphemeralId: number
}) {
  // Shares the table's DOP cache, so the VALUE column usually has it loaded already
  const { dop } = useDop(dopEphemeralId)

  return (
    <OdxLinkPopoverComponent href={href} label="Show DOP" odxLink={dopRef}>
      {dop !== undefined &&
      (isComplexDop(dop) || isDataObjectPropertyDop(dop) || isDtcDop(dop)) ? (
        <DopCompactPreview dopEphemeralId={dopEphemeralId} />
      ) : undefined}
    </OdxLinkPopoverComponent>
  )
}

export function DopStructureSummary({
  dopEphemeralId,
}: {
  dopEphemeralId: number
}) {
  const dopCache = React.useRef(new Map<number, Promise<DopBase | undefined>>())
  const previewStore = React.useMemo<ParameterValueStore>(
    () => ({
      getValue: () => undefined,
      setValue: () => undefined,
      subscribe: () => () => undefined,
      loadDop: (ephemeralId) => {
        let pendingDop = dopCache.current.get(ephemeralId)

        if (pendingDop === undefined) {
          pendingDop = fetchDop(ephemeralId).catch(() => undefined)
          dopCache.current.set(ephemeralId, pendingDop)
        }

        return pendingDop
      },
    }),
    []
  )

  return (
    <section
      aria-label="DOP structure summary"
      className="flex w-full min-w-0 flex-col items-start gap-2 text-left"
    >
      <ParameterValueStoreContext.Provider value={previewStore}>
        <DopCompactPreview dopEphemeralId={dopEphemeralId} title={undefined} />
      </ParameterValueStoreContext.Provider>
    </section>
  )
}

function DopCompactPreview({
  dopEphemeralId,
  title = 'DOP Preview',
}: {
  dopEphemeralId: number
  title?: string
}) {
  const tableStore = useParameterValueStore()
  const { dop, isLoading } = useDop(dopEphemeralId)
  const previewStore = React.useMemo<ParameterValueStore>(() => {
    const previewState: Record<string, AtomicParameterValue> = {
      'preview#expanded': true,
    }
    const listeners = new Set<() => void>()

    return {
      getValue: (path) => previewState[path],
      setValue: (path, value) => {
        previewState[path] = value
        listeners.forEach((listener) => listener())
      },
      subscribe: (listener) => {
        listeners.add(listener)

        return () => listeners.delete(listener)
      },
      loadDop: tableStore.loadDop,
    }
  }, [tableStore])

  if (isLoading) {
    return <span className="text-xs text-default-500">Loading preview...</span>
  }
  if (dop === undefined) return null

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-2 text-left">
      {title ? <h4 className="text-sm font-bold">{title}</h4> : null}
      {isDataObjectPropertyDop(dop) ? (
        <DopLeafSummary dop={dop as DataObjectPropertyResolved} />
      ) : isDtcDop(dop) ? (
        <DtcDopPreview dop={dop} />
      ) : isComplexDop(dop) ? (
        <div className="w-full min-w-0 rounded-medium border border-default-200 bg-default-50 p-3 text-left dark:bg-default-100/5">
          <h5 className="mb-2 text-left text-sm font-semibold">
            Structure hierarchy
          </h5>
          <ParameterValueStoreContext.Provider value={previewStore}>
            <ValueTreeModeContext.Provider value="structure">
              <DopValueEditor
                ancestorDopIds={[]}
                depth={0}
                dopEphemeralId={dopEphemeralId}
                path="preview"
              />
            </ValueTreeModeContext.Provider>
          </ParameterValueStoreContext.Provider>
        </div>
      ) : null}
    </div>
  )
}

function DopLeafSummary({ dop }: { dop: DataObjectPropertyResolved }) {
  const inputSpec = getParameterValueInputSpec(dop)
  const unit = dop.unit?.display_name ?? dop.unit?.short_name
  const dataType = dop.physical_type?.base_data_type

  return (
    <div className="grid min-w-0 grid-cols-[110px_minmax(0,_1fr)] gap-x-2 gap-y-1 text-sm">
      {dop.short_name ? (
        <>
          <p className="font-medium">DOP:</p>
          <p className="min-w-0 break-words">{dop.short_name}</p>
        </>
      ) : null}
      {dataType ? (
        <>
          <p className="font-medium">Physical type:</p>
          <p className="min-w-0 break-words">{dataType}</p>
        </>
      ) : null}
      {dop.compu_method?.category ? (
        <>
          <p className="font-medium">Compu method:</p>
          <p className="min-w-0 break-words">{dop.compu_method.category}</p>
        </>
      ) : null}
      {unit ? (
        <>
          <p className="font-medium">Unit:</p>
          <p className="min-w-0 break-words">{unit}</p>
        </>
      ) : null}
      {inputSpec ? (
        <>
          <p className="font-medium">Value guidance:</p>
          <div className="min-w-0 break-words">
            {inputSpec.kind === 'select' ? (
              <ul className="list-disc pl-4">
                {inputSpec.options.map((option) => (
                  <li key={`${option.value}-${option.internalValue ?? ''}`}>
                    {option.label}
                    {option.internalValue !== undefined
                      ? ` (${option.internalValue})`
                      : ''}
                  </li>
                ))}
              </ul>
            ) : inputSpec.kind === 'number' ? (
              <div className="flex flex-col gap-1">
                <p>
                  Allowed range:{' '}
                  {describeParameterValueInputSpec(inputSpec) ??
                    'not specified'}
                </p>
                <p>
                  {inputSpec.isInteger
                    ? 'Whole number values'
                    : `Step: ${inputSpec.step}`}
                </p>
                {inputSpec.restrictedRanges.map((range, index) => (
                  <p key={`${range.validity}-${range.label ?? index}`}>
                    {describeRestrictedValueRange(range)}
                  </p>
                ))}
              </div>
            ) : inputSpec.kind === 'boolean' ? (
              <p>True or false</p>
            ) : (
              <div className="flex flex-col gap-1">
                <p>
                  {inputSpec.dataType === 'A_BYTEFIELD'
                    ? 'Hex bytes, e.g. 0A FF'
                    : inputSpec.dataType === 'A_ASCIISTRING'
                      ? 'ASCII text'
                      : inputSpec.dataType === 'A_UTF8STRING'
                        ? 'UTF-8 text'
                        : inputSpec.dataType === 'A_UNICODE2STRING'
                          ? 'Unicode text'
                          : 'Text'}
                </p>
                {describeParameterValueInputSpec(inputSpec) ? (
                  <p>Length: {describeParameterValueInputSpec(inputSpec)}</p>
                ) : null}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

function DtcDopPreview({ dop }: { dop: DtcDop }) {
  const dtcs = dop.dtcs ?? []

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-2 text-sm">
      <p className="break-words font-medium">
        {dop.short_name ?? 'DtcDop'}: {dtcs.length} DTCs
      </p>
      {dtcs.length === 0 ? (
        <p>No DTCs defined</p>
      ) : (
        <div className="w-full min-w-0 max-w-full overflow-x-auto">
          <table
            aria-label={`DTCs in ${dop.short_name ?? 'DtcDop'}`}
            className="w-full table-fixed text-left text-sm"
          >
            <thead>
              <tr className="border-b border-default-200">
                <th className="break-words p-2 font-medium">Trouble code</th>
                <th className="break-words p-2 font-medium">Display code</th>
                <th className="break-words p-2 font-medium">Name</th>
                <th className="break-words p-2 font-medium">Text</th>
                <th className="break-words p-2 font-medium">Level</th>
                <th className="break-words p-2 font-medium">Temporary</th>
              </tr>
            </thead>
            <tbody>
              {dtcs.map((dtc, index) => (
                <tr
                  key={dtc.ephemeral_id ?? dtc.perma_id ?? index}
                  className="border-b border-default-200 align-top last:border-b-0"
                >
                  <td className="break-words p-2">
                    {dtc.trouble_code !== undefined
                      ? `${dtc.trouble_code} [${getHexRepresentation(dtc.trouble_code) || '0x0'}]`
                      : 'Not specified'}
                  </td>
                  <td className="break-words p-2">
                    {dtc.display_trouble_code}
                  </td>
                  <td className="break-words p-2">
                    <p className="break-words font-medium">{dtc.short_name}</p>
                    {dtc.long_name ? <p>{dtc.long_name}</p> : null}
                  </td>
                  <td className="break-words p-2">
                    <p>{dtc.text?.text}</p>
                    <DescriptionComponent
                      description={dtc.description}
                      initialState="uncollapsed"
                    />
                  </td>
                  <td className="break-words p-2">{dtc.level}</td>
                  <td className="break-words p-2">
                    {dtc.is_temporary === undefined
                      ? 'Not specified'
                      : dtc.is_temporary
                        ? 'Yes'
                        : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function DtcDopValueInput({ dop, path }: { dop: DtcDop; path: string }) {
  const store = useParameterValueStore()
  const value = useParameterValue(path) ?? ''
  const selectableDtcs = (dop.dtcs ?? []).filter(
    (dtc) => dtc.trouble_code !== undefined
  )

  return (
    <select
      aria-label={`DTC for ${dop.short_name ?? 'parameter'}`}
      className={VALUE_SELECT_CLASS_NAME}
      disabled={selectableDtcs.length === 0}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => {
        store.setValue(path, event.target.value)
      }}
    >
      <option value="">
        {selectableDtcs.length === 0 ? 'No selectable DTCs' : 'Select DTC'}
      </option>
      {selectableDtcs.map((dtc, index) => (
        <option
          key={dtc.ephemeral_id ?? dtc.perma_id ?? index}
          value={dtc.trouble_code?.toString()}
        >
          {[
            dtc.display_trouble_code || dtc.short_name || dtc.long_name,
            dtc.text?.text,
          ]
            .filter((part) => part !== undefined && part !== '')
            .join(' - ')}
        </option>
      ))}
    </select>
  )
}

function describeRestrictedValueRange(range: {
  lower?: { value: number; exclusive: boolean }
  upper?: { value: number; exclusive: boolean }
  validity?: string
  label?: string
}) {
  const lower = range.lower
    ? `${range.lower.exclusive ? '(' : '['}${range.lower.value}`
    : '(-∞'
  const upper = range.upper
    ? `${range.upper.value}${range.upper.exclusive ? ')' : ']'}`
    : '∞)'

  return `Restricted range ${lower}, ${upper}: ${range.validity ?? 'restricted'}${range.label ? ` (${range.label})` : ''}`
}

const MAX_VALUE_TREE_DEPTH = 10

const VALUE_SELECT_CLASS_NAME =
  'min-w-36 rounded-medium border border-primary-400 bg-content1 px-2 py-1.5 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-200'

const COMPLEX_DOP_SCHEMAS: string[] = [
  'Structure',
  'EnvironmentData',
  'StaticField',
  'DynamicLengthField',
  'DynamicEndmarkerField',
  'EndOfPduField',
  'Multiplexer',
  'EnvironmentDataDescription',
]

async function fetchDop(ephemeralId: number): Promise<DopBase | undefined> {
  const metadata = await client.GET('/metadata/{ephemeral-id}', {
    params: {
      path: { 'ephemeral-id': ephemeralId },
      query: { resolve_main_diag_layer: false },
    },
  })
  const className = metadata.data?.class_name

  if (className === undefined) return undefined

  const schemaName: OdxSchemaName | undefined =
    className === 'DataObjectProperty'
      ? 'DataObjectPropertyResolved'
      : className === 'DtcDop'
        ? 'DtcDop'
        : COMPLEX_DOP_SCHEMAS.includes(className)
          ? (className as OdxSchemaName)
          : undefined

  if (schemaName === undefined) {
    return { class_name: className, short_name: metadata.data?.short_name }
  }

  const result = await client.GET(
    '/structured-data/{schema-name}/{ephemeral-id}',
    {
      params: {
        path: { 'schema-name': schemaName, 'ephemeral-id': ephemeralId },
      },
    }
  )

  return result.error ? undefined : (result.data as DopBase | undefined)
}

function useDop(dopEphemeralId: number) {
  const store = useParameterValueStore()
  const [state, setState] = React.useState<{
    dop?: DopBase
    isLoading: boolean
  }>({ isLoading: true })

  React.useEffect(() => {
    let isCurrent = true

    setState({ isLoading: true })
    store.loadDop(dopEphemeralId).then((dop) => {
      if (isCurrent) setState({ dop, isLoading: false })
    })

    return () => {
      isCurrent = false
    }
  }, [dopEphemeralId, store])

  return state
}

function ValueCellNote({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}) {
  return (
    <span className="text-xs text-default-400" title={title}>
      {children}
    </span>
  )
}

function FixedValue({ value }: { value: string | number | undefined }) {
  if (value === undefined || value === '') {
    return <ValueCellNote>Not editable</ValueCellNote>
  }

  return (
    <span className="text-sm" title="Constant value defined by the ODX data">
      {value} <span className="text-xs text-default-400">(fixed)</span>
    </span>
  )
}

function ValueTreeNode({
  label,
  summary,
  stateKey,
  children,
}: {
  label: string
  summary?: string
  stateKey: string
  children: React.ReactNode
}) {
  const store = useParameterValueStore()
  const mode = React.useContext(ValueTreeModeContext)
  const expandedKey = `${stateKey}#expanded`
  const isExpanded = useParameterValue(expandedKey) === true

  const toggleExpanded = () => {
    store.setValue(expandedKey, !isExpanded)
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-1">
      <button
        aria-expanded={isExpanded}
        className={clsx(
          'flex min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-1 text-left text-sm',
          mode === 'structure'
            ? 'w-full rounded-small border border-default-200 bg-content1 px-2 py-1.5 text-foreground'
            : 'self-start rounded-small px-1 text-primary hover:bg-primary-50 dark:hover:bg-primary-950/30'
        )}
        type="button"
        onClick={toggleExpanded}
      >
        <ChevronDownIcon
          className={clsx('transition-transform', !isExpanded && '-rotate-90')}
        />
        <span className="min-w-0 break-words font-medium">{label}</span>
        {summary ? (
          <span className="ml-auto min-w-0 max-w-full break-words text-left text-xs text-default-500">
            {summary}
          </span>
        ) : null}
      </button>
      {isExpanded ? (
        <div
          className={clsx(
            'ml-2 flex min-w-0 max-w-full self-stretch flex-col gap-2 border-l-2 pl-3',
            mode === 'structure'
              ? 'border-primary-200 dark:border-primary-800'
              : 'border-default-200'
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

function ParameterValueCell({
  parameter,
  ...position
}: { parameter: ParameterUnionType } & ValueTreePosition) {
  if (isCodedConstParameterType(parameter)) {
    return <FixedValue value={parameter.coded_value} />
  }
  if (isNrcConstParameterType(parameter)) {
    return <FixedValue value={parameter.coded_values?.join(', ')} />
  }
  if (isPhysicalConstantParameterType(parameter)) {
    return <FixedValue value={parameter.physical_constant_value} />
  }
  if (isReservedParameter(parameter)) {
    return <ValueCellNote>Reserved</ValueCellNote>
  }
  if (isLengthKeyParameterType(parameter)) {
    return (
      <ValueCellNote title="Derived from the length of the referencing parameter">
        Derived
      </ValueCellNote>
    )
  }
  if (isParameterTypeWithDopRef(parameter)) {
    const dopEphemeralId = parameter.dop_ref?.resolved_object_ephemeral_id

    if (dopEphemeralId !== undefined) {
      return (
        <DopValueEditor
          {...position}
          dopEphemeralId={dopEphemeralId}
          parameter={parameter}
        />
      )
    }
    if (parameter.dop_snref) {
      return <ValueCellNote>Unresolved DOP reference</ValueCellNote>
    }
  }

  return <ValueCellNote title="Value not editable">Not editable</ValueCellNote>
}

function DopValueEditor({
  dopEphemeralId,
  parameter,
  label,
  path,
  ancestorDopIds,
  depth,
}: {
  dopEphemeralId: number
  parameter?: ParameterUnionType
  label?: string
} & ValueTreePosition) {
  const { dop, isLoading } = useDop(dopEphemeralId)
  const mode = React.useContext(ValueTreeModeContext)

  if (isLoading) {
    return <span className="text-xs text-default-500">Checking type...</span>
  }

  if (dop === undefined) {
    return <ValueCellNote>Not editable</ValueCellNote>
  }

  if (isDtcDop(dop)) {
    return mode === 'structure' ? (
      <DtcDopPreview dop={dop} />
    ) : (
      <DtcDopValueInput dop={dop} path={path} />
    )
  }

  if (isDataObjectPropertyDop(dop) && mode === 'structure') {
    return <DopLeafSummary dop={dop as DataObjectPropertyResolved} />
  }

  if (isDataObjectPropertyDop(dop)) {
    return (
      <AtomicParameterValueInput
        defaultValue={
          parameter && isValueParameterType(parameter)
            ? parameter.physical_default_value?.toString()
            : undefined
        }
        dop={dop as DataObjectPropertyResolved}
        label={parameter?.short_name ?? label ?? 'parameter'}
        path={path}
      />
    )
  }

  if (
    ancestorDopIds.includes(dopEphemeralId) ||
    depth >= MAX_VALUE_TREE_DEPTH
  ) {
    return (
      <ValueCellNote title="The DOP references itself through its children">
        Recursive DOP reference
      </ValueCellNote>
    )
  }

  const childPosition: ValueTreePosition = {
    path,
    ancestorDopIds: [...ancestorDopIds, dopEphemeralId],
    depth: depth + 1,
  }
  const nodeLabel = label ?? dop.short_name ?? 'DOP'

  if (isBasicStructureDop(dop)) {
    const childParameters = (dop.parameters ?? []) as ParameterUnionType[]

    return (
      <ValueTreeNode
        label={nodeLabel}
        stateKey={path}
        summary={`${isStructureDop(dop) ? 'Structure' : 'Environment data'} · ${childParameters.length} params`}
      >
        <StructureValueTree {...childPosition} parameters={childParameters} />
      </ValueTreeNode>
    )
  }
  if (isFieldDop(dop)) {
    return <FieldValueTree {...childPosition} field={dop} label={nodeLabel} />
  }
  if (isMultiplexerDop(dop)) {
    return (
      <MultiplexerValueTree
        {...childPosition}
        label={nodeLabel}
        multiplexer={dop}
      />
    )
  }
  if (isEnvironmentDataDescriptionDop(dop)) {
    return (
      <EnvironmentDataDescriptionValueTree
        {...childPosition}
        envDataDesc={dop}
        label={nodeLabel}
      />
    )
  }

  return (
    <ValueCellNote title={`DOPs of type ${dop.class_name} are not editable`}>
      Not editable
    </ValueCellNote>
  )
}

function StructureValueTree({
  parameters,
  path,
  ...position
}: { parameters: ParameterUnionType[] } & ValueTreePosition) {
  const mode = React.useContext(ValueTreeModeContext)

  if (parameters.length === 0) {
    return <ValueCellNote>No parameters</ValueCellNote>
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {parameters.map((child, index) => {
        const childName = child.short_name ?? `#${index}`

        return (
          <div
            key={`${childName}-${index}`}
            className={clsx(
              'flex flex-col gap-1',
              mode === 'structure' &&
                'rounded-small border border-default-200 bg-content1 p-2'
            )}
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="min-w-0 break-words font-semibold">
                {childName}
              </span>
              <span className="rounded-small bg-default-100 px-1.5 py-0.5 text-xs text-default-600 dark:bg-default-50/10 dark:text-default-400">
                {child.class_name}
              </span>
              {child.byte_position !== undefined ? (
                <span className="text-xs text-default-500">
                  byte {child.byte_position}
                </span>
              ) : null}
            </div>
            <div
              className={clsx(
                mode === 'structure' &&
                  'ml-1 min-w-0 border-l border-default-200 pl-2'
              )}
            >
              <ParameterValueCell
                {...position}
                parameter={child}
                path={`${path}.${childName}`}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FieldValueTree({
  field,
  label,
  path,
  ...position
}: { field: Field; label: string } & ValueTreePosition) {
  const store = useParameterValueStore()
  const mode = React.useContext(ValueTreeModeContext)
  const countKey = `${path}#count`
  const fixedCount = isStaticFieldDop(field)
    ? field.fixed_number_of_items
    : undefined
  const minItems =
    fixedCount ??
    (isEndOfPduFieldDop(field) ? field.min_number_of_items : undefined) ??
    0
  const maxItems =
    fixedCount ??
    (isEndOfPduFieldDop(field) ? field.max_number_of_items : undefined)
  const storedCount = Number(useParameterValue(countKey))
  const itemCount =
    fixedCount ??
    (Number.isInteger(storedCount) && storedCount >= minItems
      ? storedCount
      : minItems)

  const updateItemCount = (nextCount: number) => {
    store.setValue(countKey, nextCount.toString())
  }

  const itemRef: OdxLinkRef | undefined =
    field.structure_ref ?? field.env_data_desc_ref
  const itemDopId = itemRef?.resolved_object_ephemeral_id
  const itemName =
    itemRef?.resolved_object_short_name ??
    field.structure_snref ??
    field.env_data_desc_snref ??
    'item'

  if (mode === 'structure') {
    const itemRange =
      fixedCount !== undefined
        ? `${fixedCount}`
        : `${minItems}–${maxItems ?? '∞'}`

    return (
      <ValueTreeNode
        label={label}
        stateKey={path}
        summary={`${field.class_name ?? 'Field'} · ${itemRange} × ${itemName}`}
      >
        {itemDopId === undefined ? (
          <ValueCellNote>Unresolved item structure reference</ValueCellNote>
        ) : (
          <DopValueEditor
            {...position}
            dopEphemeralId={itemDopId}
            label={`[item] ${itemName}`}
            path={`${path}[item]`}
          />
        )}
      </ValueTreeNode>
    )
  }

  return (
    <ValueTreeNode
      label={label}
      stateKey={path}
      summary={`${field.class_name ?? 'Field'} · ${itemCount}${maxItems !== undefined && fixedCount === undefined ? `/${maxItems}` : ''} item(s)`}
    >
      {itemDopId === undefined ? (
        <ValueCellNote>Unresolved item structure reference</ValueCellNote>
      ) : (
        Array.from({ length: itemCount }, (_, index) => (
          <DopValueEditor
            key={index}
            {...position}
            dopEphemeralId={itemDopId}
            label={`[${index}] ${itemName}`}
            path={`${path}[${index}]`}
          />
        ))
      )}
      {fixedCount === undefined && itemDopId !== undefined ? (
        <div className="flex gap-2">
          <Button
            isDisabled={maxItems !== undefined && itemCount >= maxItems}
            size="sm"
            variant="flat"
            onPress={() => updateItemCount(itemCount + 1)}
          >
            Add item
          </Button>
          <Button
            isDisabled={itemCount <= minItems}
            size="sm"
            variant="flat"
            onPress={() => updateItemCount(itemCount - 1)}
          >
            Remove last
          </Button>
        </div>
      ) : null}
    </ValueTreeNode>
  )
}

function formatCaseRange(muxCase: MultiplexerCase) {
  const lower = muxCase.lower_limit?.value
  const upper = muxCase.upper_limit?.value

  if (lower === undefined) return ''

  return upper === undefined || upper === lower
    ? ` (${lower})`
    : ` (${lower}–${upper})`
}

function MultiplexerValueTree({
  multiplexer,
  label,
  path,
  ...position
}: { multiplexer: Multiplexer; label: string } & ValueTreePosition) {
  const store = useParameterValueStore()
  const mode = React.useContext(ValueTreeModeContext)
  const caseKey = `${path}#case`
  const storedCase = useParameterValue(caseKey)
  const selectedCaseKey = typeof storedCase === 'string' ? storedCase : ''

  const cases = multiplexer.cases ?? []
  const caseOptions = cases.map((muxCase, index) => ({
    key: muxCase.short_name ?? `case-${index}`,
    label: `${muxCase.short_name ?? `Case ${index}`}${formatCaseRange(muxCase)}`,
    structureRef: muxCase.structure_ref,
  }))

  if (multiplexer.default_case !== undefined) {
    caseOptions.push({
      key: '#default',
      label: `${multiplexer.default_case.short_name ?? 'Default'} (default)`,
      structureRef: multiplexer.default_case.structure_ref,
    })
  }

  const selectedCase = caseOptions.find(
    (option) => option.key === selectedCaseKey
  )
  const selectedStructureId =
    selectedCase?.structureRef?.resolved_object_ephemeral_id

  if (mode === 'structure') {
    return (
      <ValueTreeNode
        label={label}
        stateKey={path}
        summary={`Multiplexer · ${cases.length} cases`}
      >
        {caseOptions.map((option) =>
          option.structureRef?.resolved_object_ephemeral_id === undefined ? (
            <ValueCellNote key={option.key}>
              {option.label}: no resolvable structure
            </ValueCellNote>
          ) : (
            <DopValueEditor
              key={option.key}
              {...position}
              dopEphemeralId={option.structureRef.resolved_object_ephemeral_id}
              label={option.label}
              path={`${path}.${option.key}`}
            />
          )
        )}
      </ValueTreeNode>
    )
  }

  return (
    <ValueTreeNode
      label={label}
      stateKey={path}
      summary={`Multiplexer · ${cases.length} cases`}
    >
      <select
        aria-label={`Case for ${label}`}
        className={VALUE_SELECT_CLASS_NAME}
        value={selectedCaseKey}
        onChange={(event) => {
          store.setValue(caseKey, event.target.value)
        }}
      >
        <option value="">Select case</option>
        {caseOptions.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      {selectedCase === undefined ? null : selectedStructureId === undefined ? (
        <ValueCellNote>Case without resolvable structure</ValueCellNote>
      ) : (
        <DopValueEditor
          key={selectedCase.key}
          {...position}
          dopEphemeralId={selectedStructureId}
          label={selectedCase.label}
          path={`${path}.${selectedCase.key}`}
        />
      )}
    </ValueTreeNode>
  )
}

function formatDtcValues(envData: EnvironmentData) {
  if (envData.all_value) return ' (all DTCs)'
  if (envData.dtc_values && envData.dtc_values.length > 0) {
    return ` (DTC ${envData.dtc_values.map((dtc) => getHexRepresentation(dtc)).join(', ')})`
  }

  return ''
}

function EnvironmentDataDescriptionValueTree({
  envDataDesc,
  label,
  path,
  ...position
}: {
  envDataDesc: EnvironmentDataDescription
  label: string
} & ValueTreePosition) {
  const store = useParameterValueStore()
  const mode = React.useContext(ValueTreeModeContext)
  const envDataKey = `${path}#envData`
  const storedKey = useParameterValue(envDataKey)
  const selectedKey = typeof storedKey === 'string' ? storedKey : ''

  const inlineOptions = (envDataDesc.env_datas ?? []).map((envData, index) => ({
    key: `inline-${index}`,
    name: envData.short_name ?? `env-data-${index}`,
    label: `${envData.short_name ?? `Environment data ${index}`}${formatDtcValues(envData)}`,
    envData,
    refId: undefined as number | undefined,
  }))
  const refOptions = (envDataDesc.env_data_refs ?? []).map((ref, index) => ({
    key: `ref-${index}`,
    name: ref.resolved_object_short_name ?? `env-data-ref-${index}`,
    label: ref.resolved_object_short_name ?? `Environment data ref ${index}`,
    envData: undefined as EnvironmentData | undefined,
    refId: ref.resolved_object_ephemeral_id,
  }))
  const options = [...inlineOptions, ...refOptions]
  const selected = options.find((option) => option.key === selectedKey)

  if (mode === 'structure') {
    return (
      <ValueTreeNode
        label={label}
        stateKey={path}
        summary={`Environment data description · ${options.length} variants`}
      >
        {options.map((option) =>
          option.envData !== undefined ? (
            <ValueTreeNode
              key={option.key}
              label={option.label}
              stateKey={`${path}.${option.name}`}
              summary={`${option.envData.parameters?.length ?? 0} params`}
            >
              <StructureValueTree
                {...position}
                parameters={
                  (option.envData.parameters ?? []) as ParameterUnionType[]
                }
                path={`${path}.${option.name}`}
              />
            </ValueTreeNode>
          ) : option.refId !== undefined ? (
            <DopValueEditor
              key={option.key}
              {...position}
              dopEphemeralId={option.refId}
              label={option.label}
              path={`${path}.${option.name}`}
            />
          ) : (
            <ValueCellNote key={option.key}>
              {option.label}: unresolved reference
            </ValueCellNote>
          )
        )}
      </ValueTreeNode>
    )
  }

  return (
    <ValueTreeNode
      label={label}
      stateKey={path}
      summary={`Environment data description · ${options.length} variants`}
    >
      <select
        aria-label={`Environment data for ${label}`}
        className={VALUE_SELECT_CLASS_NAME}
        value={selectedKey}
        onChange={(event) => {
          store.setValue(envDataKey, event.target.value)
        }}
      >
        <option value="">Select environment data</option>
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      {selected === undefined ? null : selected.envData !== undefined ? (
        <StructureValueTree
          {...position}
          parameters={
            (selected.envData.parameters ?? []) as ParameterUnionType[]
          }
          path={`${path}.${selected.name}`}
        />
      ) : selected.refId !== undefined ? (
        <DopValueEditor
          key={selected.key}
          {...position}
          dopEphemeralId={selected.refId}
          label={selected.label}
          path={`${path}.${selected.name}`}
        />
      ) : (
        <ValueCellNote>Unresolved environment data reference</ValueCellNote>
      )}
    </ValueTreeNode>
  )
}

function getParameterValueKey(parameter: ParameterUnionType): string {
  return (
    parameter.ephemeral_id?.toString() ??
    parameter.perma_id ??
    `${parameter.short_name ?? 'parameter'}-${parameter.byte_position ?? ''}-${parameter.bit_position ?? ''}`
  )
}

function AtomicParameterValueInput({
  dop,
  label,
  defaultValue,
  path,
}: {
  dop: DataObjectPropertyResolved
  label: string
  defaultValue?: string
  path: string
}) {
  const store = useParameterValueStore()
  const localValue = useParameterValue(path) ?? ''

  const updateValue = (nextValue: AtomicParameterValue) => {
    store.setValue(path, nextValue)
  }

  const inputSpec = React.useMemo(() => getParameterValueInputSpec(dop), [dop])

  if (inputSpec === undefined) {
    return (
      <ValueCellNote title="Value not editable">Not editable</ValueCellNote>
    )
  }

  const ariaLabel = `Value for ${label}`
  const unit = dop.unit?.display_name ?? dop.unit?.short_name
  const validationError = validateParameterValue(inputSpec, localValue)
  const hint = describeParameterValueInputSpec(inputSpec)
  const selectClassName = VALUE_SELECT_CLASS_NAME

  if (inputSpec.kind === 'select') {
    return (
      <select
        aria-label={ariaLabel}
        className={selectClassName}
        value={typeof localValue === 'string' ? localValue : ''}
        onChange={(event) => updateValue(event.target.value)}
      >
        <option value="">
          {defaultValue ? `Default: ${defaultValue}` : 'Select value'}
        </option>
        {inputSpec.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.internalValue !== undefined
              ? `${option.label} (${option.internalValue})`
              : option.label}
          </option>
        ))}
      </select>
    )
  }

  if (inputSpec.kind === 'boolean') {
    return (
      <select
        aria-label={ariaLabel}
        className={selectClassName}
        value={typeof localValue === 'boolean' ? localValue.toString() : ''}
        onChange={(event) => updateValue(event.target.value === 'true')}
      >
        <option disabled value="">
          Select value
        </option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    )
  }

  const isNumber = inputSpec.kind === 'number'

  return (
    <Input
      aria-label={ariaLabel}
      className="min-w-44"
      classNames={{
        inputWrapper:
          'border-primary-400 bg-primary-50/50 dark:bg-primary-950/20',
      }}
      description={validationError ? undefined : hint}
      endContent={
        unit ? (
          <span className="text-xs text-default-500 whitespace-nowrap">
            {unit}
          </span>
        ) : undefined
      }
      errorMessage={validationError}
      isInvalid={validationError !== undefined}
      max={isNumber ? inputSpec.max?.value : undefined}
      min={isNumber ? inputSpec.min?.value : undefined}
      placeholder={
        defaultValue
          ? `Default: ${defaultValue}`
          : inputSpec.kind === 'text' && inputSpec.dataType === 'A_BYTEFIELD'
            ? 'Hex bytes, e.g. 0A FF'
            : 'Enter value'
      }
      size="sm"
      step={isNumber ? inputSpec.step : undefined}
      type={isNumber ? 'number' : 'text'}
      value={typeof localValue === 'string' ? localValue : ''}
      onValueChange={updateValue}
    />
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
