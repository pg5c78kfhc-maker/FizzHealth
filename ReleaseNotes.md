# Fizz Health v1.4.11.37 — UI Stabilization & Archive Recovery

**Build:** 141137  
**Deployment:** FH-20260724-141137  
**Completed through:** FH-1383

## Corrected

- Repaired the Food/Meals library grid regression introduced in v1.4.11.36.
- Search controls now have a fixed compact height and can no longer expand into a large circular control.
- Status and Data filters remain compact, while the result list owns the remaining scrollable space.
- The first result card starts below the search field and no longer renders underneath it.
- Archived Foods and Recipes can be restored from the archived list and from their detail screen.
- Restore preserves nutrition, ingredient relationships, favorites, serving data, and historical logs while recording `restored_at`.

## Stories

FH-1376, FH-1377, FH-1378, FH-1379, FH-1380, FH-1381, FH-1382, FH-1383
