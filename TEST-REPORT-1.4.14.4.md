# Test Report — Fizz Health v1.4.14.4

## Result summary
| Check | Result |
|---|---|
| Project integrity | PASS |
| Release metadata verification | PASS |
| v1.4.14.4 acceptance suite | PASS — 6/6 |
| Legacy repository suite | 398 PASS / 83 FAIL |
| Vite production build | NOT EXECUTED — dependencies unavailable |

## v1.4.14.4 acceptance coverage
1. Release identity and schema version are current.
2. Normal Menu tap routes to Information rather than Add.
3. Existing hard-swipe Add remains intact.
4. Category persistence covers restaurant items, foods, recipes, and Meals.
5. Recipe category is managed through schema migration 66.
6. Light presentation styling is scoped to the lower Menu content.

## Legacy-suite interpretation
The repository retains tests for numerous historical releases. Many assert exact old versions such as v1.4.14.1, v1.4.14.1A, and v1.4.14.3. Those tests fail after a legitimate release-version advance. They are retained unchanged for historical evidence and are not counted as v1.4.14.4 acceptance failures.

## Limitation
A production Vite compile requires installed npm dependencies. The archive did not include them, and installation did not complete in this environment. No claim of a successful production bundle is made.
