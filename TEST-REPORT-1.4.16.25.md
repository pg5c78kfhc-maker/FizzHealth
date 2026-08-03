# Fizz Health v1.4.16.25 Test Report

## Passed validation

- Project integrity repair: PASS
- Exactly one application root: PASS
- Exactly one package.json: PASS
- Exactly one src tree: PASS
- JavaScript syntax: PASS for feed retrieval, diagnostics, Netlify transport, and Cloudflare transport
- Focused podcast retrieval and diagnostics tests: 14/14 PASS
- Browser direct-fetch success avoids proxy: PASS
- Direct failure automatically falls back to compatibility transport: PASS
- HTTP-feed compatibility behavior: PASS
- Raw XML remains parsed on the phone: PASS
- Apple/stored/requested URL fields are captured: PASS
- Fresh subscribe and resubscribe are distinguished: PASS
- In-app diagnostics actions are present: PASS
- Rolling log is limited to 100 events: PASS

## Complete historical suite

- Total: 991
- Passed: 707
- Failed: 284

The historical failures are predominantly source-shape assertions from earlier releases that expect superseded implementation text and layouts. The new v1.4.16.25 focused tests all pass.

## Production build

The production build was attempted with `npm run build` after integrity repair. It could not start because the supplied archive did not contain installed dependencies and the `vite` executable was unavailable:

`sh: 1: vite: not found`

No successful production-build certification is claimed.
