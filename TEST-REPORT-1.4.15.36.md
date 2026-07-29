# Fizz Health v1.4.15.36 Test Report

## Release

- Version: 1.4.15.36
- Build: 141536
- Deployment: FH-20260729-141536
- Schema: 81
- Title: Linked Shopping Cart Pilot

## Implemented

- Added a persisted Product link field to the Pantry Item editor beneath Bought at.
- Added Open product for saved links.
- Replaced the Shopping placeholder with a Shopping Cart page.
- Included Pantry items that are Out of Stock or Order Soon/restock/low priority.
- Excluded discontinued items.
- Grouped items by retailer, with Retailer not specified fallback.
- Made the remote image tappable when a stored/direct image is available.
- Fell back to the tappable product name when no usable image exists.
- Added current release metadata, release history, service-worker cache version, and schema migration.

## Verification

- Focused tests: 4/4 passed.
- Release metadata verification: passed.
- Project integrity verification: passed.
- Full historical test suite: 488 passed / 170 failed. Failures are the existing historical suite baseline and are unrelated to this focused release.
- Production build: not run because node_modules were not supplied in the source archive.

## Pilot limitation

Amazon, Whole Foods, and other retailers may block browser-side extraction of product images from their product pages. This pilot therefore uses a saved/direct image URL when available and otherwise displays the product name as the link. Product links themselves remain usable without image discovery.
