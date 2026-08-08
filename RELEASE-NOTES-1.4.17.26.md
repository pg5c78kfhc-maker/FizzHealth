# Fizz Health v1.4.17.26 — Audible JSON Existing-Enrichment Import Fix

## Implemented scope

- Corrected the Audible JSON existing-record enrichment write that could fail after successful validation with a SQL.js **column index out of range** error.
- Root cause: the existing-audiobook `UPDATE audible_audiobooks` statement had 22 SQL placeholders but the v1.4.17.25 code supplied 23 bound values. An extra ownership/library value shifted all later parameters and caused SQL.js to reject the statement before the transaction could commit.
- Moved Audible exchange persistence into `src/audio/audibleExchangePersistence.js` so the existing-update and new-insert parameter contracts can be tested independently of the React modal.
- Existing-audiobook enrichment now supplies exactly one value per SQL placeholder and can persist missing `runtime_minutes`, `runtime_display`, `cover_image_url`, and associated cover provenance in the same update.
- Existing non-null metadata remains protected from replacement by incoming null/blank fields.
- Existing owned/library state cannot be downgraded by an enrichment response, and an explicit existing `finished` listening state remains preserved.
- New-audiobook insertion behavior is unchanged and remains ASIN-reconciled.
- Full-payload validation, duplicate-ASIN rejection, HTTPS URL validation, audiobook-only validation, and transactional rollback behavior are unchanged.
- After a successful import, the same v1.4.17.24 dynamic artwork path is still invoked via `primeAudibleCoverCache`, allowing imported cover URLs to be fetched/cached without another source deployment.

## Field-test acceptance target

The nine-record enrichment payload that previously validated as **0 new / 9 existing / 7 covers / 9 runtimes** should now pass the database-write step instead of failing with `column ... out of range`. On a successful import, the seven supplied cover URLs should persist and flow into the existing dynamic artwork cache. This release does not hard-code that user payload into the source database; it repairs the import path so the same JSON can be retried on-device.

## Schema / migration

Database schema remains **147**. No structural database change or compatibility migration was required; this was an application-layer SQL bind defect in the v1.4.17.25 exchange importer.

## Scope exclusions

- No new audiobook source seed or library-count change.
- No new Audible UI workflow or card redesign.
- No podcast, Audio landing-page, Workout, Nutrition, Health, or unrelated application changes.
- No changes to the Audible exchange schema version.

## Known limitations

- Live on-device IndexedDB/SQL.js persistence and remote cover downloading cannot be exercised inside this container. Focused tests verify the corrected SQL placeholder/bind contract, existing-record preservation semantics, new-record insert alignment, validation behavior, and continued connection to the cover-cache call. The supplied nine-record payload should be retried on the deployed iPhone as the field acceptance test.
- Production Vite build remains blocked in this environment because `npm ci` receives a registry 404 for pinned `xlsx@0.18.5`; see the test report.

Completed story range: **FH-17126.1-FH-17126.4**
