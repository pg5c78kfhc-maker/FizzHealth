# Fizz Health v1.4.16.49

## Shuffle Playlist Foundation & Gesture Reliability

### Added
- Permanent, collapsible **Shuffle** system section above **Unassigned** in the podcast library.
- Shuffle source settings backed by stable playlist IDs. Shuffle, My Podcasts, and Unassigned are excluded as sources.
- One current eligible contribution from each selected playlist, using the playlist's already-filtered and ordered projection.
- Duplicate episode suppression while retaining all contributing playlist IDs internally.
- Source rotation after a Shuffle episode is marked played.
- Shuffle queue, contribution, duplicate, rotation, gesture, and played-removal diagnostics.

### Reliability repairs
- Replaced release activation with stricter threshold validation: 40% of card width or 140 px, whichever is greater.
- Diagonal movement, scrolling, and reverse movement cancel the swipe.
- Existing shared episode card remains the only episode interaction implementation used by Shuffle.
- Existing gesture lifecycle reset, refresh re-projection, played filtering, and reorder boundary repairs remain active.

### Database
- Schema 133.
- Added `podcast_shuffle_sources` for stable-ID selection and rotation order.
- Added `podcast_shuffle_diagnostics` for persisted diagnostic compatibility.
- Added the non-renamable, non-deletable `shuffle` system playlist registry row.
