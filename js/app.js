// Life Dashboard — single-file vanilla JS application.
//
// Architecture (see design.md): four self-contained feature modules share a
// small set of helpers. Each module owns its in-memory state, its slice of
// Local Storage, and its own rendering. On DOMContentLoaded the four modules
// are initialized in order.
//
// This file is the scaffold: module stubs plus the init wiring. Helper and
// module logic are filled in by later tasks.

'use strict';

/* ------------------------------------------------------------------ *
 * Shared helpers
 * ------------------------------------------------------------------ */

// `dom` — tiny declarative DOM builders. Rendering constructs real nodes via
// direct DOM APIs and sets user-provided text through textContent / text
// nodes, so user data is never interpreted as markup (never innerHTML).
const dom = {
  // el(tag, props, children) — create an element.
  //   tag:      element tag name, e.g. 'button'.
  //   props:    optional object of properties/attributes:
  //             - className / id / textContent / type / value / etc. set as
  //               element properties when the property exists on the node;
  //             - 'on*' keys (e.g. onClick) and function values bind events;
  //             - a `dataset` object sets data-* attributes;
  //             - everything else is set with setAttribute.
  //   children: optional string, Node, or array of strings/Nodes. Strings
  //             become text nodes (safe), Nodes are appended as-is.
  el(tag, props, children) {
    const node = document.createElement(tag);

    if (props) {
      for (const key of Object.keys(props)) {
        const value = props[key];
        if (value == null) continue;

        if (key === 'dataset' && typeof value === 'object') {
          for (const dataKey of Object.keys(value)) {
            node.dataset[dataKey] = value[dataKey];
          }
        } else if (key.startsWith('on') && typeof value === 'function') {
          // onClick -> 'click', onInput -> 'input', etc.
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key in node) {
          node[key] = value;
        } else {
          node.setAttribute(key, value);
        }
      }
    }

    if (children != null) {
      const list = Array.isArray(children) ? children : [children];
      for (const child of list) {
        if (child == null) continue;
        node.appendChild(
          child instanceof Node ? child : document.createTextNode(String(child))
        );
      }
    }

    return node;
  },

  // clear(node) — remove all child nodes from `node`.
  clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    return node;
  },
};

// `notify` — scoped status/error messaging. Each feature section owns a
// dedicated message area (`<p class="message" role="status" aria-live>` in
// index.html). Messages are written as plain text via textContent, so user
// data can never be interpreted as markup. Modules clear the message on the
// next successful action.
const notify = {
  // message(areaEl, text) — write plain-text `text` into the given message
  //   area element. A null/empty text clears the area. `areaEl` may be the
  //   element itself or an element id string.
  message(areaEl, text) {
    const node = typeof areaEl === 'string'
      ? document.getElementById(areaEl)
      : areaEl;
    if (!node) return;
    node.textContent = text == null ? '' : String(text);
  },

  // clear(areaEl) — empty the given message area.
  clear(areaEl) {
    this.message(areaEl, '');
  },
};

// Local Storage keys. Each persistent module owns exactly one key; defined
// here so modules (and later tasks) share a single source of truth.
//   TASKS_KEY — owned by TodoListModule   (Task[] as JSON)
//   LINKS_KEY — owned by QuickLinksModule (Quick_Link[] as JSON)
//   THEME_KEY — owned by ThemeModule      (string: 'dark' | 'light')
const TASKS_KEY = 'tldd.tasks';
const LINKS_KEY = 'tldd.links';
const THEME_KEY = 'tldd.theme';

// `storage` — thin, fail-soft wrapper over the Local Storage API. Local
// Storage can be unavailable (private mode, disabled, quota full), so every
// method is defensive and NEVER throws to its caller: reads/writes return a
// result object `{ ok, ... }` and `isAvailable` returns a boolean. Callers
// preserve their in-memory state and surface an error via `notify` when a
// result is not ok (Req 12.6). All persistent data is stored here — there is
// no backend (Req 12.2).
const storage = {
  // KEYS — the storage keys owned by the persistent modules, exposed so
  // callers can reference them off the helper as well as via the top-level
  // TASKS_KEY / LINKS_KEY constants.
  KEYS: {
    TASKS: TASKS_KEY,
    LINKS: LINKS_KEY,
  },

  // isAvailable() — feature-detect Local Storage by writing and removing a
  // probe key inside try/catch. Returns true only when both succeed; any
  // thrown error (storage disabled, blocked, or quota-full) yields false.
  isAvailable() {
    const probe = '__tldd_probe__';
    try {
      localStorage.setItem(probe, probe);
      localStorage.removeItem(probe);
      return true;
    } catch (err) {
      return false;
    }
  },

  // readJSON(key) — read and JSON-parse the value at `key`.
  //   Success:  { ok: true, value } where value is the parsed data.
  //   Failure:  { ok: false, reason } with a descriptive reason string:
  //             - 'unavailable' — localStorage.getItem threw (storage blocked);
  //             - 'missing'     — the key is absent (null);
  //             - 'parse-error' — the stored value is not valid JSON.
  //   The distinct reasons let callers tell a missing key (expected, no error)
  //   from a parse failure (surface an error) — see Req 8.3 vs 8.4.
  readJSON(key) {
    let raw;
    try {
      raw = localStorage.getItem(key);
    } catch (err) {
      return { ok: false, reason: 'unavailable' };
    }

    if (raw == null) {
      return { ok: false, reason: 'missing' };
    }

    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch (err) {
      return { ok: false, reason: 'parse-error' };
    }
  },

  // writeJSON(key, value) — JSON-serialize `value` and store it at `key`.
  //   Success:  { ok: true }.
  //   Failure:  { ok: false, reason } when serialization or setItem throws:
  //             - 'serialize-error' — value could not be stringified;
  //             - 'unavailable'     — setItem threw (quota full, disabled, or
  //               otherwise unavailable).
  //   Callers keep their in-memory state and show an error on failure (Req 12.6).
  writeJSON(key, value) {
    let raw;
    try {
      raw = JSON.stringify(value);
    } catch (err) {
      return { ok: false, reason: 'serialize-error' };
    }

    try {
      localStorage.setItem(key, raw);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: 'unavailable' };
    }
  },
};

