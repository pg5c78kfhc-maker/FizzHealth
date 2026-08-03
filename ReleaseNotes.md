# Fizz Health v1.4.16.5

Podcast Up Next Queue.

# Fizz Health v1.4.16.4 — Player Preferences & Playback Experience

## Scope delivered

- Added a player-settings gear on podcast detail pages.
- Added a global playback-speed slider from 0.5× to 3.0× in 0.1× steps, with precise minus and plus controls.
- Persisted playback speed in the podcast settings table and local fallback storage; the preference applies to every podcast and survives application reopening.
- Restored the most recent in-progress episode and mini-player after application reopening.
- Marked episodes played at the 95% threshold and removed them immediately from the default episode list.
- Added a collapsed Show Played Episodes section preserving completion history and timestamps.
- Preserved in-progress position, remaining progress, and resume behavior.

## Out of scope

Offline downloads, cross-device sync, queues, CarPlay, and external-player progress imports remain out of scope.

Completed stories: FH-1604.1-FH-1604.7
