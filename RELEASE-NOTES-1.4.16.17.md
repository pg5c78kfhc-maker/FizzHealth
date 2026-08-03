# Fizz Health v1.4.16.17 — Podcast Subscription Lifecycle & Metadata Repair

## Included

- Makes the Find Podcasts subscription button an active toggle.
- Subscribed podcasts display **Subscribed** and can be unsubscribed after confirmation.
- Unsubscribing removes the podcast from My Podcasts and removes its episodes from Up Next, Stories, and other stored playlists.
- Playback history, resume positions, podcast preferences, and saved playlist-subscription settings remain preserved.
- Subscribing or resubscribing restores the existing podcast record when possible instead of creating a duplicate.
- Subscription immediately refreshes the RSS feed and repairs artwork, publisher, canonical title, website, latest episode date, and feed health.
- Adds persisted metadata completeness and last-attempt fields.
- My Podcasts refresh prioritizes incomplete metadata records while continuing to refresh the full active library.
- Saved playlist subscriptions reconcile automatically after a successful resubscription refresh.

## Schema

- Schema version: 122
- Adds `podcasts.metadata_incomplete`.
- Adds `podcasts.metadata_last_attempt_at`.
