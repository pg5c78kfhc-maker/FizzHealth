# Fizz Health v1.4.15.60 — Recipe Serving & Availability Integration

Build: 141560  
Deployment: FH-20260730-141560

## Delivered

- **FH-1560.1:** Verify all Recipe taps continue through the modern four-tab Recipe record.
- **FH-1560.2:** Repair the Recipe Nutrition editor so labels remain left and controls remain right on iPhone.
- **FH-1560.3:** Calculate read-only batch weight from ingredient weights, derive servings per batch from serving size, and calculate nutrition per serving.
- **FH-1560.4:** Add Ready, Can Prepare, and Cannot Prepare availability status to the Recipe General tab.
- **FH-1560.5:** Give prepared Recipe inventory precedence over depleted ingredient inventory.
- **FH-1560.6:** Require positive prepared Recipe inventory before a Recipe can be offered in Meal Planner.
- **FH-1560.7:** Deduct tracked ingredient inventory when a batch is made; ingredients reaching zero flow into Shopping through the existing out-of-stock mechanism.

Baseline: **v1.4.15.59 / FH-1559.3**.

## Boundaries

- No physical table or data-layer renames.
- No unrelated Library, Nutrition, Planner, consumed-log, or recommendation redesign.
- Existing Recipe migration and historical records remain intact.
