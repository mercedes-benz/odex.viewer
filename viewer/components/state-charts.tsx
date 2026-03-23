// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import cytoscape from 'cytoscape'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Selection,
} from '@heroui/table'
import { Link } from '@heroui/link'
import { CircularProgress } from '@heroui/progress'
import { UseThemeProps } from 'next-themes'
import React from 'react'
import { Card, CardBody } from '@heroui/card'
import { useAsyncList } from '@react-stately/data'

import ApiError from './api-error'
import { TableFilterObjectCollectionWithExtractorFuncDropdown } from './custom-dropdowns'

import {
  StateTransition,
  useQuery,
  StateTransitionWithDiagCommRefs,
  StateChartWithMetaData,
  StateChartWithMetaDataCollection,
} from '@/api/api-hooks'
import { sortItemsByNestedSortDescriptor } from '@/utils/utils'

export function StateChartOverviewComponent() {
  const {
    data: data_collection,
    error: error,
    isLoading: isLoading,
  } = useQuery('/state-charts', {}, { keepPreviousData: true })

  const [selectedUsedInVariants, setSelectedUsedInVariants] =
    React.useState<Selection>(new Set([]))
  const selectedUsedInVariantValues = React.useMemo(() => {
    let arr = Array.from(selectedUsedInVariants)

    return arr
  }, [selectedUsedInVariants])
  const [selectedContainers, setSelectedContainers] = React.useState<Selection>(
    new Set([])
  )
  const selectedContainerValues = React.useMemo(() => {
    let arr = Array.from(selectedContainers)

    return arr
  }, [selectedContainers])

  const [variantMap, setVariantMap] = React.useState<Map<string, string>>(
    new Map<string, string>()
  )

  const [containerMap, setContainerMap] = React.useState<Map<string, string>>(
    new Map<string, string>()
  )

  const chartCollection = useAsyncList({
    async load() {
      return {
        items:
          data_collection && data_collection.items
            ? data_collection.items
                .map((entry): StateChartWithMetaData | undefined => {
                  return entry
                })
                .flat()
                .filter((value) => value !== undefined)
                .sort((a, b) =>
                  sortItemsByNestedSortDescriptor<StateChartWithMetaData>(
                    a,
                    b,
                    {
                      column: 'state_chart.short_name',
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
          sortItemsByNestedSortDescriptor<StateChartWithMetaData>(
            a,
            b,
            sortDescriptor
          )
        ),
      }
    },
  })

  React.useEffect(() => {
    if (data_collection !== undefined) {
      chartCollection.reload()
    }

    if (data_collection && data_collection.items.length > 0) {
      resolveVariantMappings(data_collection)
    }
  }, [data_collection])

  const filteredItems = React.useMemo(() => {
    let filteredCollectionItems = [...chartCollection.items]

    if (selectedUsedInVariantValues && selectedUsedInVariantValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter((item) =>
        item.meta_data?.referencing_variants
          ? item.meta_data.referencing_variants.some((item) =>
              item.perma_id
                ? selectedUsedInVariantValues.includes(item.perma_id)
                : false
            )
          : false
      )
    }

    if (selectedContainerValues && selectedContainerValues.length > 0) {
      filteredCollectionItems = filteredCollectionItems.filter((item) =>
        item.meta_data?.diagnostic_data_set_ref?.perma_id
          ? selectedContainerValues.includes(
              item.meta_data.diagnostic_data_set_ref.perma_id
            )
          : undefined
      )
    }

    return filteredCollectionItems
  }, [chartCollection, selectedUsedInVariantValues])

  if (isLoading || !data_collection)
    return <CircularProgress aria-label="Loading..." />
  if (error) return <ApiError error={error} />

  const resolveVariantMappings = (
    sc_collection: StateChartWithMetaDataCollection
  ) => {
    if (sc_collection) {
      const mappingVariantResult = new Map<string, string>(variantMap)
      const mappingContainerResult = new Map<string, string>(containerMap)

      for (var chart of sc_collection.items) {
        chart.meta_data?.referencing_variants?.forEach((variant) =>
          variant && variant.perma_id && variant.short_name
            ? mappingVariantResult.set(variant.perma_id, variant.short_name)
            : undefined
        )
        if (
          chart.meta_data?.diagnostic_data_set_ref?.perma_id &&
          chart.meta_data.diagnostic_data_set_ref.file_name
        ) {
          mappingContainerResult.set(
            chart.meta_data.diagnostic_data_set_ref.perma_id,
            chart.meta_data.diagnostic_data_set_ref.file_name
          )
        }
      }
      setVariantMap(mappingVariantResult)
      setContainerMap(mappingContainerResult)
    }
  }

  const filterVariants = (
    <TableFilterObjectCollectionWithExtractorFuncDropdown<StateChartWithMetaData>
      filterItems={chartCollection}
      filterLabel="USED_IN_VARIANTS"
      filterValueExtractorFunc={(obj) =>
        obj.meta_data?.referencing_variants
          ? obj.meta_data.referencing_variants.map((value) =>
              value.perma_id ? value.perma_id.toString() : ''
            )
          : undefined
      }
      idLabelMappings={variantMap}
      selectedFilters={selectedUsedInVariants}
      selectedFiltersHandler={setSelectedUsedInVariants}
    />
  )

  const filterContainer = (
    <TableFilterObjectCollectionWithExtractorFuncDropdown<StateChartWithMetaData>
      filterItems={chartCollection}
      filterLabel="CONTAINER"
      filterValueExtractorFunc={(obj) =>
        obj.meta_data?.diagnostic_data_set_ref?.perma_id
          ? [obj.meta_data.diagnostic_data_set_ref.perma_id]
          : []
      }
      idLabelMappings={containerMap}
      selectedFilters={selectedContainers}
      selectedFiltersHandler={setSelectedContainers}
    />
  )

  return (
    <div>
      <Table
        isHeaderSticky
        isStriped
        aria-label="State chart table"
        sortDescriptor={chartCollection.sortDescriptor}
        onSortChange={chartCollection.sort}
      >
        <TableHeader>
          <TableColumn key="state_chart.short_name" allowsSorting={true}>
            STATE CHART
          </TableColumn>
          <TableColumn
            key="meta_data.database_ref.short_name"
            allowsSorting={true}
          >
            CONTAINER <span className="ml-2">{filterContainer}</span>
          </TableColumn>
          <TableColumn key="meta_data.referencing_variants">
            USED IN VARIANT <span className="ml-2">{filterVariants}</span>
          </TableColumn>
          <TableColumn
            key="meta_data.origin_layer.short_name"
            allowsSorting={true}
          >
            ORIGIN LAYER
          </TableColumn>
        </TableHeader>
        <TableBody items={filteredItems}>
          {(item) => (
            <TableRow key={item.state_chart?.ephemeral_id}>
              <TableCell>
                <Link
                  href={`/state-charts?objectId=${item.state_chart?.perma_id}&variantId=${item.meta_data?.origin_layer?.perma_id}&containerId=${item.meta_data?.diagnostic_data_set_ref?.perma_id}`}
                >
                  {item.state_chart?.short_name}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/odx-d?objectId=${item.meta_data?.diagnostic_data_set_ref?.perma_id}`}
                >
                  {item.meta_data?.diagnostic_data_set_ref?.file_name}
                </Link>
              </TableCell>
              <TableCell>
                <div className="min-w-[400] gap-2 grid grid-cols-2">
                  {item.meta_data?.referencing_variants?.map(
                    (variant, index) => (
                      <Card key={index}>
                        <CardBody>
                          <Link
                            href={`/diagnostic-variant?objectId=${variant.perma_id}&containerId=${item.meta_data?.diagnostic_data_set_ref?.perma_id}`}
                          >
                            {variant.short_name}
                          </Link>
                          <span className="text-small">
                            ({variant.variant_type})
                          </span>
                        </CardBody>
                      </Card>
                    )
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <Link
                    href={`/diagnostic-variant?objectId=${item.meta_data?.origin_layer?.perma_id}&containerId=${item.meta_data?.diagnostic_data_set_ref?.perma_id}`}
                  >
                    {item.meta_data?.origin_layer?.short_name}
                  </Link>
                  <p className="text-small">
                    ({item.meta_data?.origin_layer?.variant_type})
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function StateChartVisualizationComponent(
  state_transitions: StateTransition[],
  theme: UseThemeProps,
  cyRef: string
) {
  var elements: { data: { id: string } }[] = []

  for (var st of state_transitions) {
    if (st.target_snref === st.source_snref) {
      continue
    }
    var target = {
      data: {
        id: st.target_snref ? st.target_snref : '',
      },
    }
    var source = {
      data: {
        id: st.source_snref ? st.source_snref : '',
      },
    }
    var source_to_target = {
      data: {
        id: st.source_snref
          ? st.source_snref?.concat(
              st.target_snref ? st.target_snref?.toString() : ''
            )
          : '',
        source: st.source_snref,
        target: st.target_snref,
      },
    }

    if (!elements.includes(target)) {
      elements.push(target)
    }
    if (!elements.includes(source)) {
      elements.push(source)
    }
    elements.push(source_to_target)
  }
  var text_and_line_color = theme.theme === 'dark' ? 'white' : 'black'
  const cy = cytoscape({
    container: document.getElementById(cyRef),
    elements: elements,
    style: [
      // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          width: 120,
          height: 60,
          'background-color': 'rgba(255, 79, 52, 1)',
          color: text_and_line_color,
          label: 'data(id)',
          'text-valign': 'center',
          'text-halign': 'center',
          'border-width': 0,
        },
      },

      {
        selector: 'edge',
        style: {
          width: 3,
          'line-color': text_and_line_color,
          'target-arrow-color': text_and_line_color,
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
        },
      },
    ],

    layout: {
      name: 'concentric',
      fit: true,
      padding: 15,
      avoidOverlap: true,
      minNodeSpacing: 150,
    },
  })

  return cy
}

export function ReferencingDiagComms(
  state_transition_ref: string,
  state_transitions_with_refs: StateTransitionWithDiagCommRefs[],
  containerId: number,
  variantId: string
) {
  const diag_comm_refs = state_transitions_with_refs.find(
    (e) => e.state_transition_ref == state_transition_ref
  )?.diag_comms

  return (
    <TableCell>
      {diag_comm_refs
        ? diag_comm_refs.map((comm, index) => (
            <React.Fragment key={index}>
              <Link
                href={`/diagnostic-comm?objectId=${comm?.perma_id}&variantId=${variantId}&containerId=${containerId}`}
              >
                {comm.short_name}
              </Link>
              {', '}
            </React.Fragment>
          ))
        : ''}
    </TableCell>
  )
}

export function StateChartInVariants({
  variantId,
  containerId,
}: {
  variantId: string
  containerId: string
}) {
  const {
    data: data_collection,
    error,
    isLoading,
  } = useQuery(
    '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/state-charts',
    {
      params: {
        path: {
          'diag-data-set-id': containerId,
          'variant-perma-id': variantId,
        },
      },
    }
  )

  if (isLoading || !data_collection)
    return <CircularProgress aria-label="Loading..." />
  if (error) return <ApiError error={error} />

  return (
    <div>
      <Table isStriped aria-label="State Charts">
        <TableHeader>
          <TableColumn>STATE CHARTS</TableColumn>
        </TableHeader>
        <TableBody items={data_collection?.items}>
          {(item) => (
            <TableRow key={item.short_name}>
              <TableCell>
                <Link
                  href={`/state-charts?objectId=${item.perma_id}&variantId=${variantId}&containerId=${containerId}`}
                >
                  {item.short_name}
                </Link>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
