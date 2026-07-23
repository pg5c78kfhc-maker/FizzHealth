# Fizz Health v1.4.11.5

## Recipe Duplicate Validation Repair

FH-1467 through FH-1469

- FH-1467: Recipe duplicate validation now uses canonical food IDs with normalized ingredient-name fallback.
- FH-1468: Legacy ingredients with missing IDs are no longer all treated as the same duplicate ingredient.
- FH-1469: Added regression coverage proving a recipe containing unique legacy ingredients can save.

Version: 1.4.11.5  
Build: 141150  
Deployment: FH-20260723-141150  
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
