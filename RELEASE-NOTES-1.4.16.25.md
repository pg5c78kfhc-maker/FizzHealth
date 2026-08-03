# Fizz Health v1.4.16.25 Release Notes

## Podcast subscription diagnostics and URL integrity

This release completes the on-device diagnostics workflow for podcast subscription and feed refresh failures.

### Implemented

- Added a rolling local-device log containing the latest 100 podcast retrieval events.
- Records Apple directory ID, Apple-returned feed URL, previous stored feed URL, final stored feed URL, and the URL actually requested.
- Distinguishes fresh subscriptions, reactivated subscriptions, manual refreshes, and playlist refreshes.
- Verifies whether the Apple feed URL and stored/requested URL match.
- Records browser-first and compatibility-service attempts independently, including status, content type, final URL, duration, error code, message, and stack excerpt.
- Records RSS/Atom detection, XML byte size, parsed episode count, first and last episode titles, and playlist reconciliation counts.
- Added an in-app Podcast Diagnostics page with Copy Diagnostics, Save Diagnostics, Clear Diagnostics, and recent-event navigation.
- Failed subscriptions and failed episode refreshes now expose a View Diagnostics action instead of hiding the detailed failure.
- Kept RSS parsing and podcast state management on the phone; the backend remains a raw-feed compatibility transport only.
- Updated both Netlify and Cloudflare-compatible feed transports to return final URL and redirect information.

### Scope controls

No unrelated nutrition, health, inventory, menu, or visual-layout features were changed.
