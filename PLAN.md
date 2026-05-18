# Refactor Plan: `js/app.js` → Multiple Modules

## Goal

Break the single 800-line `app.js` into focused, single-responsibility modules using native ES6 modules (`import`/`export`). No build tooling required — modern browsers support `<script type="module">` natively.

---

## Proposed File Structure

```
js/
├── constants.js   # All magic numbers and string keys
├── state.js       # Game state object and loop timer variables
├── ui.js          # DOM reference cache
├── utils.js       # Pure helper functions (formatting, cost math, logging)
├── storage.js     # Save/load persistence layer
├── render.js      # UI rendering (updateUI split into phase renderers)
├── events.js      # All click event listener registrations
├── loop.js        # Game loop: mainLoop + phase-specific tick helpers
└── main.js        # Entry point — init, wiring, first rAF call
```

`app.js` is deleted. `index.html` gets one script tag changed:
```html
<!-- Before -->
<script src="js/app.js"></script>

<!-- After -->
<script type="module" src="js/main.js"></script>
```

---

## Module Breakdown

### `js/constants.js`
**Exports:** named constants only. No side effects.

Extracts:
- `SAVE_STORAGE_KEY`
- `BASE_FINDER_COST`, `BASE_SUBMITTER_COST`
- `BASE_TYPIST_COST`, `BASE_COURIER_COST`, `PROCURE_FIXED_COST`

```js
export const SAVE_STORAGE_KEY = 'cubicle_chronicles_save_v3';
export const BASE_FINDER_COST = 50;
// ...
```

---

### `js/state.js`
**Exports:** `state` object and the four loop timer variables.

Extracts the `state` object (lines 11–50) and the sub-second timer variables (`lastTimestamp`, `paperPriceTimer`, `cloudSaveTimer`, `warningThrottleTimer`).

Keeping them together makes sense because the loop mutates all of them in one place.

```js
export let state = { phase: 1, money: 1.00, ... };
export let lastTimestamp = performance.now();
export let paperPriceTimer = 0.0;
// ...
```

---

### `js/ui.js`
**Exports:** `ui` DOM reference object.

Extracts the entire `ui = { ... }` block (lines 67–147). Centralizes all `getElementById` calls so they're never scattered across other modules.

```js
export const ui = {
    p1Container: document.getElementById('phase1-container'),
    // ...
};
```

---

### `js/utils.js`
**Exports:** `logMessage`, `formatMoney`, `getGeometricCost`, `getExponentialCost`.

Pure or near-pure helpers with no game-logic side effects. `logMessage` depends on `ui.log` but has no state mutation.

```js
import { ui } from './ui.js';
export function formatMoney(amount) { ... }
export function logMessage(msg, type = "") { ... }
export function getGeometricCost(base, rate, level) { ... }
export function getExponentialCost(base, multiplier, level) { ... }
```

---

### `js/storage.js`
**Exports:** `triggerCloudSave`, `loadCloudState`.

Isolates all `localStorage` access. Depends on `state` and `SAVE_STORAGE_KEY`. Makes the persistence layer easy to swap later (e.g. IndexedDB, server sync).

```js
import { SAVE_STORAGE_KEY } from './constants.js';
import { state } from './state.js';
import { logMessage } from './utils.js';

export function triggerCloudSave(manual = false) { ... }
export function loadCloudState() { ... }
```

---

### `js/render.js`
**Exports:** `updateUI`.

Extracts the large `updateUI` function (lines 220–416) and splits it into three internal helpers:

- `renderCommon()` — money display, bankruptcy overlay, beg button
- `renderPhase1()` — all Phase 1 display logic (~100 lines)
- `renderPhase2()` — all Phase 2 display logic (~60 lines)
- `updateUI()` — dispatches to the above based on `state.phase`

This split makes each phase's render logic independently readable without changing any external behavior.

```js
import { state } from './state.js';
import { ui } from './ui.js';
import { formatMoney, getGeometricCost, getExponentialCost } from './utils.js';
import { BASE_FINDER_COST, ... } from './constants.js';

function renderPhase1() { ... }
function renderPhase2() { ... }
export function updateUI() { ... }
```

---

### `js/events.js`
**Exports:** `registerEventListeners`.

Extracts all `addEventListener` calls (lines 418–668) into one function called once at startup. Groups them into three internal blocks matching the existing comment structure:

- Phase 1 action buttons (beg, find, apply, finder/submitter upgrades, provider tabs, parental upgrades, interview)
- Phase 2 action buttons (paper, write, submit, compliment, lunch, typist, courier, procurement)
- Debug panel buttons

