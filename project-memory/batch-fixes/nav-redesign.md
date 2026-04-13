# 9E: Nav Redesign + Dropdown Fixes

_Session: 2026-04-13_

## 9E: Nav Redesign ✅

### What changed
- `client/src/components/AppNav.js` — collapsed 6 flat links into: Insights (top-level), Money▾ (Expenses, Goals), Markets▾ (Portfolio, Watchlist), Account (top-level)
- `client/src/index.css` — `.nav-dropdown`, `.nav-dropdown-trigger`, `.nav-dropdown-menu` styles; CSS-only hover with opacity/visibility transition

### Bug fixes required (3 iterations)

**1. `--navy-900` undefined → transparent dropdown**
CSS variable `--navy-900` doesn't exist in the design system (only `--navy-950` through `--navy-100`). Using undefined var defaults to transparent/white, making the dark dropdown invisible against the light page background.
Fix: replaced `var(--navy-900)` with `var(--navy-950)`.

**2. `▾` chevron too small**
At `0.6rem` it rendered as a dot. UX decision: removed entirely. Consistent with Insights/Account which have no indicator. Cleaner.

**3. Dropdown overlapping nav bar**
Root cause: `.nav-dropdown` box height = trigger text height (~22px), not the full 60px nav bar. `top: 100%` placed the menu mid-nav.
Fix: `align-self: stretch` on `.nav-dropdown` so it fills the full nav height; `margin-top: 6px` for clean separation below nav bar. Also removed the invisible bridge padding hack (no longer needed since hover zone now covers full nav height).

### Lesson: check CSS var definitions before using
Always verify a CSS variable actually exists in `:root` before using it. The design system only defines: `--navy-950`, `--navy-800`, `--navy-600`, `--navy-400`, `--navy-300`, `--navy-200`, `--navy-100`. Gaps (900, 700, 500) are undefined.

### Commits
- `08f4e36` feat: implement 9E nav redesign with hover dropdowns
- `fae6f4e` fix: nav dropdown background (--navy-900 undefined) and remove chevron
- `d9e1232` fix: nav dropdown position — align-self stretch + clean margin
