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
