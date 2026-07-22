# FH-1250 Reconciliation — Fizz Health v1.4.10.29

## Scope completed

- Corrected Pantry Intelligence so an expired or past-best-quality date does not make an item out of stock while quantity remains.
- Pantry Health, Eat Next, active inventory, and Out of Stock now derive from the same availability classification.
- Eat Next retains in-stock items even when nutrition data is incomplete; missing nutrition affects ranking rather than erasing the item.
- Added a clear Out of Stock empty state instead of a blank screen.
- Added inventory diagnostics to Pantry Health details: verified, in stock, out of stock, and missing nutrition counts.
- Replaced the oversized plus icon in the Food landing tile with a food icon.
- Retained the compact add action in the Food page header.

## Root cause

The availability calculation treated pantry status `Expired` as equivalent to `Depleted`. Items with recorded quantity were therefore removed from Pantry Health and Eat Next, while still appearing in the raw matching-item count. Freshness and inventory state are now separate concepts.

## Verification

- 195 automated tests passed.
- Release metadata verification passed.
- Production build was not completed because Vite was unavailable after dependency installation failed in the sandbox.
