# Implementation Plan: Todo List Life Dashboard

## Overview

This plan builds the dashboard as a single page with exactly one CSS file and one JavaScript file, using HTML, CSS, and vanilla JavaScript only. Work proceeds bottom-up: first the HTML scaffold and shared helpers (`storage`, `notify`, `dom`), then the four feature modules (Greeting, Focus Timer, To-Do List, Quick Links), each wired into the `DOMContentLoaded` initializer as it is built so there is no orphaned code. Styling and responsive layout close out the plan. Per NFR-1 (Requirement 12), there is no automated test harness; verification sub-tasks are lightweight manual browser checks consistent with the design's Testing Strategy.

## Tasks

- [x] 1. Scaffold the single-page structure and file layout
  - Create `index.html` with four `<section>` elements, each containing an `<h2>` heading (Greeting, Focus Timer, To-Do List, Quick Links) and a dedicated message area per section
  - Add the greeting time/date/greeting placeholders, the timer display and start/stop/reset controls, the to-do input/add control and list container, and the quick-links label/URL inputs/add control and buttons container
  - Create exactly one stylesheet at `css/styles.css` and link it in the `<head>`; create exactly one script at `js/app.js` and load it deferred at the end of `<body>`
  - Add a `DOMContentLoaded` entry point in `js/app.js` that will initialize the four modules in order (empty stubs for now)
  - _Requirements: 12.1, 12.3, 12.4, 13.3_

- [x] 2. Implement shared helpers (storage, notify, dom)
  - [x] 2.1 Implement the `dom` helper
    - Write `el(tag, props, children)` to build elements and `clear(node)` to empty a node, using direct DOM APIs and text content (never `innerHTML` of user data)
    - _Requirements: 12.1, 13.1, 13.2_

  - [x] 2.2 Implement the `notify` helper
    - Render a scoped plain-text status/error message into a given section's message area; clear the message on the next successful action
    - _Requirements: 12.6_

  - [x] 2.3 Implement the `storage` helper
    - Write `isAvailable()` using a probe write/remove inside try/catch; `readJSON(key)` returning `{ ok:true, value }` or `{ ok:false, reason }` for missing/unreadable/parse-failure; `writeJSON(key, value)` returning `{ ok:true }` or `{ ok:false, reason }` when `setItem` throws
    - Define the `tldd.tasks` and `tldd.links` key constants
    - _Requirements: 12.2, 12.6_



- [x] 3. Implement the GreetingModule
  - [x] 3.1 Implement time and date formatting
    - Write `formatTime(date)` producing `HH:MM:SS` via locale/timezone-aware formatting and `formatDate(date)` producing weekday, month name, day number, and four-digit year in the browser locale
    - _Requirements: 1.1, 1.2_

  - [x] 3.2 Implement period classification and greeting labels
    - Write `classifyPeriod(date)` mapping the local hour to morning (5-11), afternoon (12-16), evening (17-20), night (21-4); write `greetingFor(period)` returning a distinct label per period
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.3 Implement the module lifecycle and tick, and wire into init
    - Write `init()` to render once and start a 1-second interval; write `tick()` to update the time every second, update the date only when the calendar date changes, and update the greeting only when the period changes (using `lastRenderedDateKey` and `lastPeriod`); call `init()` from the `DOMContentLoaded` entry point
    - _Requirements: 1.3, 2.6_



- [x] 4. Implement the FocusTimerModule
  - [x] 4.1 Implement timer state and rendering
    - Initialize `remaining = 1500`, `isRunning = false`; write `render()` to format `remaining` as `MM:SS`; write `init()` to render `25:00` in the stopped state and wire it into the `DOMContentLoaded` entry point
    - _Requirements: 3.1_

  - [x] 4.2 Implement start/stop/reset and countdown transitions
    - Write `start()` guarded so it only acts when `remaining > 0` and is a no-op while already running (continue uninterrupted); `onTick()` to decrement by 1 each second and stop at 0; `stop()` to pause and retain `remaining`; `reset()` to return to `1500`/stopped from any state; bind the three controls
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_


