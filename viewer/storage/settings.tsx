// SPDX-License-Identifier: AGPL-3.0-only
import { Button } from '@heroui/button'
import { Tooltip } from '@heroui/tooltip'
import { Selection } from '@react-types/shared'
import { useLiveQuery } from 'dexie-react-hooks'

import { EraserIcon } from '@/components/icons'
import UiSettingsDB from '@/storage/UiSettingsDB'

// ---------------------------------------------------------------
// Instantiate a indexedDB instance for the UI settings and provide utility functions for it
// ---------------------------------------------------------------

const db = new UiSettingsDB()

function resetComponentSettings(page: string, settingKey: string) {
  db.selectionSettings.where({ page: page, settingKey: settingKey }).delete()
}

function resetPageSettings(page: string) {
  db.selectionSettings.where({ page: page }).delete()
  db.booleanStateSettings.where({ page: page }).delete()
}

function clearDatabase() {
  return db.transaction(
    'rw',
    db.selectionSettings,
    db.booleanStateSettings,
    async () => {
      await Promise.all(db.tables.map((table) => table.clear()))
    }
  )
}

// Helper method to clear local storage, since the 'theme' settings are stored in local storage
function clearLocalStorage() {
  let storage: Storage | undefined

  try {
    storage = localStorage
  } catch {
    storage = undefined
  }

  if (storage !== undefined) {
    storage.clear()
  }
}

export function clearSettingsStorage() {
  clearDatabase()
  clearLocalStorage()
}

// ---------------------------------------------------------------
// Define a collection of hooks to be used for storage interaction
// ---------------------------------------------------------------

export const useSelectionWithIndexedDB = (
  page: string,
  settingKey: string,
  initialState: Selection
): [Selection, (selection: Selection) => void] => {
  const selectedKeys = useLiveQuery(
    async () => {
      const result = await db.selectionSettings.get({
        page: page,
        settingKey: settingKey,
      })

      if (result !== undefined) {
        return result.selection
      } else {
        return initialState
      }
    },
    [],
    initialState
  )

  const setSelectedKeys = async (selection: Selection) => {
    db.selectionSettings.put({
      id: `${page}-${settingKey}`,
      page: page,
      settingKey: settingKey,
      selection: selection,
    })
  }

  return [selectedKeys, setSelectedKeys]
}

export const useBooleanStateWithIndexedDB = (
  page: string,
  settingKey: string,
  initialState: boolean
): [boolean, (state: boolean) => void] => {
  const currentState = useLiveQuery(
    async () => {
      const result = await db.booleanStateSettings.get({
        page: page,
        settingKey: settingKey,
      })

      if (result !== undefined) {
        return result.state !== undefined && result.state === 'true'
          ? true
          : false
      } else {
        return initialState
      }
    },
    [],
    initialState
  )

  const setCurrentState = async (newState: boolean) => {
    db.booleanStateSettings.put({
      id: `${page}-${settingKey}`,
      page: page,
      settingKey: settingKey,
      state: newState !== undefined && newState === true ? 'true' : 'false',
    })
  }

  return [currentState, setCurrentState]
}

// ---------------------------------------------------------------
// Define a collection of UI elements for management of settings
// ---------------------------------------------------------------
export function ResetComponentSettingsButton({
  page,
  settingKey,
}: {
  page: string
  settingKey: string
}) {
  return (
    <div className="justify-self-end">
      <Tooltip
        color="danger"
        content="Click to reset the configuration of this UI component to its default value."
      >
        <Button
          isIconOnly
          data-testid={`reset-button-${page}-${settingKey}`}
          radius="sm"
          size="md"
          variant="shadow"
          onPress={() => resetComponentSettings(page, settingKey)}
        >
          <EraserIcon />
        </Button>
      </Tooltip>
    </div>
  )
}

export function ResetPageSettingsButton({ page }: { page: string }) {
  return (
    <div className="justify-self-end">
      <Tooltip
        color="danger"
        content="Click to reset the configuration of all UI components on this page to their default value."
      >
        <Button
          isIconOnly
          data-testid="reset-button-page"
          radius="sm"
          size="md"
          variant="shadow"
          onPress={() => resetPageSettings(page)}
        >
          <EraserIcon />
        </Button>
      </Tooltip>
    </div>
  )
}
