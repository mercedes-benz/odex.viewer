// SPDX-License-Identifier: AGPL-3.0-only
import Dexie, { type EntityTable } from 'dexie'

import UiSelectionSetting from '@/storage/UiSelectionSetting'
import UiBooleanStateSetting from '@/storage/UiBooleanStateSetting'

export default class UiSettingsDB extends Dexie {
  selectionSettings!: EntityTable<UiSelectionSetting, 'id'>
  booleanStateSettings!: EntityTable<UiBooleanStateSetting, 'id'>

  constructor() {
    super('UiSettings')
    this.version(1).stores({
      selectionSettings: 'id, [page+settingKey], page, settingKey',
      booleanStateSettings: 'id, [page+settingKey], page, settingKey',
    })
    this.selectionSettings.mapToClass(UiSelectionSetting)
    this.booleanStateSettings.mapToClass(UiBooleanStateSetting)
  }
}