/* ------------------------------------------------------------------ *
 * Feature modules (empty stubs — implemented in later tasks)
 * ------------------------------------------------------------------ */

const GreetingModule = {
  // --- state ---
  tickHandle: null,
  lastRenderedDateKey: null, // 'YYYY-MM-DD' of the last rendered date
  lastPeriod: null,           // last rendered Time_Of_Day period string
  userName: '',               // saved name, empty string when none (Req 15.6)

  // --- task 3.1: time and date formatting ---

  // formatTime(date) — returns the local time as 'HH:MM:SS' using the
  // browser's locale in 24-hour format (hour, minute, second each 2-digit).
  formatTime(date) {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  },

  // formatDate(date) — returns the local date as a locale-formatted string
  // including weekday name, month name, day number, and four-digit year.
  formatDate(date) {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // --- task 3.2: period classification and greeting labels ---

  // classifyPeriod(date) — maps the local hour to a Time_Of_Day string.
  //   morning:   5 ≤ h ≤ 11
  //   afternoon: 12 ≤ h ≤ 16
  //   evening:   17 ≤ h ≤ 20
  //   night:     h ≥ 21 or h ≤ 4
  classifyPeriod(date) {
    const h = date.getHours();
    if (h >= 5 && h <= 11) return 'morning';
    if (h >= 12 && h <= 16) return 'afternoon';
    if (h >= 17 && h <= 20) return 'evening';
    return 'night'; // h >= 21 || h <= 4
  },

  // greetingFor(period) — returns a distinct greeting label for each period.
  greetingFor(period) {
    switch (period) {
      case 'morning':   return 'Good morning';
      case 'afternoon': return 'Good afternoon';
      case 'evening':   return 'Good evening';
      case 'night':     return 'Good night';
      default:          return 'Hello';
    }
  },

  // --- task 3.3: module lifecycle and tick ---

  // renderGreeting() — compose the greeting string from the current period
  // and the saved userName, then write it to #greeting-label (Req 15.2, 15.3).
  //   With name:    "Good morning, Alice!"
  //   Without name: "Good morning!"
  renderGreeting() {
    const period = this.lastPeriod || this.classifyPeriod(new Date());
    const label = this.greetingFor(period) +
      (this.userName ? ', ' + this.userName + '!' : '!');
    const labelEl = document.getElementById('greeting-label');
    if (labelEl) labelEl.textContent = label;
  },

  // tick() — called every second; updates time unconditionally, and updates
  // date / greeting only when their values have actually changed.
  tick() {
    const now = new Date();

    // Always update the time display (Req 1.3).
    const timeEl = document.getElementById('greeting-time');
    if (timeEl) timeEl.textContent = this.formatTime(now);

    // Update date only when the calendar date rolls over (Req 1.3).
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (dateKey !== this.lastRenderedDateKey) {
      this.lastRenderedDateKey = dateKey;
      const dateEl = document.getElementById('greeting-date');
      if (dateEl) dateEl.textContent = this.formatDate(now);
    }

    // Update greeting only when the period changes (Req 2.6).
    const period = this.classifyPeriod(now);
    if (period !== this.lastPeriod) {
      this.lastPeriod = period;
      this.renderGreeting();
    }
  },

  // loadName() — read 'tldd.name' from storage and adopt it only when it is
  // a string of trimmed length 1–50 (Req 15.6, 15.7). Any other value resets
  // userName to an empty string.
  loadName() {
    const result = storage.readJSON('tldd.name');

    if (result.ok && typeof result.value === 'string') {
      const trimmed = result.value.trim();
      if (trimmed.length >= 1 && trimmed.length <= 50) {
        this.userName = trimmed;
        return;
      }
    }

    this.userName = '';
  },

  // saveName(rawInput) — trim, validate, persist, and re-render (Req 15.4, 15.5).
  //   Empty after trim  → clear storage, userName = ''
  //   Length > 50       → clamp-reject (shouldn't happen via maxlength, guard anyway)
  //   Otherwise         → set userName, persist to 'tldd.name'
  //   Always calls renderGreeting() afterwards.
  saveName(rawInput) {
    const trimmed = String(rawInput).trim();

    if (trimmed.length === 0) {
      // Clear the stored name and reset state (Req 15.4).
      this.userName = '';
      storage.writeJSON('tldd.name', '');
    } else if (trimmed.length <= 50) {
      // Valid non-empty name — persist and update state (Req 15.5).
      this.userName = trimmed;
      storage.writeJSON('tldd.name', trimmed);
    } else {
      // Exceeds 50 chars (maxlength attribute should prevent this, but guard it).
      this.userName = '';
      storage.writeJSON('tldd.name', '');
    }

    this.renderGreeting();
  },

  // init() — load name, render once immediately, then start the 1-second interval.
  init() {
    // Load saved name BEFORE first tick so greeting is personalised immediately (Req 15.6).
    this.loadName();

    // Populate the name input with whatever was loaded (Req 15.7).
    const nameInputEl = document.getElementById('name-input');
    if (nameInputEl) nameInputEl.value = this.userName;

    // Bind the name form submit event (Req 15.4, 15.5).
    const nameForm = document.getElementById('name-form');
    if (nameForm) {
      nameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('name-input');
        this.saveName(input ? input.value : '');
      });
    }

    this.tick();
    this.tickHandle = setInterval(() => this.tick(), 1000);
  },
};

