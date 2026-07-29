# Fizz Health v1.4.15.35 Test Report

## Release

- Version: 1.4.15.35
- Name: Barcode Scanner Reliability Corrective
- Build: 141535
- Deployment: FH-20260729-141535
- Schema: 80

## Implemented

- Added a native iPhone still-photo workflow using a hidden `input[type=file]` with `accept="image/*"` and `capture="environment"`.
- Replaced the ambiguous scanner action with **Take Photo** / **Retake Photo**.
- Displays the captured image while decoding so the user can verify that a photo was actually taken.
- Added automatic full-image, center-crop, tighter-crop, 90°/-90°/180° rotation, grayscale, contrast, and scale decoding attempts.
- Retained live scanning as an optional fast path.
- Added explicit captured, reading, failure, retake, camera-error, and manual-entry states.
- Corrected Pantry quantity formatting so stored singular or plural package units display with exactly one plural suffix.

## Verification performed

### Focused release tests

Command:

`node --test tests/v141535-barcode-photo-corrective.test.js`

Result: **6 passed / 0 failed**

Covered:

- Release metadata
- Native still-photo capture wiring
- Multi-pass decode attempts
- Retake and manual fallback states
- Single-pass package pluralization
- Captured-photo containment

### Project integrity

Command:

`npm run integrity:check`

Result: **Passed**

### Release metadata verification

Command:

`npm run verify:release`

Result: **Passed**

### Full historical test suite

Command:

`npm test`

Result: **489 passed / 169 failed**

The failures are in the repository's historical/legacy assertions, including old release-number checks and tests expecting the retired `Scan Now` wording. The focused v1.4.15.35 tests passed.

### Production build

Not run. The supplied source archive did not include `node_modules`, so Vite and React build dependencies were unavailable in the execution environment.

### Physical iPhone barcode validation

Not possible in the container because it has no iPhone camera or Safari runtime. The still-photo path was verified structurally and through focused tests, but final acceptance requires scanning representative physical products on the target iPhone.
