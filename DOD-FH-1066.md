# FH-1066 — Decision Memory

## Definition of Done

- Save simulations and meal comparisons locally without changing health, meal, pantry, or planning records.
- Recognize an exact prior decision from its canonical type, subject, inputs, and comparison ranking.
- Recognize a related prior decision when the context matches but inputs changed.
- Explain whether a repeated decision is unchanged or what materially changed in score, status, or action.
- Mark memories stale after seven days or when engine/rules versions differ; stale reasoning is never silently reused.
- Preserve the complete original DecisionTrace, engine version, rules version, source, and timestamp for auditability.
- Allow the user to clear decision memory from the simulator.
- Automated tests, release verification, and production build pass.
