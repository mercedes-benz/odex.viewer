// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Accordion, AccordionItem } from '@heroui/accordion'
import { Button } from '@heroui/button'
import { Selection } from '@react-types/shared'
import parse from 'html-react-parser'
import React from 'react'

import {
  SpecialData,
  SpecialDataGroup,
  isSpecialDataGroup,
} from '@/api/api-hooks'
import { cleanupHtmlContent, hashStringId } from '@/utils/utils'
import { CollapseIcon, ExpandIcon } from '@/components/icons'
import { useBooleanStateWithIndexedDB } from '@/storage/settings'

export function SpecialDataGroupsComponent({
  sdgs,
  showExpandAllButton,
  pageId,
}: {
  sdgs: SpecialDataGroup[] | SpecialData[] | undefined
  showExpandAllButton?: boolean
  pageId: string
}) {
  const defaultExpandedKeys = sdgs?.map((entry, index) => {
    if (!isSpecialDataGroup(entry)) {
      return entry.ephemeral_id
        ? entry.ephemeral_id
        : entry.semantic_info
          ? entry.semantic_info
          : index.toString()
    }

    return ''
  })

  const allSDGs = sdgs?.map((entry, index) =>
    entry.ephemeral_id
      ? entry.ephemeral_id.toString()
      : entry.semantic_info
        ? entry.semantic_info
        : index.toString()
  )

  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set(defaultExpandedKeys)
  )
  const [expandStatus, setExpandStatus] = useBooleanStateWithIndexedDB(
    pageId,
    'sdgs#accordion-expandStatus',
    false
  )

  React.useEffect(() => {
    if (expandStatus) {
      setSelectedKeys(new Set(allSDGs))
    } else {
      setSelectedKeys(new Set(defaultExpandedKeys))
    }
  }, [expandStatus])

  const sdgContent =
    sdgs && Array.isArray(sdgs) && sdgs.length > 0 ? (
      <Accordion
        key={hashStringId(sdgs.map((entry) => entry.ephemeral_id).join('-'))}
        isCompact
        className="px-0 gap-1 w-full"
        itemClasses={{
          base: 'py-0 w-full rounded',
          heading: 'pl-1',
          content: 'pb-2 pl-1 text-left italic flex items-start',
          indicator: 'font-bold',
          trigger: 'data-[hover=true]:underline rounded',
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        variant="splitted"
        onSelectionChange={setSelectedKeys}
      >
        {sdgs.map((entry, index) => {
          // Check if we have a SpecialDataGroup or SpecialData entry by looking for the "values"
          // property of the SpecialDataGroup type via a custom type guard function
          if (isSpecialDataGroup(entry)) {
            // SpecialDataGroup branch
            const description =
              entry.sdg_caption &&
              entry.sdg_caption.description &&
              entry.sdg_caption.description.text
                ? cleanupHtmlContent(entry.sdg_caption.description.text)
                : ''

            return (
              <AccordionItem
                key={entry.ephemeral_id ? entry.ephemeral_id : index}
                aria-label={
                  entry.sdg_caption
                    ? entry.sdg_caption.long_name ||
                      entry.sdg_caption.short_name
                    : entry.sdg_caption_ref
                      ? entry.sdg_caption_ref.resolved_object_short_name
                      : 'default' + index
                }
                classNames={{
                  title: 'font-bold',
                  base: 'border-2 border-gray-400',
                }}
                subtitle={
                  entry.semantic_info ? entry.semantic_info : parse(description)
                }
                textValue={
                  entry.sdg_caption
                    ? `${entry.sdg_caption.long_name} (${entry.sdg_caption.short_name})`
                    : 'unnamed'
                }
                title={
                  entry.sdg_caption
                    ? `${entry.sdg_caption.long_name} (${entry.sdg_caption.short_name})`
                    : 'unnamed'
                }
              >
                <SpecialDataGroupsComponent
                  pageId={pageId}
                  sdgs={entry.values}
                />
              </AccordionItem>
            )
          } else {
            // SpecialData branch
            return (
              <AccordionItem
                key={
                  entry.ephemeral_id
                    ? entry.ephemeral_id
                    : entry.semantic_info
                      ? entry.semantic_info
                      : index
                }
                aria-label={
                  entry.semantic_info
                    ? entry.semantic_info
                    : entry.text_identifier
                      ? entry.text_identifier
                      : ''
                }
                textValue={
                  entry.semantic_info
                    ? entry.semantic_info
                    : entry.text_identifier
                      ? entry.text_identifier
                      : 'unknown'
                }
                title={entry.semantic_info ? entry.semantic_info : ''}
              >
                {entry.value ? entry.value : ''}
              </AccordionItem>
            )
          }
        })}
      </Accordion>
    ) : (
      <div className="pt-4 place-self-start">
        <span>No SDGs specified</span>
      </div>
    )

  return showExpandAllButton ? (
    <div>
      <div className="flex w-full justify-end mb-2">
        <Button
          color="primary"
          endContent={expandStatus ? <CollapseIcon /> : <ExpandIcon />}
          onPress={() => setExpandStatus(!expandStatus)}
        >
          {expandStatus ? 'Collapse All' : 'Expand All'}
        </Button>
      </div>

      {sdgContent}
    </div>
  ) : (
    sdgContent
  )
}
