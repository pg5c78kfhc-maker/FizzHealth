# Fizz Health v1.4.16.19 Release Notes

## Podcast detail crash repair

- Fixed the black-screen crash when opening The Mike O’Meara Show podcast page.
- Podcast metadata is now normalized before rendering.
- Categories may now safely arrive as strings, arrays, JSON strings, objects, nulls, booleans, or numbers.
- Titles, publishers, descriptions, artwork URLs, feed URLs, Apple Podcast URLs, and website URLs are converted to render-safe values.
- Invalid or unsafe URLs are suppressed instead of being rendered.
- Removed the direct `selected.categories.split(',')` assumption that caused the crash.
- Added a podcast-page React error boundary so malformed feed metadata produces a recoverable error page rather than a blank application screen.
- Added targeted regression coverage for The Mike O’Meara Show-style metadata.

## Version

- Version: 1.4.16.19
- Build ID: 141619
- Deployment ID: FH-20260803-141619
