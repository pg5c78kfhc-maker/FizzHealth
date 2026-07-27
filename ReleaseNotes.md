# Fizz Health v1.4.15.8 — Menu Stabilization Corrective

Issued: 2026-07-27  
Build: 141508  
Deployment: FH-20260727-141508  
Created: 2026-07-27T15:46:52-04:00  
Schema: 70 / 2026-07-27

## Completed stabilization scope

- **FH-1415.41** — Route every Menu Food pencil to the canonical Food editor instead of the category-only overlay.
- **FH-1415.42** — Save Ingredient Only, Category, identity, and nutrition by updating the existing Food record in place; never insert a duplicate.
- **FH-1415.43** — Preserve expanded/collapsed Menu sections and restore the exact scroll position after save or cancel.
- **FH-1415.44** — Make Chef's Picks use the same stack width as category cards, remove the inter-card gap, and render Chef media at full card width.

## Release constraints

- Stabilization only; no new feature work.
- Startup architecture unchanged.
- Schema remains version 70.
