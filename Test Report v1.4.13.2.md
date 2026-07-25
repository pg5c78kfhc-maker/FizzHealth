# Test Report — Fizz Health v1.4.13.2

## Verification results

- Project integrity: **Passed**.
- Release metadata verification: **Passed** for v1.4.13.2 / FH-1413.6.
- Automated tests: **428 executed; 361 passed; 67 failed**.
- Baseline comparison: the accepted v1.4.13.1 source also had **67 failures**. No additional automated-test failure was introduced after updating the planner catalog test for the approved redesign.

## Build result

The production build was attempted but could not run because the Vite executable was not installed in the uploaded archive. Two dependency-install attempts were made. Both failed when the package gateway returned HTTP 503 for `xlsx-0.18.5.tgz`.

A successful production build is therefore **not claimed**.
