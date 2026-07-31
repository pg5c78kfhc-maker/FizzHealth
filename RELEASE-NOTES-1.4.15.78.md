# Fizz Health 1.4.15.78

## Scope

- Correct the centralized inventory availability calculation.
- Treat a blank **Servings remaining in open container** value as no partially used container.
- Calculate full inventory as `Containers in stock × Servings per container` when the open-container value is blank.
- When an open-container value is present, count one partial container plus all remaining full containers.
- Replace `[n remaining]` with compact `[n]` availability suffixes in food-selection cards.
- Keep wrapped Inventory help icons attached to the end of their labels.
- Preserve all unrelated behavior and layout.

## Examples

- Honeycrisp Apple: 3 containers × 1 serving = **3 available**.
- Jimmy Dean sandwiches: 1 container, 12 servings per container, 3 remaining in the open container = **3 available**.
- Two sandwich containers with 3 left in one open container = **15 available**.
