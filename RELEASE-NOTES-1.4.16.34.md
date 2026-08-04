# Fizz Health v1.4.16.34 — Podcast Playback Reliability & Stability

## Implemented

- Added the persisted **Keep Screen Awake During Playback** setting, enabled by default.
- Requests the Screen Wake Lock API after audio begins and releases it on pause, episode end, queue completion, player close, and playback failure paths.
- Reacquires the wake lock when the PWA becomes visible again while audio remains active.
- Added a compact **Screen awake** player indicator and wake-lock diagnostics.
- Episode rows now request immediate autoplay when selected rather than merely loading the media into the mini-player.
- Playlist playback now retains its playlist source and advances through the persisted playlist order, including the round-robin order produced by **Enforce Variety**.
- Playlist completion no longer deletes playlist records; Up Next retains its existing remove-on-completion behavior.
- Hardened the episode information page against absent IDs, null metadata, object-valued fields, missing artwork, and malformed notes.
- Retained bounded playlist mounting and incremental “Load More” rendering for large playlists.

## Platform limitation

A standalone iOS PWA still cannot guarantee starting a new media resource after the app is backgrounded or manually locked. Wake Lock improves continuity while Fizz Health remains visible, but does not override that WebKit lifecycle limitation.
