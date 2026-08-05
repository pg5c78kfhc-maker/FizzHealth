# Fizz Health v1.4.16.46 — Podcast Swipe & Reorder Runtime Repair

## Scope delivered

- Moves playlist filter application into a shared runtime-safe helper.
- Repairs podcast reorder Save so projection rebuilding no longer fails with a missing variable.
- Requires a deliberate, horizontal, reversible swipe before marking an episode played.
- Prevents vertical scrolling, leftward motion, cancellation, and reversal from triggering Mark as Played.

## Stories

- FH-1646.1-FH-1646.4
