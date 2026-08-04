# Fizz Health v1.4.16.32 — Playlist Navigation & Background Playback Continuity

## Delivered

- Replaced the compact podcast folder tabs with a one-row horizontal carousel of large circular touch buttons.
- Added centered playlist names and counts beneath each button, active-state highlighting, momentum scrolling, scroll snapping, and automatic centering of the selected playlist.
- Kept the carousel data-driven so future playlists append naturally to the right without compressing or wrapping the row.
- Moved podcast completion handling from the React `onEnded` prop to a persistent native audio-element lifecycle listener owned by the global mini-player.
- Added current-playback refs to prevent stale route/component closures during automatic queue advancement.
- Added invalid queue-entry skipping, duplicate completion suppression, and route/visibility-aware auto-advance diagnostics.
- Preserved playback speed, persisted completion state, queue removal, and automatic loading of the next valid episode.

## Scope boundaries

No unrelated nutrition, health, database, or podcast-refresh features were added.
