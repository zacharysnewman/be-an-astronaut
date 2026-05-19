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

Upgrade rows follow the "25% reveal" rule: a row becomes visible once the player has **ever** held 25% of its cost (tracked via `maxAppsReached` or equivalent peak-resource fields — rows never re-hide due to spending). One-time upgrades (efficiency tiers, parental trust tiers) are **hidden after purchase**. Level-based upgrades (Auto-Finder, Auto-Submitter) remain visible permanently once revealed.

The helper `shouldShowUpgrade(maxResource, cost, purchased)` in `render.ts` encodes this rule — use it for all new one-time upgrade rows.

# Service provider section

The Internet Service provider selection UI (`#provider-container`) is **hardcoded disabled** — always hidden. Do NOT add logic to show it. The underlying provider state/logic in `loop.ts` remains intact, but `render.ts` always keeps `ui.providerContainer` hidden. We'll decide when to re-enable it later.
