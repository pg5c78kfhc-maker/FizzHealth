# Fizz Health v1.4.16.2 — Podcast Episodes

Completed stories: FH-1602.1-FH-1602.5

- Loads all available episodes from each selected podcast RSS feed through a same-origin Cloudflare Pages Function.
- Displays newest-first episode rows with artwork, publication date, duration, and a description preview.
- Adds stacked Apple Podcasts and Overcast launch controls for each episode.
- Moves podcast removal to a trash icon in the header beside the edit/check action.
- Adds loading, empty, error, and retry states.

Fizz Health does not stream, download, or host podcast audio.

## Corrective packaging update
- Corrected `scripts/project-integrity.mjs` so post-install generated tool/dependency metadata cannot be misidentified as a second application package.
- Duplicate application trees remain protected by the existing root-and-nested-app validation.
