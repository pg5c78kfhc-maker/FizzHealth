# Fizz Health v1.4.14.9 — Startup Performance and Nutrition Verification

## Completed stories

- **FH-1414.32** — Render a dark Fizz Health launch shell directly from `index.html`, before the application JavaScript bundle initializes.
- **FH-1414.33** — Remove current Recipe/Meal nutrition refresh work from the critical startup path. The database opens first, the application becomes usable, and refresh work runs during idle time.
- **FH-1414.34** — Isolate deferred nutrition refresh failures. A broken Recipe, Meal, or reference can be skipped and reported without blocking the application.
- **FH-1414.35** — Record startup phase durations locally and add regression coverage for startup ordering, fallback scheduling, and release metadata.

## Behavior

- The user sees a branded dark launch state immediately rather than an unstyled white page.
- The application shell renders as soon as the database is ready.
- Aggregate nutrition refresh runs after first render and does not block navigation.
- Full precision and canonical Recipe/Meal calculations from v1.4.14.8 are preserved.
