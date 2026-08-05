# Fizz Health v1.4.16.46 — Podcast Swipe & Reorder Runtime Repair

## Objective

Repair the missing playlist-filter runtime helper that blocked podcast reorder Save, and replace the mark-as-played swipe with a deliberate, reversible gesture state machine.

## Changes

- Moved `applyStoredPlaylistFilters` out of the `PodcastsPage` component into shared module scope so projection rebuilds and reorder Save can call it safely.
- Preserved stable playlist and podcast ID persistence and read-back verification during reorder Save.
- Rebuilds and reapplies stored playlist filters before the reorder page closes.
- Replaced distance-only swipe handling with pending, vertical, horizontal, armed, cancelled, and released states.
- Requires at least 35% of card width and 130 CSS pixels before Mark as Played arms.
- Cancels on vertical dominance, leftward motion, cancellation, or reversal below the threshold.
- Executes Mark as Played only on release while still armed.

## Database

No schema change. Existing schema version 132 is retained.
