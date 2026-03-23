// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Link } from '@heroui/link'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import parse from 'html-react-parser'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Divider } from '@heroui/divider'
import { CircularProgress } from '@heroui/progress'
import { getKeyValue, Selection } from '@heroui/table'
import { useAsyncList } from '@react-stately/data'
import React from 'react'

import { cleanupHtmlContent } from '@/utils/utils'
import { VariantTypeChip } from '@/components/commons'
import { DiagnosticVariant } from '@/api/api-hooks'
import client, {
  DiagnosticDataSetDescriptor,
  useQuery,
  VariantIdentificationPattern,
} from '@/api/api-hooks'
import ApiError from '@/components/api-error'
import { LinkButton } from '@/components/commons'
import {
  TableColumnDropdown,
  TableFilterDropdown,
} from '@/components/custom-dropdowns'
import { subtitle } from '@/components/primitives'
import { ColumnDefinition } from '@/types/index'
import {
  getHexRepresentation,
  isNumber,
  sortItemsBySortDescriptor,
} from '@/utils/utils'
import { useSelectionWithIndexedDB } from '@/storage/settings'

export function DiagnosticVariantMetadata({
  objectId,
  containerId,
  variantData,
}: {
  objectId: string
  containerId: string
  variantData: DiagnosticVariant
}) {
  return variantData ? (
    <Table hideHeader isStriped aria-label="Diagnostic variant metadata table">
      <TableHeader>
        <TableColumn width="150">KEY</TableColumn>
        <TableColumn>VALUE</TableColumn>
      </TableHeader>
      <TableBody>
        <TableRow key="short_name">
          <TableCell width="150">Short Name</TableCell>
          <TableCell>{variantData.short_name}</TableCell>
        </TableRow>
        <TableRow key="long_name">
          <TableCell width="150">Long Name</TableCell>
          <TableCell>{variantData.long_name}</TableCell>
        </TableRow>
        {variantData.description ? (
          <TableRow key="description">
            <TableCell width="150">Description</TableCell>
            <TableCell>
              {variantData.description
                ? parse(cleanupHtmlContent(variantData.description))
                : ''}
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        <TableRow key="revision">
          <TableCell width="150">Revision</TableCell>
          <TableCell>
            <Link
              href={`/revision/details?objectId=${objectId}&revisionLabel=${variantData.revision}&containerId=${containerId}`}
            >
              {variantData.revision}
            </Link>
          </TableCell>
        </TableRow>
        {variantData ? (
          <>
            <TableRow key="variant_type">
              <TableCell width="150">Variant Type</TableCell>
              <TableCell>
                <div className="flex align-center gap-2">
                  <VariantTypeChip variantType={variantData.variant_type} />
                </div>
              </TableCell>
            </TableRow>
            <TableRow key="identification_patterns">
              <TableCell width="200">Identification Patterns</TableCell>
              <TableCell>
                <div className="flex align-center gap-2">
                  {variantData.variant_patterns?.map((patternEntry, index) => (
                    <VariantIdentificationPatternComponent
                      key={index}
                      index={index}
                      patternEntry={patternEntry}
                    />
                  ))}
                </div>
              </TableCell>
            </TableRow>
            <TableRow key="parent_ref">
              <TableCell width="150">Parent references</TableCell>
              <TableCell>
                <div className="flex align-center gap-2">
                  <ul>
                    {variantData.parent_refs?.map((parent_ref, index) =>
                      variantData.variant_type === 'ECU-VARIANT' ? (
                        <li key={`parent-ref-${index}`}>
                          <Link
                            href={`/diagnostic-variant?objectId=${parent_ref.layer_ref?.resolved_object_perma_id}&containerId=${containerId}`}
                          >
                            {parent_ref.layer_ref?.resolved_object_short_name}
                          </Link>
                        </li>
                      ) : (
                        <li key={`parent-ref-${index}`}>
                          <p>
                            {parent_ref.layer_ref?.resolved_object_short_name}
                          </p>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </TableCell>
            </TableRow>
          </>
        ) : (
          <></>
        )}
      </TableBody>
    </Table>
  ) : null
}

export function DiagnosticVariantsComponent({
  objectId,
}: {
  objectId: string
}) {
  const [selectedSNames, setSelectedSNames] = React.useState<Selection>(
    new Set([])
  )
  const [selectedVariants, setSelectedVariants] = React.useState<Selection>(
    new Set([])
  )
  const selectedSNameValue = React.useMemo(() => {
    let arr = Array.from(selectedSNames)

    return arr
  }, [selectedSNames])

  const selectedVariantValue = React.useMemo(() => {
    let arr = Array.from(selectedVariants)

    return arr
  }, [selectedVariants])

  const {
    data: data_variants,
    error: error_variants,
    isLoading: isLoading_variants,
  } = useQuery('/diagnostic-data-sets/{diag-data-set-id}/variants', {
    params: {
      path: { 'diag-data-set-id': objectId ? objectId : 'unresolved' },
    },
  })

  let list = useAsyncList({
    async load() {
      return {
        items: data_variants ? data_variants.items : [],
      }
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) =>
          sortItemsBySortDescriptor<DiagnosticVariant>(a, b, sortDescriptor)
        ),
      }
    },
  })

  const columns: ColumnDefinition[] = [
    {
      key: 'short_name',
      label: 'SHORT NAME',
      filter: (
        <TableFilterDropdown<DiagnosticVariant>
          filterItems={list}
          filterKey="short_name"
          filterLabel="SHORT NAME"
          selectedFilters={selectedSNames}
          selectedFiltersHandler={setSelectedSNames}
        />
      ),
    },
    {
      key: 'variant_type',
      label: 'VARIANT TYPE',
      filter: (
        <TableFilterDropdown<DiagnosticVariant>
          filterItems={list}
          filterKey="variant_type"
          filterLabel="VARIANT TYPE"
          selectedFilters={selectedVariants}
          selectedFiltersHandler={setSelectedVariants}
        />
      ),
    },
    {
      key: 'revision',
      label: 'REVISION',
    },
    {
      key: 'actions',
      label: 'ACTIONS',
    },
  ]

  React.useEffect(() => {
    if (data_variants) {
      // If you want the list to update whenever data changes, reload it.
      list.reload()
    }
  }, [data_variants])

  if (isLoading_variants) return <CircularProgress aria-label="Loading..." />
  // Only display API error, if an objectId is given
  if (objectId) {
    if (error_variants) return <ApiError error={error_variants} />
  }

  return (
    <div className="flex table-auto justify-end gap-10">
      <Table
        isHeaderSticky
        isStriped
        aria-label="Diagnostic variants table"
        sortDescriptor={list.sortDescriptor}
        onSortChange={list.sort}
      >
        <TableHeader columns={columns}>
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
        {!list.items || error_variants ? (
          <TableBody emptyContent={'No rows to display.'}>{[]}</TableBody>
        ) : (
          <TableBody
            items={list.items.filter((it) => {
              return (
                (selectedSNameValue.includes(it.short_name) ||
                  selectedSNameValue.length == 0) &&
                (selectedVariantValue.includes(it.variant_type || '') ||
                  selectedVariantValue.length == 0)
              )
            })}
          >
            {(item) => (
              <TableRow key={item.short_name}>
                {(columnKey) => (
                  <TableCell>
                    {columnKey === 'actions' ? (
                      <div className="flex space-x-2">
                        <LinkButton
                          href={`/diagnostic-variant?objectId=${item.perma_id}&containerId=${objectId}`}
                          label="Show Variant"
                        />
                      </div>
                    ) : columnKey === 'revision' ? (
                      item.revision !== undefined ? (
                        <div className="flex align-center gap-2">
                          <Link
                            href={`/revision/details?objectId=${item.perma_id}&revisionLabel=${item.revision}&containerId=${objectId}`}
                          >
                            {getKeyValue(item, columnKey)}
                          </Link>
                          <LinkButton
                            href={`/revision?objectId=${item.perma_id}&containerId=${objectId}`}
                            label="Show History"
                          />
                        </div>
                      ) : (
                        <p className="text-medium italic">
                          no revision history
                        </p>
                      )
                    ) : columnKey === 'short_name' ? (
                      <div className="flex align-center gap-2">
                        <Link
                          href={`/diagnostic-variant?objectId=${item.perma_id}&containerId=${objectId}`}
                        >
                          {getKeyValue(item, columnKey)}
                        </Link>
                      </div>
                    ) : columnKey === 'variant_type' ? (
                      <div className="flex align-center gap-2">
                        <VariantTypeChip
                          variantType={getKeyValue(item, columnKey)}
                        />
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

type VariantsWithDatasetInfo = {
  dataSetId: string
  variants: DiagnosticVariant[] | undefined
}
type CombinedVariantDatasetType = { ds_perma_id: string } & {
  [Property in keyof DiagnosticVariant as `var_${string & Property}`]: DiagnosticVariant[Property]
}

async function requestVariantsFromDatasets(
  dataSets: DiagnosticDataSetDescriptor[]
): Promise<VariantsWithDatasetInfo[]> {
  const respPromises = dataSets.map(async (dataSet) => {
    const result = await client.GET(
      '/diagnostic-data-sets/{diag-data-set-id}/variants',
      {
        params: {
          path: {
            'diag-data-set-id': dataSet.perma_id
              ? dataSet.perma_id
              : 'unresolved',
          },
        },
      }
    )

    return {
      dataSetId: dataSet.perma_id ? dataSet.perma_id : 'unresolved',
      variants: result.data?.items,
    }
  })

  return Promise.all(respPromises)
}

function resolveVariantsWithDatasetInfo(
  variantDataSetInfo: VariantsWithDatasetInfo[]
): CombinedVariantDatasetType[] {
  const result: CombinedVariantDatasetType[] = []

  for (let entry of variantDataSetInfo) {
    if (entry.variants) {
      for (let variant of entry.variants) {
        result.push({
          ds_perma_id: entry.dataSetId.toString(),
          var_perma_id: variant.perma_id,
          var_ephemeral_id: variant.ephemeral_id,
          var_description: variant.description,
          var_long_name: variant.long_name,
          var_parent_refs: variant.parent_refs,
          var_sdgs: variant.sdgs,
          var_short_name: variant.short_name,
          var_variant_type: variant.variant_type,
          var_revision: variant.revision,
          var_revision_ephemeral_id: variant.revision_ephemeral_id,
          var_variant_patterns: variant.variant_patterns,
        })
      }
    }
  }

  return result
}

export function VariantsOverviewComponent({ pageId }: { pageId: string }) {
  const {
    data: odx_datasets,
    error: error_datasets,
    isLoading: isLoading_datasets,
  } = useQuery('/diagnostic-data-sets/{data-type}', {
    params: { path: { 'data-type': 'PDX' } },
  })

  let list = useAsyncList({
    async load() {
      return {
        items: odx_datasets
          ? resolveVariantsWithDatasetInfo(
              await requestVariantsFromDatasets(odx_datasets.items)
            )
          : [],
      }
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) =>
          sortItemsBySortDescriptor<CombinedVariantDatasetType>(
            a,
            b,
            sortDescriptor
          )
        ),
      }
    },
  })

  const columns: ColumnDefinition[] = [
    { label: 'DATABASE OBJECT ID', key: 'db_objectId', sortable: true },
    { label: 'VARIANT OBJECT ID', key: 'var_object_id', sortable: true },
    {
      key: 'var_short_name',
      label: 'SHORT-NAME',
      sortable: true,
    },
    {
      key: 'var_variant_type',
      label: 'TYPE',
      sortable: true,
    },
    {
      key: 'var_revision',
      label: 'REVISION',
      sortable: true,
    },
    {
      key: 'var_variant_patterns',
      label: 'IDENTIFICATION PATTERNS',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'ACTIONS',
    },
  ]

  const INITIAL_VISIBLE_COLUMNS = new Set([
    'var_short_name',
    'var_variant_type',
    'var_revision',
    'actions',
  ])
  const [visibleColumns, setVisibleColumns] = useSelectionWithIndexedDB(
    pageId,
    'allVariants#table-visibleColumns',
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
          <div className={subtitle({ class: 'mt-4' })}>
            List of all Diagnostic Variants of all loaded ODX-Ds
          </div>
        </div>
        <div>
          <TableColumnDropdown
            columnList={columns}
            defaultVisibleColumns={INITIAL_VISIBLE_COLUMNS}
            tableName="diagVariants"
            visibleColumns={visibleColumns}
            visibleColumnsHandler={setVisibleColumns}
          />
        </div>
      </div>
    )
  }, [visibleColumns])

  React.useEffect(() => {
    if (odx_datasets) {
      // If you want the list to update whenever data changes, reload it.
      list.reload()
    }
  }, [odx_datasets])

  if (isLoading_datasets) return <CircularProgress aria-label="Loading..." />
  if (error_datasets) return <ApiError error={error_datasets} />

  return (
    <div className="flex table-auto">
      <Table
        isHeaderSticky
        isStriped
        aria-label="Diagnostic variants table"
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
        {!list.items || error_datasets ? (
          <TableBody emptyContent={'No rows to display.'}>{[]}</TableBody>
        ) : (
          <TableBody items={list.items}>
            {(item) => (
              <TableRow key={item.ds_perma_id + item.var_perma_id}>
                {(columnKey) => (
                  <TableCell>
                    {columnKey === 'actions' ? (
                      <div className="flex space-x-2">
                        <LinkButton
                          href={`/diagnostic-variant?objectId=${item.var_perma_id}&containerId=${item.ds_perma_id}`}
                          label="Show Variant"
                        />
                      </div>
                    ) : columnKey === 'var_short_name' ? (
                      <div className="flex align-center gap-2">
                        <Link
                          href={`/diagnostic-variant?objectId=${item.var_perma_id}&containerId=${item.ds_perma_id}`}
                        >
                          {getKeyValue(item, columnKey)}
                        </Link>
                      </div>
                    ) : columnKey === 'var_variant_type' ? (
                      <div className="flex align-center gap-2">
                        <VariantTypeChip
                          variantType={getKeyValue(item, columnKey)}
                        />
                      </div>
                    ) : columnKey === 'var_variant_patterns' ? (
                      <div className="flex align-center gap-2">
                        {item.var_variant_patterns?.map(
                          (patternEntry, index) => (
                            <VariantIdentificationPatternComponent
                              key={index}
                              index={index}
                              patternEntry={patternEntry}
                            />
                          )
                        )}
                      </div>
                    ) : columnKey === 'var_revision' ? (
                      item.var_revision !== undefined ? (
                        <div className="flex align-center gap-2">
                          <Link
                            href={`/revision/details?objectId=${item.var_perma_id}&revisionLabel=${item.var_revision}&containerId=${item.ds_perma_id}`}
                          >
                            {getKeyValue(item, columnKey)}
                          </Link>
                          <LinkButton
                            href={`/revision?objectId=${item.var_perma_id}&containerId=${item.ds_perma_id}`}
                            label="Show History"
                          />
                        </div>
                      ) : (
                        <p className="text-medium italic">
                          no revision history
                        </p>
                      )
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

export function VariantIdentificationPatternComponent({
  patternEntry,
  index,
}: {
  index: number
  patternEntry: VariantIdentificationPattern
}) {
  return (
    <Card key={index} className="max-w-[400px]">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md">Pattern #{index + 1}</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        {patternEntry.map((entry, index) => {
          const uid = entry.diag_comm_obj_id
            ? entry.diag_comm_obj_id
            : '' + entry.param_obj_id
              ? entry.param_obj_id
              : '' + index

          return (
            <div key={uid} className="flex flex-col gap-1">
              <p className="font-bold">Diagnostic Service: </p>
              <p>{entry.diag_comm_short_name}</p>
              <p className="font-bold">Parameter: </p>
              <p>{entry.param_short_name}</p>
              <p className="font-bold">Expected Value: </p>
              <p>
                {entry.expected_value
                  ? `${entry.expected_value} ${
                      isNumber(entry.expected_value.toString())
                        ? `(${getHexRepresentation(entry.expected_value)})`
                        : ''
                    }`
                  : ''}
              </p>
              {index < patternEntry.length - 1 ? (
                <Divider className="mt-2 mb-2" />
              ) : null}
            </div>
          )
        })}
      </CardBody>
    </Card>
  )
}
