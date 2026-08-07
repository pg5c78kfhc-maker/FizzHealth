# Fizz Health v1.4.17.13 — Calorie Import Parser Hotfix

## Release title

Calorie Import Parser Hotfix

## Implemented scope

- Harden the workout calorie-estimate JSON import path against clipboard formatting introduced by ChatGPT/rich-text copying.
- Normalize smart/curly double quotation marks used as JSON delimiters while preserving embedded quoted phrases inside string values.
- Accept optional Markdown `json` code fences.
- Extract the JSON object when harmless explanatory text surrounds it.
- Normalize BOM/non-breaking-space clipboard artifacts.
- Preserve the existing schema-version, exchange-type, workout-execution-ID, and calorie-value validation.
- Replace raw `JSON.parse` exception text with a user-facing import error when normalization still cannot produce valid JSON.

## User-facing behavior

The Import action on a completed or early-ended workout can now accept the common response forms produced when ChatGPT JSON is copied through rich-text interfaces. A response containing curly quotation marks, Markdown fences, or surrounding prose is normalized before validation and import. A calorie estimate for a different workout continues to be rejected.

## Migration notes

No database migration is required. Database schema remains version 146. Existing workout executions, performed sets, workout history, and saved calorie estimates are unchanged.

## Known limitations

- Clipboard read access remains subject to browser/PWA permissions.
- The response must still contain a structurally valid Fizz Health calorie-estimate JSON object after normalization.
- Production build verification is environment-blocked because the configured package registry returns HTTP 404 for pinned dependency `xlsx@0.18.5`, so Vite cannot be installed in this environment.
