# Recommendation Engine Audit — v1.4.15.102

## Candidate eligibility
The engine now removes candidates already consumed on the active date and candidates already stored as Proposed for that date. Existing same-day dismissal suppression remains intact.

## Diversity assembly
Recommendations are no longer selected solely by taking the first independent scores. A balanced selector applies category caps and attempts primary-protein rotation before using fallback candidates. The target set is five items.

Category normalization supports Entrée, Snack, Appetizer/Tapas/Side, Salad, Breakfast, and Wildcard groupings. The design intentionally prevents a recommendation set dominated by salads or one protein source when suitable alternatives exist.

## Rotation memory
The engine considers:
- Days since last consumption.
- Recommendation events from the previous 30 days.
- Strong penalties for items shown very recently.
- Smaller penalties as time passes.
- A modest re-entry bonus for items absent for an extended period.

This is a frequency system, not a permanent prohibition system.

## Laboratory inputs
The latest stored values are read for LDL cholesterol, non-HDL cholesterol, total cholesterol, HDL cholesterol, and Hemoglobin A1C. When the stored lipid range marks a concern, ranking gives additional weight to fiber and lower saturated fat while retaining calorie/protein fit.

Laboratory results are ranking signals only. They do not diagnose disease, permanently exclude foods, or override same-day feasibility and inventory constraints.

## Labs visualization audit
Each Labs progress bar now renders threshold markers from the same minimum/maximum scale used for the measured result. Bounded ranges show two thresholds; one-sided ranges show one threshold. No zero bound is invented.

## Known validation limitation
A production Vite build could not be completed because the supplied environment does not contain the Vite executable. See the test report for the exact command and output.
