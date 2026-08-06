# Fizz Health v1.4.16.54 — Enforced Variety Projection Repair

## Scope

This corrective release repairs the visible and playable projection for every podcast playlist with **Enforce Variety** enabled.

## Changes

- Reapplies stored playlist filters to existing non-empty variety playlists during startup recovery.
- Builds the rendered playlist defensively through the shared round-robin projection, preventing stale database ordering from showing consecutive episodes from one podcast.
- Preserves the persisted live podcast rotation when constructing each round.
- Keeps Master Playlist Order as the initial/fallback podcast order.
- Continues to respect each podcast's own oldest-first or newest-first episode sequence.
- Uses the corrected projected order for playlist cards, counts, remaining time, Shuffle source selection, and playback entry selection.

## Expected behavior

For eligible podcasts A, B, and C, a variety playlist now projects:

A1, B1, C1, A2, B2, C2...

A podcast cannot contribute a second episode until every other currently eligible podcast has had its turn in that round.
