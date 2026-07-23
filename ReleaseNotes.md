# Fizz Health v1.4.11.13

## JSON Exchange Workflow Repair

FH-1472 through FH-1474

- Restaurant exchange requests now explicitly require strict JSON with straight quotation marks and no markdown wrapping.
- Imported responses automatically repair smart quotes, BOM characters, non-breaking spaces, code fences, and surrounding prose before strict parsing.
- Restaurant menus returned as `proposed_record.menu.sections` are flattened correctly while preserving section names as categories.
- The import workflow now includes editable pasted JSON, explicit validation, section and item counts, an item preview, a clear Apply action, and a visible completion screen.
- Restaurant profile fields included in the exchange are updated with the menu replacement.

Version: 1.4.11.13  
Build: 141230  
Deployment: FH-20260723-141230  
Released: 2026-07-23T12:30:00-04:00

# Fizz Health v1.4.11.12

Pantry Package Persistence Repair

Version: 1.4.11.12  
Build: 141220  
Deployment: FH-20260723-141220  
Stories: FH-1469 through FH-1471  

Package count, package type, size per package, package unit, unopened packages, and open-package remainder now persist and are verified after saving.

# Fizz Health v1.4.11.12

Pantry Package Persistence Repair — FH-1462 through FH-1468

- Track package count separately from size per package and total quantity.
- Track an open package remainder and unopened package count.
- Keep prepared recipe batches measured by total gram weight.
- Open the real pantry editor from the detail pencil.
- Name every missing field that reduces inventory confidence.
- Preserve existing and legacy pantry records without destructive cleanup.

Version: 1.4.11.12  
Build: 141220  
Deployment: FH-20260723-141220  
Stories: FH-1469 through FH-1471  
Released: 2026-07-23 11:45 EDT

# Fizz Health v1.4.11.9

## Food Library Data & Layer Recovery

FH-1481 through FH-1484

- FH-1481: Restored independent data loading for All, Recipes, Favorites, Recent, and Meals.
- FH-1482: Removed contradictory empty states and collapsed placeholder rows.
- FH-1483: Swipe action rails remain hidden until a card is actively swiped.
- FH-1484: Consolidated the library into one bounded results container and reset card state on filter changes.

Version: 1.4.11.9  
Build: 141190  
Deployment: FH-20260723-141190  
Released: 2026-07-23T10:45:00-04:00

# Fizz Health v1.4.11.6

## Prepared Recipe Pantry & Pantry Edit Repair

FH-1470 through FH-1472

- FH-1470: Pantry detail Edit now opens the selected pantry item editor instead of closing the detail and losing the action.
- FH-1471: Recipe detail now provides a pantry action that creates a prepared batch with quantity, unit, prepared date, expiration, location, state, and notes.
- FH-1472: Prepared batches are linked to the source recipe and tracked as finished food; component ingredients are not individually decremented.

Version: 1.4.11.6  
Build: 141160  
Deployment: FH-20260723-141160  
Released: 2026-07-23T10:05:00-04:00

# Fizz Health v1.4.11.6

## Recipe Duplicate Validation Repair

FH-1467 through FH-1469

- FH-1467: Recipe duplicate validation now uses canonical food IDs with normalized ingredient-name fallback.
- FH-1468: Legacy ingredients with missing IDs are no longer all treated as the same duplicate ingredient.
- FH-1469: Added regression coverage proving a recipe containing unique legacy ingredients can save.

Version: 1.4.11.6  
Build: 141160  
Deployment: FH-20260723-141160  
Released: 2026-07-23T09:20:00-04:00
# Fizz Health v1.4.11.4

Critical Action Wiring Repair

This corrective functional release repairs the real action paths for pantry editing, recipe saving, and recipe logging. It also strengthens action hit targets and requires current About deployment metadata.

Completed story: FH-1461 through FH-1466

- FH-1461: Pantry detail pencil closes the detail layer and opens the pantry editor.
- FH-1462: Recipe Save validates, persists all recipe rows, and returns through the saved callback.
- FH-1463: Consume Now opens Universal Log in Consumed mode.
- FH-1464: Plan for Later opens Universal Log in Planned mode.
- FH-1465: Functional action-path verification is included in the test suite.
- FH-1466: About version, build, deployment, and timestamp are mandatory and centralized.
