# Support the persistence and management of User-defined UI settings

## Context and Problem Statement

When navigating across the different UI pages and their components of the odex.viewer, any changes to filters or UI element states (e.g., accordion item "collapsed" vs. "expanded") in general are reset / lost when the UI is refreshed or the user navigates to another page and later comes back.

Therefore, the last selected / configured UI states / settings shall be stored on the users end to enable reloading the last status on following page visits.
Since pages are composed of a collection of potentially nested components where each one might provide some configurable elements, e.g., accordions with multiple items, tables will selectable columns, an overall strategy towards the management of the underlying UI element states / settings has to be provided.

## Decision Drivers

- The resulting approach shall be easy to use for developers
- Hierachically nested page / component structures and their settings have to be supported
- Settings have to be uniquely identifiable and able to be correlated to the UI elements they belong to
- Users have to be able to explicitly reset the UI element states to their defaults via respective buttons.
- Common browser storage mechanism shall be used to additional dependencies

## Considered Options

- Use **local storage** provided by browsers to persist and manage settings
- Use **IndexedDB** provided by browsers to persist and manage settings

## Decision Outcome

Chosen option: "Use **IndexedDB** provided by browsers to persist and manage settings", because it directly supports storing of complex structured data and comes with powerful data querying capabilites to implement the underlying use cases in a straight forward manner.

## Pros and Cons of the Options

### Use **local storage** provided by browsers to persist and manage settings

Implement persistence and management of UI element settings using the [Web Storage API](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage#storing_simple_data_%E2%80%94_web_storage).

- Good, because local storage is simple and easy to use
- Bad, because local storage is a simple key/value store which can only handle string data. Complex data structures have to be stringified for storing and parsed again during loading.
- Bad, because supporting hierachically nested page / component structures and their settings requires potentially a lot of additional logic for resolving the related keys from local storage.
- Bad, because local storage is synchronous and blocks UI rendering while saving/loading

### Use **IndexedDB** provided by browsers to persist and manage settings

Implement persistence and management of UI element settings using the [IndexedDB API](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage#storing_complex_data_%E2%80%94_indexeddb).

- Good, because IndexedDB provides an asynchronous API and therefore does not influence the rest of the app
- Good, because storage of complex data and objects is natively supported
- Good, because IndexedDB provides powerfull query capabilities over the persisted data which can be directly used for supporting hierachically nested page / component structures and their settings.
- Good, because IndexedDB provides indices which enable fast querying of data
- Bad, because the the setup and use of IndexedDB and its API is more complex, however, there API wrappers such as [Dexie](https://dexie.org/docs/Tutorial/React) can be used to mitigate this drawback.

## More Information

- Overview of [Client-side storage](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage) possibilities.
- Discussion on [localStorage vs. indexedDB](https://www.reddit.com/r/sveltejs/comments/15rj12h/any_downsides_to_using_indexeddb_vs_localstorage/?rdt=60017)
