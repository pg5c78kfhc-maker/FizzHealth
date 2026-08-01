# Fizz Health v1.4.15.87 Test Report

## Focused release tests

Passed: 4  
Failed: 0

Validated:

- Library full-swipe quick consume invokes centralized Pantry deduction.
- Quick-consume records adjustment history for restoration.
- Legacy zero-weight Prepared Recipe records remain visible and can be explicitly deleted.
- Add Food and Prepared Recipe overlays are constrained above the footer.
- Release metadata reports v1.4.15.87.

## Full test suite

- Tests executed: 809
- Passed: 584
- Failed: 225
- New failures attributable to this release: 0 identified
- Pre-existing failures: 225

The full suite exits nonzero because the repository already contains 225 failing legacy tests.

## Production build

Production build attempted with `npm run build`.

Result: Failed before compilation because installed dependencies are absent from the supplied source archive.

Exact error:

```text
vite: not found
```

The prebuild integrity repair completed successfully and reported one application root, one package file, one source tree, and one Menu/Chef implementation. A successful production build is not claimed.

## Runtime limitations

The uploaded source archive does not contain the live SQLite database from the installed iPhone PWA. The exact Barebells live row could not be executed here. The defect was confirmed directly in the production Library quick-consume code path: it inserted a meal without invoking inventory deduction. The corrected path is covered by focused source-path tests.
