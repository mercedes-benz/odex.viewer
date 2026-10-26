'use client'

import {
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline'
import React from 'react'

import { DiagnosticMessageCodecResult } from '@/api/api-hooks'

const PARAMETER_COLORS = [
  '#99d5c9',
  '#f7c67e',
  '#9bc9f5',
  '#efa6b7',
  '#c4d984',
  '#b8b0e8',
  '#7dd3e8',
  '#e8b89a',
  '#a9d6a4',
  '#f4dc88',
  '#b4c1d3',
  '#e8b1d8',
]

function formatValue(value: unknown): string {
  return JSON.stringify(value) ?? 'Not provided'
}

function bitPosition(position: number): string {
  return `byte ${Math.floor(position / 8)}, bit ${7 - (position % 8)}`
}

type ParameterLayout = DiagnosticMessageCodecResult['parameter_layout'][number]
type BitRange = ParameterLayout['ranges'][number]
type LayoutNode = Omit<ParameterLayout, 'physical_value'> & {
  physical_value?: unknown
  children: LayoutNode[]
  color: string
}

function mergeRanges(ranges: BitRange[]): BitRange[] {
  const merged: BitRange[] = []

  for (const range of [...ranges].sort(
    (left, right) => left.start_bit - right.start_bit
  )) {
    const previous = merged[merged.length - 1]

    if (
      previous &&
      previous.start_bit + previous.bit_length >= range.start_bit
    ) {
      previous.bit_length =
        Math.max(
          previous.start_bit + previous.bit_length,
          range.start_bit + range.bit_length
        ) - previous.start_bit
    } else {
      merged.push({ ...range })
    }
  }

  return merged
}

function parameterTree(parameters: ParameterLayout[]): LayoutNode[] {
  const roots: LayoutNode[] = []
  const nodes = new Map<string, LayoutNode>(
    parameters.map((parameter, index) => [
      parameter.path,
      {
        ...parameter,
        children: [],
        color: PARAMETER_COLORS[index % PARAMETER_COLORS.length] ?? '#99d5c9',
      },
    ])
  )

  for (const node of Array.from(nodes.values())) {
    const parent = node.parent_path ? nodes.get(node.parent_path) : undefined

    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  const aggregate = (node: LayoutNode): void => {
    node.children.forEach(aggregate)
    node.ranges = mergeRanges([
      ...node.ranges,
      ...node.children.flatMap((child) => child.ranges),
    ])
  }

  roots.forEach(aggregate)

  return roots
}

function rangeLabel(ranges: BitRange[]): string {
  return ranges
    .map((range) =>
      range.bit_length === 1
        ? bitPosition(range.start_bit)
        : `${bitPosition(range.start_bit)} to ${bitPosition(range.start_bit + range.bit_length - 1)}`
    )
    .join('; ')
}

function nodeValue(node: LayoutNode): string {
  if (node.dop_type?.endsWith('Field') && Array.isArray(node.physical_value))
    return `${node.physical_value.length} items`

  return node.children.length
    ? `${node.children.length} fields`
    : formatValue(node.physical_value)
}

function revealInPane(
  pane: HTMLElement | null,
  target: HTMLElement | undefined
) {
  if (!pane || !target) return
  const bounds = pane.getBoundingClientRect()
  const targetBounds = target.getBoundingClientRect()

  if (targetBounds.top < bounds.top)
    pane.scrollTop += targetBounds.top - bounds.top
  else if (targetBounds.bottom > bounds.bottom)
    pane.scrollTop += targetBounds.bottom - bounds.bottom
}

export function DiagnosticMessageLayout({
  result,
}: {
  result: DiagnosticMessageCodecResult
}) {
  const [highlightedPath, setHighlightedPath] = React.useState<string>()
  const [hoveredPath, setHoveredPath] = React.useState<string>()
  const diagramPane = React.useRef<HTMLDivElement>(null)
  const legendPane = React.useRef<HTMLUListElement>(null)
  const legendEntries = React.useRef(new Map<string, HTMLButtonElement>())
  const byteEntries = React.useRef(new Map<number, HTMLDivElement>())
  const [expandedPaths, setExpandedPaths] = React.useState<Set<string>>(
    new Set()
  )
  const bytes = result.hex_message.trim().split(/\s+/)
  const layoutByPath = new Map(
    (result.parameter_layout ?? []).map((node) => [node.path, node])
  )
  const roots = parameterTree(result.parameter_layout ?? [])
  const activePath = hoveredPath ?? highlightedPath
  const activeParameter = activePath ? layoutByPath.get(activePath) : undefined
  const selectParameter = (
    path: string | undefined,
    source: 'diagram' | 'legend'
  ) => {
    setHighlightedPath(path)
    if (!path) return
    if (source === 'diagram') {
      revealInPane(legendPane.current, legendEntries.current.get(path))
    } else {
      const firstRange = layoutByPath.get(path)?.ranges[0]

      if (firstRange)
        revealInPane(
          diagramPane.current,
          byteEntries.current.get(Math.floor(firstRange.start_bit / 8))
        )
    }
  }
  const groups: LayoutNode[] = []
  const parameters: LayoutNode[] = []
  const collect = (nodes: LayoutNode[], visible: boolean): void => {
    for (const node of nodes) {
      if (node.children.length) groups.push(node)
      const expanded = node.children.length > 0 && expandedPaths.has(node.path)

      if (visible && !expanded) parameters.push(node)
      collect(node.children, visible && expanded)
    }
  }

  collect(roots, true)
  const owners: (typeof parameters)[] = Array.from(
    { length: bytes.length * 8 },
    () => []
  )

  parameters.forEach((parameter) => {
    parameter.ranges.forEach((range) => {
      const end = Math.min(owners.length, range.start_bit + range.bit_length)

      for (let bit = Math.max(0, range.start_bit); bit < end; bit += 1) {
        const bitOwners = owners[bit]

        if (bitOwners && !bitOwners.includes(parameter))
          bitOwners.push(parameter)
      }
    })
  })

  return (
    <section
      aria-label="Message bit layout"
      className="mt-2 flex w-full min-w-0 max-w-[calc(100vw-4rem)] flex-col gap-3 border-t border-default-200 pt-3"
      data-testid="message-layout"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-small font-semibold">Message layout</h4>
        <div className="flex flex-wrap items-center gap-2">
          {groups.length ? (
            <div className="flex items-center gap-1">
              <button
                aria-label="Expand all parameter groups"
                className="flex size-7 items-center justify-center rounded-sm hover:bg-default-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                title="Expand all parameter groups"
                type="button"
                onClick={() => {
                  setExpandedPaths(new Set(groups.map((group) => group.path)))
                  setHighlightedPath(undefined)
                  setHoveredPath(undefined)
                }}
              >
                <ArrowsPointingOutIcon aria-hidden="true" className="size-4" />
              </button>
              <button
                aria-label="Collapse all parameter groups"
                className="flex size-7 items-center justify-center rounded-sm hover:bg-default-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                title="Collapse all parameter groups"
                type="button"
                onClick={() => {
                  setExpandedPaths(new Set())
                  setHighlightedPath(undefined)
                  setHoveredPath(undefined)
                }}
              >
                <ArrowsPointingInIcon aria-hidden="true" className="size-4" />
              </button>
            </div>
          ) : null}
          <span className="text-xs text-default-500">
            {bytes.length} {bytes.length === 1 ? 'byte' : 'bytes'} /{' '}
            {owners.length} bits
          </span>
        </div>
      </div>
      <div
        className="grid w-full min-w-0 items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        data-testid="message-layout-inspector"
      >
        <div
          className="sticky top-3 z-10 min-w-0 self-start bg-background pb-2 md:top-4"
          data-testid="message-layout-diagram"
        >
          <div
            ref={diagramPane}
            aria-label="Message bytes"
            className="grid max-h-[min(24vh,12rem)] w-full gap-x-2 gap-y-3 overflow-y-auto overscroll-contain md:max-h-[min(56vh,36rem)]"
            data-testid="message-layout-byte-pane"
            role="region"
            style={{
              gridTemplateColumns:
                'repeat(auto-fill, minmax(min(100%, 10rem), 1fr))',
            }}
            tabIndex={0}
          >
            {bytes.map((hex, byteIndex) => (
              <div
                key={byteIndex}
                ref={(element) => {
                  if (element) byteEntries.current.set(byteIndex, element)
                  else byteEntries.current.delete(byteIndex)
                }}
                className="min-w-0"
                data-testid="message-layout-byte"
              >
                <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-default-500">Byte {byteIndex}</span>
                  <code className="font-semibold">{hex}</code>
                </div>
                <div className="grid grid-cols-8">
                  {Array.from({ length: 8 }, (_, offset) => {
                    const bit = 7 - offset
                    const bitOwners = owners[byteIndex * 8 + offset] ?? []
                    const colors = bitOwners.map((parameter) => parameter.color)
                    const background =
                      colors.length > 1
                        ? `linear-gradient(135deg, ${colors.map((color, index) => `${color} ${(index * 100) / colors.length}% ${((index + 1) * 100) / colors.length}%`).join(', ')})`
                        : colors[0]
                    const value = (Number.parseInt(hex, 16) >> bit) & 1
                    const title = [
                      `Byte ${byteIndex}, bit ${bit}: ${value}`,
                      ...bitOwners.map(
                        (parameter) =>
                          `${parameter.path} = ${nodeValue(parameter)}`
                      ),
                      ...(bitOwners.length === 0 ? ['Unassigned'] : []),
                    ].join('\n')
                    const isHighlighted =
                      activePath === undefined ||
                      bitOwners.some((parameter) => {
                        let node: ParameterLayout | undefined = parameter

                        while (node) {
                          if (node.path === activePath) return true
                          node = node.parent_path
                            ? layoutByPath.get(node.parent_path)
                            : undefined
                        }

                        return false
                      })

                    return (
                      <div key={bit} className="min-w-0 text-center">
                        <span
                          aria-hidden="true"
                          className="block text-[10px] text-default-500"
                        >
                          {bit}
                        </span>
                        <button
                          aria-label={title}
                          className="block h-8 w-full border border-background bg-default-200 font-mono text-xs focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground"
                          data-bit={bit}
                          data-byte={byteIndex}
                          data-parameter={bitOwners
                            .map((parameter) => parameter.path)
                            .join('|')}
                          data-testid="message-layout-bit"
                          style={{
                            background,
                            color: colors.length ? '#111827' : undefined,
                            opacity: isHighlighted ? 1 : 0.3,
                          }}
                          title={title}
                          type="button"
                          onBlur={() => setHoveredPath(undefined)}
                          onClick={() =>
                            selectParameter(bitOwners[0]?.path, 'diagram')
                          }
                          onFocus={() => setHoveredPath(bitOwners[0]?.path)}
                          onMouseEnter={() =>
                            setHoveredPath(bitOwners[0]?.path)
                          }
                          onMouseLeave={() => setHoveredPath(undefined)}
                        >
                          {value}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <section
            aria-label="Parameter details"
            className="mt-3 min-h-28 max-h-44 overflow-y-auto border-t border-default-200 pt-2 text-xs"
            data-testid="message-layout-details"
          >
            {activeParameter ? (
              <dl className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] gap-x-2 gap-y-1">
                <dt className="text-default-500">Path</dt>
                <dd className="min-w-0 break-all font-medium">
                  {activeParameter.path}
                </dd>
                <dt className="text-default-500">Type</dt>
                <dd className="min-w-0 break-words">
                  {activeParameter.dop_type ?? activeParameter.parameter_type}
                </dd>
                <dt className="text-default-500">Range</dt>
                <dd className="min-w-0 break-words">
                  {rangeLabel(activeParameter.ranges) || 'No encoded bits'}
                </dd>
                <dt className="text-default-500">Value</dt>
                <dd className="min-w-0 break-all font-mono">
                  {formatValue(activeParameter.physical_value)}
                </dd>
              </dl>
            ) : (
              <p className="text-default-500">No parameter selected</p>
            )}
          </section>
        </div>
        <ul
          ref={legendPane}
          aria-label="Message parameter legend"
          className="max-h-[min(42vh,24rem)] w-full min-w-0 overflow-y-auto overscroll-contain md:max-h-[min(72vh,48rem)]"
          data-testid="message-layout-legend-pane"
          tabIndex={0}
        >
          {roots.map((node) => (
            <ParameterLegendNode
              key={node.path}
              activePath={activePath}
              expandedPaths={expandedPaths}
              highlightedPath={highlightedPath}
              node={node}
              onHighlight={(path) => selectParameter(path, 'legend')}
              onHover={setHoveredPath}
              onRegister={(path, element) => {
                if (element) legendEntries.current.set(path, element)
                else legendEntries.current.delete(path)
              }}
              onToggle={(path) => {
                setExpandedPaths((current) => {
                  const next = new Set(current)

                  if (next.has(path)) next.delete(path)
                  else next.add(path)

                  return next
                })
                setHighlightedPath(undefined)
                setHoveredPath(undefined)
              }}
            />
          ))}
          {owners.some((bitOwners) => bitOwners.length === 0) ? (
            <li className="flex items-center gap-2 py-2 text-xs text-default-500">
              <span aria-hidden="true" className="size-3 bg-default-200" />
              Unassigned
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  )
}

function ParameterLegendNode({
  node,
  expandedPaths,
  highlightedPath,
  activePath,
  onToggle,
  onHighlight,
  onHover,
  onRegister,
}: {
  node: LayoutNode
  expandedPaths: Set<string>
  highlightedPath: string | undefined
  activePath: string | undefined
  onToggle: (path: string) => void
  onHighlight: (path: string | undefined) => void
  onHover: (path: string | undefined) => void
  onRegister: (path: string, element: HTMLButtonElement | null) => void
}) {
  const expanded = expandedPaths.has(node.path)
  const ranges = rangeLabel(node.ranges)
  const ChevronIcon = expanded ? ChevronDownIcon : ChevronRightIcon

  return (
    <li className="min-w-0" data-layout-path={node.path}>
      <div className="flex min-w-0 items-start border-b border-default-100">
        {node.children.length ? (
          <button
            aria-expanded={expanded}
            aria-label={`Toggle ${node.path}`}
            className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-sm hover:bg-default-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            title={`${expanded ? 'Collapse' : 'Expand'} ${node.path}`}
            type="button"
            onClick={() => onToggle(node.path)}
          >
            <ChevronIcon aria-hidden="true" className="size-4" />
          </button>
        ) : (
          <span aria-hidden="true" className="mt-1 size-7 shrink-0" />
        )}
        <button
          ref={(element) => onRegister(node.path, element)}
          aria-pressed={highlightedPath === node.path}
          className="flex w-full min-w-0 items-start gap-2 py-2 text-left text-xs hover:bg-default-100 data-[active=true]:bg-default-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          data-active={activePath === node.path}
          title={`${node.dop_type ?? node.parameter_type}: ${ranges}`}
          type="button"
          onBlur={() => onHover(undefined)}
          onClick={() =>
            onHighlight(highlightedPath === node.path ? undefined : node.path)
          }
          onFocus={() => onHover(node.path)}
          onMouseEnter={() => onHover(node.path)}
          onMouseLeave={() => onHover(undefined)}
        >
          <span
            aria-hidden="true"
            className="mt-0.5 size-3 shrink-0 rounded-sm"
            style={{ backgroundColor: node.color }}
          />
          <span className="min-w-0 flex-1">
            <span className="block break-words font-medium">
              {node.short_name}
            </span>
            <span className="block break-words text-default-500">
              {node.node_type === 'item'
                ? 'Item / '
                : node.node_type === 'case'
                  ? 'Case / '
                  : node.node_type === 'row'
                    ? 'Table row / '
                    : ''}
              {node.dop_type ?? node.parameter_type}
            </span>
            <span className="block break-words text-default-500">{ranges}</span>
            {node.related_parameter_path ? (
              <span className="block break-all text-default-500">
                Selected by {node.related_parameter_path}
              </span>
            ) : null}
          </span>
          <code className="max-w-[40%] break-all">{nodeValue(node)}</code>
        </button>
      </div>
      {node.children.length > 0 && expanded ? (
        <ul
          aria-label={`${node.path} parameters`}
          className="ml-3 min-w-0 border-l border-default-200 pl-3"
        >
          {node.children.map((child) => (
            <ParameterLegendNode
              key={child.path}
              activePath={activePath}
              expandedPaths={expandedPaths}
              highlightedPath={highlightedPath}
              node={child}
              onHighlight={onHighlight}
              onHover={onHover}
              onRegister={onRegister}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
