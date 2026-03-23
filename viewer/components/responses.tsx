// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import React from 'react'
import { Tabs, Tab } from '@heroui/tabs'

import { Response, PosResponseSuppressible } from '@/api/api-hooks'
import { DiagnosticCommTargetObjectIds } from '@/types/index'
import { CommonRequestResponseComponent } from '@/components/commons'

export function PosResponsesComponent({
  posResponses,
  targetObjectIds,
  pageId,
}: {
  posResponses: Response[]
  targetObjectIds: DiagnosticCommTargetObjectIds
  pageId: string
}) {
  return posResponses.length > 0 ? (
    <div className="flex w-full flex-col">
      <Tabs
        aria-label="Positive Responses"
        items={posResponses}
        variant="solid"
      >
        {(item: Response) => (
          <Tab key={item.ephemeral_id} title={item.short_name}>
            <CommonRequestResponseComponent
              pageId={pageId}
              reqResponse={item}
              targetObjectIds={targetObjectIds}
            />
          </Tab>
        )}
      </Tabs>
    </div>
  ) : (
    <div className="pt-4 place-self-start">
      <span>No POS-RESPONSEs specified</span>
    </div>
  )
}

export function PosResponseSuppressibleComponent({
  posRspSup,
  targetObjectIds,
}: {
  posRspSup: PosResponseSuppressible
  targetObjectIds: DiagnosticCommTargetObjectIds
}) {
  // TODO: Handle PosResponseSuppressible data of DiagComms (ODX-Type: POS-RESPONSE-SUPPRESSABLE)
  return (
    <div>
      <p>{posRspSup.perma_id}: </p>
      <p>{posRspSup.value_snref}</p>
    </div>
  )
}

export function NegResponsesComponent({
  negResponses,
  targetObjectIds,
  pageId,
}: {
  negResponses: Response[]
  targetObjectIds: DiagnosticCommTargetObjectIds
  pageId: string
}) {
  return negResponses.length > 0 ? (
    <div className="flex w-full flex-col">
      <Tabs
        aria-label="Negative Responses"
        items={negResponses}
        variant="solid"
      >
        {(item: Response) => (
          <Tab key={item.ephemeral_id} title={item.short_name}>
            <CommonRequestResponseComponent
              pageId={pageId}
              reqResponse={item}
              targetObjectIds={targetObjectIds}
            />
          </Tab>
        )}
      </Tabs>
    </div>
  ) : (
    <div className="pt-4 place-self-start">
      <span>No NEG-RESPONSEs specified</span>
    </div>
  )
}
