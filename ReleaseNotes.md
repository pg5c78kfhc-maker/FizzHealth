# Fizz Health v1.4.17.24 — Audible Dynamic Cover Cache

Validated remote audiobook cover URLs are now preferred by the Audible UI and cached persistently by the service worker as they are viewed. Pull-to-refresh retries/warm-caches unresolved remote artwork, while previously packaged cover assets and the normal placeholder remain safe fallbacks. No database schema change; schema remains 147.

The supplied next 50-title capture was not available as complete raw sandbox content during this build, so this release does not fabricate or partially import those records; the owned library remains 450 titles.

Completed story range: FH-17124.1-FH-17124.4
