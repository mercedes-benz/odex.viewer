// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Accordion, AccordionItem } from '@heroui/accordion'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import client, { DiagnosticVariant, ObjectMetadata } from '@/api/api-hooks'
import {
  DefaultBreadcrumbs,
  diagVariantStaticBreadcrumps,
  getDiagnosticVariant_Breadcrumps,
} from '@/components/breadcrumps'
import { DiagComms } from '@/components/diag-comms'
import {
  DiagnosticVariantMetadata,
  VariantsOverviewComponent,
} from '@/components/diag-variants'
import { DopsVariantComponent } from '@/components/dops'
import { DtcsVariantComponent } from '@/components/dtcs'
import { headline, subtitle, title } from '@/components/primitives'
import { SpecialDataGroupsComponent } from '@/components/specialdatagroups'
import { StateChartInVariants } from '@/components/state-charts'
import {
  ResetPageSettingsButton,
  useSelectionWithIndexedDB,
} from '@/storage/settings'

export default function DiagnosticVariantPage() {
  const pageId = 'diagnostic-variant'

  const searchParams = useSearchParams()
  const objectIdQueryParam = searchParams.has('objectId')
    ? searchParams.get('objectId')
    : null
  const containerIdQueryParam = searchParams.has('containerId')
    ? searchParams.get('containerId')
    : null

  const objectId = objectIdQueryParam !== null ? objectIdQueryParam : undefined
  const containerId =
    containerIdQueryParam !== null ? containerIdQueryParam : undefined

  const [containerData, setContainerData] = React.useState<ObjectMetadata>()
  const [variantData, setVariantData] = React.useState<DiagnosticVariant>()

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
        '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}',
        {
          params: {
            path: {
              'diag-data-set-id': containerId ? containerId : 'unresolved',
              'variant-perma-id': objectId ? objectId : 'unresolved',
            },
          },
        }
      )

      if (variantResult.data && !variantResult.error) {
        setVariantData(variantResult.data)
      }
    }

    if (containerId && objectId) {
      fetchMetaData()
    }
  }, [containerId, objectId])

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
    new Set(['diagComm'])
  )

  return objectId && variantData ? (
    <div>
      <DefaultBreadcrumbs
        breadcrumbs={getDiagnosticVariant_Breadcrumps({
          odxd_shortName: containerData?.short_name
            ? containerData.short_name
            : '',
          odxd_objectId: containerId ? containerId : 'unresolved',
          isLastBreadcrumbSegment: true,
          variant_shortName: variantData?.short_name
            ? variantData.short_name
            : '',
          variant_objectId: objectId,
        })}
      />

      <h1 className={title()}>Diagnostic Variant</h1>
      <p className="mt-4" />
      <h2 className={headline()}>{variantData.short_name}</h2>

      <ResetPageSettingsButton page={pageId} />

      <div className="min-w-4xl pt-5">
        <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
          Metadata
        </div>
        <DiagnosticVariantMetadata
          containerId={containerId ? containerId : 'unresolved'}
          objectId={objectId}
          variantData={variantData}
        />
      </div>
      <Accordion
        className="min-w-4xl pt-5"
        itemClasses={itemClasses}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        variant="splitted"
        onSelectionChange={setSelectedKeys}
      >
        {variantData.sdgs && variantData.sdgs.length > 0 ? (
          <AccordionItem
            key="sdgs"
            aria-label="Special Data Groups"
            title="Special Data Groups"
          >
            <SpecialDataGroupsComponent
              pageId={pageId}
              sdgs={variantData.sdgs}
            />
          </AccordionItem>
        ) : (
          <></>
        )}
        <AccordionItem
          key="diagComm"
          aria-label="Diagnostic Communications"
          title="Diagnostic Communications"
        >
          <DiagComms
            containerId={containerId ? containerId : 'unresolved'}
            objectId={objectId}
            pageId={pageId}
          />
        </AccordionItem>
        <AccordionItem
          key="dtcs"
          aria-label="Diagnostic Trouble Codes"
          title="Diagnostic Trouble Codes"
        >
          <DtcsVariantComponent
            containerId={containerId ? containerId : 'unresolved'}
            pageId={pageId}
            variantId={objectId}
          />
        </AccordionItem>
        <AccordionItem
          key="dops"
          aria-label="Data Object Properties"
          title="Data Object Properties"
        >
          <DopsVariantComponent
            containerId={containerId ? containerId : 'unresolved'}
            pageId={pageId}
            variantId={objectId}
          />
        </AccordionItem>
        <AccordionItem
          key="state-charts"
          aria-label="State Charts"
          title="State Charts"
        >
          <StateChartInVariants
            containerId={containerId ? containerId : 'unresolved'}
            variantId={objectId}
          />
        </AccordionItem>
      </Accordion>
    </div>
  ) : (
    <div>
      <DefaultBreadcrumbs breadcrumbs={[...diagVariantStaticBreadcrumps]} />

      <div className="mb-5">
        <ResetPageSettingsButton page={pageId} />
      </div>

      <VariantsOverviewComponent pageId={pageId} />
    </div>
  )
}
