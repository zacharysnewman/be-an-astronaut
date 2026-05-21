# Button sizing

All inline content buttons (any button that appears inside a stat row, card, or overlay — i.e. not tab-bar buttons or provider-tab grid buttons) must carry `class="btn-inline"`. This matches the sizing of the Find and Submit buttons.

**Correct:**
```html
<button id="btn-upgrade-finder" class="btn-inline">Buy Auto-Finder</button>
```

**Wrong:**
```html
<button id="btn-upgrade-finder">Buy Auto-Finder</button>
```

Exceptions — these have their own sizing classes and must NOT get `btn-inline`:
- `.tab-btn` — bottom nav tabs
- `.provider-tab` — ISP provider grid buttons

# Aesthetic and layout

This game follows a 90s web page aesthetic: white background, serif body font (Times New Roman), predominantly left-justified content, black bold section headers (`<h2 class="section-title">`), and boxy bordered containers (`.retro-box`). New UI sections must match this style — no centered hero text, no rounded cards, no modern shadows.

# Upgrade visibility rule

Upgrade rows follow the "25% reveal" rule: a row becomes visible once the player has **ever** held 25% of its cost (tracked via `maxACReached` or equivalent peak-resource fields — rows never re-hide due to spending). One-time upgrades (efficiency tiers, Actions buttons) are **hidden after purchase**. Level-based upgrades (Auto-Submitter) remain visible permanently once revealed.

The helper `shouldShowUpgrade(maxResource, cost, purchased)` in `render.ts` encodes this rule — use it for all new one-time upgrade rows.

# No backwards compatibility

This app is unreleased. Do not write save migration code, legacy key fallbacks, or any other backwards-compatibility shims. When the save format changes, just bump the save key and let old saves be abandoned. Delete the old key constant and any migration logic entirely.

# Commit descriptions

Commit descriptions (the body, not the subject line) should be a brief, bulleted summary of changes — one bullet per logical change, no prose paragraphs.

# Adding new HTML pages

This is a Vite multi-page app. Every new `.html` file at the project root must be registered in `vite.config.ts` under `build.rollupOptions.input`, otherwise Vite will not include it in the build and it will never be deployed.

```ts
// vite.config.ts
build: {
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'index.html'),
      // ← add new pages here
    },
  },
},
```

Also note: the deployed base path is `/be-an-astronaut/`. Internal links between pages must use relative paths (e.g. `./index.html`) — not absolute paths like `/` or `/index.html`.

# Service provider section

The Internet Service provider selection UI (`#provider-container`) is **hardcoded disabled** — always hidden. Do NOT add logic to show it. The underlying provider state variables remain in `state.ts` for future use, but `render.ts` always keeps `ui.providerContainer` hidden. We'll decide when to re-enable it later.

Internet fees are a **flat $0.01/s** always — provider multipliers and automation flat fees have been removed from `loop.ts`. Do NOT add provider-based or automation-based fee scaling. If re-enabling providers, this must be revisited.

# Design library

Every new game component and every distinct UI state of an existing component must be represented in `design.html` (accessible at `?design`). This includes new card layouts, overlays, upgrade rows, and interactive states like disabled, active, or locked.

Add a story or variant to the relevant section in `design.html`. The disabled state of a button is as important to document as the enabled state.
