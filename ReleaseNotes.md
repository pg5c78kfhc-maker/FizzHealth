# Fizz Health v1.4.10.32

## Food Decision & Pantry Inventory Separation

Completed under FH-1250.26-1250.47.

- Renamed the Add Food page to Food.
- Added What Should I Eat? as the first Food action.
- Removed Pantry from the Food database filters.
- Moved Chef recommendations, use-soon guidance, and Food Readiness to a dedicated Food Intelligence page.
- Converted Pantry into an inventory-only workspace with In Stock, Out of Stock, Restock, location, and inventory search.
- Made recommendation and restock cards open the referenced pantry item.
- Replaced text-heavy inventory status panels with fixed-width icon-only status controls.
- Moved Pantry on the Food landing page into a compact shortcut.
- Preserved the standardized Pantry add-item header and inventory editor.

## Verification

- 198 automated tests passed.
- Release metadata verification passed.
- Production build was not completed because dependency installation timed out and Vite was unavailable in the execution environment.

# Fizz Health v1.4.10.31

## Pantry Intelligence Consistency & Navigation Correction

Completed under **FH-1250.25**:

- Recipe favorites and recently used recipe parity.
- Pantry default location is **All**.
- One shared evaluated inventory drives Pantry Health, Eat Next, Waste Risk, Restock, Out of Stock, and Shopping.
- Expired freshness no longer incorrectly means out of stock when quantity remains.
- Pantry Health displays an unavailable state instead of a misleading 0 when it cannot be calculated.
- Eat Next uses all in-stock pantry items and explains when data is insufficient.
- Out-of-stock items are separated from the main pantry and have a clear empty state.
- Pantry item cards open item details and inventory editing rather than the Add Food screen.
- Quantity, location, package state, purchase date, expiration, notes, and stock state can be reconciled.
- Missing confidence data uses a distinct unavailable state instead of 0%.
- Add Pantry uses the standard X / title / checkmark keyboard-safe editor.
- The oversized Food tile plus icon is replaced with a food icon; the compact add action is in the Food header.
- Pantry add action is compact and located in the Pantry header.
