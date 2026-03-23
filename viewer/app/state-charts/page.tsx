// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Accordion, AccordionItem } from '@heroui/accordion'
import { Card, CardBody } from '@heroui/card'
import { Link } from '@heroui/link'
import { CircularProgress } from '@heroui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import clsx from 'clsx'
import cytoscape from 'cytoscape'
import { useTheme } from 'next-themes'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import client, {
  ObjectMetadata,
  StateChart,
  StateChartMetaData,
  StateTransitionWithDiagCommRefs,
} from '@/api/api-hooks'
import {
  DefaultBreadcrumbs,
  getStateChart_Breadcrumbs,
  getStateChartsOfVariant_Breadcrumbs,
  stateChartStaticBreadcrumps,
} from '@/components/breadcrumps'
import { headline, subtitle, title } from '@/components/primitives'
import {
  ReferencingDiagComms,
  StateChartInVariants,
  StateChartOverviewComponent,
  StateChartVisualizationComponent,
} from '@/components/state-charts'
import {
  ResetPageSettingsButton,
  useSelectionWithIndexedDB,
} from '@/storage/settings'

export default function StateChartPage() {
  const pageId = 'stateCharts'

  const searchParams = useSearchParams()
  const objectIdQueryParam = searchParams.has('objectId')
    ? searchParams.get('objectId')
    : null
  const variantIdQueryParam = searchParams.has('variantId')
    ? searchParams.get('variantId')
    : null
  const containerIdQueryParam = searchParams.has('containerId')
    ? searchParams.get('containerId')
    : null

  const objectId = objectIdQueryParam !== null ? objectIdQueryParam : undefined
  const variantId =
    variantIdQueryParam !== null ? variantIdQueryParam : undefined
  const containerId =
    containerIdQueryParam !== null ? containerIdQueryParam : undefined

  const [containerData, setContainerData] = React.useState<ObjectMetadata>()
  const [variantData, setVariantData] = React.useState<ObjectMetadata>()
  const [stateChartData, setStateChartData] = React.useState<StateChart>()
  const [metaData, setMetaData] = React.useState<StateChartMetaData>()
  const [referencingTransitions, setReferencingTransitions] =
    React.useState<StateTransitionWithDiagCommRefs[]>()
  const cyRef = 'cy'
  const theme = useTheme()
  var graph = cytoscape()

  React.useEffect(() => {
    const fetchMetaData = async () => {
      if (containerId) {
        const containerResult = await client.GET(
          '/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}',
          {
            params: {
              path: {
                'diag-data-set-id': containerId ? containerId : 'unresolved',
                'perma-id': containerId ? containerId : 'unresolved',
              },
            },
          }
        )

        if (containerResult.data && !containerResult.error) {
          setContainerData(containerResult.data)
        }
      }

      if (variantId) {
        const variantResult = await client.GET(
          '/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}',
          {
            params: {
              path: {
                'diag-data-set-id': containerId ? containerId : 'unresolved',
                'perma-id': variantId ? variantId : 'unresolved',
              },
              query: { resolve_main_diag_layer: false },
            },
          }
        )

        if (variantResult.data && !variantResult.error) {
          setVariantData(variantResult.data)
        }
      }

      if (objectId) {
        const stateResult = await client.GET(
          '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/state-charts/{state-chart-perma-id}',
          {
            params: {
              path: {
                'diag-data-set-id': containerId ? containerId : 'unresolved',
                'variant-perma-id': variantId ? variantId : 'unresolved',
                'state-chart-perma-id': objectId ? objectId : 'unresolved',
              },
            },
          }
        )

        if (stateResult.data && !stateResult.error) {
          setStateChartData(stateResult.data.state_chart)
          setReferencingTransitions(stateResult.data.referencing_transitions)
          setMetaData(stateResult.data.meta_data)
        }
      }
    }

    fetchMetaData()
  }, [containerId, variantId, objectId])

  React.useEffect(() => {
    if (typeof window === 'undefined') return // SSR guard
    const node = document.getElementById(cyRef)

    if (!node) return

    if (
      stateChartData &&
      stateChartData.state_transitions &&
      stateChartData.state_transitions.length > 0
    ) {
      graph = StateChartVisualizationComponent(
        stateChartData.state_transitions,
        theme,
        cyRef
      )
      var text_and_line_color = theme.theme === 'dark' ? 'white' : 'black'

      graph.elements(`node[id = "${stateChartData.start_state_snref}"]`).style({
        'border-style': 'double',
        'border-color': text_and_line_color,
        'border-width': 3,
        'background-color': '#0066ff',
      })
    }

    return () => {
      graph.destroy()
    }
  }, [theme, stateChartData])

  const itemClasses = {
    title: clsx(
      subtitle({ class: 'mt-4' }),
      'text-start',
      'text-black dark:text-white'
    ),
    content: 'min-w-4xl',
    base: 'dark:bg-gray-800 bg-gray-50',
  }

  const [selectedKeys, setSelectedKeys] = useSelectionWithIndexedDB(
    pageId,
    'accordion-selectedKeys',
    new Set(['state chart', 'metadata'])
  )

  return objectId ? (
    stateChartData !== undefined ? (
      <div>
        <DefaultBreadcrumbs
          breadcrumbs={getStateChart_Breadcrumbs({
            odxd_shortName: containerData?.short_name
              ? containerData.short_name
              : '',
            odxd_objectId: containerId ? containerId : '',
            isLastBreadcrumbSegment: true,
            variant_shortName: variantData?.short_name
              ? variantData.short_name
              : '',
            variant_objectId: variantId ? variantId : '',
            state_chart_id: objectId,
            state_chart_shortName: stateChartData.short_name
              ? stateChartData.short_name
              : '',
          })}
        />
        <h1 className={title()}>State Chart</h1>
        <p className="mt-4" />
        <h2 className={headline()}>{stateChartData.short_name}</h2>

        <ResetPageSettingsButton page={pageId} />

        <Accordion
          keepContentMounted
          className="min-w-4xl pt-5"
          itemClasses={itemClasses}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          variant="splitted"
          onSelectionChange={setSelectedKeys}
        >
          <AccordionItem
            key="state chart"
            aria-label="State Chart"
            title="State Chart"
          >
            <div
              className="bg-content1 items-center w-full h-196 rounded-xl"
              id={cyRef}
            />
          </AccordionItem>
          <AccordionItem key="metadata" aria-label="Metadata" title="Metadata">
            <Table hideHeader isStriped aria-label="Metadata">
              <TableHeader>
                <TableColumn width={200}>KEY</TableColumn>
                <TableColumn>VALUE</TableColumn>
              </TableHeader>
              <TableBody>
                <TableRow key="short_name">
                  <TableCell className="font-bold">Short Name</TableCell>
                  <TableCell>{stateChartData.short_name}</TableCell>
                </TableRow>
                <TableRow key="long_name">
                  <TableCell className="font-bold">Long Name</TableCell>
                  <TableCell>{stateChartData.long_name}</TableCell>
                </TableRow>
                {metaData?.origin_layer ? (
                  <TableRow key="origin_layer">
                    <TableCell className="font-bold">Origin Layer</TableCell>
                    <TableCell>
                      <div>
                        <Link
                          href={`/diagnostic-variant?objectId=${metaData.origin_layer.perma_id}&containerId=${containerId}`}
                        >
                          {metaData.origin_layer.short_name}
                        </Link>
                        <p className="text-small">
                          ({metaData.origin_layer.variant_type})
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {metaData?.diagnostic_data_set_ref ? (
                  <TableRow key="container">
                    <TableCell className="font-bold">Container</TableCell>
                    <TableCell>
                      <Link
                        href={`/odx-d?objectId=${metaData.diagnostic_data_set_ref.perma_id}`}
                      >
                        {metaData.diagnostic_data_set_ref.file_name}
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {metaData?.referencing_variants ? (
                  <TableRow key="used_in_variants">
                    <TableCell className="font-bold">
                      Used in Variants
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[400] gap-2 grid grid-cols-2">
                        {metaData.referencing_variants?.map(
                          (variant, index) => (
                            <Card key={index}>
                              <CardBody>
                                <Link
                                  href={`/diagnostic-variant?objectId=${variant.perma_id}&containerId=${metaData.diagnostic_data_set_ref?.perma_id}`}
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
                  </TableRow>
                ) : (
                  <></>
                )}
              </TableBody>
            </Table>
          </AccordionItem>
          <AccordionItem key="states" aria-label="States" title="States">
            <Table isStriped aria-label="States">
              <TableHeader>
                <TableColumn>STATE</TableColumn>
                <TableColumn>START STATE</TableColumn>
              </TableHeader>
              <TableBody items={stateChartData.states}>
                {(item) =>
                  item.short_name == stateChartData.start_state_snref ? (
                    <TableRow
                      key={item.short_name}
                      style={{
                        outline: '2px solid #0066ff',
                        borderRadius: '5px',
                      }}
                    >
                      <TableCell>{item.short_name}</TableCell>
                      <TableCell>
                        {item.short_name == stateChartData.start_state_snref
                          ? 'Yes'
                          : ''}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={item.short_name}>
                      <TableCell>{item.short_name}</TableCell>
                      <TableCell>
                        {item.short_name == stateChartData.start_state_snref
                          ? 'Yes'
                          : ''}
                      </TableCell>
                    </TableRow>
                  )
                }
              </TableBody>
            </Table>
          </AccordionItem>
          <AccordionItem
            key="state transitions"
            aria-label="States Transitions"
            title="States Transitions"
          >
            <Table isStriped aria-label="Precondition States">
              <TableHeader>
                <TableColumn>SOURCE STATE</TableColumn>
                <TableColumn>TARGET STATE</TableColumn>
                <TableColumn>REFERENCING DIAG-COMMS</TableColumn>
              </TableHeader>
              <TableBody items={stateChartData.state_transitions}>
                {(item) => (
                  <TableRow key={item.short_name}>
                    <TableCell>{item.source_snref}</TableCell>
                    <TableCell>{item.target_snref}</TableCell>
                    {item.perma_id &&
                    referencingTransitions &&
                    containerId &&
                    variantId ? (
                      ReferencingDiagComms(
                        item.perma_id,
                        referencingTransitions,
                        Number(containerId),
                        variantId
                      )
                    ) : (
                      <TableCell> </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AccordionItem>
        </Accordion>
      </div>
    ) : (
      <CircularProgress aria-label="Loading..." />
    )
  ) : variantId && containerId ? (
    <div>
      <DefaultBreadcrumbs
        breadcrumbs={getStateChartsOfVariant_Breadcrumbs({
          odxd_shortName: containerData?.short_name
            ? containerData.short_name
            : '',
          odxd_objectId: containerId ? containerId : '',
          isLastBreadcrumbSegment: true,
          variant_shortName: variantData?.short_name
            ? variantData.short_name
            : '',
          variant_objectId: variantId,
        })}
      />
      <h1 className={title()}>State Charts</h1>
      <p className="mt-4" />
      <h2 className={clsx(headline(), 'text-start')}>
        List of all State Charts in Variant{' '}
        <Link
          href={`/diagnostic-variant?objectId=${variantId}&containerId=${containerId}`}
        >
          <strong>{variantData?.long_name}</strong>
        </Link>
      </h2>
      <StateChartInVariants containerId={containerId} variantId={variantId} />
    </div>
  ) : (
    <div>
      <DefaultBreadcrumbs breadcrumbs={[...stateChartStaticBreadcrumps]} />

      <h1 className={title()}>State Charts</h1>
      <p className="mt-4" />
      <h2 className={clsx(headline(), 'text-start')}>
        List of all State Charts of all loaded ODX-Ds
      </h2>
      <p className="mb-5" />
      <StateChartOverviewComponent />
    </div>
  )
}
