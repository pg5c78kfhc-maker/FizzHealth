# Fizz Health v1.4.16.18 Release Notes

## Podcasts

- Reorganized My Podcasts into persistent collapsible sections: Unassigned, Up Next, Stories, and Drama.
- Enforced single-placement priority: Up Next, then Stories, then Drama; podcasts with no playlist subscription remain Unassigned.
- Added the Drama playlist with Stories-equivalent master-order, variety, refresh, subscription reconciliation, episode count, and remaining-time behavior.
- Added one shared episode-card component for podcast feeds and playlists.
- Episode cards now show artwork, title, podcast, publisher when available, publication date/time, duration, and playback progress.
- Removed destructive trailing-card behavior; tapping the card plays/resumes, tapping the information icon opens details, and swiping right marks played.
- Added Episode Details with available artwork, title, podcast, publisher, publication date/time, duration, season, episode number, show notes, explicit status, playback status/position, playlist memberships, feed/episode links, Apple Podcasts, and Overcast actions.
- Playlist pull-to-refresh remains playlist-scoped and now includes Drama reconciliation.

## Database

- Schema 123 adds the Drama playlist and metadata columns for persisted playlist episodes.
