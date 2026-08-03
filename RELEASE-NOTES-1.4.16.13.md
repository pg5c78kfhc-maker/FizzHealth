# Fizz Health v1.4.16.13 — Podcast Import

## Summary

Adds OPML podcast-subscription import behind the top-level Podcasts gear.

## Changes

- Import standard OPML files exported by Overcast and compatible podcast apps.
- Preserve subscription order after existing podcasts.
- Detect duplicates by RSS URL, Apple Podcasts ID, and title fallback.
- Show import progress and a completion summary with imported, existing, and failed counts.
- Keep individual podcast settings unchanged.

## Limitations

- OPML contains subscriptions, not playback history, played status, or external playlists.

Completed stories: FH-1613.1-FH-1613.5
