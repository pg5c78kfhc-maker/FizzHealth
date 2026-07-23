# Fizz Health v1.4.11.8

## Meals Library Regression Stabilization

FH-1477 through FH-1480

- FH-1477: Restored the Meals library as a contained secondary screen with no horizontal page overflow.
- FH-1478: The Meals library now opens directly on explicit meal records and preserves the existing meal data query.
- FH-1479: Header actions, filter controls, search, and results remain inside the iPhone visual viewport; only the results list scrolls.
- FH-1480: Added regression checks for current metadata, meal-record binding, and responsive containment.

Version: 1.4.11.8  
Build: 141180  
Deployment: FH-20260723-141180  
Released: 2026-07-23T10:30:00-04:00

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
