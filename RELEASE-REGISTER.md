# Fizz Health v1.4.11.13

## JSON Exchange Workflow Repair

FH-1472 through FH-1474

- Restaurant exchange requests now explicitly require strict JSON with straight quotation marks and no markdown wrapping.
- Imported responses automatically repair smart quotes, BOM characters, non-breaking spaces, code fences, and surrounding prose before strict parsing.
- Restaurant menus returned as `proposed_record.menu.sections` are flattened correctly while preserving section names as categories.
- The import workflow now includes editable pasted JSON, explicit validation, section and item counts, an item preview, a clear Apply action, and a visible completion screen.
- Restaurant profile fields included in the exchange are updated with the menu replacement.

Version: 1.4.11.13  
Build: 141230  
Deployment: FH-20260723-141230  
Released: 2026-07-23T12:30:00-04:00

## v1.4.11.12 — Pantry Package Persistence Repair

- Build: 141220
- Deployment: FH-20260723-141220
- Status: Tested corrective release

## v1.4.11.12 — Pantry Package Persistence Repair

- Build: 141220
- Deployment: FH-20260723-141220
- Stories: FH-1462–FH-1468
- Status: Tested corrective release

## v1.4.11.9 — Meals Library Regression Stabilization

- FH-1477: Contained Meals library layout and removed horizontal overflow.
- FH-1478: Restored direct meal-record rendering as the default library view.
- FH-1479: Added iPhone viewport containment for actions, filters, search, and results.
- FH-1480: Added regression gates for responsive layout and populated meal rendering.

## v1.4.11.6 — Prepared Recipe Pantry & Pantry Edit Repair

- Build: 141160
- Deployment: FH-20260723-141160
- Stories: FH-1470–FH-1472
- Status: Tested corrective release

## v1.4.11.6 — Recipe Duplicate Validation Repair

- Build: 141160
- Deployment: FH-20260723-141160
- Stories: FH-1467 through FH-1469

## v1.4.11.4 — Navigation & Workflow Stabilization

- Build: 141140
- Deployment: FH-20260723-141140
- Date: 2026-07-23
- Scope: FH-1405.1 through FH-1460
- Status: Tested



## v1.4.10.43b — Daily Health Newspaper

Completed FH-1311 through FH-1323: expanded editorial brief, urgency-ranked pantry safety, exact voiceURI selection, diagnostics, narration, and newspaper sections.
| 1.4.10.43a | Spoken Editorial Brief | 2026-07-22T23:58:00-04:00 | FH-1307 through FH-1310 | Continuous newspaper-style briefing with device-native spoken narration. |
| 1.4.10.43 | Daily Decision Brief | 2026-07-22T23:40:00-04:00 | FH-1301 through FH-1306 | First Decision Intelligence redesign pass plus mobile width and health timestamp corrections. |
| 1.4.10.42b | Responsive Highest Impact Card Repair | 2026-07-22T22:55:00-04:00 | FH-1 through FH-3 | Definitive iPhone portrait layout correction for Highest Impact Next Action. |
| 1.4.10.42a | Restaurant Day and Responsive Decision Support | 2026-07-22T20:00:00-04:00 | FH-1 through FH-6 | Date-aware restaurant eligibility gate plus iPhone card overflow repair. |
| 1.4.10.42 | Highest Impact Next Action | 2026-07-22T19:15:00-04:00 | FH-1 through FH-6 | Interactive decision support with alternatives, predicted outcomes, pantry and restaurant integration, and transparent rationale. |
| 1.4.10.41b | Home Hierarchy Corrective B | 2026-07-22T18:15:00-04:00 | FH-41B-1 through FH-41B-4 | Corrected Home sequence and preserved dynamic nutrition progress behavior. |
# Fizz Health Release Register

**Audit baseline:** Source records through v1.4.10.7. Conflicts are retained rather than silently corrected.

