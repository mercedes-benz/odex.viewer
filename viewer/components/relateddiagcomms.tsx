// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { RelatedDiagCommRef } from '@/api/api-hooks'
import { DiagnosticCommTargetObjectIds } from '@/types/index'

export function RelatedDiagCommsComponent({
  relDiagCommRefs,
}: {
  relDiagCommRefs: RelatedDiagCommRef[]
  targetObjectIds: DiagnosticCommTargetObjectIds
}) {
  return (
    <div>
      <ul>
        {relDiagCommRefs.map((entry, index) => (
          <li key={index}>
            <p>{entry.resolved_object_perma_id}: </p>
            <p>{entry.resolved_object_ephemeral_id}: </p>
            <p>{entry.resolved_object_short_name}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
