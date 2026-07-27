# Fizz Health v1.4.15.3 — Startup Loop Recovery

Corrective release issued 2026-07-27.

- FH-1415.26 — Prevent service-worker activation from reloading an active startup session.
- FH-1415.27 — Serialize database startup and retry attempts.
- FH-1415.28 — Allow long-running migrations to finish without an orphaned timeout operation.
- FH-1415.29 — Keep the startup recovery screen stable and disable overlapping Retry actions.

Schema version: 69  
Build: 141503  
Deployment: FH-20260727-141503

---

# Fizz Health v1.4.15.2 — Meals Builder Stabilization

Release ID: FH-20260727-141502  
Build: 141502  
Schema: 68

## Completed

- FH-1415.21 — Make migration 68 safe when `release_register` is absent.
- FH-1415.22 — Restore Meals page scrolling and bottom-navigation clearance.
- FH-1415.23 — Restore icon-only All, Recent, and Favorites controls with a clear selected state.
- FH-1415.24 — Constrain swipe actions so Category and Archive remain fully visible.
- FH-1415.25 — Remove horizontal overflow, clipped text, and unfinished layout artifacts.
