// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Protocol } from '@/api/api-hooks'
import { DiagnosticCommTargetObjectIds } from '@/types/index'

export function ProtocolsComponent({
  protocols,
  targetObjectIds,
}: {
  protocols: Protocol[]
  targetObjectIds: DiagnosticCommTargetObjectIds
}) {
  return (
    <div>
      <ul>
        {protocols.map((entry, index) => (
          <li key={index}>
            <p>{entry.diag_layer_raw?.short_name}: </p>
            <p>{entry.perma_id}</p>
            <p>{entry.ephemeral_id}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