- [x] 5. Checkpoint - read-only features complete
  - Ensure the greeting and focus timer render and behave correctly in the browser, ask the user if questions arise.

- [x] 6. Implement the TodoListModule
  - [x] 6.1 Implement task validation and the Task data model
    - Write shared validation for add/edit: trim for the emptiness check, reject 0 non-whitespace chars ("A description is required."), reject total length over 200 ("Description must be 200 characters or fewer."); define the Task shape `{ id, description, completed }` with unique id generation
    - _Requirements: 4.1, 4.3, 4.4, 5.2, 5.3, 5.4_

  - [x] 6.2 Implement load, persist, and shape validation
    - Write `load()` to read `tldd.tasks`, validate the array shape and adopt it preserving order and completion state, use `[]` when the key is missing, and use `[]` plus a "saved tasks could not be loaded" error on read/parse failure; write `persist()` to write `tldd.tasks` and, on write failure, keep in-memory tasks and show "change could not be saved"
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 12.6_

  - [x] 6.3 Implement render with empty-state and completed styling
    - Write `render()` to rebuild the list from `tasks`, apply the completed-state visual class per task, and show the empty-state message when there are no tasks
    - _Requirements: 6.3, 6.4, 7.4, 13.1_

  - [x] 6.4 Implement add, complete toggle, and delete
    - Write `add(rawText)` to validate, push a new incomplete Task at the end, persist, clear the input, and render (show validation errors without mutating state on failure); `toggleComplete(id)` to flip completion, persist, and revert on persist failure with an error; `remove(id)` to show "task could not be found" when absent, otherwise remove, persist, and render (empty-state when none remain)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.5, 7.1, 7.2, 7.3, 7.4_

  - [x] 6.5 Implement edit flow (begin/confirm/cancel)
    - Write `beginEdit(id)` to render a pre-populated editable input; `confirmEdit(id, rawText)` to validate and replace the description on success (persist, exit edit mode) or keep the previous description and show an error while staying in edit mode; `cancelEdit()` to exit edit mode and restore the original description
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.6 Wire the module into init
    - Call `TodoListModule.init()` from the `DOMContentLoaded` entry point so tasks load and render on page load
    - _Requirements: 8.2, 8.3_


- [x] 7. Checkpoint - to-do list complete
  - Ensure to-do add/edit/complete/delete and persistence work in the browser, ask the user if questions arise.

- [x] 8. Implement the QuickLinksModule
  - [x] 8.1 Implement link validation and the Quick_Link data model
    - Write validation: trim label and require 1-50 chars ("Label must be 1-50 characters."); require a non-empty URL of at most 2048 chars that parses via `new URL(...)` with `http:`/`https:` protocol ("Enter a valid http or https URL."); define the Quick_Link shape `{ id, label, url }` with unique id generation
    - _Requirements: 10.1, 10.3, 10.4_

  - [x] 8.2 Implement load, persist, and shape validation
    - Write `load()` to read `tldd.links`, validate the array shape and adopt it in saved order, use `[]` when the key is missing, and use `[]` while discarding malformed/unparseable data (no error required); write `persist()` to write `tldd.links` and, on write failure, keep in-memory links and show "quick links could not be saved"
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 12.6_

  - [x] 8.3 Implement render with truncation and empty-state
    - Write `render()` to produce one button per link with the label truncated to 30 characters plus a trailing ellipsis when longer, and show the "no quick links" message with no buttons when there are none
    - _Requirements: 9.1, 9.2, 13.2_

  - [x] 8.4 Implement add, remove, and open
    - Write `add(rawLabel, rawUrl)` to validate and, on success, push a Quick_Link, persist, and render; on failure reject, retain the input values, and show a field-specific error; `remove(id)` to remove, persist, and render; `open(id)` to show "link is invalid" for a missing/malformed URL or otherwise open the URL in a new tab with `noopener`
    - _Requirements: 9.3, 9.4, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 8.5 Wire the module into init
    - Call `QuickLinksModule.init()` from the `DOMContentLoaded` entry point so links load and render on page load
    - _Requirements: 11.3, 11.4_


