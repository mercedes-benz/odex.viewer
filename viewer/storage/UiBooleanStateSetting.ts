// SPDX-License-Identifier: AGPL-3.0-only
import AbstractUiSetting from '@/storage/AbstractUiSetting'

export default class UiSelectionSetting extends AbstractUiSetting {
  state!: 'true' | 'false'
}
