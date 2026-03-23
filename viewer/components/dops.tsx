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
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

import {
  DiagnosticDataSetDescriptor,
  DopsOfVariantsOfDataSetsCollection,
  DopUnionTypeWithLayerInfo,
  DiagnosticVariant,
  useQuery,
  isDataObjectPropertyDop,
  isDtcDop,
  isMultiplexerDop,
  isStructureDop,
  isStaticFieldDop,
  isDynamicEndmarkerFieldDop,
  isDynamicLengthFieldDop,
  isEndOfPduFieldDop,
  isEnvironmentDataDescriptionDop,
  isEnvironmentDataDop,
  DopUnionType,
  CompuMethod,
  InternalConstr,
  DiagCodedType,
} from '@/api/api-hooks'
import ApiError from '@/components/api-error'
import {
  ActionDropdown,
  AddNewButton,
  DescriptionComponent,
  DopTypeChip,
  NextPageButton,
  PreviousPageButton,
  DiagCodedTypePopoverComponent,
  OdxLinkPopoverComponent,
  PhysicalTypePopoverComponent,
  CompuMethodPopoverComponent,
  InternalConstraintPopoverComponent,
  SwitchKeyCompactComponent,
  CaseCompactComponent,
  DynamicEndDopCompactComponent,
  DetermineNumberOfItemsCompactComponent,
  CompuMethodCategoryChip,
} from '@/components/commons'
import {
  DopTableColumnDropdown,
  TableFilterDropdownWithExtractorFunc,
  TableFilterObjectCollectionWithExtractorFuncDropdown,
} from '@/components/custom-dropdowns'
import { SearchIcon } from '@/components/icons'
import { DopColumnDefinition } from '@/types'
import {
  sortItemsBySortDescriptor,
  generateLatexFuncFromCompuMethod,
  getCompuMethodDataForRendering,
  getInternalConstraintDataForRendering,
  CompuMethodRenderingData,
} from '@/utils/utils'
import { DataObjectPropTargetObjectIds } from '@/types/index'
import { KaTeXComponent } from '@/components/katex'
import { useSelectionWithIndexedDB } from '@/storage/settings'

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
)

