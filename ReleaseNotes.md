# Fizz Health v1.4.15.17 — Menu Eligibility Classification Repair

Corrective release limited to repairing Menu eligibility classification drift.

- **FH-1415.17A:** Migrate all active Foods and Recipes so `Ingredient only` controls their planning classification consistently.
- **FH-1415.17B:** Build Menu eligibility from the canonical `ingredient_only` field, preventing stale legacy usage fields from hiding valid items.
- **FH-1415.17C:** Synchronize classification, usage designation, consumption role, and category whenever Food or Recipe classification is saved.

Release: 1.4.15.17  
Build: 141517  
Deployment: FH-20260728-141517  
Schema: 72  
Created: 2026-07-28T02:35:00-04:00
