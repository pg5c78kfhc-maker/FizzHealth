# Fizz Health v1.4.15.83 Release Notes

## Purpose
This blocking corrective release consolidates live inventory availability onto the production inventory service and adds temporary runtime diagnostics.

## Changes
- Added ingredient-level runtime inventory diagnostics containing caller, Food ID, Pantry record ID, Recipe ID, requested quantity/unit, serving definition, container counts, open-container servings, computed available servings, and the final decision.
- Added a centralized `foodAvailableServings` result to the shared availability index.
- Redirected Library and Menu serving displays away from local calculations and into the shared availability index.
- Preserved preparation and deduction through `consumeInventory`, the same production inventory service used by availability.
- Updated About/release metadata to v1.4.15.83.

## Scope controls
No barcode, enrichment, UI redesign, inventory redesign, shopping, nutrition, or unrelated refactoring work was included.

## Build status
The production build was attempted. It could not complete because the supplied archive did not contain dependencies and the configured package registry returned HTTP 404 for `xlsx@0.18.5` during `npm ci`. The initial build attempt failed with `vite: not found`.