const FocusTimerModule = {
  // --- state ---
  remaining: 1500,       // integer seconds remaining (1500 = 25 minutes)
  isRunning: false,      // false on load (Req 3.1)
  intervalHandle: null,  // setInterval id while counting down
  customDuration: 1500,  // persisted session length in seconds; default 25 min (Req 16.2)

  // --- task 4.1: timer state and rendering ---

  // render() — formats `remaining` as 'MM:SS' and writes it to the display.
  // Also toggles the .running CSS class for the pulse-glow animation.
  render() {
    const displayEl = document.getElementById('timer-display');
    if (!displayEl) return;

    const minutes = Math.floor(this.remaining / 60);
    const seconds = this.remaining % 60;
    displayEl.textContent =
      String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

    // Toggle the .running class so the pulse-glow animation tracks state.
    if (this.isRunning) {
      displayEl.classList.add('running');
    } else {
      displayEl.classList.remove('running');
    }
  },

  // --- task 4.2: start/stop/reset and countdown transitions ---

  // onTick() — decrement remaining by 1; stop automatically at 0 (Req 3.3, 3.6).
  onTick() {
    this.remaining -= 1;
    if (this.remaining <= 0) {
      this.remaining = 0;
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      this.isRunning = false;
    }
    this.render();
  },

  // start() — guarded: no-op when already running (Req 3.7) or remaining is 0.
  // Otherwise begins counting down at 1-second intervals (Req 3.2).
  start() {
    if (this.isRunning) return;       // no-op — continue uninterrupted (Req 3.7)
    if (this.remaining <= 0) return;  // nothing left to count down

    this.isRunning = true;
    this.intervalHandle = setInterval(() => this.onTick(), 1000);
    this.render(); // update .running class immediately
  },

  // stop() — pause and retain remaining time (Req 3.4).
  stop() {
    if (!this.isRunning) return;
    clearInterval(this.intervalHandle);
    this.intervalHandle = null;
    this.isRunning = false;
    this.render(); // remove .running class
    // remaining is intentionally unchanged
  },

  // reset() — return to customDuration stopped from any state (Req 3.5, 16.3).
  reset() {
    clearInterval(this.intervalHandle);
    this.intervalHandle = null;
    this.isRunning = false;
    this.remaining = this.customDuration;
    this.render();
  },

  // loadDuration() — read 'tldd.pomoDuration' from storage and apply it (Req 16.4, 16.5).
  // Validates that the stored value is an integer in [1, 90].
  // On success: sets customDuration = value * 60.
  // On failure (missing/invalid): keeps customDuration = 1500 (default).
  // Updates #duration-input to display the effective minutes.
  loadDuration() {
    const result = storage.readJSON('tldd.pomoDuration');
    const inputEl = document.getElementById('duration-input');

    if (result.ok) {
      const parsed = parseInt(result.value, 10);
      if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 90) {
        this.customDuration = parsed * 60;
        if (inputEl) inputEl.value = parsed;
        return;
      }
    }
    // Invalid or missing — use default 25 minutes.
    this.customDuration = 1500;
    if (inputEl) inputEl.value = 25;
  },

  // setDuration(rawInput) — validate and persist a new session length (Req 16.6, 16.7).
  // Does NOT call reset() so a running timer is never interrupted (Req 16.7).
  setDuration(rawInput) {
    const messageEl = document.getElementById('timer-message');
    const inputEl   = document.getElementById('duration-input');
    const parsed    = parseInt(rawInput, 10);

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
      if (messageEl) messageEl.textContent =
        'Session must be a whole number between 1 and 90.';
      return;
    }

    this.customDuration = parsed * 60;
    storage.writeJSON('tldd.pomoDuration', parsed);
    if (messageEl) messageEl.textContent = '';
    if (inputEl)   inputEl.value = parsed;

    // Update the display immediately if the timer is not running (Req 16.7:
    // a running timer must not be interrupted, so we only update remaining
    // when stopped/idle so the new duration is visible right away).
    if (!this.isRunning) {
      this.remaining = this.customDuration;
      this.render();
    }
  },

  // init() — set initial state, load persisted duration, render, bind controls (Req 3.1, 16.4).
  init() {
    this.isRunning = false;
    this.intervalHandle = null;
    this.loadDuration();               // sets customDuration; may update #duration-input
    this.remaining = this.customDuration;
    this.render();

    const startBtn      = document.getElementById('timer-start');
    const stopBtn       = document.getElementById('timer-stop');
    const resetBtn      = document.getElementById('timer-reset');
    const durationForm  = document.getElementById('duration-form');
    const durationInput = document.getElementById('duration-input');

    if (startBtn) startBtn.addEventListener('click', () => this.start());
    if (stopBtn)  stopBtn.addEventListener('click',  () => this.stop());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

    if (durationForm) {
      durationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.setDuration(durationInput ? durationInput.value : '');
      });
    }
  },
};

// --- TodoListModule helpers ---

// createTask(description) — Task factory.
// Returns a new Task object with a unique id, the given description, and an
// initial incomplete state. `crypto.randomUUID()` is available in all modern
// browsers (Chrome 92+, Firefox 95+, Safari 15.4+, Edge 92+) and satisfies
// the "unique id" requirement without a library (Req 4.1).
function createTask(description) {
  return {
    id: crypto.randomUUID(),
    description,
    completed: false,
    priority: 'none',   // 'high' | 'medium' | 'low' | 'none'
  };
}

// validateTaskDescription(rawText) — shared validation for add and edit.
// Validates the raw text from a task input field and returns a result object:
//   { ok: true,  value: trimmedText }  — valid: ≥1 non-whitespace char, total ≤ 200
//   { ok: false, reason: "..." }       — invalid, with a user-visible reason
//
// Validation rules (applied in this order):
//   1. If trimmed text has 0 non-whitespace characters → "A description is required."
//      (covers both empty strings and whitespace-only strings, Req 4.3, 5.3)
//   2. If the raw total length exceeds 200 characters → "Description must be 200
//      characters or fewer." (Req 4.4, 5.4)
//   On success the returned value is the trimmed text (Req 4.1, 5.2).
function validateTaskDescription(rawText) {
  const trimmed = String(rawText).trim();

  if (trimmed.length === 0) {
    return { ok: false, reason: 'A description is required.' };
  }

  if (String(rawText).length > 200) {
    return { ok: false, reason: 'Description must be 200 characters or fewer.' };
  }

  return { ok: true, value: trimmed };
}

