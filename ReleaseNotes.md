## v1.4.10.24 — Restaurant Tile Hotfix

Issued July 21, 2026 · Build 141024 · Database schema 44

- Fixed the Food hub Restaurants tile crash caused by a missing current-day nutrition totals helper.
- Added safe zero-default totals for restaurant ranking.
- Added direct regression coverage for opening the restaurant subsystem.

## v1.4.10.23 — Restaurant Intelligence Workflow Completion

Issued July 21, 2026 · Build 141023 · Database schema 44

Completed story: FH-1250

- Replaced trapped restaurant navigation with standard close, add, and edit headers.
- Reused the Restaurant Profile editor for both new and existing restaurants.
- Added contextual AI Exchange entry points for menu replacement and individual menu-item enrichment.
- Removed generic restaurant AI capture, meal capture, and manual visit controls.
- Replaced menu-card Plan and Retire buttons with swipe-right logging and swipe-left retirement.
- Added visible evidence levels for menu-description estimates, photo-enhanced estimates, and restaurant-verified nutrition.
- Unified menu-item logging under Consume Now / Plan for Later.
- Promoted Food and Restaurants to compact subsystem icons at the top of the Food hub.
- Photos, PDFs, receipts, and exchange JSON remain temporary and are not stored in the database.

## v1.4.10.22 — Unified AI Food Exchange & Restaurant Stability

Issued July 21, 2026 · Build 141022 · Database schema 44

- FH-1270 / FH-1271 / FH-1272: One AI Exchange workspace now creates a reusable food, logs a one-time photo-estimated meal, or enriches an existing food according to entry context.
- Add Food now uses compact **+ New Food** and **⚡ Log Once** actions.
- AI responses are read from the clipboard and routed to an all-or-nothing review; photos and exchange JSON are not retained after approval.
- Restaurant profiles use resilient queries and a page-level recovery boundary so selecting a restaurant cannot strand the user on a black screen.

# Fizz Health v1.4.10.18 — Workflow Completion and UX Consistency

Issued July 20, 2026 · Build 141018 · Database schema 43

## Completed scope

- FH-1260 context-aware Take Action routing: calories open the meal planner and step actions open step entry.
- FH-1261 navigation audit correction: Restaurant Intelligence now has an explicit Back path at list and profile levels.
- FH-1262 Nutrition Editor 2.0: Cancel and Save moved into the fixed header; duplicate footer actions removed.
- FH-1263 shared compact editor action and contrast rules retained and extended.
- FH-1264 dashboard terminology clarified, including Restaurant Plans and Today’s Focus.
- FH-1265 exact Home hierarchy: header/date controls, decision circles, nutrient bars, planned and consumed meals, then all remaining operational content.
- FH-1266 recommendation explanation pages preserved; no changes to LDL Support, Steps, or Estimated Maintenance detail layouts.
- FH-1267 step history behavior preserved from v1.4.10.17.
- FH-1268 Dining Plans renamed Restaurant Plans.
- FH-1269 persistent decision documentation updated.

## Preserved behavior

- LDL Support, Steps, and Estimated Maintenance explanation pages are intentionally unchanged.
- Native planned-meal date/time selection remains unchanged.
- Database schema remains 43.

## v1.4.10.19 — Release Metadata, Home Hierarchy, and Keyboard Editor Correction

- FH-1270: About, package, build, service worker, and engine versions now share the current release identity.
- FH-1271: Home opens with date controls, decision summary, nutrient bars, and meals before secondary panels.
- FH-1272: Nutrition editing preserves more usable screen space above the iPhone keyboard.

## v1.4.10.20 — Universal Existing-Food Enrichment

Issued July 21, 2026 · Build 141022 · Database schema 44

- Added a universal exchange v3 contract for enriching an existing canonical food from multiple package photographs.
- Added comprehensive ChatGPT instructions for package identity, Nutrition Facts, ingredients, allergens, barcode, dates, and preparation evidence.
- Added the pencil launch action to Full Nutrition Record while preserving the pencil as a context-dependent edit action elsewhere.
- Added an inbound-only enrichment workspace; outbound JSON remains hidden and is copied directly to the clipboard.
- Added a specialized all-or-nothing approval screen showing Current versus Proposed values, confidence, evidence, and identity mismatch protection.
- Enforced `create_if_missing: false`; enrichment cannot silently create a new food.
- Added schema 44 product metadata, exchange-session history, and change traceability.
- Approved nutrition changes recalculate linked consumed meals for today and planned meals while preserving historical snapshots.
