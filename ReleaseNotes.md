# Fizz Health v1.4.17.14 — Compact Program Cards

Release date: 2026-08-07  
Build: 141714  
Release ID: FH-20260807-141714  
Schema: 146

## Implemented scope

- FH-17114.1 — Remove redundant Active status indicators from cards already shown on the Active tab.
- FH-17114.2 — Compact active program cards and allow summary text to use the available card width.
- FH-17114.3 — Move the expand/collapse chevron to the centered bottom edge of the program card.
- FH-17114.4 — Preserve lifecycle tabs, edit/add controls, and nested workout expansion behavior.

## User-facing behavior

Active program cards no longer repeat the Active state inside the card. Program metadata and description use the available horizontal width, reducing unnecessary wrapping and vertical height. The disclosure chevron now sits at the bottom edge of the card, directly above the section that expands.

## Migration notes

No database migration. Schema remains 146.

Acceptance story range: FH-17114.1-FH-17114.4

---

# Fizz Health v1.4.17.13 — Calorie Import Parser Hotfix

Release date: 2026-08-07  
Build: 141713  
Release ID: FH-20260807-141713  
Schema: 146

## Implemented scope

- FH-17113.1 — Normalize smart quotation marks in copied calorie-estimate JSON.
- FH-17113.2 — Accept Markdown code fences and surrounding ChatGPT response text.
- FH-17113.3 — Preserve schema-version, workout-execution-ID, and calorie-value validation after normalization.

## User-facing behavior

Calorie-estimate Import now accepts strict JSON as well as common clipboard formatting introduced by rich-text copying, including curly quotation marks, optional ```json fences, and harmless text surrounding the JSON object. Invalid or mismatched workout responses remain rejected.

## Migration notes

No database migration. Schema remains 146.

## Known limitations

Clipboard read access remains subject to browser/PWA permissions. Import still requires a structurally valid Fizz Health calorie-estimate response after normalization.

Acceptance story range: FH-17113.1-FH-17113.3

---

# Fizz Health v1.4.17.12 — Workout End & Calorie Estimate Exchange

Release date: 2026-08-07  
Build: 141712  
Release ID: FH-20260807-141712  
Schema: 146

## Implemented scope

- FH-17112.1 — Start a workout only when its first performed set is committed.
- FH-17112.2 — Replace routine selection checkboxes with completion-only checkmarks.
- FH-17112.3 — Allow an in-progress workout to end early while preserving completed sets and actual duration.
- FH-17112.4 — Export completed or early-ended workouts as versioned JSON for ChatGPT calorie estimation.
- FH-17112.5 — Validate and import returned estimated calories onto the correct workout.

## User-facing behavior

A workout remains not started while the user browses routines, exercises, and sets. The first inline set checkmark creates the workout execution timestamp. An active workout can be ended early with confirmation. Completed and early-ended workouts expose an Export action; after export the action changes to Import so a validated ChatGPT JSON response can persist an estimated-calorie value.

## Migration notes

Schema 146 adds end-reason and calorie-estimate exchange metadata to workout execution sessions. Existing workout history and performed sets are preserved.

## Known limitations

Calorie burn is explicitly an estimate supplied through the manual JSON exchange. Clipboard read/write support remains subject to browser/PWA permissions.

Acceptance story range: FH-17112.1-FH-17112.5
