# Fizz Health v1.4.16.47 — Master Playlist Order Projection Repair

## Scope delivered

- Uses each playlist’s saved podcast order, keyed by stable playlist and podcast IDs, as the primary projection order.
- Preserves that master order through every Enforce Variety round.
- Builds the visible playlist and playback queue from the same persisted projection.
- Verifies the projected podcast sequence and reports the first mismatch instead of silently falling back to date order.

## Stories

- FH-1647.1-FH-1647.4