Avoids a single giant flat scope of listeners by wrapping them in a callable function.

```js
import { state } from './state.js';
import { ui } from './ui.js';
import { logMessage } from './utils.js';
import { updateUI } from './render.js';
import { triggerCloudSave } from './storage.js';
import { transitionToPhase } from './loop.js';
import { SAVE_STORAGE_KEY, ... } from './constants.js';

export function registerEventListeners() { ... }
```

---

### `js/loop.js`
**Exports:** `mainLoop`, `transitionToPhase`.

Extracts `mainLoop` (lines 671–791) and `transitionToPhase` (lines 202–218), splitting the loop body into two internal tick helpers:

- `tickPhase1(dt)` — money drain, auto-finder, auto-submitter, contract timer, provider randomization
- `tickPhase2(dt)` — salary income, typist drafting, courier submissions, credibility/approval decay, auto-procurement
- `mainLoop(ts)` — clamps dt, dispatches ticks, runs paper price fluctuation, auto-save, calls `updateUI`, schedules next frame

`transitionToPhase` belongs here because it touches phase-state and triggers `updateUI`, making it a loop-level concern rather than an event or render concern.

```js
import { state, lastTimestamp, ... } from './state.js';
import { ui } from './ui.js';
import { logMessage } from './utils.js';
import { triggerCloudSave } from './storage.js';
import { updateUI } from './render.js';
import { ... } from './constants.js';

function tickPhase1(dt) { ... }
function tickPhase2(dt) { ... }
export function transitionToPhase(targetPhase) { ... }
export function mainLoop(currentTimestamp) { ... }
```

---

### `js/main.js`
**Exports:** nothing. Side-effect-only entry point.

Handles:
- Mobile gesture prevention (the two `document.addEventListener` calls at the top of app.js)
- `window.onload`: calls `loadCloudState`, `transitionToPhase`, `requestAnimationFrame(mainLoop)`
- Calls `registerEventListeners()`

```js
import { loadCloudState } from './storage.js';
import { transitionToPhase, mainLoop } from './loop.js';
import { registerEventListeners } from './events.js';
import { state } from './state.js';

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('touchmove', e => { if (e.scale !== 1) e.preventDefault(); }, { passive: false });

registerEventListeners();

window.onload = function () {
    loadCloudState();
    transitionToPhase(state.phase === 2 ? 2 : 1);
    requestAnimationFrame(mainLoop);
};
```

---

## Dependency Graph

```
constants.js   (no deps)
state.js       (no deps)
ui.js          (no deps)
utils.js       ← ui.js
storage.js     ← constants.js, state.js, utils.js
render.js      ← state.js, ui.js, utils.js, constants.js
loop.js        ← state.js, ui.js, utils.js, storage.js, render.js, constants.js
events.js      ← state.js, ui.js, utils.js, render.js, storage.js, loop.js, constants.js
main.js        ← storage.js, loop.js, events.js, state.js
```

No circular dependencies.

---

## Key Decisions

**ES modules over script tags:** Using `type="module"` gives us real `import`/`export` without a bundler, avoids global namespace collisions, and defers scripts automatically (no `defer` attribute needed).

**`state` as a mutable exported object:** Since multiple modules need to read and write `state`, it's exported as a plain object and mutated in place. This avoids a complex store/dispatch pattern that would be over-engineered for this game's scale.

**No new abstractions:** Every module boundary maps directly to an existing logical grouping already evident in the `app.js` comments. Nothing is redesigned — only separated.

---

## Implementation Steps

1. Create `js/constants.js` — copy constants, verify nothing breaks.
2. Create `js/state.js` — move state + timer vars.
3. Create `js/ui.js` — move the `ui` object.
4. Create `js/utils.js` — move 4 helpers, import `ui`.
5. Create `js/storage.js` — move 2 functions, wire imports.
6. Create `js/render.js` — move `updateUI`, split into 3 internal helpers.
7. Create `js/loop.js` — move `mainLoop` + `transitionToPhase`, split into `tickPhase1`/`tickPhase2`.
8. Create `js/events.js` — move all listeners into `registerEventListeners()`.
9. Create `js/main.js` — wire everything together as the entry point.
10. Update `index.html` — replace `<script src="js/app.js">` with `<script type="module" src="js/main.js">`.
11. Delete `js/app.js`.
12. Smoke-test both phases, debug panel, and save/load in the browser.
