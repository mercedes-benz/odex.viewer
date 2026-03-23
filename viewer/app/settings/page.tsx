// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Button } from '@heroui/button'
import { Tooltip } from '@heroui/tooltip'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'

import { title, subtitle } from '@/components/primitives'
import { clearSettingsStorage } from '@/storage/settings'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div>
      <h1 className={title()}>Settings</h1>

      <div className="min-w-4xl mt-5">
        <div className={clsx(subtitle({ class: 'mt-4' }), 'text-start')}>
          State settings
        </div>
        <div className="flex flex-col dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
          <p className="mt-2 mb-5 text-start italic">
            This section allows to manage the settings of UI element states and
            their persistent storage in the odex.viewer frontend.
          </p>
          <Tooltip
            color="primary"
            content="Click to reset the configuration of UI elements to their default values."
            placement="top-start"
            showArrow={true}
          >
            <Button
              className="disabled:gray-200 disabled:bg-gray-50 disabled:text-gray-500"
              color="danger"
              variant="shadow"
              onPress={() => {
                clearSettingsStorage()
                window.location.href = '/settings'
                router.refresh()
              }}
            >
              Reset UI state to defaults
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
