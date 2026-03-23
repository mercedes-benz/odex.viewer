// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Accordion, AccordionItem } from '@heroui/accordion'
import { CircularProgress } from '@heroui/progress'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import client, {
  DiagCommDetails,
  isDiagService,
  isSingleEcuJob,
  ObjectMetadata,
  StateChart,
} from '@/api/api-hooks'
import { AudienceComponent } from '@/components/audience'
import {
  DefaultBreadcrumbs,
  diagCommStaticBreadcrumps,
  getDiagnosticComm_Breadcrumps,
} from '@/components/breadcrumps'
import { ComparamInstancesComponent } from '@/components/comparaminstances'
import {
  DiagCommMetadata,
  DiagCommsOverviewComponent,
} from '@/components/diag-comms'
import { PreConditionStatesComponent } from '@/components/preconditionstates'
import { headline, subtitle, title } from '@/components/primitives'
import { ProtocolsComponent } from '@/components/protocols'
import { RelatedDiagCommsComponent } from '@/components/relateddiagcomms'
import { RequestComponent } from '@/components/request'
import {
  NegResponsesComponent,
  PosResponsesComponent,
  PosResponseSuppressibleComponent,
} from '@/components/responses'
import {
  InputParametersComponent,
  NegativeOutputParametersComponent,
  OutputParametersComponent,
  ProgramCodesComponent,
} from '@/components/singleecujobs'
import { SpecialDataGroupsComponent } from '@/components/specialdatagroups'
import { StateTransitionsComponent } from '@/components/statetransitions'
import {
  ResetPageSettingsButton,
  useSelectionWithIndexedDB,
} from '@/storage/settings'
import { DiagnosticCommTargetObjectIds } from '@/types/index'