- [x] 9. Implement presentation and responsive styling
  - [x] 9.1 Style the four labeled sections and typography
    - In `css/styles.css`, style the four sections as visually distinct, labeled regions (spacing, borders/background, headings); set base `font-size` to at least 14px on `body` and choose foreground/background color pairs that meet at least 4.5:1 contrast
    - _Requirements: 13.3, 13.4_

  - [x] 9.2 Implement the responsive fluid layout
    - Use flexbox/grid with wrapping, `max-width` containers, `box-sizing: border-box`, and no fixed widths wider than the smallest viewport; add a breakpoint to switch between a single column (narrow) and a multi-column arrangement (wide) so all four sections show without horizontal scrolling or overlap from 320px to 1920px
    - _Requirements: 13.5_


- [x] 10. Final checkpoint - full dashboard
  - Ensure all four sections work together and data persists across reloads in the browser, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional, lightweight manual verification steps and can be skipped for a faster MVP. Per NFR-1 (Requirement 12), the project includes no automated test harness, test framework, or property-based testing setup; verification is manual per the design's Testing Strategy.
- Each task references specific requirement clauses for traceability.
- Checkpoints ensure incremental validation at natural breaks.
- The Focus Timer is intentionally not persisted; no requirement asks for its state to survive reload.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 1, "tasks": ["2.4", "3.1", "3.2", "4.1", "6.1", "8.1"] },
    { "id": 2, "tasks": ["3.3", "4.2", "6.2", "8.2"] },
    { "id": 3, "tasks": ["3.4", "4.3", "6.3", "8.3"] },
    { "id": 4, "tasks": ["6.4", "8.4"] },
    { "id": 5, "tasks": ["6.5", "8.5"] },
    { "id": 6, "tasks": ["6.6", "8.6"] },
    { "id": 7, "tasks": ["6.7", "9.1"] },
    { "id": 8, "tasks": ["9.2"] },
    { "id": 9, "tasks": ["9.3"] }
  ]
}
```

- [x] 11. Implement Feature A — Light / Dark Mode
  - [x] 11.1 Add the no-flash inline script and theme-toggle button to index.html
    - Insert a synchronous `<script>` block inside `<head>` **before** the `<link rel="stylesheet">` that reads `localStorage.getItem('tldd.theme')` and sets `document.documentElement.dataset.theme` to `"dark"` (default) or `"light"`
    - Add a `<button id="theme-toggle">` element above `.dashboard` in `<body>` with a placeholder `aria-label`
    - _Requirements: 14.5, 14.6, 14.1_

  - [x] 11.2 Add light-theme CSS custom property overrides to styles.css
    - Move existing `:root` color tokens to a `[data-theme="dark"]` selector (keeping `:root` as a fallback)
    - Add a `[data-theme="light"]` selector block that overrides all `--color-*` tokens with light-palette values maintaining at least 4.5:1 contrast (Req 13.4)
    - Style the `#theme-toggle` button so it is visible and accessible in both themes
    - _Requirements: 14.2, 14.3, 13.4_

  - [x] 11.3 Implement ThemeModule in app.js
    - Write `ThemeModule` with `current`, `init()`, `apply()`, and `toggle()` methods
    - `init()` reads `tldd.theme` from storage (default `"dark"`), calls `apply()`, binds the toggle button's `click` event to `toggle()`
    - `apply()` sets `document.documentElement.dataset.theme`, updates `#theme-toggle` `aria-label` to reflect the action the next click will perform (Req 14.7)
    - `toggle()` flips `current`, calls `apply()`, persists to `tldd.theme`
    - Call `ThemeModule.init()` first in the `DOMContentLoaded` handler
    - _Requirements: 14.2, 14.3, 14.4, 14.7_


