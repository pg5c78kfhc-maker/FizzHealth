# Fizz Health v1.4.15.102 — Labs Thresholds & Adaptive Recommendations

## Scope delivered

### Labs progress-bar precision
- Added exact numeric threshold labels at every red/green color transition.
- Bounded ranges display both lower and upper threshold values.
- One-sided ranges display the single stored cutoff without inventing a missing bound.
- Threshold markers and measured-value markers use the same linear scale and coordinate system.
- Not-reported results retain unavailable behavior and do not receive a measured-value marker.

### Category-aware recommendations
- Excludes foods and recipes already consumed today.
- Excludes foods and recipes already present in today's Proposed plan.
- Builds a five-item recommendation set with category caps instead of taking only the highest independent scores.
- Limits repeated categories and rotates primary protein sources where alternatives are available.

### Laboratory-aware intelligence
- Reads the latest stored LDL, non-HDL, total cholesterol, HDL, and A1C results.
- Elevated lipid results increase preference for fiber, lower saturated fat, and calorie-appropriate protein.
- Lab data modifies ranking rather than permanently banning foods.

### Pattern and rotation behavior
- Recent consumption and recent recommendation history apply graduated penalties.
- Foods can return after a cooling-off period.
- Less-supportive foods remain eligible when they fit the day and improve variety.
- Recommendation explanations now mention category diversity, rotation, and relevant stored lab priorities.

## Metadata
- Version: 1.4.15.102
- Build: 1415102
- Deployment: FH-20260801-1415102
