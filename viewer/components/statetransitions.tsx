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
import React from 'react'
import { useTheme } from 'next-themes'
import cytoscape from 'cytoscape'

import { StateChartVisualizationComponent } from './state-charts'

import { StateTransition, StateChart } from '@/api/api-hooks'
import { DiagnosticCommTargetObjectIds } from '@/types/index'

export function StateTransitionsComponent({
  stateCharts,
  stateTransitions,
  targetObjectIds,
}: {
  stateCharts: StateChart[]
  stateTransitions: StateTransition[]
  targetObjectIds: DiagnosticCommTargetObjectIds
}) {
  const stateDict: Record<string, StateChart> = {}
  const cyRef = 'cy'
  const theme = useTheme()

  for (var s of stateCharts) {
    if (s.states) {
      for (var stateTrans of stateTransitions) {
        if (
          s.states.some((e) => e.short_name === stateTrans.source_snref) &&
          stateTrans.source_snref
        ) {
          stateDict[stateTrans.source_snref] = s
        }
      }
    }
  }

  React.useEffect(() => {
    var graph = cytoscape()

    if (stateTransitions.length != 0) {
      graph = StateChartVisualizationComponent(stateTransitions, theme, cyRef)
    }

    return () => {
      graph
    }
  }, [theme, stateTransitions])

  return (
    <div className="flex flex-col gap-5">
      <Table isStriped aria-label="Precondition States">
        <TableHeader>
          <TableColumn width={150}>STATE CHART</TableColumn>
          <TableColumn width={250}>SOURCE STATE</TableColumn>
          <TableColumn>TARGET STATE</TableColumn>
        </TableHeader>
        <TableBody items={stateTransitions}>
          {(item) => (
            <TableRow key={item.short_name}>
              <TableCell className="font-bold" width={150}>
                <Link
                  href={`/state-charts?objectId=${item.source_snref ? stateDict[item.source_snref]?.perma_id : '.'}&variantId=${targetObjectIds.variantId}&containerId=${targetObjectIds.containerId}`}
                >
                  {item.source_snref
                    ? stateDict[item.source_snref]?.long_name
                    : '-'}
                </Link>
              </TableCell>
              <TableCell width={250}>{item.source_snref}</TableCell>
              <TableCell>{item.target_snref}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div
        className="bg-content1 items-center w-full h-96 rounded-xl"
        id={cyRef}
      />
    </div>
  )
}
