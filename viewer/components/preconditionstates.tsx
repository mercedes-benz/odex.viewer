// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import { Link } from '@heroui/link'

import { State, StateChart } from '@/api/api-hooks'
import { DiagnosticCommTargetObjectIds } from '@/types/index'

export function PreConditionStatesComponent({
  stateCharts,
  preConditionStates,
  targetObjectIds,
}: {
  stateCharts: StateChart[]
  preConditionStates: State[]
  targetObjectIds: DiagnosticCommTargetObjectIds
}) {
  const stateDict: Record<string, StateChart> = {}

  for (var s of stateCharts) {
    if (s.states) {
      for (var state of preConditionStates) {
        if (
          s.states.some((e) => e.short_name === state.short_name) &&
          state.perma_id
        ) {
          stateDict[state.perma_id] = s
        }
      }
    }
  }

  return (
    <div>
      <Table isStriped aria-label="Precondition States">
        <TableHeader>
          <TableColumn width={150}>STATE CHART</TableColumn>
          <TableColumn>STATE</TableColumn>
        </TableHeader>
        <TableBody items={preConditionStates}>
          {(item) => (
            <TableRow key={item.ephemeral_id}>
              <TableCell className="font-bold" width={150}>
                <Link
                  href={`/state-charts?objectId=${item.perma_id ? stateDict[item.perma_id]?.perma_id : '.'}&variantId=${targetObjectIds.variantId}&containerId=${targetObjectIds.containerId}`}
                >
                  {item.perma_id ? stateDict[item.perma_id]?.long_name : '-'}
                </Link>
              </TableCell>
              <TableCell>{item.short_name}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
