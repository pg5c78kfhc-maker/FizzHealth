# Fizz Health v1.4.16.24 Release Notes

## Podcast feed compatibility repair

This release repairs podcast subscriptions and refreshes that failed even after the browser-first retrieval architecture switched to compatibility mode.

### Changes

- The compatibility service is now a minimal RSS transport only.
- RSS XML is returned to the iPhone and parsed locally, preserving the browser-first architecture and keeping podcast processing on the device.
- Public HTTP and HTTPS feed URLs are accepted by compatibility mode.
- Direct Safari retrieval remains HTTPS-only to avoid mixed-content failures.
- Redirects are followed with podcast-host-compatible request headers.
- Non-RSS responses are rejected with a specific diagnostic.
- Legacy HTTP episode media URLs are upgraded to HTTPS for secure PWA playback when possible.
- The previous parsed-JSON proxy response remains supported for backward compatibility.

No unrelated podcast playlist, playback, or health functionality was changed.
