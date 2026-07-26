# Test Report — v1.4.13.8A

## Passing release gates

- `npm run integrity:check` — PASS
- `npm run verify:release` — PASS
- Focused tests — 14 passed, 0 failed
  - Menu interactions
  - Swipe gestures
  - Chef integration
  - Decision Intelligence
  - v1.4.13.7 Menu baseline
  - v1.4.13.8A corrective UX and metadata

## Full inherited suite

- Total: 442
- Passed: 372
- Failed: 70

The failing tests are inherited from the supplied baseline and include historical tests with hard-coded old release identities. They are not hidden or represented as passing.

## Build command

`npm run build` reached the Vite command and stopped with `vite: not found`. The source package remains intended for the normal Cloudflare dependency-install and Vite-build workflow.
