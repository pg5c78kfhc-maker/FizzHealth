# Fizz Health v1.4.15.66 — Availability Engine Stabilization

Corrective stabilization release based exclusively on v1.4.15.65.

## Completed

- **FH-1566.1** — Correct tracked and untracked Recipe availability rules.
- **FH-1566.2** — Normalize packaged Pantry inventory into the ingredient measurement unit.
- **FH-1566.3** — Include sealed packages and open-package contents in availability totals.
- **FH-1566.4** — Deduct packaged ingredient contents consistently when preparing batches.
- **FH-1566.5** — Refresh Recipe Detail and Meal Planner availability from current Pantry data.

No unrelated redesign or refactoring is included.

---

# Fizz Health v1.4.15.65 — Recipe Form & Availability Stabilization

Corrective stabilization release based exclusively on v1.4.15.64.

## Completed

- **FH-1565.1** — Recipes not tracked as prepared inventory can be planned and consumed when their required tracked ingredients are available in sufficient quantities.
- **FH-1565.2** — Recipes explicitly tracked in inventory continue to require an available prepared batch before planning or consumption.
- **FH-1565.3** — Recipe prepared-batch forms use a dedicated iPhone-safe vertical scroll container so every field remains reachable.
- **FH-1565.4** — Shared edit-row components remain stable during state updates, preventing text fields from remounting and losing cursor focus.
- **FH-1565.5** — Checkbox and switch controls use the approved compact Fizz Health rendering across edit forms.

No unrelated redesign or refactoring is included.