- [x] 12. Implement Feature B — Custom Name in Greeting
  - [x] 12.1 Add the name input form to index.html
    - Inside `#greeting-section`, after the date element, add a `<form id="name-form">` containing a visually-labeled `<input type="text" id="name-input" maxlength="50">` and a `<button type="submit" id="name-save">Save</button>`
    - _Requirements: 15.1_

  - [x] 12.2 Style the name form in styles.css
    - Add styles for `.name-form` so the input and button sit inline within the greeting card without disrupting the existing layout at any viewport width (Req 13.5)
    - _Requirements: 15.1, 13.5_

  - [x] 12.3 Extend GreetingModule with name support in app.js
    - Add `userName` state (empty string default)
    - Write `loadName()` to read `tldd.name` from storage; adopt only if a string of trimmed length 1–50 (Req 15.6, 15.7)
    - Write `saveName(rawInput)`: trim; if empty clear storage key and set `userName = ""`; otherwise validate ≤ 50 chars, set `userName`, persist to `tldd.name` (Req 15.4, 15.5); call `renderGreeting()` in both branches
    - Update `renderGreeting()` to compose `greetingFor(period) + (userName ? ", " + userName + "!" : "!")` and write to `#greeting-label` (Req 15.2, 15.3)
    - Bind `#name-form` submit to `saveName(nameInputEl.value)`; `preventDefault` the form event
    - Call `loadName()` inside `init()` before the first `tick()`
    - On load, populate `#name-input` value with `this.userName` so the field shows the saved name
    - _Requirements: 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_


- [x] 13. Implement Feature C — Configurable Pomodoro Duration
  - [x] 13.1 Add the duration form to index.html
    - Inside `#timer-section`, after the timer-controls div, add `<form id="duration-form">` containing `<label for="duration-input">Session (min)</label>`, `<input type="number" id="duration-input" min="1" max="90" step="1" value="25">`, and `<button type="submit" id="duration-set">Set</button>`
    - _Requirements: 16.1_

  - [x] 13.2 Style the duration form in styles.css
    - Add styles for `.duration-form` to lay out the label, number input, and button inline within the timer card; ensure the number input respects the shared `input` tokens
    - _Requirements: 16.1, 13.5_

  - [x] 13.3 Extend FocusTimerModule with configurable duration in app.js
    - Add `customDuration` state (default 1500)
    - Write `loadDuration()`: read `tldd.pomoDuration`; validate integer in [1, 90]; set `this.customDuration = value * 60` on success, else `1500`; update `#duration-input` value to display the loaded/default minutes (Req 16.4, 16.5)
    - Write `setDuration(rawInput)`: parse as integer; validate [1, 90] — on failure show "Session must be a whole number between 1 and 90." in `#timer-message` and return (Req 16.6); on success update `this.customDuration`, persist to `tldd.pomoDuration`, clear the message, and update `#duration-input`; do NOT call `reset()` (Req 16.7)
    - Update `reset()` to use `this.customDuration` instead of hard-coded `1500` (Req 16.3)
    - Update `init()` to call `loadDuration()` before `render()` and set `this.remaining = this.customDuration` (Req 16.4)
    - Bind `#duration-form` submit to `setDuration(durationInputEl.value)`; `preventDefault`
    - _Requirements: 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_


