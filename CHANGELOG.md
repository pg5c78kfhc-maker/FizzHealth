## 1.4.10.23

- Completed restaurant navigation and contextual AI Exchange workflows.
- Added shared Add/Edit Restaurant profile screen.
- Added restaurant menu-item provenance and swipe actions.
- Promoted completed Food hub subsystems.
- Removed obsolete generic restaurant capture interfaces.

## 1.4.10.22
- Unified AI food creation, one-time meal estimation, and existing-food enrichment.
- Added lightweight provenance without storing photos or exchange payloads.
- Fixed restaurant detail black-screen failure path and added resilient fallback behavior.

## 1.4.10.15 — 2026-07-20

- Nutrient audit completion, Add Food fix, nutrition inspector access, About metadata, and planned-card consistency.

## 1.4.10.14 — 2026-07-20

- Complete nutrient registry, editing, provenance, unknown-value preservation, schema 42, time-sensitive nutrient priority/color logic, and durable decision documentation.

## 1.4.10.13 — 2026-07-20

- Corrected FH-1250.2 planner card layout, planned-meal gestures, and meal scheduling UX.
- Added transparent fixed/dynamic Top 10 nutrient ranking and contributor drill-downs.
- Added schema 41 and cholesterol propagation for planned and consumed meals.
- Added regression coverage for nutrition trust and planner corrections.

## 1.4.10.12 — 2026-07-20

### FH-1250.2
- Added interactive recommendation swipe/tap actions and accessible button alternatives.
- Added recommendation explanation, acceptance, same-day dismissal, and scheduling workflows.
- Added distinct lifecycle events for dismissed suggestions and removed planned meals.
- Added same-day recommendation suppression and behavior/time-of-day ranking guardrails.
- Preserved the Food Log as the unified consumed-plus-planned nutrition runway.
- Reduced Home planning UI to a compact link.

# Changelog

## v1.4.10.8 — 2026-07-20
- FH-1262 partial: canonical federated Health timeline for meals and measurements.
- Added stable event identity, source linkage, duplicate suppression, Delete, Log Again, and Undo behavior.
- Added automated FH-1262 regression coverage and implementation/deferred-scope documentation.

## v1.4.10 — Pantry Intelligence Stabilization & Workflow Refinement

Schema 39. Unified hierarchical pantry filtering now drives the inventory list, Pantry Health Score, Chef’s Recommendations, waste risk, restock, and shopping. Added Pantry Health Score drill-down, intelligent empty states, manual pantry creation, multi-image Universal Capture, keyboard-safe workflow standards, chart rendering stabilization, and release-wide resilience/navigation refinements.

## 1.4.9.1 — 2026-07-18
- Moved the primary Universal Capture entry point to the top of Restaurant Intelligence.
- Kept global Universal Capture access through the floating + button and Capture navigation item.
- Removed the large Capture button from Daily Dashboard 2.0.

## v1.4.8.3 — Form Viewport Recovery Hotfix

- Added visual-viewport sizing for keyboard-safe editors.
- Bounded all modal panels and form controls to the available screen.
- Converted Universal Capture to a fixed-header, scrollable-body, fixed-action layout.
- Added regression coverage for viewport-safe forms.

# v1.4.6 — Health Intelligence 2.0

- Added FH-1161 through FH-1168.
- Added longitudinal, biomarker, correlation, intervention, goal, preventive-care, and explainable coaching engines.
- Upgraded database schema to 35.

# v1.4.2 — Decision Intelligence Enhancements

- Added FH-1120 through FH-1127.
- Added predictive end-of-day nutrition and LDL support.
- Added dynamic decision queue and opportunity scoring.
- Added seven-day nutrition debt and credit.
- Added weekly health forecast, decision timeline, and goal probabilities.
- Added schema migration 31 and decision-intelligence tests.

# v1.4.1.2 — Restaurant Intelligence Expansion

- FH-1110 Restaurant Meal Capture
- FH-1111 Restaurant Learning Engine
- FH-1112 Restaurant Nutrition Confidence
- FH-1113 Restaurant Analytics & Insights
- Schema 30

# Changelog

## v0.8.0 — Chef's Recommendations Engine

- Completed FH-1067.
- Added thawed/frozen pantry-state ranking.
- Added safety-first expired-item penalties.
- Strengthened quantity, priority, and recent-use variety signals.
- Added automated coverage for thawed and expired recommendation behavior.


## v0.7.9 — Decision Memory

- Added local decision memory for simulations and meal comparisons.
- Detects exact repeats and related decisions with changed inputs.
- Summarizes score, status, and action changes instead of repeating unchanged explanations.
- Marks memories stale after seven days or engine/rules changes.
- Preserves complete DecisionTrace audit data and adds an in-app clear control.


