'use client'

import {
  Accordion as HeroAccordion,
  AccordionItemProps,
  AccordionProps,
} from '@heroui/accordion'
import React from 'react'

export { AccordionItem } from '@heroui/accordion'

function wrapItemContent(
  children: React.ReactNode
): React.ReactElement<AccordionItemProps>[] {
  const items: React.ReactElement<AccordionItemProps>[] = []

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<AccordionItemProps>(child)) {
      return
    }

    if (child.type === React.Fragment) {
      items.push(...wrapItemContent(child.props.children))

      return
    }

    items.push(
      React.cloneElement(child, {
        children: (
          <div
            className="contents"
            onFocus={(event) => event.stopPropagation()}
          >
            {child.props.children}
          </div>
        ),
      })
    )
  })

  return items
}

export function Accordion({ children, ...props }: AccordionProps) {
  return (
    <HeroAccordion {...props}>
      {wrapItemContent(children) as AccordionProps['children']}
    </HeroAccordion>
  )
}