| Version | Release | Date / created | FH stories recorded | Audit note |
|---|---|---|---|---|
| 1.4.10.41a | Home Hierarchy Corrective | 2026-07-22T17:30:00-04:00 | FH-1 through FH-6 corrective | Persistent summaries remain above expanded intelligence. |
| 1.4.10.41 | Home Information Hierarchy | 2026-07-22T16:30:00-04:00 | FH-1, FH-2, FH-3, FH-4, FH-5, FH-6 | Home simplification and structural reorganization only. |
| 1.4.10.6 | Field Hotfix Completion | 2026-07-19T18:00:00-04:00 | FH-1221, FH-1222, FH-1224, FH-1225, FH-1228, FH-1235, FH-1236, FH-1238 | Current VERSION.json is 1.4.10.7 but repeats most of this story set. |
| 1.4.10.1 | Legacy Health Database Import Audit | 2026-07-19 | — | — |
| 1.4.10 | Pantry Intelligence Stabilization & Workflow Refinement | 2026-07-18 | FH-1190, FH-1191, FH-1192, FH-1193, FH-1194, FH-1195, FH-1196, FH-1200, FH-1205, FH-1212, FH-1213, FH-1214, FH-1215, FH-1216, FH-1217, FH-1218, FH-1219 | — |
| 1.4.9.1 | Restaurant-First Universal Capture Hotfix | 2026-07-18 | — | — |
| 1.4.8.3 | Form Viewport Recovery Hotfix | 2026-07-18 | — | — |
| 1.4.7 | Workflow & Experience 2.0 | 2026-07-18T09:00:00-04:00 | FH-1169, FH-1170, FH-1171, FH-1172, FH-1173, FH-1174, FH-1175, FH-1176, FH-1177 | — |
| 1.4.6 | Health Intelligence 2.0 | 2026-07-18 | FH-1161, FH-1162, FH-1163, FH-1164, FH-1165, FH-1166, FH-1167, FH-1168 | — |
| 1.4.5 | Restaurant Intelligence 2.0 & AI Food Recognition 2.0 | 2026-07-18 | FH-1153, FH-1154, FH-1155, FH-1156, FH-1157, FH-1158, FH-1159, FH-1160 | — |
| 1.4.4 | Meal Planning 2.0 | 2026-07-18 | FH-1144, FH-1145, FH-1146, FH-1147, FH-1148, FH-1149, FH-1150, FH-1151, FH-1152 | — |
| 1.4.3 | Pantry Intelligence 2.0 | 2026-07-18T21:30:00-04:00 | FH-1128, FH-1129, FH-1130, FH-1131, FH-1132, FH-1133, FH-1134, FH-1135, FH-1136, FH-1137, FH-1138, FH-1139 | — |
| 1.4.2 | Decision Intelligence Enhancements | 2026-07-18T18:45:00-04:00 | FH-1120, FH-1121, FH-1122, FH-1123, FH-1124, FH-1125, FH-1126, FH-1127 | — |
| 1.4.1.2 | Restaurant Intelligence Expansion | 2026-07-18T15:30:00-04:00 | FH-1110, FH-1111, FH-1112, FH-1113 | — |
| 1.4.1.1 | Restaurant Intelligence Core | 2026-07-18T11:30:00-04:00 | FH-1106, FH-1107, FH-1108, FH-1109 | — |
| 1.4.0 | Page Enhancements & Settings | 2026-07-18T09:00:00-04:00 | FH-1099, FH-1100, FH-1101, FH-1102, FH-1103, FH-1104, FH-1105, FH-1106, FH-1107, FH-1108, FH-1109, FH-1110, FH-1111 | Conflicts with later assignment of FH-1106 through FH-1111. |
| 1.4.8.1 | Today Dashboard Recovery Hotfix | 2026-07-18 | — | — |
| 1.4.8.2 | Today Meal Planner Query Hotfix | 2026-07-18 | — | — |
| 1.4.9 | Universal Photo Capture | 2026-07-18 | FH-1188, FH-1189 | — |
| 1.4.10.2 | Stability, Navigation & UX Hotfix | 2026-07-19 | FH-1221, FH-1222, FH-1223, FH-1224, FH-1225, FH-1226, FH-1227, FH-1228, FH-1229, FH-1230 | — |
| 1.4.10.7 | Keyboard and Capture Commit Reliability Hotfix | — | — | Release-history entry has no story list; VERSION.json supplies the current story list. |

## Current release metadata

- Version: **1.4.10.11**
- Build: **14110**
- Status: **PARTIAL**
- Stories: FH-1221, FH-1222, FH-1224, FH-1225, FH-1228, FH-1235, FH-1223, FH-1227, FH-1236, FH-1238

| 1.4.10.11 | FH-1250.1 Meal Planner Stabilization and Food Workspace Relocation | 2026-07-20 | FH-1250 | Partial; composite meal and AI/JSON scope deferred. |

| 1.4.10.12 | 2026-07-20 | FH-1250.2 Interactive Meal Planning | Partial | Tested build; FH-1250 remains open |

## 1.4.10.19 — July 20, 2026
Release ID: FH-20260720-141019  
Build: 141019  
Schema: 43  
Scope: FH-1270 through FH-1272
