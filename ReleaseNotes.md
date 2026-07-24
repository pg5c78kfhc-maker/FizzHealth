# Fizz Health v1.4.11.29 — Classified Meal Promotion Recovery

Released July 24, 2026. Build 141129. Deployment FH-20260724-141129.

Completed FH-1325 through FH-1327, with stabilization story FH-1333.

- Restored the v1.4.11.22 stable source baseline before applying new feature work.
- Added Food Consumption Role: Standalone Food, Meal Component, or Both.
- Added one shared Promote to Meal form for Foods and Recipes.
- Requires a Meal Category during promotion, defaulting explicitly to Any.
- Promotion creates a Meal definition linked to its Food or Recipe source without logging, consuming, planning, or changing pantry quantities.
- Removed consumption and planning controls from Food and Recipe metadata/detail screens.
- Food-library item taps now open metadata/details; explicit quick-log gestures remain separate.
- Promotion forms do not auto-focus fields and keep the keyboard closed until the user deliberately taps the Meal name.

# Fizz Health v1.4.11.22 — Startup Reliability Hotfix

Released July 24, 2026. Build 141122. Deployment FH-20260724-141122.

Completed FH-1321 through FH-1324.

- Removed the artificial database startup timeout that could reject a healthy first installation or upgrade.
- Replaced the fatal startup watchdog with non-destructive progress reporting.
- Added visible startup-stage diagnostics while preserving the underlying error message.
- Reduced migration work by reconciling schema once after pending migrations and limiting feature repair to the necessary upgrade path.
- Preserved all existing local Fizz Health data.

# Fizz Health v1.4.11.21 — Living Daily Brief & Persistent Audio

Released July 24, 2026.

Completed FH-1302 through FH-1320.

- Replaced the static Daily Brief greeting with timestamped, continuously updated health and fitness headlines.
- Added pending-food projections, Restaurant Day context, pantry-specific nutrition guidance, and weight milestone history.
- Added smoother spoken narration and Settings → Audio with persistent voice and speed selection.
- Promoted Meal Planner to the Food subsystem tile grid and removed the redundant Plan a meal card.
- Standardized Meal Planner close navigation.
- Locked restaurant card controls to rank, price, favorite, pencil and tightened confidence percentage fitting.

# Fizz Health v1.4.11.20 — Restaurant Decision Dashboard Polish

Released July 24, 2026. Build 141320. Deployment FH-20260724-141320.

Completed FH-1295 through FH-1301.

- Finalized restaurant cards with rank, price, favorite, and edit actions in one compact top row.
- Added a dedicated right-side stack for confidence, Prot, Sat Fat, and Chol.
- Expanded the card text area for the dish description and specific ranking explanation.
- Preserved adaptive high-contrast nutrient status colors.
- Standardized the Full Nutrition Record header: X left, Pencil then Check on the right.
- Save is disabled until changes exist; closing with unsaved changes requires confirmation.
- Preserved keyboard and safe-area visibility for all editor actions.
