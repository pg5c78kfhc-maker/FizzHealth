# Traceability Matrix

| Rule | Decision | Code | Tests |
|---|---|---|---|
| Unknown is not zero | ADR-001 | registry, migration 42, NutritionEditor | nutrient-integrity.test.js |
| Full nutrient editing | Nutrient data contract | NutritionEditor | nutrient-integrity.test.js |
| Guaranteed Top 10 without fixed pinning | ADR-002 | orderNutrients | nutrient-integrity.test.js |
| Time-sensitive urgency and color | Priority algorithm | decision/engine.js, NutrientBar | decision-engine.test.js; nutrient-integrity.test.js |
| LDL fields in capture contracts | Nutrient data contract | exchange builders | nutrient-integrity.test.js |
