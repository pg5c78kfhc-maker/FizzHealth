# Fizz Health v1.4.11.23 — Daily Brief Intelligence & UI Consistency

Released July 24, 2026. Build 141123. Deployment FH-20260724-141123.

Completed FH-1316 through FH-1321.

- Removed the white treatment behind restaurant edit pencils while preserving full touch targets.
- Completed Audio Settings dirty-state, explicit save, persistent voice and speed, unsaved-change protection, and return navigation.
- Standardized X and checkmark controls directly on editor page backgrounds with 44×44 touch targets.
- Added verified pantry ranking for fiber and protein gaps using nutrition impact, calories, expiration, open status, Restaurant Day context, LDL support, and projected gap closure.
- Added Daily Brief acknowledgment for Not Planned → Proposed and Proposed → Consumed transitions.
- Kept planned nutrition separate from consumed totals and re-ranked next actions after transitions.
- Updated spoken narration to connect meal changes, projected effects, actual effects, and pantry-based next steps.

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
