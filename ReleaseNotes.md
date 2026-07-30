# Fizz Health v1.4.15.56 — Inventory Model Consolidation & Nutrition Landing Cleanup

Build: 141556  
Deployment: FH-20260730-141556

## Delivered

- **FH-1556.1:** Moved servings-per-package ownership from Nutrition to Inventory while preserving existing values through schema migration.
- **FH-1556.2:** Added Each as an Inventory package type and corrected packaged/count-based versus directly measured servings calculations.
- **FH-1556.3:** Added Inventory display/edit field parity for package, quantity, storage, freshness, quality, and notes fields.
- **FH-1556.4:** Removed the legacy Pantry and Shopping landing entry points and resized Library and Restaurants to match the Eating two-card layout.
- **FH-1556.5:** Simplified the Nutrition landing header so Nutrition appears once.

## Boundaries

- No reorder thresholds.
- No Shopping eligibility changes.
- No Add Now workflow changes.
- No unrelated UI changes.

# Fizz Health v1.4.15.56 — Inventory Visibility & Add Now

Build: 141556  
Deployment: FH-20260730-141556

## Delivered

- **FH-1555.1:** Food cards preserve the existing serving basis and append calculated inventory availability in brackets.
- **FH-1555.2:** Add to Meals now includes a highlighted Add Now button beside Beverage.
- **FH-1555.3:** Add Now logs the selected portion immediately to Consumed using the current date and time and decrements inventory through the existing source-aware inventory pipeline.
- **FH-1555.4:** The Add to Meals screen closes after success and the standard Undo snackbar can remove the consumed record and restore inventory.
- **FH-1555.5:** The action is disabled while saving to prevent duplicate submission.

## Boundaries

- No database schema changes.
- No changes to Proposed or meal-planning behavior.
- No changes to inventory eligibility or depletion rules beyond the existing normal consumption path.

# Fizz Health v1.4.15.54 — Shopping Eligibility and Food-Link Integrity

Build: 141554  
Deployment: FH-20260730-141554

## Delivered

- **FH-1554.1:** Shopping now automatically includes only non-discontinued Pantry records whose quantity is zero or less. Legacy `Order Soon`, `Restock`, `Low`, and `High` text values no longer qualify an item.
- **FH-1554.2:** Every visible Shopping item must resolve to an active Food record. Shopping cards open that exact standard Food Information record.
- **FH-1554.3:** Invalid Pantry food links are repaired only when one unique exact-name Food match exists. Unresolved orphaned Pantry records are excluded and recorded in the local `fizz-shopping-link-audit` diagnostic instead of being guessed or duplicated.

## Boundaries

- No database schema changes.
- No reorder thresholds.
- No changes to inventory depletion logic.
- No unrelated Library or Shopping presentation changes.
