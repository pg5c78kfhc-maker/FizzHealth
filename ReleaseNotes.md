# Fizz Health v1.4.16.17 — Podcast Subscription Lifecycle & Metadata Repair

Completed stories: **FH-1617.1-FH-1617.5**.

- Turns Find Podcasts results into active Subscribe/Unsubscribe controls.
- Unsubscribing removes the podcast from My Podcasts and all playlists while preserving playback history, progress, preferences, and playlist-subscription settings.
- Subscribing or resubscribing immediately refreshes the RSS feed and repairs artwork, publisher, title, website, latest episode date, and feed status.
- Tracks podcasts with incomplete metadata and retries those records first during My Podcasts refresh.
- Reconciles saved playlist subscriptions immediately after resubscription and refresh.
