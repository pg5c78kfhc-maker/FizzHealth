# Acceptance — FH-1250.3

1. Open a food and choose Edit Nutrition. Confirm all tracked nutrients appear, including cholesterol, trans fat, sodium, sugars, minerals, vitamins, alcohol, and caffeine.
2. Leave cholesterol blank and save. Reopen and confirm it remains Unknown rather than 0.
3. Enter a verified cholesterol value for a known serving. Log a multiple of that serving and confirm the meal, daily total, and contributor value scale correctly.
4. Correct a food already present in consumed and planned meals. Confirm both snapshots and projected totals refresh.
5. At different times of day, confirm a large protein deficit rises in rank and changes from on-pace to amber/red as recoverability declines.
6. Confirm calories, protein, saturated fat, fiber, cholesterol, and net carbs all remain somewhere in the Top 10 but are not locked to fixed positions.
7. Run a restaurant/menu/photo exchange and confirm the generated JSON requests cholesterol, saturated fat, trans fat, total fat, fiber, sodium, and the rest of the canonical set.
8. Tap a progress bar and confirm its ranking explanation reflects consumed, planned, target/limit, and time-sensitive urgency.