const TodoListModule = {
  // --- state ---
  tasks: [],             // ordered array of Task objects (Req 8.1)
  editingId: null,       // id of task currently in edit mode, or null
  currentSort: 'date-asc', // active sort key; one of the five valid identifiers (Req 18.6)

  // --- task 6.2: load, persist, and shape validation ---

  // isValidTask(entry) — returns true when `entry` is an object with a
  // string `id`, a string `description`, and a boolean `completed`.
  // Used by load() to silently discard malformed entries (Req 8.2).
  isValidTask(entry) {
    if (
      entry === null ||
      typeof entry !== 'object' ||
      typeof entry.id !== 'string' ||
      typeof entry.description !== 'string' ||
      typeof entry.completed !== 'boolean'
    ) return false;
    // priority is optional for backward-compat; normalise missing values in load()
    if (entry.priority !== undefined) {
      const VALID = ['high', 'medium', 'low', 'none'];
      if (!VALID.includes(entry.priority)) return false;
    }
    return true;
  },

  // normalisePriority(entry) — called by load() to add a default priority to
  // tasks saved before this feature existed.
  normalisePriority(entry) {
    if (!['high', 'medium', 'low', 'none'].includes(entry.priority)) {
      entry.priority = 'none';
    }
    return entry;
  },

  // load() — reads tldd.tasks from Local Storage, validates the array shape,
  // and populates this.tasks.
  //
  //   missing key  → this.tasks = [] with no error (Req 8.3)
  //   read/parse failure → this.tasks = [], notify error (Req 8.4)
  //   ok value     → keep only entries that pass isValidTask(), preserving
  //                  order and completion state; silently discard the rest (Req 8.2)
  load() {
    const result = storage.readJSON(TASKS_KEY);

    if (!result.ok) {
      this.tasks = [];
      if (result.reason !== 'missing') {
        // Any failure other than a missing key is unexpected — surface it (Req 8.4).
        notify.message('todo-message', 'saved tasks could not be loaded');
      }
      return;
    }

    // Validate shape: value must be an array; each element must be a Task. (Req 8.2)
    const raw = result.value;
    if (!Array.isArray(raw)) {
      this.tasks = [];
      notify.message('todo-message', 'saved tasks could not be loaded');
      return;
    }

    // Keep only well-formed entries; silently discard invalid ones.
    // Also normalise missing priority fields from older saved data.
    this.tasks = raw
      .filter(entry => this.isValidTask(entry))
      .map(entry => this.normalisePriority(entry));
  },

  // persist() — writes this.tasks to Local Storage.
  //
  //   ok: true  → clear any prior error in the message area (Req 8.5)
  //   ok: false → keep this.tasks unchanged, show "change could not be saved" (Req 8.5)
  //
  // Returns the storage result { ok } so callers (e.g. toggleComplete) can
  // react — for example, reverting an optimistic state change.
  persist() {
    const result = storage.writeJSON(TASKS_KEY, this.tasks);

    if (!result.ok) {
      notify.message('todo-message', 'change could not be saved');
    } else {
      notify.clear('todo-message');
    }

    return result;
  },

  // --- task 15.3: sort logic ---

  // VALID_SORT_KEYS — the five accepted sort identifiers (Req 18.1, 18.7).
  VALID_SORT_KEYS: ['date-asc', 'date-desc', 'alpha-asc', 'alpha-desc', 'incomplete-first', 'priority-first'],

  // sortedTasks() — returns a sorted shallow copy of this.tasks (Req 18.3).
  // Never mutates this.tasks — callers always receive a fresh array.
  //   'date-asc':        insertion order (natural array order)
  //   'date-desc':       reversed insertion order
  //   'alpha-asc':       case-insensitive alphabetical A→Z
  //   'alpha-desc':      case-insensitive alphabetical Z→A
  //   'incomplete-first': stable — false (incomplete) before true (complete),
  //                       preserving relative order within each group
  sortedTasks() {
    switch (this.currentSort) {
      case 'date-desc':
        return [...this.tasks].reverse();
      case 'alpha-asc':
        return [...this.tasks].sort((a, b) =>
          a.description.toLowerCase().localeCompare(b.description.toLowerCase())
        );
      case 'alpha-desc':
        return [...this.tasks].sort((a, b) =>
          b.description.toLowerCase().localeCompare(a.description.toLowerCase())
        );
      case 'incomplete-first':
        return [...this.tasks].sort((a, b) => {
          // false (0) sorts before true (1) — stable because sort() in V8/modern
          // engines is guaranteed stable (ES2019+).
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        });
      case 'priority-first': {
        const ORDER = { high: 0, medium: 1, low: 2, none: 3 };
        return [...this.tasks].sort((a, b) => {
          const pa = ORDER[a.priority] ?? 3;
          const pb = ORDER[b.priority] ?? 3;
          if (pa !== pb) return pa - pb;
          // Secondary: incomplete before complete within same priority level.
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return 0;
        });
      }
      case 'date-asc':
      default:
        return [...this.tasks]; // insertion order
    }
  },

  // setSort(key) — validate, persist, and re-render with the new sort (Req 18.2, 18.4, 18.7).
  setSort(key) {
    // Validate; fall back to 'date-asc' for any unrecognised value (Req 18.7).
    this.currentSort = this.VALID_SORT_KEYS.includes(key) ? key : 'date-asc';
    storage.writeJSON('tldd.taskSort', this.currentSort);
    this.render(); // re-render within the same call stack — well within 200 ms (Req 18.2)
  },

  // --- task 6.3: render with empty-state and completed styling ---

  // render() — rebuilds the displayed task list from this.tasks.
  //
  //   Empty state: clears the list, writes the empty-state message into the
  //   message area, and returns early (Req 7.4).
  //
  //   Non-empty: clears any prior message, then constructs one <li> per task
  //   using dom.el() (never innerHTML — Req 13.1). Each <li> carries:
  //     - data-id attribute for look-up by later event handlers
  //     - a checkbox (type="checkbox", checked when completed)
  //     - a <span class="todo-text"> with the description as textContent
  //     - an "Edit" button
  //     - a "Delete" button with class "btn-delete"
  //   When task.completed is true the <li> gets both "completed" (matches the
  //   existing CSS rule) and "task-completed" (Req 6.3); when false neither
  //   class is present (Req 6.4).
  //
  //   Event handlers are NOT wired here — that is done in tasks 6.4 and 6.5.
  render() {
    const listEl = document.getElementById('todo-list');
    if (!listEl) return;

    dom.clear(listEl);

    if (this.tasks.length === 0) {
      // Empty-state: show the message and leave the list empty (Req 7.4).
      notify.message('todo-message', 'No tasks yet. Add one above!');
      return;
    }

    // Non-empty: clear any prior message (success path).
    notify.clear('todo-message');

    for (const task of this.sortedTasks()) {
      // Checkbox — checked state reflects completion (Req 6.3, 6.4).
      const checkbox = dom.el('input', {
        type: 'checkbox',
        checked: task.completed,
        'aria-label': 'Toggle complete',
      });

      let descSpan, editBtn, deleteBtn, editInput, saveBtn, cancelBtn;

      if (task.id === this.editingId) {
        // Edit mode: replace description span and Edit/Delete with an input + Save/Cancel (Req 5.1).
        editInput = dom.el('input', {
          type: 'text',
          className: 'edit-input',
          value: task.description,
          'aria-label': 'Edit task description',
        });

        saveBtn = dom.el('button', {
          type: 'button',
          textContent: 'Save',
          className: 'btn-save',
        });

        cancelBtn = dom.el('button', {
          type: 'button',
          textContent: 'Cancel',
          className: 'btn-cancel',
        });

        // Build the list item in edit mode.
        var li = dom.el('li', {
          dataset: { id: task.id },
        }, [checkbox, editInput, saveBtn, cancelBtn]);
      } else {
        // Normal mode: description span — textContent only, never innerHTML (Req 13.1).
        descSpan = dom.el('span', { className: 'todo-text' });
        descSpan.textContent = task.description;

        // Action buttons — handlers wired in tasks 6.4 and 6.5.
        editBtn = dom.el('button', {
          type: 'button',
          textContent: 'Edit',
          className: 'btn-edit',
        });

        deleteBtn = dom.el('button', {
          type: 'button',
          textContent: '✕',
          className: 'btn-delete',
          'aria-label': 'Delete task',
        });

        // Priority badge — shows current level, click to cycle (none → high → medium → low → none).
        const PRIORITY_LABEL = { high: '● High', medium: '● Med', low: '● Low', none: '○' };
        const PRIORITY_CLASS = { high: 'priority-high', medium: 'priority-medium', low: 'priority-low', none: 'priority-none' };
        const pLevel = task.priority || 'none';
        const priorityBtn = dom.el('button', {
          type: 'button',
          textContent: PRIORITY_LABEL[pLevel],
          className: 'btn-priority ' + PRIORITY_CLASS[pLevel],
          'aria-label': 'Priority: ' + pLevel + '. Click to change.',
        });

        // Build the list item in normal mode.
        var li = dom.el('li', {
          dataset: { id: task.id },
        }, [checkbox, priorityBtn, descSpan, editBtn, deleteBtn]);
      }

      // Apply visual class for completed tasks (Req 6.3); omit when incomplete (Req 6.4).
      if (task.completed) {
        li.classList.add('completed', 'task-completed');
      }

      // Tag the <li> with data-priority so CSS can style the left border.
      li.dataset.priority = task.priority || 'none';

      listEl.appendChild(li);
    }
  },

  // --- task 6.4: add, toggleComplete, and remove ---

  // add(rawText) — validate, create a new task, persist, clear input, render.
  // On validation failure shows the error without mutating state (Req 4.1–4.4).
  add(rawText) {
    const result = validateTaskDescription(rawText);

    if (!result.ok) {
      notify.message('todo-message', result.reason);
      return;
    }

    // Read selected priority from the picker (default 'none' if nothing active).
    const activeBtn = document.querySelector('.btn-pick-priority[aria-pressed="true"]');
    const chosenPriority = activeBtn ? activeBtn.dataset.priority : 'none';

    // Validation passed — create the task with chosen priority.
    const task = createTask(result.value);
    task.priority = chosenPriority;
    this.tasks.push(task);
    this.persist();

    // Clear the input field and reset the priority picker.
    const inputEl = document.getElementById('todo-input');
    if (inputEl) inputEl.value = '';
    document.querySelectorAll('.btn-pick-priority').forEach(b => {
      b.setAttribute('aria-pressed', 'false');
    });

    this.render();
  },

  // toggleComplete(id) — flip completion, persist, revert on failure (Req 6.1, 6.2, 6.5).
  toggleComplete(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return; // id not found — do nothing

    // Optimistic flip.
    task.completed = !task.completed;

    const result = this.persist();
    if (!result.ok) {
      // Revert the flip so in-memory state stays consistent with storage.
      task.completed = !task.completed;
      // Re-render so the DOM reflects the reverted state (Req 6.5).
      this.render();
      return;
    }

    this.render();
  },

  // togglePriority(id) — cycle priority: none → high → medium → low → none.
  // Persists and re-renders on each change.
  togglePriority(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    const cycle = { none: 'high', high: 'medium', medium: 'low', low: 'none' };
    task.priority = cycle[task.priority] || 'none';
    this.persist();
    this.render();
  },

  // remove(id) — find and remove the task, persist, and render (Req 7.1–7.4).
  // render() handles the empty-state message when no tasks remain (Req 7.4).
  remove(id) {
    const index = this.tasks.findIndex(t => t.id === id);

    if (index === -1) {
      notify.message('todo-message', 'task could not be found');
      return;
    }

    this.tasks.splice(index, 1);
    this.persist();
    this.render();
  },

  // --- task 6.5: edit flow ---

  // beginEdit(id) — enter edit mode for the given task (Req 5.1).
  // Sets editingId and re-renders so render() substitutes the edit controls.
  beginEdit(id) {
    this.editingId = id;
    this.render();
  },

  // confirmEdit(id, rawText) — validate the edited text and apply or reject (Req 5.2–5.4).
  //   Validation failure: show error, stay in edit mode, leave task unchanged.
  //   Validation success: update description, persist, exit edit mode, re-render.
  confirmEdit(id, rawText) {
    const result = validateTaskDescription(rawText);

    if (!result.ok) {
      // Stay in edit mode and show the error (Req 5.3, 5.4).
      notify.message('todo-message', result.reason);
      this.editingId = id;
      return;
    }

    const task = this.tasks.find(t => t.id === id);
    if (!task) return; // guard: task was removed concurrently (shouldn't happen)

    task.description = result.value; // Req 5.2
    this.persist();
    this.editingId = null;
    this.render();
  },

  // cancelEdit() — exit edit mode without saving; description was never mutated (Req 5.5).
  cancelEdit() {
    this.editingId = null;
    this.render();
  },

  // --- task 6.6: init (stub — wired into DOMContentLoaded) ---
  init() {
    this.load();

    // Load persisted sort key and validate it (Req 18.5, 18.6, 18.7).
    const sortResult = storage.readJSON('tldd.taskSort');
    if (sortResult.ok && this.VALID_SORT_KEYS.includes(sortResult.value)) {
      this.currentSort = sortResult.value;
    } else {
      this.currentSort = 'date-asc'; // default (Req 18.6)
    }

    // Reflect the loaded sort in the selector before first render (Req 18.5).
    const sortEl = document.getElementById('todo-sort');
    if (sortEl) {
      sortEl.value = this.currentSort;
      sortEl.addEventListener('change', () => this.setSort(sortEl.value));
    }

    this.render();

    // Wire priority picker: toggle aria-pressed, satu aktif sekaligus.
    const pickerEl = document.getElementById('todo-priority-picker');
    if (pickerEl) {
      pickerEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-pick-priority');
        if (!btn) return;
        const wasActive = btn.getAttribute('aria-pressed') === 'true';
        // Reset all first.
        pickerEl.querySelectorAll('.btn-pick-priority').forEach(b =>
          b.setAttribute('aria-pressed', 'false')
        );
        // Toggle: click active button turns it off; click inactive turns it on.
        if (!wasActive) btn.setAttribute('aria-pressed', 'true');
      });
    }

    // Wire the todo form submit (covers both Add button click and Enter key press,
    // Req 4.2). preventDefault stops the browser from reloading the page.
    const todoForm = document.getElementById('todo-form');
    if (todoForm) {
      todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('todo-input');
        if (input) this.add(input.value);
      });
    }

    // Event delegation on the list for checkbox (toggleComplete) and delete (remove).
    // Edit button delegation is wired in task 6.5.
    const listEl = document.getElementById('todo-list');
    if (listEl) {
      listEl.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
          const li = e.target.closest('li[data-id]');
          if (li) this.toggleComplete(li.dataset.id);
        }
      });
      listEl.addEventListener('click', (e) => {
        // Delete button → remove
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
          const li = deleteBtn.closest('li[data-id]');
          if (li) this.remove(li.dataset.id);
        }

        // Priority button → togglePriority
        const priorityBtn = e.target.closest('.btn-priority');
        if (priorityBtn) {
          const li = priorityBtn.closest('li[data-id]');
          if (li) this.togglePriority(li.dataset.id);
        }

        // Edit button → beginEdit (Req 5.1)
        const editBtn = e.target.closest('.btn-edit');
        if (editBtn) {
          const li = editBtn.closest('li[data-id]');
          if (li) this.beginEdit(li.dataset.id);
        }

        // Save button → confirmEdit (Req 5.2–5.4)
        const saveBtn = e.target.closest('.btn-save');
        if (saveBtn) {
          const li = saveBtn.closest('li[data-id]');
          if (li) {
            const editInput = li.querySelector('.edit-input');
            this.confirmEdit(li.dataset.id, editInput ? editInput.value : '');
          }
        }

        // Cancel button → cancelEdit (Req 5.5)
        const cancelBtn = e.target.closest('.btn-cancel');
        if (cancelBtn) this.cancelEdit();
      });
    }
  },
};

