# Fizz Health v1.4.17.4 — Workout History & Exercise Library Import

Release ID: FH-20260807-141704  
Stories: FH-1714.1-FH-1714.5

- Added a reusable exercise library keyed independently from performed workout history.
- Imported 138 historical workout sessions from the supplied 2026_07_29 Workouts PDF in oldest-to-newest chronological order.
- Preserved 786 workout exercise occurrences with source equipment, order, prescription text, target reps/RIR, and source labels.
- Preserved 2,848 individual performed sets with weight, reps, and RIR where present.
- Added deterministic IDs, source keys, and an import audit row so the import is safe to rerun without duplication.
- No new workout UI behavior is included in this release.
