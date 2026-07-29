# Fizz Health v1.4.15.33 — Pantry Persistence and Barcode Scanner Corrective

Release ID: FH-20260728-141533  
Build: 141533  
Issued: 2026-07-28

## Delivered

- Fixed Pantry counting-unit persistence so changing the quantity descriptor (for example, jar to bags) saves and reloads independently from package-size units.
- Replaced the technical **Unit** label with **What are you counting?** and added practical container and measurement suggestions.
- Increased live barcode scan cadence and requested continuous focus, higher capture resolution, and modest zoom where the iPhone camera supports them.
- Changed barcode detection guidance so the entire camera frame is scanned rather than requiring exact placement inside a small target.
- Added **Scan Now**, which captures a high-resolution still image and retries barcode detection against full-frame and cropped views.
- Preserved manual barcode entry and camera retry behavior.
- Reverified Pantry persistence, Promote to Meal safeguards, and responsive editor constraints.

## Stories

- FH-1415.33A — Pantry counting-unit persistence corrective
- FH-1415.33B — Natural-language quantity descriptor controls
- FH-1415.33C — Faster full-frame live barcode detection
- FH-1415.33D — High-resolution still-image barcode fallback
- FH-1415.33E — Focused Pantry and Meal workflow regression verification

---

# Fizz Health v1.4.15.32 — Pantry Stabilization and Promote to Meal

Release ID: FH-20260728-141532  
Build: 141532  
Issued: 2026-07-28

## Delivered

- Reworked Pantry cards so product information receives the full width and quantity/completeness share a compact metadata row.
- Applied neutral out-of-stock styling whenever quantity is zero.
- Rebuilt Record Completeness from one shared field list, including retailer, manufacturer, package data, servings, barcode, freshness, and notes.
- Fixed quantity-on-hand persistence so a directly entered quantity is not overwritten by package calculations.
- Updated open-package prompts to ask how much remains in the current container and show the applicable unit.
- Added manufacturer editing and persistence from Pantry Item to the linked Food record.
- Constrained Pantry controls to the iPhone safe area and aligned Full Nutrition Record package fields responsively.
- Preserved duplicate-safe Promote to Meal for Food and Recipe details with immediate Meals/Menu availability.

## Stories

- FH-1415.32A — Pantry card, stock-state, and completeness corrective
- FH-1415.32B — Pantry persistence, wording, and safe-area stabilization
- FH-1415.32C — Promote to Meal completion and duplicate prevention
- FH-1415.32D — Full Nutrition Record alignment corrective

---

# Fizz Health v1.4.15.31 — Pantry Reconciliation UX and Retailer Organization

Release ID: FH-20260728-141531  
Build: 141531  
Issued: 2026-07-28

## Delivered

- Added a horizontally scrollable Pantry view bar and a persistent **By Retailer** view.
- Grouped Pantry foods into collapsible retailer sections, including a clear **Retailer not recorded** group.
- Made retailer names on Pantry cards actionable so they jump into the matching retailer view.
- Reorganized Pantry Item into **Product**, **What You Have**, and **Freshness** sections.
- Added **Bought at** with suggestions from previously used retailer values.
- Replaced technical field labels with plain-language prompts.
- Repaired the Pantry percentage/completeness action by defining and rendering a safe Record Completeness checklist.
- Enlarged and strengthened Menu food-category headings for iPhone readability.

No schema migration was required; existing Pantry and Food fields are reused.

## Stories

- FH-1415.31A — Retailer-grouped Pantry browsing
- FH-1415.31B — Pantry editor reorganization and Bought at
- FH-1415.31C — Plain-language field labels
- FH-1415.31D — Record Completeness corrective
- FH-1415.31E — Menu category heading readability
