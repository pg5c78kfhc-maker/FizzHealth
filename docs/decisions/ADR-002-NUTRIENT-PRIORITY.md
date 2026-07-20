# ADR-002 — Nutrient visibility and urgency ranking

## Decision
Six goal-critical nutrients are guaranteed a place in the visible Top 10 but are not pinned to fixed positions. All visible bars are ordered by the same dynamic urgency score.

Guaranteed visible: calories, protein, saturated fat, fiber, cholesterol, and net carbohydrates.

The score compounds existing logic with time-of-day pace, current and planned intake, remaining gap, limit pressure, health importance, and recoverability before day-end.

## Preservation rule
Existing useful scoring constants and late-day boosts remain in place. New pace-deficit logic augments rather than replaces them.
