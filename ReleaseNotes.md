# Fizz Health v1.4.11.38 — Archive Restore Completion

**Build:** 141138  
**Deployment:** FH-20260724-141138  
**Released:** July 25, 2026

This blocking corrective release completes the Food and Recipe archive lifecycle that was not delivered correctly in v1.4.11.37.

## Completed

- **FH-1384:** Archived cards now use archive-specific gestures. A right swipe reveals **Restore**, and a full right swipe restores immediately. It can no longer open Add to Food Log or consume an archived record.
- **FH-1385:** Archived Food and Recipe detail screens display an immediately visible **Restore to Active** action in the header area and an archive-status banner.
- **FH-1386:** Restore preserves nutrition, recipe ingredients, favorites/history relationships, serving information, and existing historical Food Log snapshots. The record immediately leaves Archived and returns to Active.
- **FH-1387:** Added focused regression gates for archived query state, context-aware swipe behavior, visible detail restoration, release metadata, and the restore persistence updates.

## Acceptance behavior

1. Set Status to Archived.
2. Swipe an archived Food or Recipe right: the exposed action reads **Restore**, not Add.
3. Complete the full swipe or tap Restore: the record returns to Active.
4. Open an archived Food or Recipe: **Restore to Active** is visible at the top of the detail screen.
5. Archived records cannot be logged or consumed until restored.
