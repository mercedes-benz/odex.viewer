# Hydration and Reliable Assertions

## Why visible does not mean ready

Next.js prerenders Client Components as HTML before attaching event handlers.
Visible controls are therefore not necessarily interactive, even after navigation
has finished. The `'use client'` directive does not disable prerendering.
On slower CI runners, the interval between visible HTML and working event
handlers can be large enough for an automated click or input to be lost.

Playwright checks actionability, such as visibility and whether a click target
receives pointer events. These checks do not establish that React has attached
the intended handler. Likewise, `page.goto()`, a successful HTTP response, or a
visible heading does not establish application readiness.

## The shared hydration gate

The shared [Providers component](../../app/providers.tsx), installed by the
[root layout](../../app/layout.tsx), keeps the prerendered application `inert`
until the provider hydrates. An inert subtree cannot receive ordinary user
interaction, including pointer input and keyboard focus. This lets Playwright's
normal actionability checks wait before interacting instead of accepting an
ineffective click.

The provider uses `useSyncExternalStore` to distinguish server rendering from
client readiness:

- The server snapshot is `false`, so the exported HTML has `inert` and
  `data-hydrated="false"`.
- The initial hydration render uses the same server snapshot, keeping the server
  and client markup consistent.
- React then uses the client snapshot, `true`, removing `inert` and updating
  `data-hydrated` without a fixed delay.

Keep these snapshots consistent when modifying the provider. Do not remove the
gate to make a test click sooner, or replace it with a timer. The `contents`
class keeps the wrapper from introducing a layout box; changes to this wrapper
should also be checked for layout, keyboard navigation, and accessibility.

The gate intentionally requires JavaScript before the application can be used.
Content outside the wrapper, or rendered into a portal outside it, is not covered
by its `inert` attribute. New independently rendered controls must account for
their own readiness rather than assuming this gate covers them.

## Responsibilities when developing components

Hydration of the provider is not a global "application ready" event. Next.js and
React can hydrate nested Suspense boundaries separately, and the provider
persists across client-side navigations. Its `data-hydrated` attribute therefore
does not reset for each route or indicate that every descendant has hydrated.

| Readiness boundary        | What developers must account for                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Provider hydration        | Preserve the shared gate and matching initial server/client markup.                                                    |
| Route or Suspense content | Expose a meaningful loading state; do not make separately prerendered controls usable before their handlers are ready. |
| API data                  | Keep dependent actions disabled or loading until their required data exists, and render errors explicitly.             |
| Persisted UI settings     | Allow asynchronous reads and writes to settle before treating settings as restored or saved.                           |

When adding or changing components:

- Make the initial server and client render deterministic. Do not branch the
  initial markup on `window`, browser storage, random values, or the current
  time. Use an appropriate client update for browser-only state.
- Do not use `suppressHydrationWarning` as a general fix for mismatched markup
  or lost interactions. It suppresses a warning, not the underlying race.
- For controls with additional initialization, expose that state through actual
  UI behavior, such as a disabled button, loading indicator, or unavailable
  dependent content. An `aria-busy` attribute alone does not prevent input.
- Ensure effects and subscriptions clean up correctly. Development-mode effect
  checks and production rendering differ; avoid relying on an effect running
  exactly once or in a particular timing window.
- Treat browser storage as asynchronous. The hooks in
  [storage/settings.tsx](../../storage/settings.tsx) initially return defaults
  and subsequently update from IndexedDB. A visible default is not evidence that
  the persisted value has loaded. See [UI Settings Management](ui-settings.md)
  for the persistence model.

## Writing reliable Playwright tests

Hydration of the provider does not mean every Suspense boundary, API request, or
IndexedDB update has finished. Wait for the specific UI result with locator
assertions rather than waiting for an assumed elapsed time.

### Perform an action once, then assert its result

For example, the [DOP tests](../../tests/dops.spec.ts) open a filter once and
wait for the menu, then select an entry and wait for the filtered result:

```typescript
await page.getByTestId('filter-TYPE-button').click()
await expect(
  page.getByTestId('filter-TYPE-menu').getByRole('menu', { name: 'Filter' })
).toBeVisible()
await page.getByTestId('filter-TYPE-menu-entry-Structure').click()
await expect(
  page.getByText('4 of total 36 data object properties')
).toBeVisible()
```

Do not wrap clicks, typing, or other state-changing actions in `toPass()` to
recover from lost input. A repeated click may close a menu, collapse an
accordion, or submit the same operation twice. Retry the observation, not the
mutation. Similarly, avoid `force: true`, which bypasses actionability checks
and can conceal a readiness problem.

### Use retrying assertions for asynchronous state

Prefer locator assertions over immediate snapshots:

```typescript
const rows = page.getByLabel('Data object property table').getByRole('row')

await expect(rows).toHaveCount(37)
```

`expect(await rows.all()).toHaveLength(37)` only checks the elements present at
that instant. A table can be visible while its rows are still loading.
The same applies to values, classes, and attributes: use `toHaveValue()`,
`toHaveClass()`, or `toHaveAttribute()` to wait for the observable result instead
of reading it immediately after an action.

If a test needs to capture an initial value, establish the relevant readiness
first. The [settings tests](../../tests/settings.spec.ts) wait for
`data-hydrated="true"` before recording the theme, then use an attribute assertion
to wait for a theme change. That marker is appropriate for this provider-level
check, not as a substitute for route-specific or data-specific assertions.

For persistence tests, assert the changed UI, reload or revisit the page, and
assert the restored value. Observing an in-memory change alone does not prove a
storage write completed successfully.

### Avoid unrelated waiting signals

- Do not add fixed sleeps to accommodate slower CI runners. Wait for a specific
  visible result or an actual readiness condition.
- Do not use `networkidle` as a hydration signal. Network activity and React
  readiness are different, and background requests can also prevent idleness.
- Do not inspect Next.js internal globals to infer readiness. Use the supported
  UI contract and explicit application state.
- Prefer accessible role and label locators, scoped to the relevant region or
  table. Use test IDs where an accessible locator would not identify the target
  reliably.

## Regression coverage and CI verification

The [settings regression](../../tests/settings.spec.ts) holds back Next.js
JavaScript requests before navigating, checks the inert prerendered state, then
releases the scripts and verifies that the first theme-switch click works.
This makes the hydration window deterministic without relying on a slow machine
or a fixed sleep. Keep the script release in `finally` so a failed assertion does
not leave navigation blocked.

Use the production static export when investigating CI failures. The
[production Playwright configuration](../../playwright.config.ts) builds and
serves it, whereas the [development configuration](../../playwright.config-dev.ts)
uses the development server. Prerendering and hydration behavior can differ, so
a passing development run is not sufficient production verification. Static
export is configured in [next.config.js](../../next.config.js).

From the frontend directory, with the prerequisites described in the
[frontend README](../../README.md#prerequisites), check stability without test
retries:

```shell
npx playwright test dops.spec.ts settings.spec.ts --retries=0 --repeat-each=3 --workers=1
```
