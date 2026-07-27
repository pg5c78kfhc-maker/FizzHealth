# Test Report — Fizz Health v1.4.14.4A

## Result summary

| Verification | Result |
|---|---|
| Original Stories 10–12 acceptance checks | 6 passed |
| v1.4.14.4A corrective checks | 5 passed |
| Combined focused acceptance suite | 11 passed, 0 failed |
| Centralized release verification | Passed |
| Project integrity | Passed |
| Production Vite build | Not completed; dependency executable unavailable |

## Corrective checks
1. Release identity is v1.4.14.4A and schema remains 66.
2. Information View respects the footer and handles booleans/unknown nutrition appropriately.
3. Category editor is clamped between calendar and footer with independent scrolling.
4. Compact swipe actions fully reveal both left-side actions.
5. Light Menu has responsive width, readable contrast, rounded corners, reachable filters, and vector indicators.

## Regression coverage retained
- Normal tap opens Information.
- Explicit swipe Add remains available.
- Universal category persistence remains implemented for restaurant items, foods, recipes, and meals.
- Recipe category schema support remains present.
- Light presentation remains scoped to the lower Menu.

## Build limitation
`npm run build` reached the Vite invocation but failed with `vite: not found`. The supplied archive had a partial dependency directory and the locked installation attempt did not complete in this environment. Source-level acceptance, release verification, and integrity checks passed; device deployment should still perform its normal production build before release acceptance.
