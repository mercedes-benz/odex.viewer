// SPDX-License-Identifier: AGPL-3.0-only
export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'odex.viewer',
  description: 'Easy to use, browser-based reader for diagnostic data.',
  navItems: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'ODX-D',
      href: '/odx-d',
    },
    {
      label: 'Diagnostic Variants',
      href: '/diagnostic-variant',
    },
    {
      label: 'Diagnostic Communications',
      href: '/diagnostic-comm',
    },
  ],
  navMenuItems: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'ODX-D',
      href: '/odx-d',
    },
    {
      label: 'Diagnostic Variants',
      href: '/diagnostic-variant',
    },
    {
      label: 'Diagnostic Communications',
      href: '/diagnostic-comm',
    },
    {
      label: 'Data Object Properties (DOPs)',
      href: '/dops',
    },
    {
      label: 'Diagnostic Trouble Codes (DTCs)',
      href: '/dtcs',
    },
    {
      label: 'State Charts',
      href: '/state-charts',
    },
    {
      label: 'About',
      href: '/about',
    },
  ],
  links: {
    settings: '/settings',
    github: 'https://github.com/mercedes-benz/odex.viewer',
    docs: 'https://github.com/mercedes-benz/odex.viewer',
  },
}
