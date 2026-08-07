# Fizz Health v1.4.17.16 — Exercise Disclosure Chevron Corrective Hotfix

## Scope
This blocking corrective release fixes the exercise-card disclosure placement that remained inconsistent after the program and workout card compaction releases.

- Every exercise expand/collapse chevron is centered on the bottom edge of the exercise card.
- Collapsed exercise cards show a down chevron pointing toward the nested sets that will open below.
- Expanded exercise cards show an up chevron in the same bottom-edge position.
- Exercise copy uses the available horizontal width; only the top-right pencil and plus actions reserve space at the title line.
- Existing exercise edit, add-set, expansion, execution, and nested set behavior is unchanged.
- No database changes. Schema remains 146.

Completed story range: FH-17116.1-FH-17116.3

## Stories
- FH-17116.1 — Bottom-edge exercise disclosure chevrons
- FH-17116.2 — Full-width exercise-card copy
- FH-17116.3 — Preserve exercise behavior while correcting presentation only
