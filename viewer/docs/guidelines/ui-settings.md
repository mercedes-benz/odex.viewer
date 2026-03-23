# Persistence and management of User-defined UI settings

When navigating across the different UI pages and their components of the odex.viewer, any changes to filters or UI element states (e.g., accordion item "collapsed" vs. "expanded") in general are reset / lost when the UI is refreshed or the user navigates to another page and later comes back.

Therefore, the last selected / configured UI states / settings shall be stored on the users end using the IndexedDB API of the browser to enable reloading the last status on following page visits.
Since pages are composed of a collection of potentially nested components where each one might provide some configurable elements, e.g., accordions with multiple items, tables will selectable columns, an overall strategy towards the management of the underlying UI element states / settings has to be provided.

Further details why using IndexedDB can be found in [ADR-0001](../decisions/0001-persist-ui-user-settings.md).

## Implementation

The main logic for the persistent management of UI settings is implemented in [storage/settings.tsx](../../storage/settings.tsx).
The IndexedDB instance for storing the settings is defined and initialized in [storage/UiSettingsDB.ts](../../storage/UiSettingsDB.ts).

For each category of settings a corresponding class extending `AbstractUiSetting` is defined. For example, `UiBooleanStateSetting` to store simple boolean state values or `UiSelectionSetting` for persisting a selection, i.e., an array of key strings, e.g., representing currently visible columns in a table.

The class `AbstractUiSetting` defines the basic properties of every setting to be stored to have a common basis for querying and the resolution of settings and the pages they belong to even across complex UI element hierarchies.

This includes:

- `id`: The id property is automatically set by merging the `page` and `settingKey` values using the following format `${page}-${settingKey}`
- `page`: The page property holds the identifier of the page the setting belongs to. This is always the identifier of the root page, i.e., one of the app entry pages defined in `app` folder. With this approach, it is possible to later reset the settings of all UI elements which belong to this root page no matter how they are nested whithin the UI hierarchy.
- `settingKey`: The settingKey holds the identifier of the actual setting to be persisted/managed. To avoid overlaps or naming collisions we introduce a naming schema to define unique setting keys.

## Setting key naming schema

The following naming schema in EBNF shall be applied when introducing new settings to the `settingsDB`:

```
settingKey = ([(childKey, "#")], ui-element-type, "-", setting-id)
```

Where `ui-element-type` is the type of the UI element the setting is applied to, e.g., an accordion, table, slider, etc. The `childKey` and `setting-id` can be freely choosen, however, shall provide an idea about the underlying setting and its origin / related UI component or element.

Examples:

- `accordion-selectedKeys`: This settingKey holds the selection of expanded keys of an accordion element directly on the [diagnostic-comm page](../../app/diagnostic-comm/page.tsx), therefore `ui-element-type: "accordion"` and `setting-id: "selectedKeys"`.
- `allDiagComms#table-visibleColumns`: This settingKey has also a `childKey` since there are different combinations of UI components that can be shown on the same page depending on how the user navigates to it. Therefore, the `childKey` allows to provide a hint on the context the setting originates from. The resulting settingKey is again defined within the on the [diagnostic-comm page](../../app/diagnostic-comm/page.tsx), however the setting itself is related to the selection of visible columns of the table provided by the nested [DiagComms overview component](../../components/diag-comms.tsx). Based on that, `childKey: "allDiagComms"`, `ui-element-type: "table"`, and `setting-id: "visibleColumns"` results in the above `settingKey: "allDiagComms#table-visibleColumns"`.

## Use / integrate Settings in UI pages

As stated above, the main logic for the persistent management of UI settings is implemented in [storage/settings.tsx](../../storage/settings.tsx).
There also a collection of hooks and UI elements are provided which can be directly used and integrated into respected UI pages for setting management.

For example, the provided `ResetPageSettingsButton` can be added to a page to provide the user a way to reset all settings back to the default. The only information required is the `pageId` used for managing the settings, i.e., the one specified together with the `settingKey`.

```typescript
import { ResetPageSettingsButton } from '@/storage/settings'

<ResetPageSettingsButton page={pageId} />
```

For the actual settings, respective hooks are provided depending on the type of setting.
As an example, there is a hook for selection-based settings `useSelectionWithIndexedDB`, which allows to store, load and observe a selection, for example, which columns of a table are selected by a user.

Here is an example on how to use one of the hooks within a page or UI component:

```typescript
import { useSelectionWithIndexedDB } from '@/storage/settings'

const [selectedKeys, setSelectedKeys] = useSelectionWithIndexedDB(
  pageId,
  'accordion-selectedKeys',
  new Set(['metadata', 'request', 'posResponses'])
)
```

Each hook requires the `pageId`, `settingKey` and an initial value for the underlying setting. The hook returns two variables, one for the current/latest value of the setting loaded from the IndexedDB and a setter method to change the value and persist it to the IndexedDB in the background.
