# Definition of Done — FH-1067

- Chef's Recommendations uses only verified on-hand foods and nutrition-complete recipes.
- Recommendations are ranked by nutrition fit, LDL support, calorie room, pantry pressure, waste risk, convenience, time of day, and variety.
- Open, expiring, thawed, frozen, low-quantity, high-priority, and recently consumed states affect ranking transparently.
- Recorded expired items receive a safety-first penalty.
- Top recommendations expose canonical DecisionTrace explanations and projected nutrition impact.
- Automated tests cover thawed/frozen prioritization and expired-item safety behavior.
- Full test, release verification, and production build pass.
