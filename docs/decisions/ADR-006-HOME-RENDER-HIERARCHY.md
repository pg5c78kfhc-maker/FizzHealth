# ADR-006 — Home Render Hierarchy

## Decision
The Home screen renders in this fixed sequence:

1. Header and date controls.
2. LDL Support, Estimated Maintenance, and Steps summary indicators.
3. Ranked nutrient progress bars and What If entry.
4. Planned and consumed meals.
5. All other decision-intelligence, planning, command-center, and timeline content.

## Reason
The user must first see current health status, then nutrition status, then the food record that produced it. Operational and predictive panels remain available below those primary daily-driver sections.

## Preservation rule
The LDL Support, Steps, and Estimated Maintenance explanation pages are locked and must not be redesigned as part of Home layout work.

## Implementation
The order is enforced on the real rendered Home children, not inferred from source declaration order alone.
