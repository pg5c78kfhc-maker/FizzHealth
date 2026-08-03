# Fizz Health v1.4.16.20 Release Notes

## Podcast startup crash repair

- Fixed the My Podcasts page black-screen failure during initial render.
- Moved the podcast page header to module scope so the error-boundary fallback no longer references a component that is out of scope.
- Made the error-boundary diagnostics query non-fatal.
- Added defensive validation for persisted collapsed/expanded section state, including `null`, arrays, malformed JSON, and non-object values.
- Changed initial My Podcasts, Up Next, Stories, Drama, preference, and subscription reads to migration-safe optional queries.
- Preserved the v1.4.16.18 podcast organization and episode-card behavior.

## Version

- Version: 1.4.16.20
- Build ID: 141620
- Deployment ID: FH-20260803-141620
