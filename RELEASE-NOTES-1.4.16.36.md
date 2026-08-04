# Fizz Health v1.4.16.36 — Main Settings Navigation Hotfix

## Scope

A narrow corrective release repairing the black screen shown when the footer Settings button was tapped.

## Root cause

The v1.4.16.35 source was truncated at the end of `PodcastsPage`. The complete Podcasts render switch and the separate main `Data` Settings component were replaced by the Settings hub's trailing markup. Consequently, the application attempted to render an undefined `Data` component when navigating to Settings.

## Changes

- Restored the complete `PodcastsPage` render switch from the last intact source while preserving the v1.4.16.35 playback, episode-information, and persistence fixes.
- Restored the standalone `Data` Settings component and all Settings subpage routing.
- Kept the v1.4.16.35 local episode-details error boundary around the restored episode-details route.
- Wrapped the footer Settings route in an application-level error boundary.
- Updated release, build, service-worker, decision-engine, About, package, and release-history metadata to v1.4.16.36.

## User-visible result

Tapping Settings in the persistent footer now opens the normal Settings hub instead of a blank black screen.
