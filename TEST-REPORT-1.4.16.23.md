# Test Report — v1.4.16.23

## Passed

- Project integrity repair passed.
- Exactly one application root, one package.json, and one src tree confirmed.
- New browser-first feed tests: 4/4 passed.
  - Local RSS parsing
  - Direct success avoids proxy
  - Direct failure automatically falls back to proxy
  - HTML proxy response is diagnosed safely
- Netlify function module syntax check passed.
- Both release ZIP files passed corruption and clean-extraction checks.

## Historical regression suite

A targeted podcast regression run executed 29 tests: 23 passed and 6 failed. The failures are older source-text assertions coupled to superseded implementation details, including pre-v1.4.16.22 swipe-handler formatting and prior feed-fetch source shapes. The new runtime-oriented v1.4.16.23 tests all passed.

## Production build

`npm run build` was attempted. Integrity repair completed, but Vite could not start because the supplied source archive did not contain installed dependencies (`vite: not found`). No successful production-build certification is claimed.
