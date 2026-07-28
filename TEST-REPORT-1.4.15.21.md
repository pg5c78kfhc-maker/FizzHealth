# Fizz Health v1.4.15.21 Test Report

## Scope
Meal Selector Portion Controls only.

## Passed
- Focused regression tests: 3/3.
- Release metadata verification passed.
- Project integrity verification passed.
- ZIP integrity verification passed after packaging.

## Verified behavior in source
- Existing Add to Meals popup now accepts decimal portions.
- Quick choices: ¼, ½, ¾, 1, 1½, and 2.
- Defined serving size and calculated logging amount are displayed.
- Projected nutrition scales live with the selected portion.
- New planned entries store the selected portion and scaled nutrient values.
- Existing selected meal assignments update their portion and scaled nutrient values.
- Meal destination remains multi-select with smaller buttons.

## Full inherited suite
The inherited test suite contains pre-existing failures unrelated to this release: 462 passed, 141 failed. The focused v1.4.15.21 tests passed.

## Production build
The production Vite build could not be executed in this container because dependencies were not present and `npm clean-install` could not complete within the environment. No claim of a successful production build is made.
