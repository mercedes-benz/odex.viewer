// SPDX-License-Identifier: AGPL-3.0-only
import type UiSettingsDB from '@/storage/UiSettingsDB'

import { Entity } from 'dexie'

export default class AbstractUiSetting extends Entity<UiSettingsDB> {
  id!: string
  page!: string
  settingKey!: string
}
