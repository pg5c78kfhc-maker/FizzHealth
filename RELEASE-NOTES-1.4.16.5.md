# Fizz Health v1.4.16.5 — Podcast Up Next Queue

## Added

- Folder-style **My Podcasts** and **Up Next** tabs on the Podcasts landing page.
- Swipe-right action on podcast episodes to append an episode to the bottom of Up Next.
- Persistent `podcast_up_next` database table isolated within the Podcasts module.
- Duplicate prevention using the episode key.
- Up Next list with queue order, artwork, episode title, podcast title, saved progress, play/resume, and remove controls.
- Sequential in-app playback: completing a queued episode removes it and advances to the next queued episode.
- Automatic stop after the final queued episode.

## Deliberately deferred

- Drag-and-drop queue reordering.
- Multiple playlists.
- Bulk queue actions.
- External Apple Podcasts or Overcast queue synchronization.
- Offline downloads.