// --- QuickLinksModule helpers ---

// createLink(label, url) — Quick_Link factory.
// Returns a new Quick_Link object with a unique id, the given label, and url.
// Mirrors createTask() in structure (Req 10.1).
function createLink(label, url) {
  return {
    id: crypto.randomUUID(),
    label,
    url,
  };
}

// validateLinkLabel(rawLabel) — validates the label input value.
//   Trim first; if trimmed length is 0 or > 50 → { ok: false, reason }
//   Otherwise                                  → { ok: true,  value: trimmedLabel }
// (Req 10.3, 10.4)
function validateLinkLabel(rawLabel) {
  const trimmed = String(rawLabel).trim();
  if (trimmed.length === 0 || trimmed.length > 50) {
    return { ok: false, reason: 'Label must be 1-50 characters.' };
  }
  return { ok: true, value: trimmed };
}

// validateLinkUrl(rawUrl) — validates the URL input value.
//   Empty string or length > 2048     → reject
//   new URL() throws                  → reject
//   protocol not http: or https:      → reject
//   Otherwise                         → { ok: true, value: rawUrl }
// (Req 10.3, 10.4)
function validateLinkUrl(rawUrl) {
  const raw = String(rawUrl);
  if (raw.length === 0 || raw.length > 2048) {
    return { ok: false, reason: 'Enter a valid http or https URL.' };
  }
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (err) {
    return { ok: false, reason: 'Enter a valid http or https URL.' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Enter a valid http or https URL.' };
  }
  return { ok: true, value: raw };
}

const QuickLinksModule = {
  // --- state ---
  links: [], // ordered array of Quick_Link objects

  // --- task 8.2: isValidLink, load, persist ---

  // isValidLink(entry) — shape guard used by load() to silently discard
  // malformed entries (Req 11.5).
  isValidLink(entry) {
    return (
      entry !== null &&
      typeof entry === 'object' &&
      typeof entry.id === 'string' &&
      typeof entry.label === 'string' &&
      typeof entry.url === 'string'
    );
  },

  // load() — reads tldd.links from Local Storage and populates this.links.
  //   missing key         → this.links = [], no error (Req 11.4)
  //   read/parse failure  → this.links = [], discard silently (Req 11.5)
  //   ok value            → keep only entries passing isValidLink(), in order (Req 11.3)
  load() {
    const result = storage.readJSON(LINKS_KEY);

    if (!result.ok) {
      this.links = [];
      // Missing key is expected on first run — no error (Req 11.4).
      // Any other failure (unavailable, parse-error) → discard silently (Req 11.5).
      return;
    }

    const raw = result.value;
    if (!Array.isArray(raw)) {
      this.links = [];
      return;
    }

    // Keep only well-formed entries; silently discard invalid ones (Req 11.3, 11.5).
    this.links = raw.filter(entry => this.isValidLink(entry));
  },

  // persist() — writes this.links to Local Storage.
  //   ok: true  → clear any prior message (Req 11.1)
  //   ok: false → show "quick links could not be saved" (Req 11.2, 12.6)
  persist() {
    const result = storage.writeJSON(LINKS_KEY, this.links);

    if (!result.ok) {
      notify.message('links-message', 'quick links could not be saved');
    } else {
      notify.clear('links-message');
    }

    return result;
  },

  // --- task 8.3: render ---

  // render() — rebuilds #links-buttons from this.links using dom.el().
  //   Empty state: show empty-state message, clear the buttons container (Req 9.2)
  //   Non-empty:   clear message, render one button + one remove button per link (Req 9.1)
  //   Labels longer than 30 chars are truncated with '…' appended (Req 9.1)
  //   Never uses innerHTML (Req 13.2)
  render() {
    const container = document.getElementById('links-buttons');
    if (!container) return;

    dom.clear(container);

    if (this.links.length === 0) {
      notify.message('links-message', 'No quick links yet.');
      return;
    }

    notify.clear('links-message');

    // Icon map — matched case-insensitively against the link label.
    const ICONS = { github: 'GH', facebook: 'FB' };

    for (const link of this.links) {
      // Truncate label to 30 chars (Req 9.1).
      const displayLabel = link.label.length > 30
        ? link.label.slice(0, 30) + '\u2026'
        : link.label;

      // Pick an icon based on the label, fall back to a generic link symbol.
      const iconKey = Object.keys(ICONS).find(k =>
        link.label.toLowerCase().includes(k)
      );
      const iconText = iconKey ? ICONS[iconKey] : '\uD83D\uDD17';

      const iconSpan = dom.el('span', { className: 'link-icon', 'aria-hidden': 'true' });
      iconSpan.textContent = iconText;

      const labelSpan = dom.el('span', { className: 'link-label' });
      labelSpan.textContent = displayLabel;

      // Link button — click opens the URL (Req 9.3). No delete button.
      const linkBtn = dom.el('button', {
        type: 'button',
        className: 'btn-link',
        dataset: { id: link.id },
        'aria-label': link.label,
      }, [iconSpan, labelSpan]);

      container.appendChild(linkBtn);
    }
  },

  // --- task 8.4: add, remove, open ---

  // add(rawLabel, rawUrl) — validate both fields, create link, persist, render.
  //   Any failure: show field-specific error, retain input values, return early (Req 10.3–10.5)
  //   Label errors take priority over URL errors (Req 10.3)
  //   On success: create link, push, persist, render (Req 10.1)
  add(rawLabel, rawUrl) {
    const labelResult = validateLinkLabel(rawLabel);
    const urlResult   = validateLinkUrl(rawUrl);

    if (!labelResult.ok) {
      // Label error takes priority — show it and stop (Req 10.3).
      notify.message('links-message', labelResult.reason);
      return; // inputs intentionally NOT cleared (Req 10.5)
    }

    if (!urlResult.ok) {
      notify.message('links-message', urlResult.reason);
      return; // inputs intentionally NOT cleared (Req 10.5)
    }

    // Both valid — create and append the link (Req 10.1).
    const link = createLink(labelResult.value, urlResult.value);
    this.links.push(link);
    this.persist();

    // Clear inputs only on success.
    const labelInput = document.getElementById('link-label-input');
    const urlInput   = document.getElementById('link-url-input');
    if (labelInput) labelInput.value = '';
    if (urlInput)   urlInput.value   = '';

    this.render();
  },

  // remove(id) — find by id, splice from array, persist, render (Req 10.2).
  remove(id) {
    const index = this.links.findIndex(l => l.id === id);
    if (index === -1) return; // not found — do nothing

    this.links.splice(index, 1);
    this.persist();
    this.render();
  },

  // open(id) — open the link URL in a new tab (Req 9.3).
  //   Link not found or URL not valid http/https → show error (Req 9.4)
  open(id) {
    const link = this.links.find(l => l.id === id);

    if (!link) {
      notify.message('links-message', 'link is invalid');
      return;
    }

    // Re-validate the stored URL before opening (Req 9.4).
    const urlResult = validateLinkUrl(link.url);
    if (!urlResult.ok) {
      notify.message('links-message', 'link is invalid');
      return;
    }

    window.open(link.url, '_blank', 'noopener');
  },

  // --- task 8.5: init ---

  init() {
    this.links = [];
    this.load();

    // Seed default links on first run (when storage is empty).
    // These are only added once — subsequent loads restore from storage.
    if (this.links.length === 0) {
      this.links = [
        createLink('GitHub',   'https://github.com/nasitumpah'),
        createLink('Facebook', 'https://www.facebook.com/share/1HBAZfXwRW/'),
      ];
      this.persist();
    }

    this.render();

    // Add form removed — quick links are managed via seed defaults only.

    // Event delegation on the buttons container for open and remove clicks.
    const container = document.getElementById('links-buttons');
    if (container) {
      container.addEventListener('click', (e) => {
        // Link button — click opens the URL.
        const linkBtn = e.target.closest('button[data-id]');
        if (linkBtn) {
          this.open(linkBtn.dataset.id);
        }
      });
    }
  },
};

/* ------------------------------------------------------------------ *
 * ThemeModule — light / dark mode (Feature A, Req 14.1–14.7)
 * ------------------------------------------------------------------ */

const ThemeModule = {
  // current theme; overwritten by init() from storage
  current: 'dark',

  // init() — read persisted theme, default to 'dark', sync DOM, bind button.
  init() {
    const result = storage.readJSON(THEME_KEY);
    this.current = (result.ok && result.value === 'light') ? 'light' : 'dark';

    // DOM already has data-theme set by the inline script (no-flash, Req 14.5).
    // Call apply() to sync the button label/icon with the persisted value.
    this.apply();

    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', () => this.toggle());
  },

  // apply() — write data-theme and update the toggle button's label/icon.
  apply() {
    document.documentElement.dataset.theme = this.current;

    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    if (this.current === 'dark') {
      // Dark is active → next action is "switch to light" (Req 14.7).
      btn.setAttribute('aria-label', 'Switch to light mode');
      btn.textContent = '🌙';
    } else {
      // Light is active → next action is "switch to dark" (Req 14.7).
      btn.setAttribute('aria-label', 'Switch to dark mode');
      btn.textContent = '☀️';
    }
  },

  // toggle() — flip the theme, apply it, and persist (Req 14.2, 14.3, 14.4).
  toggle() {
    this.current = (this.current === 'dark') ? 'light' : 'dark';
    this.apply();
    // Best-effort persistence — failures are silent (Req 14.4).
    storage.writeJSON(THEME_KEY, this.current);
  },
};


/* ------------------------------------------------------------------ *
 * VideoBgModule — animated video background with adjustable blur
 * ------------------------------------------------------------------ */

const VideoBgModule = {
  // --- state ---
  blurLevel: 8,       // current blur in px (0–20)
  MIN_BLUR: 0,
  MAX_BLUR: 20,
  STORAGE_KEY: 'tldd.bgBlur',

  // apply(level) — clamp, store in state, write CSS variable, update slider + badge.
  apply(level) {
    this.blurLevel = Math.max(this.MIN_BLUR, Math.min(this.MAX_BLUR, Math.round(level)));
    document.documentElement.style.setProperty('--bg-blur', this.blurLevel + 'px');

    const slider = document.getElementById('blur-slider');
    const badge  = document.getElementById('blur-value');
    if (slider) slider.value = this.blurLevel;
    if (badge)  badge.textContent = this.blurLevel;
  },

  // persist() — save current blur level to localStorage (best-effort, silent on failure).
  persist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, String(this.blurLevel));
    } catch (_) { /* quota / blocked — ignore */ }
  },

  // load() — read persisted blur level; fall back to default 8.
  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw !== null) {
        const parsed = parseInt(raw, 10);
        if (Number.isInteger(parsed) && parsed >= this.MIN_BLUR && parsed <= this.MAX_BLUR) {
          return parsed;
        }
      }
    } catch (_) { /* unavailable */ }
    return 8; // default
  },

  // init() — set up video element, detect load, wire blur slider.
  init() {
    const video     = document.getElementById('bg-video');
    const container = document.getElementById('bg-video-container');

    if (!video || !container) return;

    // Restore persisted blur before video confirmation so there's no flash.
    const savedBlur = this.load();
    this.apply(savedBlur);

    // Mark body as has-video only after the video actually starts playing.
    // This keeps the original gradient background as fallback if video fails.
    const activateVideo = () => {
      document.body.classList.add('has-video');
    };

    video.addEventListener('playing', activateVideo, { once: true });

    // If autoplay is blocked or src is missing, the video stays hidden gracefully.
    video.addEventListener('error', () => {
      document.body.classList.remove('has-video');
    });

    // Attempt to play (autoplay attribute handles most cases, but call play()
    // explicitly as a safety net for browsers that need it).
    video.play().catch(() => {
      // Autoplay blocked — keep fallback gradient, hide blur control.
    });

    // Wire blur slider.
    const slider = document.getElementById('blur-slider');
    if (slider) {
      slider.addEventListener('input', () => {
        this.apply(parseInt(slider.value, 10));
        this.persist();
      });
    }
  },
};

/* ------------------------------------------------------------------ *
 * Entry point: initialize the four modules in order.
 * ------------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  VideoBgModule.init();
  ThemeModule.init();
  GreetingModule.init();
  FocusTimerModule.init();
  TodoListModule.init();
  QuickLinksModule.init();
});
