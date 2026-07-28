# Test Report — Fizz Health v1.4.15.25

## Scope verified

- Ingredient Only is rendered as an iOS-style switch.
- Discontinued is rendered directly beneath Ingredient Only as an iOS-style switch.
- Enabling Discontinued requires confirmation.
- Discontinued state uses the established food archival lifecycle.
- Linked Pantry records are discontinued/restored with the food.
- Source-linked Meal definitions are archived/restored with the food.
- Historical consumed and planned meal records are not deleted or rewritten.
- Archived foods remain editable so the Discontinued switch can restore them.
- Release metadata identifies v1.4.15.25 consistently.

## Results

- Focused release tests: PASS — 4/4.
- Project integrity check: PASS.
- Release metadata verification: PASS.
- ZIP integrity verification: performed after packaging.

## Build environment

A production Vite build could not be executed because dependencies are not installed in the supplied source tree and the package installation command failed in the execution environment before dependency resolution completed.

The complete legacy test suite was also run. It reported pre-existing failures across historical aggregate-nutrition, decision-engine, and source-text regression tests unrelated to this release. The focused v1.4.15.25 tests passed.
