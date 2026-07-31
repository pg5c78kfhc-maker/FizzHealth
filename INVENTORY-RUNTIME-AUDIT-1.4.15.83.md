# Inventory Runtime Audit — v1.4.15.83

## Central runtime implementation
The single inventory math implementation is `src/inventory/service.js`.

The shared orchestration/index is `src/inventory/availability.js`, which delegates quantity, stock, sufficiency, and deduction calculations to the production service.

## Runtime callers audited
- Library: redirected to `availability.foodAvailableServings`.
- Recipe Detail: uses `availability.recipeAvailable` / `recipeCanPrepare`.
- Prepared Recipe creation: ingredient sufficiency resolves through the availability index and deduction through `consumeInventory`.
- Batch preparation: availability through the index; deduction through `consumeInventory`.
- Meal Planner: uses `availability.itemAvailable`.
- Chef’s Picks: candidates are filtered through the shared availability index; no independent quantity formula remains in the candidate display path.
- Pantry deduction: uses `consumeInventory`.
- Consumption deduction: uses `consumeInventory` through resolved Pantry records.
- Undo/Delete restoration: snapshot restoration remains authoritative; re-deduction paths use the production deduction flow.

## Legacy calculations removed or redirected
- Removed Library’s local Pantry-row filtering and unit conversion calculation for available servings.
- Removed Menu’s local Pantry-row filtering, serving-size division, and unit conversion calculation.
- Added `foodAvailableServings` to the centralized availability index so callers consume the same precomputed inventory state.

## Production diagnostic fields
Each diagnostic entry includes:
- caller
- Food ID
- Inventory record ID
- Recipe ID
- requested quantity and unit
- serving size and unit
- servings per container
- containers in stock
- open-container servings
- computed available servings
- final Available/Unavailable decision

## Diagnostic scenario results
### Blueberries
Input used by the production service path:
- Food ID: F-BLUE
- Inventory ID: P-BLUE
- 1 container
- 1 serving/container
- 100 g serving

Result:
- computed available servings: 1
- final decision: Available
- Library centralized result: 1 serving
- Fruit Bowl centralized recipe result: Available

### Red Onion
Input used by the production service path:
- Food ID: F-ONION
- Inventory ID: P-ONION
- 1 container/onion
- 1 serving/container
- 150 g serving definition

Result:
- computed available servings: 1
- Daily Salad centralized recipe result: Available
- batch deduction result: success
- servings deducted: 1
- resulting container quantity: 0

## Live database limitation
The uploaded artifact contains source code, not the user’s browser-resident production database. Actual live record IDs and runtime console output from the installed PWA could not be captured here. The release adds the required production-path logging so the deployed application will expose those exact inputs during real use.