## FH-1061 — Decision Trace UI
- Added a complete audit view for every canonical DecisionTrace.
- Grouped scoring factors by category with positive, negative, and net contributions.
- Added score reconciliation, evidence provenance, evaluated inputs, projections, ranking context, missing-data disclosure, and raw trace inspection.
- Added automated tests for trace presentation and audit calculations.
# Changelog

## 0.7.3 — Decision Intelligence Platform Phase 1

- Added `src/decision/engine.js` as the shared recommendation and priority service.
- Replaced inline homepage nutrient sorting with engine-generated nutrient decisions.
- Replaced inline Chef’s Recommendation scoring with engine-generated recommendation decisions.
- Added reusable decision traces and confidence metadata.
- Added five automated tests for time awareness, limit handling, nutrient ranking, pantry pressure, and recommendation limits.
- Updated application, service-worker cache, and package versions to 0.7.3.

## 0.7.2 — Personalization Engine

- Moves Settings/Data to a gear button in the Today header and centers the five primary navigation tabs.
- Renames “Yesterday Steps” to “Steps” so the value can be updated throughout the day.
- Redesigns nutrient bars with icons and larger labels inside the bars, contrast-aware content, goal and maximum markers, and dynamic overflow scaling.
- Classifies nutrients as Goal, Limit, or Budget and displays distinct status badges, including ⭐ for goals achieved.
- Shows the ten highest-priority nutrients by default with an inline Show All control. Priorities become more urgent as the day progresses.
- Adds profile-aware nutrition infrastructure and Gear pages for Personal Health Profile and Nutrient Configuration.
- Stores minimum, goal, maximum, source, behavior, derived state, and override values in SQLite. Existing targets are preserved.
- Adds USDA/DRI-based defaults only for previously missing nutrients.
- Adds a learning maintenance-calorie estimate between the LDL Support and Steps rings.
- Adds range-aware line graphs to every body-metric history page, including two lines for blood pressure.

## Data protection

Schema v25 is a non-destructive migration. Existing meals, health readings, pantry records, restaurants, planned meals, targets, and AI Exchange history are preserved. New defaults use INSERT OR IGNORE, and existing personalized targets are not replaced.


## 0.6.7
- Daily Health tab with morning check-in and completion status.
- SQLite health-metrics event table and schema v23 migration.
- Editable metric history for weight, blood pressure, resting heart rate, steps, waist, workouts, and sleep.
- Combined daily health-and-meal timeline.


## 0.6.6
- Resilient AI Exchange JSON normalization and workspace controls.
- Restaurant lifecycle management and menu versioning.
- Restaurant menu pricing and actual-cost foundation.
# Changelog

## v0.6.5
- Added Fizz Health Exchange Format v1 for product, restaurant menu, and restaurant meal enrichment.
- Added AI Exchange workflow in Data with request generation, clipboard copy, validation, review, and apply.
- Added Restaurant Guide import and Dining navigation.
- Added saved restaurant meals and Plan action.
- Added planned-food contribution list to gauge detail.

## 0.7.1 — 2026-07-17

- Added Daily Driver decision dashboard with LDL Support, Steps, and priority-ranked segmented nutrition bars.
- Added widget-level Health error isolation.
- Replaced the Data tab label with a gear icon.
- Added enhanced weight history analytics and trend chart.
- Polished restaurant recommendation scores and favorite controls.
- Added schema migration 24 for restaurant favorites.

## 0.7.2 — 2026-07-17

- Added the Personalization Engine, database-driven nutrient thresholds, health profile, adaptive maintenance estimate, time-aware nutrient ranking, expanded nutrient bars, and body-metric history charts.
- Hotfix: corrected migration SQL statement parsing so semicolons inside text values do not split SQL statements.
- Verified all 25 migrations on a fresh database, including preservation of the complete alcohol recommendation text.

## v0.7.2 Hotfix 2 — Startup repair

- Fixed a Today-screen startup crash caused by a missing `showAllNutrients` state declaration.
- Added a Today-level error boundary so a future dashboard rendering error cannot leave the entire application blank.
- Changed the Health metric label from “Yesterday’s steps” to “Steps.”
- Advanced the service-worker cache key to force clients to receive the repaired application bundle.
- Preserved schema version 25 and all existing local data.

## v0.7.4
- Added full-disclosure decision detail pages for Chef recommendations, LDL Support, Steps, and maintenance calories.
- Split Chef cards into score/confidence explanation and food-consumption tap zones.
- Fixed iPhone bottom navigation safe-area, stacking, and scroll clearance.

## v0.7.4 scope-completion checkpoint 2
- Added first-class recipe detail, quantity adjustment, planning, and consumption as one meal snapshot.
- Added recipe ingredient drill-down without expanding ingredients into separate meal-log entries.
- Chef recommendation card bodies now open a food or recipe detail flow with Consume Now and Plan for Later.
- Added restaurant menu-item detail with separate score disclosure, Plan, and Consume actions.
- Restaurant consumption stores a historical nutrition/confidence snapshot and retains the restaurant/menu-item link.
- Restaurant recommendation disclosure distinguishes AI-estimated records and missing serving/preparation information.

