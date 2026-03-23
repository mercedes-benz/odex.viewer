// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import React from 'react'

import { Request } from '@/api/api-hooks'
import { CommonRequestResponseComponent } from '@/components/commons'
import { DiagnosticCommTargetObjectIds } from '@/types/index'

export function RequestComponent({
  request,
  targetObjectIds,
  pageId,
}: {
  request: Request
  targetObjectIds: DiagnosticCommTargetObjectIds
  pageId: string
}) {
  return (
    <CommonRequestResponseComponent
      pageId={pageId}
      reqResponse={request}
      targetObjectIds={targetObjectIds}
    />
  )
}
