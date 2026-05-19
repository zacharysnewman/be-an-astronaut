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