export function DopMetadataComponent({
  dopData,
  targetObjectIds,
}: {
  dopData: DopUnionTypeWithLayerInfo
  targetObjectIds: DataObjectPropTargetObjectIds
}) {
  return (
    <Table
      hideHeader
      isStriped
      aria-label="Data Object Property metadata table"
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
            <p>{dopData.dop?.short_name}</p>
          </TableCell>
        </TableRow>
        <TableRow key="long_name">
          <TableCell className="font-bold">Long Name</TableCell>
          <TableCell>
            <p>{dopData.dop?.long_name}</p>
          </TableCell>
        </TableRow>
        {dopData.dop?.description ? (
          <TableRow key="description">
            <TableCell className="font-bold">Description</TableCell>
            <TableCell>
              <DescriptionComponent
                description={dopData.dop?.description}
                enableUnfolding={true}
                initialState={'uncollapsed'}
                maxDisplayLengthLimit={200}
              />
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        <TableRow key="class_name">
          <TableCell className="font-bold">Type</TableCell>
          <TableCell>
            <DopTypeChip dop={dopData.dop} />
          </TableCell>
        </TableRow>
        {dopData.origin_layer_perma_id ? (
          <TableRow key="origin_layer">
            <TableCell className="font-bold">Origin Layer Name</TableCell>
            <TableCell>
              <div>
                <Link
                  href={`/diagnostic-variant?objectId=${dopData.origin_layer_perma_id}&containerId=${targetObjectIds.containerId}`}
                >
                  {dopData.origin_layer_short_name}
                </Link>
                <p className="text-small">({dopData.origin_layer_type})</p>
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

export function DopsVariantComponent({
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
    'class_name',
    'compu_method',
    'actions',
  ])

  const [visibleColumns, setVisibleColumns] = useSelectionWithIndexedDB(
    pageId,
    'variantDops#table-visibleColumns',
    INITIAL_VISIBLE_COLUMNS
  )

  const visibleColumnsValues = React.useMemo(() => {
    let arr = Array.from(visibleColumns)

    return arr
  }, [visibleColumns])

  // Query data from API and provide as async list for local processing
  const {
    data: data_collection,
    error,
    isLoading,
  } = useQuery(
    '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dops',
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

  const dopCollection = useAsyncList({
    async load() {
      return {
        items: data_collection
          ? data_collection.items.sort((a, b) => {
              return a.dop !== undefined && b.dop !== undefined
                ? sortItemsBySortDescriptor<DopUnionType>(a.dop, b.dop, {
                    column: 'short_name',
                    direction: 'ascending',
                  })
                : 0
            })
          : [],
      }
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          if (sortDescriptor.column === 'origin_layer_short_name') {
            return sortItemsBySortDescriptor<DopUnionTypeWithLayerInfo>(
              a,
              b,
              sortDescriptor
            )
          } else {
            return a.dop !== undefined && b.dop !== undefined
              ? sortItemsBySortDescriptor<DopUnionType>(
                  a.dop,
                  b.dop,
                  sortDescriptor
                )
              : 0
          }
        }),
      }
    },
  })

  // Reload the async list items, when the queried DOPs change
  React.useEffect(() => {
    if (data_collection) {
      dopCollection.reload()
    }
  }, [data_collection])

  // Introduce all state variables for searching and filtering the diagnostic trouble codes
  const [searchValue, setSearchValue] = React.useState('')

  const [selectedTypes, setSelectedTypes] = React.useState<Selection>(
    new Set([])
  )
  const selectedTypeValues = React.useMemo(() => {
    let arr = Array.from(selectedTypes)

    return arr
  }, [selectedTypes])

  const [selectedOriginLayers, setSelectedOriginLayers] =
    React.useState<Selection>(new Set([]))
  const selectedOriginLayerValues = React.useMemo(() => {
    let arr = Array.from(selectedOriginLayers)

    return arr
  }, [selectedOriginLayers])

  const [selectedPhysicalTypes, setSelectedPhysicalTypes] =
    React.useState<Selection>(new Set([]))
  const selectedPhyscialTypeValues = React.useMemo(() => {
    let arr = Array.from(selectedPhysicalTypes)

    return arr
  }, [selectedPhysicalTypes])

  const [selectedCompuMethods, setSelectedCompuMethods] =
    React.useState<Selection>(new Set([]))
  const selectedCompuMethodsValues = React.useMemo(() => {
    let arr = Array.from(selectedCompuMethods)

    return arr
  }, [selectedCompuMethods])

  const [selectedDiagCodedTypes, setSelectedDiagCodedTypes] =
    React.useState<Selection>(new Set([]))
  const selectedDiagCodedTypeValues = React.useMemo(() => {
    let arr = Array.from(selectedDiagCodedTypes)

    return arr
  }, [selectedDiagCodedTypes])

  // Jump back to page 1, if one of the column filters is changed
  React.useEffect(() => {
    setPage(1)
  }, [
    selectedCompuMethods,
    selectedDiagCodedTypes,
    selectedOriginLayers,
    selectedPhysicalTypes,
    selectedTypes,
  ])

  // Define the table columns, the list of initially visible columns and a related state variable
  const columns: DopColumnDefinition[] = [
    { label: 'PERMA_ID', key: 'perma_id', sortable: true },
    { label: 'EPHEMERAL_ID', key: 'ephemeral_id', sortable: true },
    { label: 'SHORT_NAME', key: 'short_name', sortable: true },
    { label: 'LONG_NAME', key: 'long_name', sortable: true },
    { label: 'DESCRIPTION', key: 'description', sortable: false },
    {
      label: 'TYPE',
      key: 'class_name',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DopUnionTypeWithLayerInfo>
          filterItems={dopCollection}
          filterLabel="TYPE"
          filterValueExtractorFunc={(obj) =>
            obj.dop?.class_name ? obj.dop.class_name : undefined
          }
          selectedFilters={selectedTypes}
          selectedFiltersHandler={setSelectedTypes}
        />
      ),
    },
    {
      label: 'ORIGIN_LAYER',
      key: 'origin_layer_short_name',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DopUnionTypeWithLayerInfo>
          filterItems={dopCollection}
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
    {
      label: 'PHYSICAL TYPE',
      key: 'physical_type',
      relatedDopTypes: ['DataObjectProperty', 'DtcDop'],
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DopUnionTypeWithLayerInfo>
          filterItems={dopCollection}
          filterLabel="PHYSICAL TYPE"
          filterValueExtractorFunc={(obj) =>
            obj.dop && (isDataObjectPropertyDop(obj.dop) || isDtcDop(obj.dop))
              ? obj.dop.physical_type?.base_data_type
              : undefined
          }
          selectedFilters={selectedPhysicalTypes}
          selectedFiltersHandler={setSelectedPhysicalTypes}
        />
      ),
    },
    {
      label: 'COMPU METHOD',
      key: 'compu_method',
      relatedDopTypes: ['DataObjectProperty', 'DtcDop'],
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DopUnionTypeWithLayerInfo>
          filterItems={dopCollection}
          filterLabel="COMPU METHOD"
          filterValueExtractorFunc={(obj) =>
            obj.dop && (isDataObjectPropertyDop(obj.dop) || isDtcDop(obj.dop))
              ? obj.dop.compu_method?.category
              : undefined
          }
          selectedFilters={selectedCompuMethods}
          selectedFiltersHandler={setSelectedCompuMethods}
        />
      ),
    },
    {
      label: 'DIAG CODED TYPE',
      key: 'diag_coded_type',
      relatedDopTypes: ['DataObjectProperty', 'DtcDop'],
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DopUnionTypeWithLayerInfo>
          filterItems={dopCollection}
          filterLabel="DIAG CODED TYPE"
          filterValueExtractorFunc={(obj) =>
            obj.dop && (isDataObjectPropertyDop(obj.dop) || isDtcDop(obj.dop))
              ? obj.dop.diag_coded_type?.base_data_type
              : undefined
          }
          selectedFilters={selectedDiagCodedTypes}
          selectedFiltersHandler={setSelectedDiagCodedTypes}
        />
      ),
    },
    {
      label: 'INTERNAL CONSTRAINT',
      key: 'internal_constr',
      relatedDopTypes: ['DataObjectProperty'],
      sortable: false,
    },
    {
      label: 'UNIT',
      key: 'unit_ref',
      relatedDopTypes: ['DataObjectProperty'],
      sortable: false,
    },
    {
      label: 'PHYSICAL CONSTRAINT',
      key: 'physical_constr',
      relatedDopTypes: ['DataObjectProperty'],
      sortable: false,
    },
    {
      label: 'IS VISIBLE',
      key: 'is_visible',
      relatedDopTypes: [
        'DtcDop',
        'Multiplexer',
        'Structure',
        'StaticField',
        'DynamicEndmarkerField',
        'DynamicLengthField',
        'EndOfPduField',
      ],
      sortable: true,
    },
    {
      label: 'PARAMETER REFERENCE',
      key: 'param_snref',
      keyAliases: ['param_snpathref'],
      relatedDopTypes: ['EnvironmentDataDescription'],
      sortable: true,
    },
    {
      label: 'BYTE POSITION',
      key: 'byte_position',
      relatedDopTypes: ['Multiplexer'],
      sortable: true,
    },
    {
      label: 'SWITCH KEY',
      key: 'switch_key',
      relatedDopTypes: ['Multiplexer'],
      sortable: false,
    },
    {
      label: 'DEFAULT CASE',
      key: 'default_case',
      relatedDopTypes: ['Multiplexer'],
      sortable: false,
    },
    {
      label: 'BYTE SIZE',
      key: 'byte_size',
      relatedDopTypes: ['EnvironmentData', 'Structure'],
      sortable: true,
    },
    {
      label: 'ALL VALUE',
      key: 'all_value',
      relatedDopTypes: ['EnvironmentData'],
      sortable: true,
    },
    {
      label: 'DTC VALUES',
      key: 'dtc_values',
      relatedDopTypes: ['EnvironmentData'],
      sortable: false,
    },
    {
      label: 'STRUCTURE',
      key: 'structure_ref',
      keyAliases: ['structure_snref'],
      relatedDopTypes: [
        'StaticField',
        'DynamicEndmarkerField',
        'DynamicLengthField',
        'EndOfPduField',
      ],
      sortable: false,
    },
    {
      label: 'ENV DATA DESCRIPTION',
      key: 'env_data_desc_ref',
      keyAliases: ['env_data_desc_snref'],
      relatedDopTypes: [
        'StaticField',
        'DynamicEndmarkerField',
        'DynamicLengthField',
        'EndOfPduField',
      ],
      sortable: false,
    },
    {
      label: 'FIXED NUMBER OF ITEMS',
      key: 'fixed_number_of_items',
      relatedDopTypes: ['StaticField'],
      sortable: true,
    },
    {
      label: 'ITEM BYTE SIZE',
      key: 'item_byte_size',
      relatedDopTypes: ['StaticField'],
      sortable: true,
    },
    {
      label: 'DYNAMIC END DOP',
      key: 'dyn_end_dop_ref',
      relatedDopTypes: ['DynamicEndmarkerField'],
      sortable: false,
    },
    {
      label: 'OFFSET',
      key: 'offset',
      relatedDopTypes: ['DynamicLengthField'],
      sortable: true,
    },
    {
      label: 'DETERMINE NUMBER OF ITEMS',
      key: 'determine_number_of_items',
      relatedDopTypes: ['DynamicLengthField'],
      sortable: false,
    },
    {
      label: 'MIN NUMBER OF ITEMS',
      key: 'min_number_of_items',
      relatedDopTypes: ['EndOfPduField'],
      sortable: true,
    },
    {
      label: 'MAX NUMBER OF ITEMS',
      key: 'max_number_of_items',
      relatedDopTypes: ['EndOfPduField'],
      sortable: true,
    },
    { label: 'ACTIONS', key: 'actions' },
  ]

  // Define a memo for table data filtering
  const filteredItems = React.useMemo(() => {
    let filteredCollectionItems = [...dopCollection.items]

    // Filter all dops based on visibleColumns list
    if (searchValue && searchValue.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithLayerInfo) => {
          let result = false

          if (
            !result &&
            visibleColumnsValues.includes('perma_id') &&
            dopWithLayerInfo.dop?.perma_id !== undefined
          ) {
            result = dopWithLayerInfo.dop?.perma_id
              .toString()
              .includes(searchValue.toLowerCase())
          }

          if (
            !result &&
            visibleColumnsValues.includes('short_name') &&
            dopWithLayerInfo.dop?.short_name !== undefined
          ) {
            result = dopWithLayerInfo.dop?.short_name
              .toLowerCase()
              .includes(searchValue.toLowerCase())
          }

          if (!result && visibleColumnsValues.includes('long_name')) {
            result = dopWithLayerInfo.dop?.long_name
              ? dopWithLayerInfo.dop?.long_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (
            !result &&
            visibleColumnsValues.includes('description') &&
            dopWithLayerInfo.dop?.description !== undefined
          ) {
            result = dopWithLayerInfo.dop?.description.text
              ? dopWithLayerInfo.dop?.description.text
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (!result && visibleColumnsValues.includes('class_name')) {
            result = dopWithLayerInfo.dop?.class_name
              ? dopWithLayerInfo.dop?.class_name
                  .toString()
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (
            !result &&
            visibleColumnsValues.includes('origin_layer_short_name')
          ) {
            result = dopWithLayerInfo.origin_layer_short_name
              ? dopWithLayerInfo.origin_layer_short_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (!result && visibleColumnsValues.includes('physical_type')) {
            if (
              dopWithLayerInfo.dop &&
              (isDataObjectPropertyDop(dopWithLayerInfo.dop) ||
                isDtcDop(dopWithLayerInfo.dop)) &&
              dopWithLayerInfo.dop.physical_type
            ) {
              const ires =
                dopWithLayerInfo.dop.physical_type.base_data_type
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.physical_type.display_radix
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('compu_method')) {
            if (
              dopWithLayerInfo.dop &&
              (isDataObjectPropertyDop(dopWithLayerInfo.dop) ||
                isDtcDop(dopWithLayerInfo.dop)) &&
              dopWithLayerInfo.dop.compu_method
            ) {
              const ires =
                dopWithLayerInfo.dop.compu_method.category
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.compu_method.internal_type
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.compu_method.physical_type
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('diag_coded_type')) {
            if (
              dopWithLayerInfo.dop &&
              (isDataObjectPropertyDop(dopWithLayerInfo.dop) ||
                isDtcDop(dopWithLayerInfo.dop)) &&
              dopWithLayerInfo.dop.diag_coded_type
            ) {
              const ires =
                dopWithLayerInfo.dop.diag_coded_type.base_data_type
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.diag_coded_type.base_type_encoding
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('internal_constr')) {
            if (
              dopWithLayerInfo.dop &&
              isDataObjectPropertyDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.internal_constr
            ) {
              const ires = dopWithLayerInfo.dop.internal_constr.value_type
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('physical_constr')) {
            if (
              dopWithLayerInfo.dop &&
              isDataObjectPropertyDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.physical_constr
            ) {
              const ires = dopWithLayerInfo.dop.physical_constr.value_type
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('is_visible')) {
            if (
              dopWithLayerInfo.dop &&
              (isDtcDop(dopWithLayerInfo.dop) ||
                isMultiplexerDop(dopWithLayerInfo.dop) ||
                isStructureDop(dopWithLayerInfo.dop) ||
                isStaticFieldDop(dopWithLayerInfo.dop) ||
                isDynamicEndmarkerFieldDop(dopWithLayerInfo.dop) ||
                isDynamicLengthFieldDop(dopWithLayerInfo.dop) ||
                isEndOfPduFieldDop(dopWithLayerInfo.dop)) &&
              dopWithLayerInfo.dop.is_visible
            ) {
              const ires = dopWithLayerInfo.dop.is_visible
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (
            (!result && visibleColumnsValues.includes('param_snref')) ||
            visibleColumnsValues.includes('param_snpathref')
          ) {
            if (
              dopWithLayerInfo.dop &&
              isEnvironmentDataDescriptionDop(dopWithLayerInfo.dop) &&
              (dopWithLayerInfo.dop.param_snref ||
                dopWithLayerInfo.dop.param_snpathref)
            ) {
              const ires =
                dopWithLayerInfo.dop.param_snref
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.param_snpathref
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('byte_position')) {
            if (
              dopWithLayerInfo.dop &&
              isMultiplexerDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.byte_position
            ) {
              const ires = dopWithLayerInfo.dop.byte_position
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('switch_key')) {
            if (
              dopWithLayerInfo.dop &&
              isMultiplexerDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.switch_key
            ) {
              const ires =
                dopWithLayerInfo.dop.switch_key.dop_ref?.resolved_object_short_name
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.switch_key.byte_position
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.switch_key.bit_position
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('default_case')) {
            if (
              dopWithLayerInfo.dop &&
              isMultiplexerDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.default_case
            ) {
              const ires =
                dopWithLayerInfo.dop.default_case.short_name
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.default_case.description?.text
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.default_case.structure_ref?.resolved_object_short_name
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.default_case.structure_snref
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('byte_size')) {
            if (
              dopWithLayerInfo.dop &&
              (isEnvironmentDataDop(dopWithLayerInfo.dop) ||
                isStructureDop(dopWithLayerInfo.dop)) &&
              dopWithLayerInfo.dop.byte_size
            ) {
              const ires =
                dopWithLayerInfo.dop.byte_size
                  .toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.byte_size
                  .toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('all_value')) {
            if (
              dopWithLayerInfo.dop &&
              isEnvironmentDataDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.all_value !== undefined
            ) {
              const ires = dopWithLayerInfo.dop.all_value
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('dtc_values')) {
            if (
              dopWithLayerInfo.dop &&
              isEnvironmentDataDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.dtc_values
            ) {
              const ires = dopWithLayerInfo.dop.dtc_values
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (
            (!result && visibleColumnsValues.includes('structure_ref')) ||
            visibleColumnsValues.includes('structure_snref')
          ) {
            if (
              dopWithLayerInfo.dop &&
              (isStaticFieldDop(dopWithLayerInfo.dop) ||
                isDynamicEndmarkerFieldDop(dopWithLayerInfo.dop) ||
                isDynamicLengthFieldDop(dopWithLayerInfo.dop) ||
                isEndOfPduFieldDop(dopWithLayerInfo.dop)) &&
              (dopWithLayerInfo.dop.structure_ref ||
                dopWithLayerInfo.dop.structure_snref)
            ) {
              const ires =
                dopWithLayerInfo.dop.structure_ref?.resolved_object_short_name
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.structure_snref
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (
            (!result && visibleColumnsValues.includes('env_data_desc_ref')) ||
            visibleColumnsValues.includes('env_data_desc_snref')
          ) {
            if (
              dopWithLayerInfo.dop &&
              (isStaticFieldDop(dopWithLayerInfo.dop) ||
                isDynamicEndmarkerFieldDop(dopWithLayerInfo.dop) ||
                isDynamicLengthFieldDop(dopWithLayerInfo.dop) ||
                isEndOfPduFieldDop(dopWithLayerInfo.dop)) &&
              (dopWithLayerInfo.dop.env_data_desc_ref ||
                dopWithLayerInfo.dop.env_data_desc_snref)
            ) {
              const ires =
                dopWithLayerInfo.dop.env_data_desc_ref?.resolved_object_short_name
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.env_data_desc_snref
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (
            !result &&
            visibleColumnsValues.includes('fixed_number_of_items')
          ) {
            if (
              dopWithLayerInfo.dop &&
              isStaticFieldDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.fixed_number_of_items
            ) {
              const ires = dopWithLayerInfo.dop.fixed_number_of_items
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('item_byte_size')) {
            if (
              dopWithLayerInfo.dop &&
              isStaticFieldDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.item_byte_size
            ) {
              const ires = dopWithLayerInfo.dop.item_byte_size
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('dyn_end_dop_ref')) {
            if (
              dopWithLayerInfo.dop &&
              isDynamicEndmarkerFieldDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.dyn_end_dop_ref
            ) {
              const ires =
                dopWithLayerInfo.dop.dyn_end_dop_ref.resolved_object_short_name
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('offset')) {
            if (
              dopWithLayerInfo.dop &&
              isDynamicLengthFieldDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.offset
            ) {
              const ires = dopWithLayerInfo.dop.offset
                .toString()
                ?.toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (
            !result &&
            visibleColumnsValues.includes('determine_number_of_items')
          ) {
            if (
              dopWithLayerInfo.dop &&
              isDynamicLengthFieldDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.determine_number_of_items
            ) {
              const ires =
                dopWithLayerInfo.dop.determine_number_of_items.dop_ref?.resolved_object_short_name
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.determine_number_of_items.byte_position
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithLayerInfo.dop.determine_number_of_items.bit_position
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('min_number_of_items')) {
            if (
              dopWithLayerInfo.dop &&
              isEndOfPduFieldDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.min_number_of_items
            ) {
              const ires = dopWithLayerInfo.dop.min_number_of_items
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('max_number_of_items')) {
            if (
              dopWithLayerInfo.dop &&
              isEndOfPduFieldDop(dopWithLayerInfo.dop) &&
              dopWithLayerInfo.dop.max_number_of_items
            ) {
              const ires = dopWithLayerInfo.dop.max_number_of_items
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          return result
        }
      )
    }
    if (selectedTypeValues && selectedTypeValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithLayerInfo) =>
          dopWithLayerInfo.dop && dopWithLayerInfo.dop.class_name
            ? selectedTypeValues.includes(dopWithLayerInfo.dop.class_name)
            : false
      )
    }
    if (selectedOriginLayerValues && selectedOriginLayerValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithLayerInfo) =>
          dopWithLayerInfo.origin_layer_short_name
            ? selectedOriginLayerValues.includes(
                dopWithLayerInfo.origin_layer_short_name
              )
            : false
      )
    }
    if (selectedPhyscialTypeValues && selectedPhyscialTypeValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithLayerInfo) =>
          dopWithLayerInfo.dop &&
          (isDataObjectPropertyDop(dopWithLayerInfo.dop) ||
            isDtcDop(dopWithLayerInfo.dop)) &&
          dopWithLayerInfo.dop.physical_type?.base_data_type
            ? selectedPhyscialTypeValues.includes(
                dopWithLayerInfo.dop.physical_type.base_data_type
              )
            : false
      )
    }
    if (selectedCompuMethodsValues && selectedCompuMethodsValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithLayerInfo) =>
          dopWithLayerInfo.dop &&
          (isDataObjectPropertyDop(dopWithLayerInfo.dop) ||
            isDtcDop(dopWithLayerInfo.dop)) &&
          dopWithLayerInfo.dop.compu_method?.category
            ? selectedCompuMethodsValues.includes(
                dopWithLayerInfo.dop.compu_method.category
              )
            : false
      )
    }
    if (selectedDiagCodedTypeValues && selectedDiagCodedTypeValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithLayerInfo) =>
          dopWithLayerInfo.dop &&
          (isDataObjectPropertyDop(dopWithLayerInfo.dop) ||
            isDtcDop(dopWithLayerInfo.dop)) &&
          dopWithLayerInfo.dop.diag_coded_type?.base_data_type
            ? selectedDiagCodedTypeValues.includes(
                dopWithLayerInfo.dop.diag_coded_type.base_data_type
              )
            : false
      )
    }

    return filteredCollectionItems
  }, [
    dopCollection,
    searchValue,
    selectedTypeValues,
    selectedOriginLayerValues,
    selectedCompuMethodsValues,
    selectedDiagCodedTypeValues,
    selectedPhyscialTypeValues,
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
    (dopWithLayerInfo: DopUnionTypeWithLayerInfo, columnKey: React.Key) => {
      const cellValue =
        dopWithLayerInfo[columnKey as keyof DopUnionTypeWithLayerInfo]

      switch (columnKey) {
        case 'perma_id':
          return <p>{dopWithLayerInfo.dop?.perma_id}</p>
        case 'ephemeral_id':
          return <p>{dopWithLayerInfo.dop?.ephemeral_id}</p>
        case 'short_name':
          return (
            <Link
              href={`/dops?objectId=${dopWithLayerInfo.dop?.perma_id}&variantId=${dopWithLayerInfo.origin_layer_perma_id}&containerId=${containerId}`}
            >
              {dopWithLayerInfo.dop?.short_name}
            </Link>
          )
        case 'long_name':
          return <p>{dopWithLayerInfo.dop?.long_name}</p>
        case 'description':
          return (
            <DescriptionComponent
              description={dopWithLayerInfo.dop?.description}
              enableUnfolding={true}
              maxDisplayLengthLimit={200}
            />
          )
        case 'class_name':
          return <DopTypeChip dop={dopWithLayerInfo.dop} />
        case 'origin_layer_short_name':
          return (
            <div>
              <Link
                href={`/diagnostic-variant?objectId=${dopWithLayerInfo.origin_layer_perma_id}&containerId=${containerId}`}
              >
                {dopWithLayerInfo.origin_layer_short_name}
              </Link>
              <p className="text-small">
                ({dopWithLayerInfo.origin_layer_type})
              </p>
            </div>
          )
        case 'physical_type':
          return dopWithLayerInfo.dop &&
            (isDataObjectPropertyDop(dopWithLayerInfo.dop) ||
              isDtcDop(dopWithLayerInfo.dop)) &&
            dopWithLayerInfo.dop.physical_type ? (
            <PhysicalTypePopoverComponent
              physicalType={dopWithLayerInfo.dop.physical_type}
            />
          ) : (
            <></>
          )
        case 'compu_method':
          return dopWithLayerInfo.dop &&
            (isDataObjectPropertyDop(dopWithLayerInfo.dop) ||
              isDtcDop(dopWithLayerInfo.dop)) &&
            dopWithLayerInfo.dop.compu_method ? (
            <CompuMethodPopoverComponent
              compuMethod={dopWithLayerInfo.dop.compu_method}
              dop_href={`/dops?objectId=${dopWithLayerInfo.dop?.perma_id}&variantId=${dopWithLayerInfo.origin_layer_perma_id}&containerId=${containerId}`}
            />
          ) : (
            <></>
          )
        case 'diag_coded_type':
          return dopWithLayerInfo.dop &&
            (isDataObjectPropertyDop(dopWithLayerInfo.dop) ||
              isDtcDop(dopWithLayerInfo.dop)) &&
            dopWithLayerInfo.dop.diag_coded_type ? (
            <DiagCodedTypePopoverComponent
              diagCodedType={dopWithLayerInfo.dop.diag_coded_type}
            />
          ) : (
            <></>
          )
        case 'internal_constr':
          return dopWithLayerInfo.dop &&
            isDataObjectPropertyDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.internal_constr ? (
            <InternalConstraintPopoverComponent
              constraint={dopWithLayerInfo.dop.internal_constr}
              dop_href={`/dops?objectId=${dopWithLayerInfo.dop?.perma_id}&variantId=${dopWithLayerInfo.origin_layer_perma_id}&containerId=${containerId}`}
            />
          ) : (
            <></>
          )
        case 'unit_ref':
          return dopWithLayerInfo.dop &&
            isDataObjectPropertyDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.unit_ref ? (
            <OdxLinkPopoverComponent
              href={`/units?objectId=${dopWithLayerInfo.dop.unit_ref.resolved_object_perma_id}&variantId=${dopWithLayerInfo.origin_layer_perma_id}&containerId=${containerId}`}
              label="Show Unit"
              odxLink={dopWithLayerInfo.dop.unit_ref}
            />
          ) : (
            <></>
          )
        case 'physical_constr':
          return dopWithLayerInfo.dop &&
            isDataObjectPropertyDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.physical_constr ? (
            <InternalConstraintPopoverComponent
              constraint={dopWithLayerInfo.dop.physical_constr}
              dop_href={`/dops?objectId=${dopWithLayerInfo.dop?.perma_id}&variantId=${dopWithLayerInfo.origin_layer_perma_id}&containerId=${containerId}`}
            />
          ) : (
            <></>
          )
        case 'is_visible':
          return dopWithLayerInfo.dop &&
            (isDtcDop(dopWithLayerInfo.dop) ||
              isMultiplexerDop(dopWithLayerInfo.dop) ||
              isStructureDop(dopWithLayerInfo.dop) ||
              isStaticFieldDop(dopWithLayerInfo.dop) ||
              isDynamicEndmarkerFieldDop(dopWithLayerInfo.dop) ||
              isDynamicLengthFieldDop(dopWithLayerInfo.dop) ||
              isEndOfPduFieldDop(dopWithLayerInfo.dop)) &&
            dopWithLayerInfo.dop.is_visible !== undefined ? (
            <p>{dopWithLayerInfo.dop.is_visible.toString()}</p>
          ) : (
            <></>
          )
        case 'param_snref':
          return dopWithLayerInfo.dop &&
            isEnvironmentDataDescriptionDop(dopWithLayerInfo.dop) ? (
            dopWithLayerInfo.dop.param_snref ? (
              <p>{dopWithLayerInfo.dop.param_snref}</p>
            ) : dopWithLayerInfo.dop.param_snpathref ? (
              <p>{dopWithLayerInfo.dop.param_snpathref}</p>
            ) : (
              <></>
            )
          ) : (
            <></>
          )
        case 'byte_position':
          return dopWithLayerInfo.dop &&
            isMultiplexerDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.byte_position ? (
            <p>{dopWithLayerInfo.dop.byte_position}</p>
          ) : (
            <></>
          )
        case 'switch_key':
          return dopWithLayerInfo.dop &&
            isMultiplexerDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.switch_key ? (
            <SwitchKeyCompactComponent
              containerId={containerId}
              switch_key={dopWithLayerInfo.dop.switch_key}
              variantId={variantId}
            />
          ) : (
            <></>
          )
        case 'default_case':
          return dopWithLayerInfo.dop &&
            isMultiplexerDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.default_case ? (
            <CaseCompactComponent
              containerId={containerId}
              multiplexer_case={dopWithLayerInfo.dop.default_case}
              variantId={variantId}
            />
          ) : (
            <></>
          )
        case 'byte_size':
          return dopWithLayerInfo.dop &&
            (isEnvironmentDataDop(dopWithLayerInfo.dop) ||
              isStructureDop(dopWithLayerInfo.dop)) &&
            dopWithLayerInfo.dop.byte_size ? (
            <p>{dopWithLayerInfo.dop.byte_size}</p>
          ) : (
            <></>
          )
        case 'all_value':
          return dopWithLayerInfo.dop &&
            isEnvironmentDataDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.all_value !== undefined ? (
            <p>{dopWithLayerInfo.dop.all_value.toString()}</p>
          ) : (
            <></>
          )
        case 'dtc_values':
          return dopWithLayerInfo.dop &&
            isEnvironmentDataDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.dtc_values ? (
            <p>{dopWithLayerInfo.dop.dtc_values.toString()}</p>
          ) : (
            <></>
          )
        case 'structure_ref':
          return dopWithLayerInfo.dop &&
            (isStaticFieldDop(dopWithLayerInfo.dop) ||
              isDynamicEndmarkerFieldDop(dopWithLayerInfo.dop) ||
              isDynamicLengthFieldDop(dopWithLayerInfo.dop) ||
              isEndOfPduFieldDop(dopWithLayerInfo.dop)) &&
            dopWithLayerInfo.dop.structure_ref ? (
            <Link
              href={`/dops?objectId=${dopWithLayerInfo.dop.structure_ref.resolved_object_perma_id}&variantId=${variantId}&containerId=${containerId}`}
            >
              {dopWithLayerInfo.dop.structure_ref.resolved_object_short_name}
            </Link>
          ) : (
            <></>
          )
        case 'env_data_desc_ref':
          return dopWithLayerInfo.dop &&
            (isStaticFieldDop(dopWithLayerInfo.dop) ||
              isDynamicEndmarkerFieldDop(dopWithLayerInfo.dop) ||
              isDynamicLengthFieldDop(dopWithLayerInfo.dop) ||
              isEndOfPduFieldDop(dopWithLayerInfo.dop)) &&
            dopWithLayerInfo.dop.env_data_desc_ref ? (
            <Link
              href={`/dops?objectId=${dopWithLayerInfo.dop.env_data_desc_ref.resolved_object_perma_id}&variantId=${variantId}&containerId=${containerId}`}
            >
              {
                dopWithLayerInfo.dop.env_data_desc_ref
                  .resolved_object_short_name
              }
            </Link>
          ) : (
            <></>
          )
        case 'fixed_number_of_items':
          return dopWithLayerInfo.dop &&
            isStaticFieldDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.fixed_number_of_items ? (
            <p>{dopWithLayerInfo.dop.fixed_number_of_items}</p>
          ) : (
            <></>
          )
        case 'item_byte_size':
          return dopWithLayerInfo.dop &&
            isStaticFieldDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.item_byte_size ? (
            <p>{dopWithLayerInfo.dop.item_byte_size}</p>
          ) : (
            <></>
          )
        case 'dyn_end_dop_ref':
          return dopWithLayerInfo.dop &&
            isDynamicEndmarkerFieldDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.dyn_end_dop_ref ? (
            <DynamicEndDopCompactComponent
              dyn_end_dop_ref={dopWithLayerInfo.dop.dyn_end_dop_ref}
            />
          ) : (
            <></>
          )
        case 'offset':
          return dopWithLayerInfo.dop &&
            isDynamicLengthFieldDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.offset ? (
            <p>{dopWithLayerInfo.dop.offset}</p>
          ) : (
            <></>
          )
        case 'determine_number_of_items':
          return dopWithLayerInfo.dop &&
            isDynamicLengthFieldDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.determine_number_of_items ? (
            <DetermineNumberOfItemsCompactComponent
              determine_number_of_items={
                dopWithLayerInfo.dop.determine_number_of_items
              }
            />
          ) : (
            <></>
          )
        case 'min_number_of_items':
          return dopWithLayerInfo.dop &&
            isEndOfPduFieldDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.min_number_of_items ? (
            <p>{dopWithLayerInfo.dop.min_number_of_items}</p>
          ) : (
            <></>
          )
        case 'max_number_of_items':
          return dopWithLayerInfo.dop &&
            isEndOfPduFieldDop(dopWithLayerInfo.dop) &&
            dopWithLayerInfo.dop.max_number_of_items ? (
            <p>{dopWithLayerInfo.dop.max_number_of_items}</p>
          ) : (
            <></>
          )
        case 'actions':
          return (
            <div className="relative flex justify-end items-center gap-2">
              <ActionDropdown
                view_href={`/dops?objectId=${dopWithLayerInfo.dop?.perma_id}&variantId=${dopWithLayerInfo.origin_layer_perma_id}&containerId=${containerId}`}
              />
            </div>
          )
        default:
          return cellValue?.toString()
      }
    },
    [dopCollection]
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
            <DopTableColumnDropdown
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
            {filteredItems.length} of total {dopCollection.items.length} data
            object properties
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
    dopCollection,
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
      aria-label="Data object property table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[382px], min-w-full',
      }}
      selectedKeys={selectedKeys}
      selectionMode="none"
      sortDescriptor={dopCollection.sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={dopCollection.sort}
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
        emptyContent={'No DOPs found'}
        isLoading={isLoading}
        items={visible_items}
        loadingContent={<CircularProgress aria-label="Loading..." />}
      >
        {(item) => (
          <TableRow key={item.dop?.ephemeral_id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

type DopWithVariantDatasetInfo = {
  dataSet: DiagnosticDataSetDescriptor | undefined
  referencingVariants: DiagnosticVariant[] | undefined
  dop: DopUnionTypeWithLayerInfo
}

export function DataObjectPropsOverviewComponent({
  pageId,
}: {
  pageId: string
}) {
  const INITIAL_VISIBLE_COLUMNS = new Set([
    'short_name',
    'class_name',
    'compu_method',
    'actions',
  ])

  const [visibleColumns, setVisibleColumns] = useSelectionWithIndexedDB(
    pageId,
    'allDops#table-visibleColumns',
    INITIAL_VISIBLE_COLUMNS
  )

  const visibleColumnsValues = React.useMemo(() => {
    let arr = Array.from(visibleColumns)

    return arr
  }, [visibleColumns])

  const {
    data: data_collection,
    error,
    isLoading,
  } = useQuery(
    '/dops',
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

  const dopCollection = useAsyncList({
    async load() {
      return {
        items:
          data_collection && data_collection.dops
            ? data_collection.dops
                .map((entry): DopWithVariantDatasetInfo | undefined => {
                  return entry.dop !== undefined
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
                        dop: entry.dop,
                      }
                    : undefined
                })
                .flat()
                .filter((value) => value !== undefined)
                .sort((a, b) => {
                  return a.dop.dop !== undefined && b.dop.dop !== undefined
                    ? sortItemsBySortDescriptor<DopUnionType>(
                        a.dop.dop,
                        b.dop.dop,
                        {
                          column: 'short_name',
                          direction: 'ascending',
                        }
                      )
                    : 0
                })
            : [],
      }
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          if (sortDescriptor.column === 'origin_layer_short_name') {
            return sortItemsBySortDescriptor<DopUnionTypeWithLayerInfo>(
              a.dop,
              b.dop,
              sortDescriptor
            )
          } else {
            return a.dop.dop !== undefined && b.dop.dop !== undefined
              ? sortItemsBySortDescriptor<DopUnionType>(
                  a.dop.dop,
                  b.dop.dop,
                  sortDescriptor
                )
              : 0
          }
        }),
      }
    },
  })

  // Reload the async list items, when the queried dataCollection change
  React.useEffect(() => {
    if (data_collection !== undefined) {
      dopCollection.reload()

      if (
        data_collection.dops !== undefined &&
        data_collection.dops.length > 0
      ) {
        resolveVariantMappings(data_collection)
      }
    }
  }, [data_collection])

  const [variantMap, setVariantMap] = React.useState<Map<string, string>>(
    new Map<string, string>()
  )

  const resolveVariantMappings = (
    dcvCollection: DopsOfVariantsOfDataSetsCollection
  ) => {
    if (dcvCollection) {
      const mappingResult = new Map<string, string>(variantMap)

      dcvCollection.variants?.forEach((variant) =>
        mappingResult.set(variant.perma_id, variant.short_name)
      )

      setVariantMap(mappingResult)
    }
  }

  // Introduce all state variables for searching and filtering the DOPs
  const [searchValue, setSearchValue] = React.useState('')

  const [selectedTypes, setSelectedTypes] = React.useState<Selection>(
    new Set([])
  )
  const selectedTypeValues = React.useMemo(() => {
    let arr = Array.from(selectedTypes)

    return arr
  }, [selectedTypes])

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

  const [selectedPhysicalTypes, setSelectedPhysicalTypes] =
    React.useState<Selection>(new Set([]))
  const selectedPhyscialTypeValues = React.useMemo(() => {
    let arr = Array.from(selectedPhysicalTypes)

    return arr
  }, [selectedPhysicalTypes])

  const [selectedCompuMethods, setSelectedCompuMethods] =
    React.useState<Selection>(new Set([]))
  const selectedCompuMethodsValues = React.useMemo(() => {
    let arr = Array.from(selectedCompuMethods)

    return arr
  }, [selectedCompuMethods])

  const [selectedDiagCodedTypes, setSelectedDiagCodedTypes] =
    React.useState<Selection>(new Set([]))
  const selectedDiagCodedTypeValues = React.useMemo(() => {
    let arr = Array.from(selectedDiagCodedTypes)

    return arr
  }, [selectedDiagCodedTypes])

  // Jump back to page 1, if one of the column filters is changed
  React.useEffect(() => {
    setPage(1)
  }, [
    selectedCompuMethods,
    selectedDiagCodedTypes,
    selectedOriginLayers,
    selectedPhysicalTypes,
    selectedTypes,
    selectedUsedInVariants,
  ])

  // Define the table columns, the list of initially visible columns and a related state variable
  const columns: DopColumnDefinition[] = [
    { label: 'PERMA_ID', key: 'perma_id', sortable: true },
    { label: 'EPHEMERAL_ID', key: 'ephemeral_id', sortable: true },
    { label: 'SHORT_NAME', key: 'short_name', sortable: true },
    { label: 'LONG_NAME', key: 'long_name', sortable: true },
    { label: 'DESCRIPTION', key: 'description', sortable: false },
    {
      label: 'TYPE',
      key: 'class_name',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DopWithVariantDatasetInfo>
          filterItems={dopCollection}
          filterLabel="TYPE"
          filterValueExtractorFunc={(obj) =>
            obj.dop.dop?.class_name ? obj.dop.dop.class_name : undefined
          }
          selectedFilters={selectedTypes}
          selectedFiltersHandler={setSelectedTypes}
        />
      ),
    },
    {
      label: 'ORIGIN_LAYER',
      key: 'origin_layer_short_name',
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DopWithVariantDatasetInfo>
          filterItems={dopCollection}
          filterLabel="ORIGIN_LAYER"
          filterValueExtractorFunc={(obj) =>
            obj.dop.origin_layer_short_name
              ? obj.dop.origin_layer_short_name
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
        <TableFilterObjectCollectionWithExtractorFuncDropdown<DopWithVariantDatasetInfo>
          filterItems={dopCollection}
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
      label: 'PHYSICAL TYPE',
      key: 'physical_type',
      relatedDopTypes: ['DataObjectProperty', 'DtcDop'],
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DopWithVariantDatasetInfo>
          filterItems={dopCollection}
          filterLabel="PHYSICAL TYPE"
          filterValueExtractorFunc={(obj) =>
            obj.dop.dop &&
            (isDataObjectPropertyDop(obj.dop.dop) || isDtcDop(obj.dop.dop))
              ? obj.dop.dop.physical_type?.base_data_type
              : undefined
          }
          selectedFilters={selectedPhysicalTypes}
          selectedFiltersHandler={setSelectedPhysicalTypes}
        />
      ),
    },
    {
      label: 'COMPU METHOD',
      key: 'compu_method',
      relatedDopTypes: ['DataObjectProperty', 'DtcDop'],
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DopWithVariantDatasetInfo>
          filterItems={dopCollection}
          filterLabel="COMPU METHOD"
          filterValueExtractorFunc={(obj) =>
            obj.dop.dop &&
            (isDataObjectPropertyDop(obj.dop.dop) || isDtcDop(obj.dop.dop))
              ? obj.dop.dop.compu_method?.category
              : undefined
          }
          selectedFilters={selectedCompuMethods}
          selectedFiltersHandler={setSelectedCompuMethods}
        />
      ),
    },
    {
      label: 'DIAG CODED TYPE',
      key: 'diag_coded_type',
      relatedDopTypes: ['DataObjectProperty', 'DtcDop'],
      sortable: true,
      filter: (
        <TableFilterDropdownWithExtractorFunc<DopWithVariantDatasetInfo>
          filterItems={dopCollection}
          filterLabel="DIAG CODED TYPE"
          filterValueExtractorFunc={(obj) =>
            obj.dop.dop &&
            (isDataObjectPropertyDop(obj.dop.dop) || isDtcDop(obj.dop.dop))
              ? obj.dop.dop.diag_coded_type?.base_data_type
              : undefined
          }
          selectedFilters={selectedDiagCodedTypes}
          selectedFiltersHandler={setSelectedDiagCodedTypes}
        />
      ),
    },
    {
      label: 'INTERNAL CONSTRAINT',
      key: 'internal_constr',
      relatedDopTypes: ['DataObjectProperty'],
      sortable: false,
    },
    {
      label: 'UNIT',
      key: 'unit_ref',
      relatedDopTypes: ['DataObjectProperty'],
      sortable: false,
    },
    {
      label: 'PHYSICAL CONSTRAINT',
      key: 'physical_constr',
      relatedDopTypes: ['DataObjectProperty'],
      sortable: false,
    },
    {
      label: 'IS VISIBLE',
      key: 'is_visible',
      relatedDopTypes: [
        'DtcDop',
        'Multiplexer',
        'Structure',
        'StaticField',
        'DynamicEndmarkerField',
        'DynamicLengthField',
        'EndOfPduField',
      ],
      sortable: true,
    },
    {
      label: 'PARAMETER REFERENCE',
      key: 'param_snref',
      keyAliases: ['param_snpathref'],
      relatedDopTypes: ['EnvironmentDataDescription'],
      sortable: true,
    },
    {
      label: 'BYTE POSITION',
      key: 'byte_position',
      relatedDopTypes: ['Multiplexer'],
      sortable: true,
    },
    {
      label: 'SWITCH KEY',
      key: 'switch_key',
      relatedDopTypes: ['Multiplexer'],
      sortable: false,
    },
    {
      label: 'DEFAULT CASE',
      key: 'default_case',
      relatedDopTypes: ['Multiplexer'],
      sortable: false,
    },
    {
      label: 'BYTE SIZE',
      key: 'byte_size',
      relatedDopTypes: ['EnvironmentData', 'Structure'],
      sortable: true,
    },
    {
      label: 'ALL VALUE',
      key: 'all_value',
      relatedDopTypes: ['EnvironmentData'],
      sortable: true,
    },
    {
      label: 'DTC VALUES',
      key: 'dtc_values',
      relatedDopTypes: ['EnvironmentData'],
      sortable: false,
    },
    {
      label: 'STRUCTURE',
      key: 'structure_ref',
      keyAliases: ['structure_snref'],
      relatedDopTypes: [
        'StaticField',
        'DynamicEndmarkerField',
        'DynamicLengthField',
        'EndOfPduField',
      ],
      sortable: false,
    },
    {
      label: 'ENV DATA DESCRIPTION',
      key: 'env_data_desc_ref',
      keyAliases: ['env_data_desc_snref'],
      relatedDopTypes: [
        'StaticField',
        'DynamicEndmarkerField',
        'DynamicLengthField',
        'EndOfPduField',
      ],
      sortable: false,
    },
    {
      label: 'FIXED NUMBER OF ITEMS',
      key: 'fixed_number_of_items',
      relatedDopTypes: ['StaticField'],
      sortable: true,
    },
    {
      label: 'ITEM BYTE SIZE',
      key: 'item_byte_size',
      relatedDopTypes: ['StaticField'],
      sortable: true,
    },
    {
      label: 'DYNAMIC END DOP',
      key: 'dyn_end_dop_ref',
      relatedDopTypes: ['DynamicEndmarkerField'],
      sortable: false,
    },
    {
      label: 'OFFSET',
      key: 'offset',
      relatedDopTypes: ['DynamicLengthField'],
      sortable: true,
    },
    {
      label: 'DETERMINE NUMBER OF ITEMS',
      key: 'determine_number_of_items',
      relatedDopTypes: ['DynamicLengthField'],
      sortable: false,
    },
    {
      label: 'MIN NUMBER OF ITEMS',
      key: 'min_number_of_items',
      relatedDopTypes: ['EndOfPduField'],
      sortable: true,
    },
    {
      label: 'MAX NUMBER OF ITEMS',
      key: 'max_number_of_items',
      relatedDopTypes: ['EndOfPduField'],
      sortable: true,
    },
    { label: 'ACTIONS', key: 'actions' },
  ]

  // Define a memo for table data filtering
  const filteredItems = React.useMemo(() => {
    let filteredCollectionItems = [...dopCollection.items]

    // Filter all dops based on visibleColumns list
    if (searchValue && searchValue.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithVarDb) => {
          let result = false

          if (
            !result &&
            visibleColumnsValues.includes('perma_id') &&
            dopWithVarDb.dop.dop?.perma_id !== undefined
          ) {
            result = dopWithVarDb.dop.dop?.perma_id
              .toString()
              .includes(searchValue.toLowerCase())
          }

          if (
            !result &&
            visibleColumnsValues.includes('short_name') &&
            dopWithVarDb.dop.dop?.short_name !== undefined
          ) {
            result = dopWithVarDb.dop.dop?.short_name
              .toLowerCase()
              .includes(searchValue.toLowerCase())
          }

          if (!result && visibleColumnsValues.includes('long_name')) {
            result = dopWithVarDb.dop.dop?.long_name
              ? dopWithVarDb.dop.dop?.long_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (
            !result &&
            visibleColumnsValues.includes('description') &&
            dopWithVarDb.dop.dop?.description !== undefined
          ) {
            result = dopWithVarDb.dop.dop?.description.text
              ? dopWithVarDb.dop.dop?.description.text
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (!result && visibleColumnsValues.includes('class_name')) {
            result = dopWithVarDb.dop.dop?.class_name
              ? dopWithVarDb.dop.dop?.class_name
                  .toString()
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (
            !result &&
            visibleColumnsValues.includes('origin_layer_short_name')
          ) {
            result = dopWithVarDb.dop.origin_layer_short_name
              ? dopWithVarDb.dop.origin_layer_short_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              : false
          }

          if (!result && visibleColumnsValues.includes('used_in_variants')) {
            result = dopWithVarDb.referencingVariants
              ? dopWithVarDb.referencingVariants.some((item) => {
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

          if (!result && visibleColumnsValues.includes('physical_type')) {
            if (
              dopWithVarDb.dop.dop &&
              (isDataObjectPropertyDop(dopWithVarDb.dop.dop) ||
                isDtcDop(dopWithVarDb.dop.dop)) &&
              dopWithVarDb.dop.dop.physical_type
            ) {
              const ires =
                dopWithVarDb.dop.dop.physical_type.base_data_type
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.physical_type.display_radix
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('compu_method')) {
            if (
              dopWithVarDb.dop.dop &&
              (isDataObjectPropertyDop(dopWithVarDb.dop.dop) ||
                isDtcDop(dopWithVarDb.dop.dop)) &&
              dopWithVarDb.dop.dop.compu_method
            ) {
              const ires =
                dopWithVarDb.dop.dop.compu_method.category
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.compu_method.internal_type
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.compu_method.physical_type
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('diag_coded_type')) {
            if (
              dopWithVarDb.dop.dop &&
              (isDataObjectPropertyDop(dopWithVarDb.dop.dop) ||
                isDtcDop(dopWithVarDb.dop.dop)) &&
              dopWithVarDb.dop.dop.diag_coded_type
            ) {
              const ires =
                dopWithVarDb.dop.dop.diag_coded_type.base_data_type
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.diag_coded_type.base_type_encoding
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('internal_constr')) {
            if (
              dopWithVarDb.dop.dop &&
              isDataObjectPropertyDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.internal_constr
            ) {
              const ires = dopWithVarDb.dop.dop.internal_constr.value_type
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('physical_constr')) {
            if (
              dopWithVarDb.dop.dop &&
              isDataObjectPropertyDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.physical_constr
            ) {
              const ires = dopWithVarDb.dop.dop.physical_constr.value_type
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('is_visible')) {
            if (
              dopWithVarDb.dop.dop &&
              (isDtcDop(dopWithVarDb.dop.dop) ||
                isMultiplexerDop(dopWithVarDb.dop.dop) ||
                isStructureDop(dopWithVarDb.dop.dop) ||
                isStaticFieldDop(dopWithVarDb.dop.dop) ||
                isDynamicEndmarkerFieldDop(dopWithVarDb.dop.dop) ||
                isDynamicLengthFieldDop(dopWithVarDb.dop.dop) ||
                isEndOfPduFieldDop(dopWithVarDb.dop.dop)) &&
              dopWithVarDb.dop.dop.is_visible
            ) {
              const ires = dopWithVarDb.dop.dop.is_visible
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (
            (!result && visibleColumnsValues.includes('param_snref')) ||
            visibleColumnsValues.includes('param_snpathref')
          ) {
            if (
              dopWithVarDb.dop.dop &&
              isEnvironmentDataDescriptionDop(dopWithVarDb.dop.dop) &&
              (dopWithVarDb.dop.dop.param_snref ||
                dopWithVarDb.dop.dop.param_snpathref)
            ) {
              const ires =
                dopWithVarDb.dop.dop.param_snref
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.param_snpathref
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('byte_position')) {
            if (
              dopWithVarDb.dop.dop &&
              isMultiplexerDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.byte_position
            ) {
              const ires = dopWithVarDb.dop.dop.byte_position
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('switch_key')) {
            if (
              dopWithVarDb.dop.dop &&
              isMultiplexerDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.switch_key
            ) {
              const ires =
                dopWithVarDb.dop.dop.switch_key.dop_ref?.resolved_object_short_name
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.switch_key.byte_position
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.switch_key.bit_position
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('default_case')) {
            if (
              dopWithVarDb.dop.dop &&
              isMultiplexerDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.default_case
            ) {
              const ires =
                dopWithVarDb.dop.dop.default_case.short_name
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.default_case.description?.text
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.default_case.structure_ref?.resolved_object_short_name
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.default_case.structure_snref
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('byte_size')) {
            if (
              dopWithVarDb.dop.dop &&
              (isEnvironmentDataDop(dopWithVarDb.dop.dop) ||
                isStructureDop(dopWithVarDb.dop.dop)) &&
              dopWithVarDb.dop.dop.byte_size
            ) {
              const ires =
                dopWithVarDb.dop.dop.byte_size
                  .toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.byte_size
                  .toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('all_value')) {
            if (
              dopWithVarDb.dop.dop &&
              isEnvironmentDataDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.all_value !== undefined
            ) {
              const ires = dopWithVarDb.dop.dop.all_value
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('dtc_values')) {
            if (
              dopWithVarDb.dop.dop &&
              isEnvironmentDataDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.dtc_values
            ) {
              const ires = dopWithVarDb.dop.dop.dtc_values
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (
            (!result && visibleColumnsValues.includes('structure_ref')) ||
            visibleColumnsValues.includes('structure_snref')
          ) {
            if (
              dopWithVarDb.dop.dop &&
              (isStaticFieldDop(dopWithVarDb.dop.dop) ||
                isDynamicEndmarkerFieldDop(dopWithVarDb.dop.dop) ||
                isDynamicLengthFieldDop(dopWithVarDb.dop.dop) ||
                isEndOfPduFieldDop(dopWithVarDb.dop.dop)) &&
              (dopWithVarDb.dop.dop.structure_ref ||
                dopWithVarDb.dop.dop.structure_snref)
            ) {
              const ires =
                dopWithVarDb.dop.dop.structure_ref?.resolved_object_short_name
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.structure_snref
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (
            (!result && visibleColumnsValues.includes('env_data_desc_ref')) ||
            visibleColumnsValues.includes('env_data_desc_snref')
          ) {
            if (
              dopWithVarDb.dop.dop &&
              (isStaticFieldDop(dopWithVarDb.dop.dop) ||
                isDynamicEndmarkerFieldDop(dopWithVarDb.dop.dop) ||
                isDynamicLengthFieldDop(dopWithVarDb.dop.dop) ||
                isEndOfPduFieldDop(dopWithVarDb.dop.dop)) &&
              (dopWithVarDb.dop.dop.env_data_desc_ref ||
                dopWithVarDb.dop.dop.env_data_desc_snref)
            ) {
              const ires =
                dopWithVarDb.dop.dop.env_data_desc_ref?.resolved_object_short_name
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.env_data_desc_snref
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (
            !result &&
            visibleColumnsValues.includes('fixed_number_of_items')
          ) {
            if (
              dopWithVarDb.dop.dop &&
              isStaticFieldDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.fixed_number_of_items
            ) {
              const ires = dopWithVarDb.dop.dop.fixed_number_of_items
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('item_byte_size')) {
            if (
              dopWithVarDb.dop.dop &&
              isStaticFieldDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.item_byte_size
            ) {
              const ires = dopWithVarDb.dop.dop.item_byte_size
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('dyn_end_dop_ref')) {
            if (
              dopWithVarDb.dop.dop &&
              isDynamicEndmarkerFieldDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.dyn_end_dop_ref
            ) {
              const ires =
                dopWithVarDb.dop.dop.dyn_end_dop_ref.resolved_object_short_name
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('offset')) {
            if (
              dopWithVarDb.dop.dop &&
              isDynamicLengthFieldDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.offset
            ) {
              const ires = dopWithVarDb.dop.dop.offset
                .toString()
                ?.toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (
            !result &&
            visibleColumnsValues.includes('determine_number_of_items')
          ) {
            if (
              dopWithVarDb.dop.dop &&
              isDynamicLengthFieldDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.determine_number_of_items
            ) {
              const ires =
                dopWithVarDb.dop.dop.determine_number_of_items.dop_ref?.resolved_object_short_name
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.determine_number_of_items.byte_position
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                dopWithVarDb.dop.dop.determine_number_of_items.bit_position
                  ?.toString()
                  ?.toLowerCase()
                  .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('min_number_of_items')) {
            if (
              dopWithVarDb.dop.dop &&
              isEndOfPduFieldDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.min_number_of_items
            ) {
              const ires = dopWithVarDb.dop.dop.min_number_of_items
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          if (!result && visibleColumnsValues.includes('max_number_of_items')) {
            if (
              dopWithVarDb.dop.dop &&
              isEndOfPduFieldDop(dopWithVarDb.dop.dop) &&
              dopWithVarDb.dop.dop.max_number_of_items
            ) {
              const ires = dopWithVarDb.dop.dop.max_number_of_items
                .toString()
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

              result = ires !== undefined ? ires : false
            }
          }

          return result
        }
      )
    }
    if (selectedTypeValues && selectedTypeValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithVarDb) =>
          dopWithVarDb.dop.dop && dopWithVarDb.dop.dop.class_name
            ? selectedTypeValues.includes(dopWithVarDb.dop.dop.class_name)
            : false
      )
    }
    if (selectedOriginLayerValues && selectedOriginLayerValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithVarDb) =>
          dopWithVarDb.dop.origin_layer_short_name
            ? selectedOriginLayerValues.includes(
                dopWithVarDb.dop.origin_layer_short_name
              )
            : false
      )
    }
    if (selectedUsedInVariantValues && selectedUsedInVariantValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithVarDb) =>
          dopWithVarDb.referencingVariants
            ? dopWithVarDb.referencingVariants.some((item) =>
                item.perma_id
                  ? selectedUsedInVariantValues.includes(
                      item.perma_id.toString()
                    )
                  : false
              )
            : false
      )
    }
    if (selectedPhyscialTypeValues && selectedPhyscialTypeValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithVarDb) =>
          dopWithVarDb.dop.dop &&
          (isDataObjectPropertyDop(dopWithVarDb.dop.dop) ||
            isDtcDop(dopWithVarDb.dop.dop)) &&
          dopWithVarDb.dop.dop.physical_type?.base_data_type
            ? selectedPhyscialTypeValues.includes(
                dopWithVarDb.dop.dop.physical_type.base_data_type
              )
            : false
      )
    }
    if (selectedCompuMethodsValues && selectedCompuMethodsValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithVarDb) =>
          dopWithVarDb.dop.dop &&
          (isDataObjectPropertyDop(dopWithVarDb.dop.dop) ||
            isDtcDop(dopWithVarDb.dop.dop)) &&
          dopWithVarDb.dop.dop.compu_method?.category
            ? selectedCompuMethodsValues.includes(
                dopWithVarDb.dop.dop.compu_method.category
              )
            : false
      )
    }
    if (selectedDiagCodedTypeValues && selectedDiagCodedTypeValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter(
        (dopWithVarDb) =>
          dopWithVarDb.dop.dop &&
          (isDataObjectPropertyDop(dopWithVarDb.dop.dop) ||
            isDtcDop(dopWithVarDb.dop.dop)) &&
          dopWithVarDb.dop.dop.diag_coded_type?.base_data_type
            ? selectedDiagCodedTypeValues.includes(
                dopWithVarDb.dop.dop.diag_coded_type.base_data_type
              )
            : false
      )
    }

    return filteredCollectionItems
  }, [
    dopCollection,
    searchValue,
    selectedTypeValues,
    selectedOriginLayerValues,
    selectedUsedInVariantValues,
    selectedCompuMethodsValues,
    selectedDiagCodedTypeValues,
    selectedPhyscialTypeValues,
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
    (dopWithVarDb: DopWithVariantDatasetInfo, columnKey: React.Key) => {
      const cellValue =
        dopWithVarDb.dop[columnKey as keyof DopUnionTypeWithLayerInfo]

      switch (columnKey) {
        case 'perma_id':
          return <p>{dopWithVarDb.dop.dop?.perma_id}</p>
        case 'ephemeral_id':
          return <p>{dopWithVarDb.dop.dop?.ephemeral_id}</p>
        case 'short_name':
          return (
            <Link
              href={`/dops?objectId=${dopWithVarDb.dop.dop?.perma_id}&variantId=${dopWithVarDb.dop.origin_layer_perma_id}&containerId=${dopWithVarDb.dataSet?.perma_id}`}
            >
              {dopWithVarDb.dop.dop?.short_name}
            </Link>
          )
        case 'long_name':
          return <p>{dopWithVarDb.dop.dop?.long_name}</p>
        case 'description':
          return (
            <DescriptionComponent
              description={dopWithVarDb.dop.dop?.description}
              enableUnfolding={true}
              maxDisplayLengthLimit={200}
            />
          )
        case 'class_name':
          return <DopTypeChip dop={dopWithVarDb.dop.dop} />
        case 'origin_layer_short_name':
          return (
            <div>
              <Link
                href={`/diagnostic-variant?objectId=${dopWithVarDb.dop.origin_layer_perma_id}&containerId=${dopWithVarDb.dataSet?.perma_id}`}
              >
                {dopWithVarDb.dop.origin_layer_short_name}
              </Link>
              <p className="text-small">
                ({dopWithVarDb.dop.origin_layer_type})
              </p>
            </div>
          )
        case 'used_in_variants':
          return (
            <div className="min-w-[400] gap-2 grid grid-cols-2">
              {dopWithVarDb.referencingVariants?.map((entry, index) => {
                return (
                  <Card key={entry.ephemeral_id + index}>
                    <CardBody>
                      <Link
                        href={`/diagnostic-variant?objectId=${entry.perma_id}&containerId=${dopWithVarDb.dataSet?.perma_id}`}
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
        case 'physical_type':
          return dopWithVarDb.dop.dop &&
            (isDataObjectPropertyDop(dopWithVarDb.dop.dop) ||
              isDtcDop(dopWithVarDb.dop.dop)) &&
            dopWithVarDb.dop.dop.physical_type ? (
            <PhysicalTypePopoverComponent
              physicalType={dopWithVarDb.dop.dop.physical_type}
            />
          ) : (
            <></>
          )
        case 'compu_method':
          return dopWithVarDb.dop.dop &&
            (isDataObjectPropertyDop(dopWithVarDb.dop.dop) ||
              isDtcDop(dopWithVarDb.dop.dop)) &&
            dopWithVarDb.dop.dop.compu_method ? (
            <CompuMethodPopoverComponent
              compuMethod={dopWithVarDb.dop.dop.compu_method}
              dop_href={`/dops?objectId=${dopWithVarDb.dop.dop?.perma_id}&variantId=${dopWithVarDb.dop.origin_layer_perma_id}&containerId=${dopWithVarDb.dataSet?.perma_id}`}
            />
          ) : (
            <></>
          )
        case 'diag_coded_type':
          return dopWithVarDb.dop.dop &&
            (isDataObjectPropertyDop(dopWithVarDb.dop.dop) ||
              isDtcDop(dopWithVarDb.dop.dop)) &&
            dopWithVarDb.dop.dop.diag_coded_type ? (
            <DiagCodedTypePopoverComponent
              diagCodedType={dopWithVarDb.dop.dop.diag_coded_type}
            />
          ) : (
            <></>
          )
        case 'internal_constr':
          return dopWithVarDb.dop.dop &&
            isDataObjectPropertyDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.internal_constr ? (
            <InternalConstraintPopoverComponent
              constraint={dopWithVarDb.dop.dop.internal_constr}
              dop_href={`/dops?objectId=${dopWithVarDb.dop.dop?.perma_id}&variantId=${dopWithVarDb.dop.origin_layer_perma_id}&containerId=${dopWithVarDb.dataSet?.perma_id}`}
            />
          ) : (
            <></>
          )
        case 'unit_ref':
          return dopWithVarDb.dop.dop &&
            isDataObjectPropertyDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.unit_ref ? (
            <OdxLinkPopoverComponent
              href={`/units?objectId=${dopWithVarDb.dop.dop.unit_ref.resolved_object_perma_id}&variantId=${dopWithVarDb.dop.origin_layer_perma_id}&containerId=${dopWithVarDb.dataSet?.perma_id}`}
              label="Show Unit"
              odxLink={dopWithVarDb.dop.dop.unit_ref}
            />
          ) : (
            <></>
          )
        case 'physical_constr':
          return dopWithVarDb.dop.dop &&
            isDataObjectPropertyDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.physical_constr ? (
            <InternalConstraintPopoverComponent
              constraint={dopWithVarDb.dop.dop.physical_constr}
              dop_href={`/dops?objectId=${dopWithVarDb.dop.dop?.perma_id}&variantId=${dopWithVarDb.dop.origin_layer_perma_id}&containerId=${dopWithVarDb.dataSet?.perma_id}`}
            />
          ) : (
            <></>
          )
        case 'is_visible':
          return dopWithVarDb.dop.dop &&
            (isDtcDop(dopWithVarDb.dop.dop) ||
              isMultiplexerDop(dopWithVarDb.dop.dop) ||
              isStructureDop(dopWithVarDb.dop.dop) ||
              isStaticFieldDop(dopWithVarDb.dop.dop) ||
              isDynamicEndmarkerFieldDop(dopWithVarDb.dop.dop) ||
              isDynamicLengthFieldDop(dopWithVarDb.dop.dop) ||
              isEndOfPduFieldDop(dopWithVarDb.dop.dop)) &&
            dopWithVarDb.dop.dop.is_visible !== undefined ? (
            <p>{dopWithVarDb.dop.dop.is_visible.toString()}</p>
          ) : (
            <></>
          )
        case 'param_snref':
          return dopWithVarDb.dop.dop &&
            isEnvironmentDataDescriptionDop(dopWithVarDb.dop.dop) ? (
            dopWithVarDb.dop.dop.param_snref ? (
              <p>{dopWithVarDb.dop.dop.param_snref}</p>
            ) : dopWithVarDb.dop.dop.param_snpathref ? (
              <p>{dopWithVarDb.dop.dop.param_snpathref}</p>
            ) : (
              <></>
            )
          ) : (
            <></>
          )
        case 'byte_position':
          return dopWithVarDb.dop.dop &&
            isMultiplexerDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.byte_position ? (
            <p>{dopWithVarDb.dop.dop.byte_position}</p>
          ) : (
            <></>
          )
        case 'switch_key':
          return dopWithVarDb.dop.dop &&
            isMultiplexerDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.switch_key ? (
            <SwitchKeyCompactComponent
              containerId={dopWithVarDb.dataSet?.perma_id}
              switch_key={dopWithVarDb.dop.dop.switch_key}
              variantId={dopWithVarDb.dop.origin_layer_perma_id}
            />
          ) : (
            <></>
          )
        case 'default_case':
          return dopWithVarDb.dop.dop &&
            isMultiplexerDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.default_case ? (
            <CaseCompactComponent
              containerId={dopWithVarDb.dataSet?.perma_id}
              multiplexer_case={dopWithVarDb.dop.dop.default_case}
              variantId={dopWithVarDb.dop.origin_layer_perma_id}
            />
          ) : (
            <></>
          )
        case 'byte_size':
          return dopWithVarDb.dop.dop &&
            (isEnvironmentDataDop(dopWithVarDb.dop.dop) ||
              isStructureDop(dopWithVarDb.dop.dop)) &&
            dopWithVarDb.dop.dop.byte_size ? (
            <p>{dopWithVarDb.dop.dop.byte_size}</p>
          ) : (
            <></>
          )
        case 'all_value':
          return dopWithVarDb.dop.dop &&
            isEnvironmentDataDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.all_value !== undefined ? (
            <p>{dopWithVarDb.dop.dop.all_value.toString()}</p>
          ) : (
            <></>
          )
        case 'dtc_values':
          return dopWithVarDb.dop.dop &&
            isEnvironmentDataDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.dtc_values ? (
            <p>{dopWithVarDb.dop.dop.dtc_values.toString()}</p>
          ) : (
            <></>
          )
        case 'structure_ref':
          return dopWithVarDb.dop.dop &&
            (isStaticFieldDop(dopWithVarDb.dop.dop) ||
              isDynamicEndmarkerFieldDop(dopWithVarDb.dop.dop) ||
              isDynamicLengthFieldDop(dopWithVarDb.dop.dop) ||
              isEndOfPduFieldDop(dopWithVarDb.dop.dop)) &&
            dopWithVarDb.dop.dop.structure_ref ? (
            <Link
              href={`/dops?objectId=${dopWithVarDb.dop.dop.structure_ref.resolved_object_perma_id}&variantId=${dopWithVarDb.dop.origin_layer_perma_id}&containerId=${dopWithVarDb.dataSet?.perma_id}`}
            >
              {dopWithVarDb.dop.dop.structure_ref.resolved_object_short_name}
            </Link>
          ) : (
            <></>
          )
        case 'env_data_desc_ref':
          return dopWithVarDb.dop.dop &&
            (isStaticFieldDop(dopWithVarDb.dop.dop) ||
              isDynamicEndmarkerFieldDop(dopWithVarDb.dop.dop) ||
              isDynamicLengthFieldDop(dopWithVarDb.dop.dop) ||
              isEndOfPduFieldDop(dopWithVarDb.dop.dop)) &&
            dopWithVarDb.dop.dop.env_data_desc_ref ? (
            <Link
              href={`/dops?objectId=${dopWithVarDb.dop.dop.env_data_desc_ref.resolved_object_perma_id}&variantId=${dopWithVarDb.dop.origin_layer_perma_id}&containerId=${dopWithVarDb.dataSet?.perma_id}`}
            >
              {
                dopWithVarDb.dop.dop.env_data_desc_ref
                  .resolved_object_short_name
              }
            </Link>
          ) : (
            <></>
          )
        case 'fixed_number_of_items':
          return dopWithVarDb.dop.dop &&
            isStaticFieldDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.fixed_number_of_items ? (
            <p>{dopWithVarDb.dop.dop.fixed_number_of_items}</p>
          ) : (
            <></>
          )
        case 'item_byte_size':
          return dopWithVarDb.dop.dop &&
            isStaticFieldDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.item_byte_size ? (
            <p>{dopWithVarDb.dop.dop.item_byte_size}</p>
          ) : (
            <></>
          )
        case 'dyn_end_dop_ref':
          return dopWithVarDb.dop.dop &&
            isDynamicEndmarkerFieldDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.dyn_end_dop_ref ? (
            <DynamicEndDopCompactComponent
              dyn_end_dop_ref={dopWithVarDb.dop.dop.dyn_end_dop_ref}
            />
          ) : (
            <></>
          )
        case 'offset':
          return dopWithVarDb.dop.dop &&
            isDynamicLengthFieldDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.offset ? (
            <p>{dopWithVarDb.dop.dop.offset}</p>
          ) : (
            <></>
          )
        case 'determine_number_of_items':
          return dopWithVarDb.dop.dop &&
            isDynamicLengthFieldDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.determine_number_of_items ? (
            <DetermineNumberOfItemsCompactComponent
              determine_number_of_items={
                dopWithVarDb.dop.dop.determine_number_of_items
              }
            />
          ) : (
            <></>
          )
        case 'min_number_of_items':
          return dopWithVarDb.dop.dop &&
            isEndOfPduFieldDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.min_number_of_items ? (
            <p>{dopWithVarDb.dop.dop.min_number_of_items}</p>
          ) : (
            <></>
          )
        case 'max_number_of_items':
          return dopWithVarDb.dop.dop &&
            isEndOfPduFieldDop(dopWithVarDb.dop.dop) &&
            dopWithVarDb.dop.dop.max_number_of_items ? (
            <p>{dopWithVarDb.dop.dop.max_number_of_items}</p>
          ) : (
            <></>
          )
        case 'actions':
          return (
            <div className="relative flex justify-end items-center gap-2">
              <ActionDropdown
                view_href={`/dops?objectId=${dopWithVarDb.dop.dop?.perma_id}&variantId=${dopWithVarDb.dop.origin_layer_perma_id}&containerId=${dopWithVarDb.dataSet?.perma_id}`}
              />
            </div>
          )
        default:
          return cellValue?.toString()
      }
    },
    [dopCollection]
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
            <DopTableColumnDropdown
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
            {filteredItems.length} of total {dopCollection.items.length} data
            object properties
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
    dopCollection,
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
      aria-label="Data object property table"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[382px], min-w-full',
      }}
      selectedKeys={selectedKeys}
      selectionMode="none"
      sortDescriptor={dopCollection.sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={dopCollection.sort}
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
        emptyContent={'No DOPs found'}
        isLoading={isLoading}
        items={visible_items}
        loadingContent={<CircularProgress aria-label="Loading..." />}
      >
        {(item) => (
          <TableRow key={item.dop.dop?.ephemeral_id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export function DopCompactSummaryComponent({
  dopData,
}: {
  dopData: DopUnionTypeWithLayerInfo
}) {
  const renderCompuMethod = (
    compuMethod: CompuMethod | undefined,
    diag_coded_type: DiagCodedType | undefined,
    internalConstraint: InternalConstr | undefined
  ) => {
    const compactFunctionRepr = generateLatexFuncFromCompuMethod(
      compuMethod,
      diag_coded_type,
      internalConstraint
    )
    const functionGraph = renderFunctionGraphOrMappingTable(
      compuMethod,
      diag_coded_type,
      internalConstraint
    )

    return compuMethod !== undefined ? (
      <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-y-4">
        <p className="font-medium">CompuMethod Category: </p>
        {compuMethod.category ? (
          <CompuMethodCategoryChip category={compuMethod.category} />
        ) : (
          <p className="italic">not specified</p>
        )}
        {compactFunctionRepr !== undefined ? (
          <p className="font-medium">Mapping Function: </p>
        ) : (
          <></>
        )}
        {compactFunctionRepr !== undefined ? (
          <div className="border border-2 dark:border-green-300 border-green-600 rounded-sm">
            <KaTeXComponent
              className="p-2"
              texExpression={compactFunctionRepr}
            />
          </div>
        ) : (
          <></>
        )}
        {functionGraph !== undefined ? (
          compuMethod.category === 'TEXTTABLE' ? (
            <p className="font-medium">Mapping Table: </p>
          ) : (
            <p className="font-medium">Function Graph: </p>
          )
        ) : (
          <></>
        )}
        {functionGraph !== undefined ? (
          <div className="w-full">{functionGraph}</div>
        ) : (
          <></>
        )}
      </div>
    ) : (
      <></>
    )
  }

  const renderFunctionGraphOrMappingTable = (
    compuMethod: CompuMethod | undefined,
    diagCodedType: DiagCodedType | undefined,
    internalConstraint: InternalConstr | undefined
  ) => {
    const compuMethodData = getCompuMethodDataForRendering(
      compuMethod,
      diagCodedType,
      internalConstraint
    )

    if (compuMethodData !== undefined && compuMethod !== undefined) {
      if (compuMethod.category === 'TEXTTABLE') {
        // Visualize data in a table
        return renderMappingTable(compuMethodData)
      } else {
        // Visualize data in a line chart
        return renderFunctionGraph(compuMethodData)
      }
    } else {
      return undefined
    }
  }

  const renderMappingTable = (renderingData: CompuMethodRenderingData) => {
    return (
      <Table isStriped aria-label="CompuMethod TEXTTABLE Mapping Table">
        <TableHeader>
          <TableColumn>Internal Representation</TableColumn>
          <TableColumn>Physical Representation</TableColumn>
        </TableHeader>
        <TableBody>
          {renderingData.scales.map((entry, index) => (
            <TableRow key={index}>
              <TableCell width={150}>
                {entry.xValues.length > 0 ? (
                  entry.xValues.length == 2 ? (
                    `${entry.xValues[0]} - ${entry.xValues[1]}`
                  ) : (
                    entry.xValues[0]
                  )
                ) : (
                  <></>
                )}
              </TableCell>
              <TableCell>{entry.yValues[0]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  const renderFunctionGraph = (renderingData: CompuMethodRenderingData) => {
    if (
      renderingData !== undefined &&
      (renderingData.scales.length > 1 ||
        (renderingData.scales.length === 1 &&
          renderingData.scales[0] !== undefined &&
          renderingData.scales[0].xValues.length > 0 &&
          renderingData.scales[0].yValues.length > 0))
    ) {
      const options = {
        responsive: true,
        aspectRatio: 3,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Internal Value',
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Physical Value',
            },
          },
        },
      }

      const labels = renderingData.scales.flatMap((entry) => entry.xValues)

      const data = {
        labels,
        datasets: [
          {
            label: 'Internal-to-Physical',
            data: renderingData.scales.flatMap(
              (entry) => entry.yValues as number[]
            ),
            borderColor: 'rgba(104, 114, 253, 1)',
            backgroundColor: 'rgba(99, 255, 255, 0.5)',
          },
        ],
      }

      return <Line data={data} options={options} />
    } else {
      return undefined
    }
  }

  const renderInternalConstraint = (
    internalConstraint: InternalConstr,
    diagCodedType: DiagCodedType | undefined
  ) => {
    const renderingData = getInternalConstraintDataForRendering(
      internalConstraint,
      diagCodedType
    )

    const options = {
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
      },
      interaction: {
        intersect: false,
        axis: 'x' as const,
      },
      scales: {
        y: {
          min: 0,
          max: 1,
          ticks: {
            stepSize: 1,
          },
        },
      },
      responsive: true,
      aspectRatio: 3,
    }

    const labels = renderingData ? renderingData.labels : []
    const datasets = renderingData
      ? renderingData.constraints.flatMap((constraint) => {
          if (constraint.validity === undefined) {
            return []
          }

          switch (constraint.validity) {
            case 'VALID':
              return {
                stepped: true,
                fill: true,
                label: 'VALID',
                data: constraint.data,
                borderColor: 'rgba(151, 253, 104, 1)',
                backgroundColor: 'rgba(99, 255, 187, 0.5)',
              }
            case 'NOT-VALID':
              return {
                stepped: true,
                fill: true,
                label: 'NOT-VALID',
                data: constraint.data,
                borderColor: 'rgba(253, 104, 104, 1)',
                backgroundColor: 'rgba(255, 99, 99, 0.5)',
              }
            case 'NOT-AVAILABLE':
              return {
                stepped: true,
                fill: true,
                label: 'NOT-AVAILABLE',
                data: constraint.data,
                borderColor: 'rgba(26, 39, 213, 1)',
                backgroundColor: 'rgba(16, 29, 198, 0.5)',
              }
            case 'NOT-DEFINED':
              return {
                stepped: true,
                fill: true,
                label: 'NOT-DEFINED',
                data: constraint.data,
                borderColor: 'rgba(120, 120, 120, 1)',
                backgroundColor: 'rgba(100, 100, 100, 0.5)',
              }
          }
        })
      : []

    const data = {
      labels,
      datasets,
    }

    return internalConstraint !== undefined ? (
      <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-y-4 mt-5">
        <p className="font-medium">Internal Constraints: </p>
        <div className="w-full">
          <Line data={data} options={options} />
        </div>
      </div>
    ) : (
      <></>
    )
  }

  const renderDop = React.useCallback(
    (dop: DopUnionType) => {
      return (
        <div>
          {dop &&
          (isDataObjectPropertyDop(dop) || isDtcDop(dop)) &&
          dop.compu_method ? (
            renderCompuMethod(
              dop.compu_method,
              dop.diag_coded_type,
              isDataObjectPropertyDop(dop) ? dop.internal_constr : undefined
            )
          ) : (
            <></>
          )}
          {dop && isDataObjectPropertyDop(dop) && dop.internal_constr ? (
            renderInternalConstraint(dop.internal_constr, dop.diag_coded_type)
          ) : (
            <></>
          )}
        </div>
      )
    },
    [dopData]
  )

  return dopData.dop ? renderDop(dopData.dop) : <></>
}
