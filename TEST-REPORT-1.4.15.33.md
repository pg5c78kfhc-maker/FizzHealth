# Fizz Health v1.4.15.33 Test Report

## Release

- Version: 1.4.15.33
- Build: 141533
- Deployment: FH-20260728-141533
- Schema: 78
- Baseline: v1.4.15.32

## Implemented

- Corrected Pantry counting-unit persistence. The quantity descriptor now saves from the dedicated Pantry field even when package-size calculations are present.
- Replaced the Pantry label **Unit** with **What are you counting?** and added common container and measurement suggestions.
- Increased barcode live-analysis cadence from 160 ms to 100 ms.
- Requested higher camera resolution, continuous autofocus, and modest zoom when supported.
- Changed scanning guidance to full-frame detection.
- Added **Scan Now** high-resolution still capture.
- Added full-frame and cropped still-image decoding retries.
- Preserved camera retry and manual barcode entry.
- Updated all centralized release-identification sources.

## Verification Results

### Focused release tests

- 9 passed
- 0 failed

Covered:

- Pantry counting-unit save wiring
- Independence of counting unit and package-size unit
- Natural-language Pantry label
- Faster full-frame scanning
- Camera focus constraints
- Still-image capture
- Multi-crop retry
- Existing v1.4.15.32 Pantry stabilization behavior
- Promote to Meal duplicate protection
- Release metadata consistency

### Project integrity

- Passed
- One application root
- One package.json
- One src tree
- One isolated Menu/Chef implementation

### Release verification

- Passed
- Version, build, deployment, timestamp, package version, engine version, service-worker cache, release history, release notes, and schema metadata are consistent.

### Full repository test suite

- 648 tests executed
- 488 passed
- 160 failed

The 160 failures are pre-existing historical suite failures also present in the supplied baseline; the new focused release tests all pass.

### Production build

Not executed because the supplied source archive did not include `node_modules`, and this environment did not have the project dependencies installed.

### ZIP integrity

Both release archives were created with standard ZIP packaging and verified with `unzip -t`.