export default function DiagnosticCommPage() {
  const pageId = 'diagnostic-comm'

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
  const [diagCommData, setDiagCommData] = React.useState<DiagCommDetails>()
  const [stateChartData, setStateChartData] = React.useState<StateChart[]>()

  const [targetObjectIds, setTargetObjectIds] =
    React.useState<DiagnosticCommTargetObjectIds>({
      containerId: 'unresolved',
      variantId: 'unresolved',
      diagCommId: 'unresolved',
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

      const commResult = await client.GET(
        '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}',
        {
          params: {
            path: {
              'diag-data-set-id': containerId ? containerId : 'unresolved',
              'variant-perma-id': variantId ? variantId : 'unresolved',
              'diag-comm-perma-id': objectId ? objectId : 'unresolved',
            },
          },
        }
      )

      if (commResult.data && !commResult.error) {
        setDiagCommData(commResult.data)
        if (
          (commResult.data.pre_condition_states &&
            commResult.data.pre_condition_states.length > 0) ||
          (commResult.data.state_transitions &&
            commResult.data.state_transitions.length > 0)
        ) {
          const stateResult = await client.GET(
            '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/state-charts',
            {
              params: {
                path: {
                  'diag-data-set-id': containerId ? containerId : 'unresolved',
                  'variant-perma-id': variantId ? variantId : 'unresolved',
                },
              },
            }
          )

          if (stateResult.data && !stateResult.error) {
            setStateChartData(stateResult.data.items)
          }
        }
      }
    }

    if (containerId && variantId && objectId) {
      setTargetObjectIds({
        containerId: containerId ? containerId : 'unresolved',
        variantId: variantId ? variantId : 'unresolved',
        diagCommId: objectId ? objectId : 'unresolved',
      })

      fetchMetaData()
    }
  }, [containerId, variantId, objectId])

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
    new Set(['metadata', 'request', 'posResponses'])
  )

  return objectId ? (
    diagCommData !== undefined ? (
      <div>
        <DefaultBreadcrumbs
          breadcrumbs={getDiagnosticComm_Breadcrumps({
            odxd_shortName: containerData?.short_name
              ? containerData.short_name
              : '',
            odxd_objectId: containerId ? containerId : '',
            isLastBreadcrumbSegment: true,
            variant_shortName: variantData?.short_name
              ? variantData.short_name
              : '',
            variant_objectId: variantId ? variantId : 'unresolved',
            diagComm_shortName: diagCommData?.short_name
              ? diagCommData.short_name
              : '',
            diagComm_objectId: objectId,
          })}
        />

        <h1 className={title()}>Diagnostic Communication</h1>
        <p className="mt-4" />
        <h2 className={headline()}>{diagCommData.short_name}</h2>

        <ResetPageSettingsButton page={pageId} />

        <Accordion
          className="min-w-4xl pt-5"
          itemClasses={itemClasses}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          variant="splitted"
          onSelectionChange={setSelectedKeys}
        >
          <AccordionItem key="metadata" aria-label="Metadata" title="Metadata">
            <DiagCommMetadata
              containerId={targetObjectIds.containerId}
              diagCommData={diagCommData}
            />
          </AccordionItem>
          {diagCommData.sdgs && diagCommData.sdgs.length > 0 ? (
            <AccordionItem
              key="sdgs"
              aria-label="Special Data Groups"
              title="Special Data Groups"
            >
              <SpecialDataGroupsComponent
                pageId={pageId}
                sdgs={diagCommData.sdgs}
              />
            </AccordionItem>
          ) : (
            <></>
          )}

          {isSingleEcuJob(diagCommData) &&
          diagCommData.prog_codes &&
          diagCommData.prog_codes.length > 0 ? (
            <AccordionItem
              key="progCodes"
              aria-label="Program Codes"
              title="Program Codes"
            >
              <ProgramCodesComponent
                progCodes={diagCommData.prog_codes}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {isDiagService(diagCommData) && diagCommData.request ? (
            <AccordionItem key="request" aria-label="Request" title="Request">
              <RequestComponent
                pageId={pageId}
                request={diagCommData.request}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {isSingleEcuJob(diagCommData) &&
          diagCommData.input_params &&
          diagCommData.input_params.length > 0 ? (
            <AccordionItem
              key="inputParams"
              aria-label="Input Parameters"
              title="Input Parameters"
            >
              <InputParametersComponent
                params={diagCommData.input_params}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {isDiagService(diagCommData) &&
          diagCommData.positive_responses &&
          diagCommData.positive_responses.length > 0 ? (
            <AccordionItem
              key="posResponses"
              aria-label="Positive Responses"
              title="Positive Responses"
            >
              <PosResponsesComponent
                pageId={pageId}
                posResponses={diagCommData.positive_responses}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {isSingleEcuJob(diagCommData) &&
          diagCommData.output_params &&
          diagCommData.output_params.length > 0 ? (
            <AccordionItem
              key="outputParams"
              aria-label="Output Parameters"
              title="Output Parameters"
            >
              <OutputParametersComponent
                params={diagCommData.output_params}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {isSingleEcuJob(diagCommData) &&
          diagCommData.neg_output_params &&
          diagCommData.neg_output_params.length > 0 ? (
            <AccordionItem
              key="negOutParams"
              aria-label="Negative Output Parameters"
              title="Negative Output Parameters"
            >
              <NegativeOutputParametersComponent
                params={diagCommData.neg_output_params}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {isDiagService(diagCommData) &&
          diagCommData.pos_response_suppressible ? (
            <AccordionItem
              key="posResponses"
              aria-label="Positive Response Suppressible"
              title="Positive Response Suppressible"
            >
              <PosResponseSuppressibleComponent
                posRspSup={diagCommData.pos_response_suppressible}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {isDiagService(diagCommData) &&
          diagCommData.negative_responses &&
          diagCommData.negative_responses.length > 0 ? (
            <AccordionItem
              key="negResponses"
              aria-label="Negative Responses"
              title="Negative Responses"
            >
              <NegResponsesComponent
                negResponses={diagCommData.negative_responses}
                pageId={pageId}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {isDiagService(diagCommData) &&
          diagCommData.comparams &&
          diagCommData.comparams.length > 0 ? (
            <AccordionItem
              key="commParams"
              aria-label="Communication Parameters"
              title="Communication Parameters"
            >
              <ComparamInstancesComponent
                comparams={diagCommData.comparams}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {diagCommData.audience ? (
            <AccordionItem
              key="audiences"
              aria-label="Audiences"
              title="Audiences"
            >
              <AudienceComponent
                audienceEphemeralId={
                  diagCommData.audience
                    ? diagCommData.audience.ephemeral_id
                    : undefined
                }
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {diagCommData.pre_condition_states &&
          diagCommData.pre_condition_states.length > 0 &&
          stateChartData &&
          stateChartData.length > 0 ? (
            <AccordionItem
              key="preConditionStateRefs"
              aria-label="Pre-Condition States"
              title="Pre-Condition States"
            >
              <PreConditionStatesComponent
                preConditionStates={diagCommData.pre_condition_states}
                stateCharts={stateChartData}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {diagCommData.state_transitions &&
          diagCommData.state_transitions.length > 0 &&
          stateChartData &&
          stateChartData.length > 0 ? (
            <AccordionItem
              key="stateTransitions"
              aria-label="State Transitions"
              title="State Transitions"
            >
              <StateTransitionsComponent
                stateCharts={stateChartData}
                stateTransitions={diagCommData.state_transitions}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {diagCommData.protocols && diagCommData.protocols.length > 0 ? (
            <AccordionItem
              key="protocols"
              aria-label="Protocols"
              title="Protocols"
            >
              <ProtocolsComponent
                protocols={diagCommData.protocols}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
          {diagCommData.related_diag_comm_refs &&
          diagCommData.related_diag_comm_refs.length > 0 ? (
            <AccordionItem
              key="relatedDiagComms"
              aria-label="Related Diagnostic Communications"
              title="Related Diagnostic Communications"
            >
              <RelatedDiagCommsComponent
                relDiagCommRefs={diagCommData.related_diag_comm_refs}
                targetObjectIds={targetObjectIds}
              />
            </AccordionItem>
          ) : (
            <></>
          )}
        </Accordion>
      </div>
    ) : (
      <CircularProgress aria-label="Loading..." />
    )
  ) : (
    <div>
      <DefaultBreadcrumbs breadcrumbs={[...diagCommStaticBreadcrumps]} />

      <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
        List of all Diagnostic Communications of all loaded ODX-Ds
      </div>

      <div className="mb-5">
        <ResetPageSettingsButton page={pageId} />
      </div>

      <DiagCommsOverviewComponent pageId={pageId} />
    </div>
  )
}
