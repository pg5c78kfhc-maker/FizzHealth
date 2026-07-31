# Fizz Health v1.4.15.74

## Unified Food and Recipe Logging Corrective

- FH-1574.1: Uses one shared logging context for serving amount, unit, portion scaling, projected nutrition, saved records, and inventory consumption.
- FH-1574.2: Library, Planner, Proposed, and Consumed Recipe logging use per-serving Recipe nutrition rather than full-batch totals.

For a 994 g Recipe with a 100 g serving, one portion now records 100 g and approximately one-tenth of the batch nutrition.