## v0.7.4 scope completion — FH-1058 / FH-1059 / FH-1060
- Centralized LDL Support, Steps, Maintenance, Restaurant, Chef, and nutrient decisions behind the Decision Intelligence Engine.
- Standardized full DecisionTrace contracts with engine/rules versions, inputs, factors, missing data, projected effects, and actions.
- Added a non-destructive What If simulator for hypothetical meals and additional steps; simulations run entirely in memory and never write to SQLite.
- Expanded LDL Support to account for fiber, saturated fat, activity, calories, sodium, added sugar, alcohol, and nutrition coverage.
- Expanded Steps likelihood to support typical pace and planned-exercise inputs.
- Added activity and logging-completeness context to maintenance confidence.

## FH-1058 architecture checkpoint
- Routed application decision consumers through the single `evaluateDecision()` dispatcher.
- Moved maintenance estimation and pantry-food matching into the Decision Intelligence Engine.
- Added centralized decision-rule configuration and expanded dispatcher tests.
- Verified 13 automated tests and a clean Vite production build.

## v0.7.5 — FH-1062 Decision Details Expansion

- Added a plain-language “Why this decision?” explanation above technical trace data.
- Added strongest positive and negative driver disclosure.
- Added prominent best-next-action guidance.
- Separated confidence explanation from missing-data completeness.
- Converted projected results into readable values and before/after effects.
- Surfaced ranking comparisons when available.
- Preserved complete technical audit and raw DecisionTrace access.

## v0.7.6 — FH-1063 Explanation Consistency Engine

- Added centralized terminology normalization for decision factors.
- Standardized helpful, harmful, and neutral factor descriptions.
- Standardized confidence levels, evidence explanations, missing-data disclosures, and ranking rationale.
- Routed Decision Details through the shared explanation presentation engine.
- Added cross-context consistency regression tests.
- Restored the complete VERSION.json schema and synchronized all release-version references.
- Added an automated release metadata verification command.

## v0.7.7 — FH-1064 Decision Simulator Enhancements

- Expanded What If to support meal additions, substitutions, and additional walking.
- Added simulation inputs for calories, protein, carbohydrates, fat, fiber, saturated fat, sodium, added sugar, and alcohol.
- Added remove-and-replace nutrition calculations for substitutions.
- Added projected daily totals with target and limit status.
- Added specific meal-improvement suggestions.
- Preserved the non-destructive, in-memory simulation guarantee.

## v0.7.8 — 2026-07-17

### FH-1065 — Meal Comparison Engine
- Added two-to-four option meal comparison to the Decision Simulator.
- Added shared comparison evaluation and stable ranking tie-breaks.
- Added winner explanation, ranking cards, and metric-by-metric projected totals.
- Added auditable meal-comparison DecisionTrace output.
- Added automated comparison-engine tests.

## v0.8.1 — FH-1068 — Forward Meal Planner
- Added inventory-constrained 15/20/30-day forward meal planning.
- Added rotation, runout visibility, and calendar persistence.
- Added automated planner coverage tests.

## v0.8.2 — FH-1069 — Inventory Pressure Engine
- Added standardized inventory-pressure scoring.
- Added expiration, open/thawed, storage, serving-surplus, preferred-frequency, and waste-risk factors.
- Integrated inventory pressure into Chef recommendations and forward planning.
- Added expired-inventory safety handling and pressure visibility.
- Completed Epic 4.

## 1.0.0 — Epic 5: Pantry Intelligence
- FH-1070 Pantry Availability Engine
- FH-1071 Remaining Servings Tracker
- FH-1072 Expiration & Freshness Engine
- FH-1073 Pantry Prioritization Engine
- FH-1074 Pantry Verification with Pantry Confidence Score
- FH-1075 Pantry Forecast
- Schema v26 pantry verification and forecasting fields

## v1.3.0 — Epic 6: Health Intelligence
- FH-1076 Health Intelligence Engine
- FH-1077 Adaptive Daily Health Score
- FH-1078 Personalized Decision Engine
- FH-1079 Biomarker Optimization
- FH-1080 Trend & Correlation Analysis
- FH-1081 Goal Progress & Forecasting
- Added schema v27 for goals, labs, and intelligence snapshots.
- Added Health Decision Assistant card to Today.

## v1.3.1 — Core Logging Usability Hot Fix

