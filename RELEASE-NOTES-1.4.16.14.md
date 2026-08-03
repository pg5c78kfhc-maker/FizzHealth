# Fizz Health v1.4.16.14 — iPhone OPML File Selection Hotfix

## Summary

Corrects the iPhone Files picker so valid Overcast OPML exports can be selected for import.

## Changes

- Removed the MIME/extension `accept` restriction from the hidden OPML file input.
- iOS Files may now return the selected file even when its provider reports an unexpected or blank MIME type.
- OPML validity is still checked after selection by the existing parser.
- Existing import ordering, duplicate detection, progress display, and result reporting remain unchanged.

## Scope

Corrective hotfix only. No podcast database or import-behavior redesign.
