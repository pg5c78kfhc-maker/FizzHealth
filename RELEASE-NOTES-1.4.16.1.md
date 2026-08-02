# Fizz Health v1.4.16.1 — Podcast Directory Search

## Scope

- The Podcasts `+` button now opens **Find Podcasts**.
- Search Apple’s external podcast directory by show name, host, or publisher.
- Display artwork, title, publisher, and categories in search results.
- Add a selected podcast to My Podcasts with one tap.
- Store only selected podcasts in the Fizz Health database.
- Mark already-added results and prevent active duplicate RSS feeds.
- Preserve **Enter a podcast manually** as a fallback.

## Data isolation

Podcast directory source identifiers are stored only in the dedicated `podcasts` table. No Health, Labs, Nutrition, or Recommendations tables are changed.

## Out of scope

Episode import, RSS refresh, streaming, downloads, listening history, and AI summaries remain out of scope.
