// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import katex from 'katex'
import { useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'

export function KaTeXComponent({
  texExpression,
  className,
}: {
  texExpression: string
  className: string
}) {
  const containerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    katex.render(texExpression, containerRef.current as HTMLInputElement)
  }, [texExpression])

  return <div ref={containerRef} className={className} />
}
