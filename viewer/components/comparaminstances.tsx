// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { ComparamInstance } from '@/api/api-hooks'
import { DiagnosticCommTargetObjectIds } from '@/types/index'

export function ComparamInstancesComponent({
  comparams,
  targetObjectIds,
}: {
  comparams: ComparamInstance[]
  targetObjectIds: DiagnosticCommTargetObjectIds
}) {
  return (
    <div>
      <ul>
        {comparams.map((entry, index) => (
          <li key={index}>
            <p>{entry.ephemeral_id}: </p>
            <p>{entry.perma_id}: </p>
            <p>{entry.value?.toString()}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
