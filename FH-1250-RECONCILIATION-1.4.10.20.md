# Fizz Health Reconciliation Report — v1.4.10.20

## Baseline

- Source inspected: `Source-1.4.10.19(2).zip`
- Baseline app version: v1.4.10.19
- Baseline database schema: v43
- Resulting app version: v1.4.10.20
- Resulting database schema: v44
- Build ID: 141020
- Release date: July 21, 2026
- Scope owner: FH-1250 (existing epic; no new FH identifier assigned)

## Implemented scope

### Universal existing-food enrichment

- Added one universal Fizz Health exchange envelope, schema v3, for `enrich_existing_food`.
- The request identifies the canonical food by stable ID and explicitly sets `create_if_missing: false`.
- Existing verified food, serving, nutrient, and product information is included in the hidden outbound request.
- ChatGPT instructions cover multiple photographs and visible evidence from:
  - package front and product identity
  - Nutrition Facts
  - ingredients and allergens
  - barcode
  - package quantity
  - expiration, best-by, use-by, and sell-by dates
  - preparation instructions
- Unknown values remain null; verified zero must be explicit.
- Existing values may be proposed for replacement when visible current packaging supports a change.
- Product-identity mismatch can block import.

### Full Nutrition Record launch

- Added the existing pencil icon immediately to the left of the Save checkmark.
- The pencil remains a context-dependent Edit action elsewhere in Fizz Health.
- On Full Nutrition Record, the pencil launches enrichment for that exact existing food.

### Inbound-only enrichment workspace

- Outbound JSON is hidden from the interface.
- `Copy request` places the complete exchange request on the clipboard.
- The screen accepts the completed inbound JSON by paste or clipboard.
- The response is normalized, validated, checked against the selected food ID, and routed to the food-update approval screen.

### Specialized approval screen

- Added an all-or-nothing Existing Food Update review.
- Displays Current versus Proposed for every changed supported field.
- Displays confidence, evidence notes, record identity, and historical-preservation behavior.
- Reject uses X; approval uses the standard checkmark.
- The importer refuses to create a new food if the target no longer exists.

### Database and traceability

Schema v44 adds food-product fields:

- brand
- barcode
- serving description
- servings per container
- ingredients
- allergens
- package quantity
- package date and date type
- preparation instructions

Schema v44 also adds:

- `ai_exchange_sessions`
- `ai_exchange_changes`

These retain the request, returned response, approved normalized payload, confidence, identity match, evidence, and applied Current/Proposed changes.

### Nutrition propagation

After approval:

- the canonical food is updated;
- linked consumed meals for today are recalculated;
- linked planned meals are recalculated;
- nutrition provenance and completeness are refreshed where supported;
- historical consumed meals remain unchanged.

## Compatibility and retirement status

- The new food workflow no longer exposes the legacy outbound product JSON on the Full Nutrition Record path.
- Existing restaurant-menu and restaurant-meal exchange workflows remain available as compatibility paths.
- Their specialized universal-exchange approval screens are deferred; they were not removed because doing so would break current restaurant workflows.
- Universal Photo Capture remains available for meal/photo capture and is not silently replaced.

## Files changed

- `ReleaseNotes.md`
- `VERSION.json`
- `package-lock.json`
- `package.json`
- `public/sw.js`
- `src/database.js`
- `src/decision/engine.js`
- `src/exchange.js` (new)
- `src/main.jsx`
- `src/styles.css`
- release/schema expectation tests updated for v1.4.10.20 and schema v44

## Verification

Command executed:

`npm run verify`

Results:

- Automated tests: **209 passed, 0 failed**
- Release metadata verification: **passed**
- Production build: **passed**
- Vite output generated successfully
- Non-blocking build warning: the main JavaScript bundle remains above Vite's 500 kB advisory threshold
- `npm install` reported one high-severity dependency audit finding; no dependency version was changed beyond the existing `latest` declarations because remediation could introduce unreviewed application changes

## Artifacts returned

1. Full source ZIP
2. Changed files ZIP, preserving repository-relative paths
3. This reconciliation report

## GitHub status

No GitHub write, commit, merge, or push was performed.
