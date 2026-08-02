# Fizz Health v1.4.16.3 — Podcast Player & External Launch Repair

Released: August 2, 2026

## Delivered

- Added direct in-app streaming from each episode RSS enclosure URL. Audio is requested by the iPhone directly from the podcast host; Fizz Health does not relay or store the audio.
- Added a persistent mini-player with play/pause, 15-second rewind, 30-second forward, seek position, playback speed, and close controls.
- Added playback persistence with unplayed, in-progress, and played states; resume position is restored and 95% completion marks an episode played.
- Added episode progress bars and played indicators.
- Replaced duplicate generic external-player symbols with distinct Apple Podcasts and Overcast controls.
- Repaired external launch behavior and added show-level fallbacks when an exact episode URL is unavailable.
- Added Media Session metadata and supported lock-screen actions where the browser provides the API.

## Not included

- Offline episode downloads
- Apple Podcasts or Overcast playback-history synchronization
- CarPlay or native background-download support
- Queues, playlists, and cross-device synchronization