- Anchored food, pantry, health, and nutrition editors to the viewport safe area.
- Added fixed headers/actions and keyboard-safe scrolling inside editors.
- Added universal visible close controls to the food logging editor.
- Reduced bottom navigation height and removed the persistent version footer from normal screens.
- Added editable compatible serving units and live calories/macros/target-impact preview.
- Added swipe-left deletion for foods and recipes in the Add panel.
- Implemented historical-safe archiving: existing meal records and nutrition snapshots are unchanged.

## v1.4.3 — Pantry Intelligence 2.0
- Added FH-1128 through FH-1139.
- Added storage-aware freshness, cost, waste, restock, shopping, location, health-score, confidence, timeline, and verification intelligence.
- Added schema migration 32.

## v1.4.4 — Meal Planning 2.0

- Added the health-plan optimization engine and five planning horizons.
- Added adaptive, variety-aware, pantry-first meal generation.
- Added batch cooking and leftover scheduling.
- Added smart shopping aggregation and purchase-size suggestions.
- Added restaurant commitments, meal locking, and partial plan adaptation foundations.
- Added health forecast and plan quality score.
- Upgraded database schema to version 33.

## v1.4.5 — Restaurant Intelligence 2.0 & AI Food Recognition 2.0
Implemented FH-1153 through FH-1160 with AI-assisted capture, recognition, portion/nutrition estimation, receipt reconciliation, smart modifications, provenance, confidence, and restaurant memory.

## 1.4.7 — Workflow & Experience 2.0
- Added Daily Dashboard 2.0 and Smart Action Center.
- Added Universal Capture and natural-language intent routing.
- Added adaptive navigation, unified timeline playback, explainability, actionable notifications, and offline workflow infrastructure.
- Upgraded database schema to 36.

## 1.4.8 — Personal Intelligence
- Added personal knowledge, preference learning, adherence prediction, behavior detection, strategy selection, adaptive goals, personal health memory, continuous learning, explainability, governance, and Personal Context API.
- Database schema upgraded to 37.

## 1.4.8.1 — Today Dashboard Recovery Hotfix
- Repairs partially applied feature schemas from v1.4.5–v1.4.8 even when migration records already exist.
- Makes optional command-center data fail soft so Today remains usable when a secondary feature table is unavailable.
- Adds regression coverage for deployed-database recovery.


## 1.4.8.2 — Today Meal Planner Query Hotfix
- Fixed a production-only Today crash caused by querying nonexistent `health_metrics.weight` and `health_metrics.recorded_at` columns.
- Added widget-level isolation around Chef’s Recommendations and Meal Planning 2.0.
- Added regression coverage for the exact SQL mismatch.

## v1.4.10.1 — 2026-07-19
- FH-1220 legacy health workbook import audit and implementation.
- Schema 40 adds workout, sleep, health context, import coverage, and idempotent source-record tracking.

## v1.4.10.2 — 2026-07-19
- Completed FH-1221 through FH-1230 stabilization and UX fixes.
- Fixed biomarker intelligence parsing of imported lab collected_at dates.
- Removed duplicate Capture navigation item while retaining the global floating action.

## 1.4.10.3
- Fixed Home location recommendation filtering.
- Added native iOS photo sharing after JSON copy.
- Added functional meal planning entry from Today.
- Rebuilt manual Pantry editor for keyboard-safe scrolling.
- Reconciled laboratory import and Health Intelligence biomarker visibility.

## v1.4.10.9 — FH-1259 One-Time Food Logging
- Added user-facing Log Once entry point and keyboard-safe editor.
- Added direct one-time meal persistence using `source='one_time'`.
- Preserved unknown-vs-zero nutrition semantics.
- Confirmed no Foods, Recipes, Favorites, or Pantry mutation.
- Integrated with Meal Log, unified Timeline, nutrition totals, deletion, and Undo.
- Added FH-1259 test proof, DOD, acceptance checklist, and deferred-scope record.

## v1.4.10.10 — FH-1259 Entry-Point Correction
- Added a direct **Log food** destination to the Food hub.
- Clarified Pantry inventory creation by renaming **Add food** to **Add to pantry**.
- Preserved the dedicated **Log Once** editor within the meal-logging workflow.
- Added regression coverage for routing and terminology separation.

## v1.4.10.11 — FH-1250.1 Meal Planner Stabilization and Food Workspace Relocation
- Moved full Meal Planner and Chef’s Recommendations from Home into Food.
- Added Plan a meal, Recommendations, and Upcoming meals destinations to Food.
- Kept macros, goal impact, planned meals, and Food Log on Home.
- Added a compact Home Food Plan summary linking into Food.
- Added guarded planner queries, normalized candidate data, safe defaults, empty state, recoverable failure state, and Retry.
- Added FH-1250 implementation, test, acceptance, and deferred-scope documentation.

## 1.4.10.19 — 2026-07-20

- Corrected canonical release metadata and About-screen version synchronization.
- Enforced the agreed Home render hierarchy against the actual rendered components.
- Compacted the nutrition editor header and keyboard-focused state.
