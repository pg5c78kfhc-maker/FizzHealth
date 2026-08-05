# Fizz Health v1.4.16.48 — Playlist Refresh, Gesture State & Reorder Boundary Repair

## Scope completed

- Bounded the podcast reorder screen to a real internal scroll viewport so it cannot scroll or drop into an unbounded empty region.
- Clamped drops above and below the list to the first and final valid podcast positions.
- Stopped edge auto-scroll at the actual scroll limits and cleared pointer/animation state after drop or cancellation.
- Added a shared gesture reset event and gesture-session tokens so delayed long-press callbacks cannot survive episode-details navigation or component unmounting.
- Cancelled pending long press/swipe state before opening episode information.
- Made pull-to-refresh perform a final full stable-ID playlist projection and reapply stored Master Order and Variety filters.
- Strengthened played-episode filtering by using persisted status/completion plus playback-duration fallbacks to the playlist and episode duration.
- Applied the same completion filtering to stored playlist filtering and queue construction.

## Compatibility

No schema change was required. Existing playlist IDs, membership, saved podcast order, and playback history are preserved.
