// SPDX-License-Identifier: AGPL-3.0-only
'use client'

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
import { useSearchParams } from 'next/navigation'
import React from 'react'

import client, {
  DopUnionTypeWithLayerInfo,
  ObjectMetadata,
  UnitResolved,
  isDataObjectPropertyDop,
  isDtcDop,
  isDynamicEndmarkerFieldDop,
  isDynamicLengthFieldDop,
  isEndOfPduFieldDop,
  isEnvironmentDataDescriptionDop,
  isEnvironmentDataDop,
  isMultiplexerDop,
  isStaticFieldDop,
  isStructureDop,
} from '@/api/api-hooks'
import {
  DefaultBreadcrumbs,
  dataObjectPropertyStaticBreadcrumps,
  getDataObjectProp_Breadcrumps,
} from '@/components/breadcrumps'
import {
  CaseComponent,
  CompuMethodComponent,
  DetermineNumberOfItemsComponent,
  DiagCodedTypeComponent,
  DynamicEndDopComponent,
  InternalConstraintComponent,
  PhysicalTypeComponent,
  SwitchKeyComponent,
  UnitComponent,
} from '@/components/commons'
import {
  DataObjectPropsOverviewComponent,
  DopCompactSummaryComponent,
  DopMetadataComponent,
} from '@/components/dops'
import { ParametersComponent } from '@/components/parameters'
import {
  headline,
  subtitle,
  subtitleWithSize,
  title,
} from '@/components/primitives'
import { SpecialDataGroupsComponent } from '@/components/specialdatagroups'
import { ResetPageSettingsButton } from '@/storage/settings'
import { DataObjectPropTargetObjectIds } from '@/types/index'

