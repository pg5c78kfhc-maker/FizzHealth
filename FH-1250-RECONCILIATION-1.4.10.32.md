# FH-1250 Reconciliation — v1.4.10.32

## Scope

FH-1250.26 through FH-1250.47: separate food decision-making from pantry inventory management.

## Implemented

- Renamed Add Food to Food.
- Added What Should I Eat? as the first Food action.
- Removed Pantry from Food database filters.
- Added a dedicated Food Intelligence page containing Food Readiness, Chef’s Recommendations, and Use Soon.
- Made recommendation and use-soon cards open the referenced pantry item; Eat opens food logging.
- Refocused Pantry on In Stock, Out of Stock, Restock, location filtering, and inventory search.
- Made Restock cards open pantry-item details.
- Replaced status text such as “Needs data” with fixed-width icon-only controls and accessible labels.
- Replaced the large Pantry landing-page card with a compact Pantry shortcut.
- Preserved manual Pantry creation and standardized X/title/check editor controls.

## Verification

- Automated tests: 198 passed, 0 failed.
- Release metadata: passed.
- Production build: not completed. Dependency installation timed out and Vite was unavailable (`vite: not found`).

## Changed files

- `src/main.jsx`
- `src/styles.css`
- `src/decision/engine.js`
- `public/sw.js`
- `package.json`
- `package-lock.json`
- `VERSION.json`
- `ReleaseNotes.md`
- `CHANGELOG.md`
- `tests/v141022-corrective.test.js`
