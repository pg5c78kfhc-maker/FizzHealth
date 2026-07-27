# Fizz Health v1.4.14.6 — Menu Simplification and Visual Polish

Issued: 2026-07-27  
Build: 141406  
Deployment: FH-20260727-141406  
Schema: 67

## Completed

FH-1414.16 / FH-1414.17 / FH-1414.18 / FH-1414.19

- FH-1414.16 — Replaced Nothing You Could Do with Caveat 700 for restaurant names and canonical or restaurant-defined Menu category headings only.
- FH-1414.17 — Removed the remaining vertical gaps between Menu category cards while preserving readable internal spacing and touch targets.
- FH-1414.18 — Removed the redundant All / Favorites / category browse-filter row so categories begin immediately below Chef's Picks.
- FH-1414.19 — Added optional Chef's Pick image rendering for pantry foods, meals, and recipes using an existing image URL or browser-local cache. Restaurant recommendations are explicitly excluded and no external image fetching is introduced.

## Compatibility

- Database schema remains 67.
- Canonical food categories continue to come from SQLite.
- Existing tap, swipe, favorite, category-editing, calendar, Restaurant Day, and Decision Intelligence behavior is preserved.
