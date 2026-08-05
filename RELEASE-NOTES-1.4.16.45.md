# Fizz Health v1.4.16.45 — Podcast Gesture, Ordering & Card Hierarchy Repair

## Scope delivered

- Repairs the podcast reorder page Save checkmark with commit, read-back verification, projection rebuild, immediate refresh, and visible failure handling.
- Prevents ordinary vertical playlist scrolling from triggering the episode long-press “Go to Podcast” menu.
- Requires a deliberate rightward swipe of at least 30% of the episode card width, with a 110 px minimum and horizontal-dominance check, before marking an episode played.
- Rebuilds and verifies the selected playlist whenever Enforce Master Playlist Order or Enforce Variety changes.
- Displays the podcast name above the episode title with matching large, bold hierarchy.

## Version

- App version: 1.4.16.45
- Build: 141645
- Database schema: 132 (unchanged)
