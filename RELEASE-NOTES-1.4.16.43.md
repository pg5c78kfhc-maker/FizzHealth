# Fizz Health v1.4.16.43 — Playlist Ordering & Live Reconciliation Repair

## Scope delivered

### Playlist carousel ordering
- Added **Reorder Playlists** immediately below **Create Playlist** in Podcast Settings.
- Added a dedicated playlist-order page using the same card-and-right-handle interaction as podcast ordering.
- Keeps **My Podcasts** fixed first and non-draggable.
- Persists every ordinary playlist by stable playlist ID using `podcast_playlists.display_order`.
- Verifies the database order by reading it back before closing the page.
- Refreshes the playlist registry immediately after a verified save.
- Newly created playlists continue to append to the end; renaming does not change position.

### Membership reconciliation
- Playlist membership editors now verify the committed subscription state.
- Membership changes dispatch one shared reconciliation event after the affected projection is rebuilt.
- Podcast lists, eligible episode lists, Unassigned enrollment, counts, remaining time, and carousel totals refresh without navigation or reload.

### Universal played-episode exclusion
- The shared playlist projection engine excludes episodes when any of these are true:
  - playback status is `played`;
  - a completion timestamp exists;
  - persisted playback progress is at least 95% of known duration.
- The same rule is applied to stored projections, Up Next, rendered playlist queries, and newly created playlists.
- Playback updates now trigger immediate playlist reconciliation.

### Reorder-page visual repair
- Removed the internal full-height scroll shell and scroll-gutter overlay from the reorder page.
- Reorder lists now use normal document scrolling with reserved right-side clearance.
- Pointer-coordinate edge auto-scroll remains available while dragging.
- This eliminates the moving black rectangle that obscured the list.

### Date/time formatting
- Podcast cleanup and last-successful-refresh timestamps now use the device’s local, human-readable date/time format.
- Missing refresh timestamps display **Never**.

## Database
- Schema migration: **131**
- Pins My Podcasts to display order 1.
- Records v1.4.16.43 release metadata.

## Stories
- FH-1643.1 — Reorder playlist carousel from Podcast Settings
- FH-1643.2 — Persist and immediately apply carousel order
- FH-1643.3 — Refresh affected playlists after membership changes
- FH-1643.4 — Exclude completed episodes from all current and future playlists
- FH-1643.5 — Remove reorder-page overlay architecture
- FH-1643.6 — Format podcast refresh timestamps for local display