- [ ] 14. Implement Feature D — Prevent Duplicate Tasks
  - [ ] 14.1 Add duplicate-detection helper to TodoListModule in app.js
    - Write `isDuplicate(description, excludeId = null)`: returns `true` when `this.tasks` contains any task (with `id !== excludeId`) whose `description.trim().toLowerCase()` equals `description.trim().toLowerCase()` (Req 17.1, 17.2)
    - _Requirements: 17.1, 17.2_

  - [ ] 14.2 Guard add() with duplicate check in app.js
    - After existing validation in `add(rawText)`, call `this.isDuplicate(result.value)` before pushing; if `true`, call `notify.message('todo-message', 'A task with this description already exists.')` and return without mutation (Req 17.1)
    - _Requirements: 17.1_

  - [ ] 14.3 Guard confirmEdit() with duplicate check in app.js
    - After existing validation in `confirmEdit(id, rawText)`, call `this.isDuplicate(result.value, id)` before updating the description; if `true`, show the same message, keep `this.editingId = id`, and return without mutation (Req 17.2)
    - _Requirements: 17.2_


- [x] 15. Implement Feature E — Sort Tasks
  - [ ] 15.1 Add sort selector to index.html
    - Inside `#todo-section`, between the `<form id="todo-form">` and `<ul id="todo-list">`, add:
      ```html
      <label class="sr-only" for="todo-sort">Sort tasks</label>
      <select id="todo-sort">
        <option value="date-asc">Date added ↑</option>
        <option value="date-desc">Date added ↓</option>
        <option value="alpha-asc">A → Z</option>
        <option value="alpha-desc">Z → A</option>
        <option value="incomplete-first">Incomplete first</option>
      </select>
      ```
    - _Requirements: 18.1_

  - [ ] 15.2 Style the sort selector in styles.css
    - Add styles for `#todo-sort` to match the dashboard color scheme in both themes (background, border, text color via `var(--color-*)` tokens); ensure the select is full-width within the card on narrow viewports (Req 13.5)
    - _Requirements: 18.1, 13.4, 13.5_

  - [ ] 15.3 Implement sort logic in TodoListModule in app.js
    - Add `currentSort` state (default `"date-asc"`)
    - Write `sortedTasks()`: returns a shallow copy of `this.tasks` sorted according to `this.currentSort`; never mutates `this.tasks` (Req 18.3)
      - `"date-asc"`: `[...this.tasks]` (insertion order)
      - `"date-desc"`: `[...this.tasks].reverse()`
      - `"alpha-asc"`: sort by `description.toLowerCase()` ascending
      - `"alpha-desc"`: sort by `description.toLowerCase()` descending
      - `"incomplete-first"`: stable sort — `completed === false` before `completed === true`, preserving relative order within each group
    - Update `render()` to call `this.sortedTasks()` for the display list instead of iterating `this.tasks` directly (Req 18.3)
    - Write `setSort(key)`: validate key is one of the five identifiers (default to `"date-asc"` if not); set `this.currentSort`; persist to `tldd.taskSort`; call `render()` (Req 18.2, 18.4, 18.7)
    - Update `init()`: read `tldd.taskSort` from storage; validate; set `this.currentSort`; set `#todo-sort` select value to match; then `render()` (Req 18.5, 18.6)
    - Bind `#todo-sort` `change` event to `this.setSort(selectEl.value)` inside `init()`
    - _Requirements: 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_


- [ ] 16. Integration checkpoint — all five new features
  - Verify in the browser that all five features work correctly in isolation and together:
    - Theme toggle switches between light and dark; no flash on reload; `aria-label` updates correctly; theme survives reload
    - Name input personalizes the greeting in all four time periods; clearing the name reverts to the nameless form; name survives reload
    - Setting a custom duration changes what `reset` returns to; running timer is not interrupted by changing the duration field; custom duration survives reload
    - Adding a task whose description (trimmed, case-insensitive) matches an existing task is rejected with the duplicate message for both add and edit flows
    - Sort selector reorders the display-only list in each of the five modes; stored array insertion order is unaffected; selected sort survives reload
    - All four original features (greeting clock, focus timer, to-do CRUD + persistence, quick links) continue to work without regression
  - Ensure all tasks pass, ask the user if questions arise.
  - _Requirements: 14.1–14.7, 15.1–15.7, 16.1–16.7, 17.1–17.3, 18.1–18.7_