export default function DopsPage() {
  const pageId = 'dops'

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
  const [dopData, setDopData] = React.useState<DopUnionTypeWithLayerInfo>()

  const [unitData, setUnitData] = React.useState<UnitResolved>()

  const [targetObjectIds, setTargetObjectIds] =
    React.useState<DataObjectPropTargetObjectIds>({
      containerId: 'unresolved',
      variantId: 'unresolved',
      dopId: 'unresolved',
    })

  React.useEffect(() => {
    const fetchMetaData = async () => {
      const containerResult = await client.GET(
        '/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}',
        {
          params: {
            path: {
              'diag-data-set-id': containerId ? containerId : 'unresolved',
              'perma-id': containerId ? containerId : 'unresolved',
            },
            query: { resolve_main_diag_layer: false },
          },
        }
      )

      if (containerResult.data && !containerResult.error) {
        setContainerData(containerResult.data)
      }

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

      const dopResult = await client.GET(
        '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/dops/{dop-perma-id}',
        {
          params: {
            path: {
              'diag-data-set-id': containerId ? containerId : 'unresolved',
              'variant-perma-id': variantId ? variantId : 'unresolved',
              'dop-perma-id': objectId ? objectId : 'unresolved',
            },
          },
        }
      )

      if (dopResult.data && !dopResult.error) {
        setDopData(dopResult.data)
      }
    }

    const fetchChildData = async () => {
      if (
        dopData !== undefined &&
        dopData.dop !== undefined &&
        isDataObjectPropertyDop(dopData.dop) &&
        dopData.dop.unit_ref !== undefined
      ) {
        const unitResult = await client.GET(
          '/structured-data/{schema-name}/{ephemeral-id}',
          {
            params: {
              path: {
                'schema-name': 'UnitResolved',
                'ephemeral-id':
                  dopData.dop.unit_ref &&
                  dopData.dop.unit_ref.resolved_object_ephemeral_id
                    ? dopData.dop.unit_ref.resolved_object_ephemeral_id
                    : 0,
              },
            },
          }
        )

        if (unitResult.data && !unitResult.error) {
          setUnitData(unitResult.data as UnitResolved)
        }
      }
    }

    if (containerId && variantId && objectId) {
      setTargetObjectIds({
        containerId: containerId ? containerId : 'unresolved',
        variantId: variantId ? variantId : 'unresolved',
        dopId: objectId ? objectId : 'unresolved',
      })

      fetchMetaData()
      fetchChildData()
    }
  }, [containerId, variantId, objectId])

  return objectId ? (
    dopData !== undefined ? (
      <div>
        <DefaultBreadcrumbs
          breadcrumbs={getDataObjectProp_Breadcrumps({
            odxd_shortName: containerData?.short_name
              ? containerData.short_name
              : '',
            odxd_objectId: containerId ? containerId : '',
            isLastBreadcrumbSegment: true,
            variant_shortName: variantData?.short_name
              ? variantData.short_name
              : '',
            variant_objectId: variantId ? variantId : 'unresolved',
            dop_shortName: dopData.dop?.short_name
              ? dopData.dop.short_name
              : '',
            dop_objectId: objectId,
          })}
        />
        <h1 className={title()}>Data Object Property</h1>
        <p className="mt-4" />
        <h2 className={headline()}>{dopData.dop?.short_name}</h2>

        <ResetPageSettingsButton page={pageId} />

        <div className="min-w-4xl pt-5">
          <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
            Metadata
          </div>
          <DopMetadataComponent
            dopData={dopData}
            targetObjectIds={targetObjectIds}
          />
        </div>
        {dopData.dop &&
        (isDataObjectPropertyDop(dopData.dop) || isDtcDop(dopData.dop)) ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Compact Summary
            </div>
            <DopCompactSummaryComponent dopData={dopData} />
          </div>
        ) : (
          <></>
        )}
        {dopData.dop?.sdgs && dopData.dop.sdgs.length > 0 ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Special Data Groups
            </div>
            <SpecialDataGroupsComponent
              pageId={pageId}
              sdgs={dopData.dop.sdgs}
              showExpandAllButton={true}
            />
          </div>
        ) : (
          <></>
        )}
        {dopData.dop &&
        isDataObjectPropertyDop(dopData.dop) &&
        dopData.dop.unit_ref ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Unit
            </div>
            <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
              <UnitComponent
                unit={unitData ? unitData : dopData.dop.unit_ref}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
        {dopData.dop &&
        (isDataObjectPropertyDop(dopData.dop) || isDtcDop(dopData.dop)) &&
        dopData.dop.physical_type ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Physical Type
            </div>
            <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
              <PhysicalTypeComponent
                layout={'Page'}
                physicalType={dopData.dop.physical_type}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
        {dopData.dop &&
        (isDataObjectPropertyDop(dopData.dop) || isDtcDop(dopData.dop)) &&
        dopData.dop.diag_coded_type ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Diag Coded Type
            </div>
            <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
              <DiagCodedTypeComponent
                diagCodedType={dopData.dop.diag_coded_type}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
        {dopData.dop &&
        isDataObjectPropertyDop(dopData.dop) &&
        dopData.dop.internal_constr ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Internal Constraint
            </div>
            <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
              <InternalConstraintComponent
                constraint={dopData.dop.internal_constr}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
        {dopData.dop &&
        isDataObjectPropertyDop(dopData.dop) &&
        dopData.dop.physical_constr ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Physical Constraint
            </div>
            <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
              <InternalConstraintComponent
                constraint={dopData.dop.physical_constr}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
        {dopData.dop &&
        (isDataObjectPropertyDop(dopData.dop) || isDtcDop(dopData.dop)) &&
        dopData.dop.compu_method ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Compu Method
            </div>
            <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
              <CompuMethodComponent compuMethod={dopData.dop.compu_method} />
            </div>
          </div>
        ) : (
          <></>
        )}
        {dopData.dop &&
        isMultiplexerDop(dopData.dop) &&
        dopData.dop.switch_key ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Switch Key
            </div>
            <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
              <SwitchKeyComponent
                containerId={containerId}
                switch_key={dopData.dop.switch_key}
                variantId={variantId}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
        {dopData.dop &&
        isMultiplexerDop(dopData.dop) &&
        dopData.dop.default_case ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Default Case
            </div>
            <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
              <CaseComponent
                containerId={containerId}
                multiplexer_case={dopData.dop.default_case}
                variantId={variantId}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
        {dopData.dop &&
        isMultiplexerDop(dopData.dop) &&
        dopData.dop.cases &&
        dopData.dop.cases.length > 0 ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Cases
            </div>
            <div>
              {dopData.dop.cases.map((entry) => (
                <div
                  key={entry.ephemeral_id}
                  className="border border-2 rounded-md p-2 mb-2 dark:border-neutral-400 border-neutral-400"
                >
                  <CaseComponent
                    containerId={containerId}
                    multiplexer_case={entry}
                    variantId={variantId}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}
        {dopData.dop &&
        isDynamicEndmarkerFieldDop(dopData.dop) &&
        dopData.dop.dyn_end_dop_ref ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Dynamic End DOP
            </div>
            <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
              <DynamicEndDopComponent
                dyn_end_dop_ref={dopData.dop.dyn_end_dop_ref}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
        {dopData.dop &&
        isDynamicLengthFieldDop(dopData.dop) &&
        dopData.dop.determine_number_of_items ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Determine Number of Items
            </div>
            <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
              <DetermineNumberOfItemsComponent
                determine_number_of_items={
                  dopData.dop.determine_number_of_items
                }
              />
            </div>
          </div>
        ) : (
          <></>
        )}

        {dopData.dop &&
        (isStructureDop(dopData.dop) || isEnvironmentDataDop(dopData.dop)) ? (
          <div className="pt-5 pb-2">
            <div className="text-start">
              <div className={subtitleWithSize({ size: 'md' })}>Parameters</div>
            </div>
            {dopData.dop.parameters ? (
              <ParametersComponent
                pageId={pageId}
                parentObject={dopData.dop}
                targetObjectIds={targetObjectIds}
              />
            ) : (
              <div className="pt-4 place-self-start">
                <span>No PARAMETERs specified</span>
              </div>
            )}
          </div>
        ) : (
          <></>
        )}

        {dopData.dop &&
        (isDtcDop(dopData.dop) ||
          isMultiplexerDop(dopData.dop) ||
          isStructureDop(dopData.dop) ||
          isStaticFieldDop(dopData.dop) ||
          isDynamicEndmarkerFieldDop(dopData.dop) ||
          isDynamicLengthFieldDop(dopData.dop) ||
          isEndOfPduFieldDop(dopData.dop) ||
          isEnvironmentDataDescriptionDop(dopData.dop) ||
          isEnvironmentDataDop(dopData.dop)) ? (
          <div className="min-w-4xl pt-5">
            <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
              Additional Type-specific Properties
            </div>
            <Table
              hideHeader
              isStriped
              aria-label="Further DOP properties table"
            >
              <TableHeader>
                <TableColumn width="150">KEY</TableColumn>
                <TableColumn>VALUE</TableColumn>
              </TableHeader>
              <TableBody>
                {dopData.dop &&
                (isDtcDop(dopData.dop) ||
                  isMultiplexerDop(dopData.dop) ||
                  isStructureDop(dopData.dop) ||
                  isStaticFieldDop(dopData.dop) ||
                  isDynamicEndmarkerFieldDop(dopData.dop) ||
                  isDynamicLengthFieldDop(dopData.dop) ||
                  isEndOfPduFieldDop(dopData.dop)) &&
                dopData.dop.is_visible !== undefined ? (
                  <TableRow key="is_visible">
                    <TableCell className="font-bold" width="200">
                      Is visible
                    </TableCell>
                    <TableCell>
                      <p>{dopData.dop.is_visible.toString()}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                isEnvironmentDataDescriptionDop(dopData.dop) &&
                dopData.dop.param_snref !== undefined ? (
                  <TableRow key="param_snref">
                    <TableCell className="font-bold" width="200">
                      Parameter Reference
                    </TableCell>
                    <TableCell>
                      <p>{dopData.dop.param_snref.toString()}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                isEnvironmentDataDescriptionDop(dopData.dop) &&
                dopData.dop.param_snpathref !== undefined ? (
                  <TableRow key="param_snpathref">
                    <TableCell className="font-bold" width="200">
                      Parameter Path Reference
                    </TableCell>
                    <TableCell>
                      <p>{dopData.dop.param_snpathref.toString()}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                isMultiplexerDop(dopData.dop) &&
                dopData.dop.byte_position !== undefined ? (
                  <TableRow key="byte_position">
                    <TableCell className="font-bold" width="200">
                      Byte Position
                    </TableCell>
                    <TableCell>
                      <p>{dopData.dop.byte_position.toString()}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                (isEnvironmentDataDop(dopData.dop) ||
                  isStructureDop(dopData.dop)) &&
                dopData.dop.byte_size !== undefined ? (
                  <TableRow key="byte_size">
                    <TableCell className="font-bold" width="200">
                      Byte Size
                    </TableCell>
                    <TableCell>
                      <p>{dopData.dop.byte_size.toString()}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                isEnvironmentDataDop(dopData.dop) &&
                dopData.dop.all_value !== undefined ? (
                  <TableRow key="all_value">
                    <TableCell className="font-bold" width="200">
                      All Value
                    </TableCell>
                    <TableCell>
                      <p>{dopData.dop.all_value.toString()}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                isEnvironmentDataDop(dopData.dop) &&
                dopData.dop.dtc_values ? (
                  <TableRow key="dtc_values">
                    <TableCell className="font-bold" width="200">
                      DTC Values
                    </TableCell>
                    <TableCell>
                      <p>{dopData.dop.dtc_values.toString()}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                (isStaticFieldDop(dopData.dop) ||
                  isDynamicEndmarkerFieldDop(dopData.dop) ||
                  isDynamicLengthFieldDop(dopData.dop) ||
                  isEndOfPduFieldDop(dopData.dop)) &&
                dopData.dop.structure_ref ? (
                  <TableRow key="structure_ref">
                    <TableCell className="font-bold" width="200">
                      Structure Reference
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dops?objectId=${dopData.dop.structure_ref.resolved_object_perma_id}&variantId=${variantId}&containerId=${containerId}`}
                      >
                        {dopData.dop.structure_ref.resolved_object_short_name}
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                (isStaticFieldDop(dopData.dop) ||
                  isDynamicEndmarkerFieldDop(dopData.dop) ||
                  isDynamicLengthFieldDop(dopData.dop) ||
                  isEndOfPduFieldDop(dopData.dop)) &&
                dopData.dop.env_data_desc_ref ? (
                  <TableRow key="env_data_desc_ref">
                    <TableCell className="font-bold" width="200">
                      Env Data Description Reference
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dops?objectId=${dopData.dop.env_data_desc_ref.resolved_object_perma_id}&variantId=${variantId}&containerId=${containerId}`}
                      >
                        {
                          dopData.dop.env_data_desc_ref
                            .resolved_object_short_name
                        }
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                isStaticFieldDop(dopData.dop) &&
                dopData.dop.fixed_number_of_items ? (
                  <TableRow key="fixed_number_of_items">
                    <TableCell className="font-bold" width="200">
                      Fixed Number of Items
                    </TableCell>
                    <TableCell>{dopData.dop.fixed_number_of_items}</TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                isStaticFieldDop(dopData.dop) &&
                dopData.dop.item_byte_size ? (
                  <TableRow key="item_byte_size">
                    <TableCell className="font-bold" width="200">
                      Item by Size
                    </TableCell>
                    <TableCell>{dopData.dop.item_byte_size}</TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                isDynamicLengthFieldDop(dopData.dop) &&
                dopData.dop.offset ? (
                  <TableRow key="offset">
                    <TableCell className="font-bold" width="200">
                      Offset
                    </TableCell>
                    <TableCell>{dopData.dop.offset}</TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                isEndOfPduFieldDop(dopData.dop) &&
                dopData.dop.min_number_of_items ? (
                  <TableRow key="min_number_of_items">
                    <TableCell className="font-bold" width="200">
                      Min Number of Items
                    </TableCell>
                    <TableCell>{dopData.dop.min_number_of_items}</TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
                {dopData.dop &&
                isEndOfPduFieldDop(dopData.dop) &&
                dopData.dop.max_number_of_items ? (
                  <TableRow key="max_number_of_items">
                    <TableCell className="font-bold" width="200">
                      Max Number of Items
                    </TableCell>
                    <TableCell>{dopData.dop.max_number_of_items}</TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <></>
        )}
      </div>
    ) : (
      <CircularProgress aria-label="Loading..." />
    )
  ) : (
    <div>
      <DefaultBreadcrumbs
        breadcrumbs={[...dataObjectPropertyStaticBreadcrumps]}
      />

      <div className="mb-5">
        <ResetPageSettingsButton page={pageId} />
      </div>

      <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
        List of all Data Object Properties of all loaded ODX-Ds
      </div>

      <DataObjectPropsOverviewComponent pageId={pageId} />
    </div>
  )
}
