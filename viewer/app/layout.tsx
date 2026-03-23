// SPDX-License-Identifier: AGPL-3.0-only
import '@/styles/globals.css'
import { Metadata, Viewport } from 'next'
import { Link } from '@heroui/link'
import clsx from 'clsx'

import { Providers } from './providers'

import { Navbar } from '@/components/navbar'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx('min-h-screen bg-background font-sans antialiased')}
      >
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-full px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-3">
              <span className="text-default-600">Powered by&nbsp;</span>
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://www.heroui.com/"
                title="heroui.com homepage"
              >
                <p className="text-primary">HeroUI&nbsp;</p>
              </Link>
              <p className="text-default-600">and&nbsp;</p>
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://nextjs.org/"
                title="next.js homepage"
              >
                <p className="text-primary">Next.js</p>
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
