// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import {
  ProgCode,
  InputParam,
  OutputParam,
  NegOutputParam,
} from '@/api/api-hooks'
import { ProgCodeComponent } from '@/components/commons'
import { DiagnosticCommTargetObjectIds } from '@/types/index'

export function ProgramCodesComponent({
  progCodes,
  targetObjectIds,
}: {
  progCodes: ProgCode[]
  targetObjectIds: DiagnosticCommTargetObjectIds
}) {
  return (
    <div>
      <ul>
        {progCodes.map((entry, index) => (
          <ProgCodeComponent key={index} progCode={entry} />
        ))}
      </ul>
    </div>
  )
}

export function InputParametersComponent({
  params,
  targetObjectIds,
}: {
  params: InputParam[]
  targetObjectIds: DiagnosticCommTargetObjectIds
}) {
  return (
    <div>
      <ul>
        {params.map((entry, index) => (
          <li key={index}>
            <p>{entry.short_name}: </p>
            <p>{entry.perma_id}</p>
            <p>{entry.ephemeral_id}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function OutputParametersComponent({
  params,
  targetObjectIds,
}: {
  params: OutputParam[]
  targetObjectIds: DiagnosticCommTargetObjectIds
}) {
  return (
    <div>
      <ul>
        {params.map((entry, index) => (
          <li key={index}>
            <p>{entry.short_name}: </p>
            <p>{entry.perma_id}</p>
            <p>{entry.ephemeral_id}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function NegativeOutputParametersComponent({
  params,
  targetObjectIds,
}: {
  params: NegOutputParam[]
  targetObjectIds: DiagnosticCommTargetObjectIds
}) {
  return (
    <div>
      <ul>
        {params.map((entry, index) => (
          <li key={index}>
            <p>{entry.short_name}: </p>
            <p>{entry.perma_id}</p>
            <p>{entry.ephemeral_id}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
