// SPDX-License-Identifier: AGPL-3.0-only
import { Suspense } from 'react'

export default function VariantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-full text-center justify-center w-full">
          {children}
        </div>
      </section>
    </Suspense>
  )
}
