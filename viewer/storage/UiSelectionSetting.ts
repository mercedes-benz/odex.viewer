// SPDX-License-Identifier: AGPL-3.0-only
import { Selection } from '@react-types/shared'

import AbstractUiSetting from '@/storage/AbstractUiSetting'

export default class UiSelectionSetting extends AbstractUiSetting {
  selection!: Selection
}
