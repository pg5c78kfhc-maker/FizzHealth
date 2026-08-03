# Fizz Health v1.4.16.14 — iPhone OPML File Selection Hotfix

## Summary

Corrects the iPhone Files picker so valid Overcast OPML exports can be selected for import.

## Changes

- Remove the restrictive `accept` attribute from the hidden OPML file input.
- Allow iOS Files to return the selected file regardless of its reported MIME type.
- Continue validating the selected file by parsing its OPML contents after selection.
- Preserve the existing duplicate detection, import ordering, progress, and results summary.

## Limitations

- The local production build remains dependent on the locked npm packages being available from the configured registry.

Completed stories: FH-1614.1-FH-1614.2
