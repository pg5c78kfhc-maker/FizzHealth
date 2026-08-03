# Fizz Health v1.4.16.23 Release Notes

## Podcast retrieval architecture

- Podcast RSS refresh now attempts a direct browser request first.
- RSS XML is parsed locally on the device when the feed permits browser access.
- A lightweight compatibility proxy is used automatically only after the direct request fails.
- The phone remains responsible for parsing, persistence, reconciliation, playlist rebuilding, sorting, filtering, playback state, and remaining-time calculations.
- Successful retrieval mode is cached per feed for diagnostics and future optimization.
- Subscription and refresh operations now expose meaningful progress states: downloading, parsing, compatibility mode, and ready.
- Generic HTML responses from a misrouted proxy are detected rather than treated as JSON.
- Feed failures record structured direct and proxy diagnostics in the browser console and podcast health fields.

## Hosting compatibility

- Added a Netlify-compatible RSS fallback function.
- Added an explicit `/api/podcast-feed` redirect before the SPA wildcard redirect.
- Retained the existing Cloudflare Pages function for deployments using that platform.
