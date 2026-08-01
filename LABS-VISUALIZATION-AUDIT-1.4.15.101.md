# Labs Visualization Audit — v1.4.15.101

## Range defect

The prior implementation converted `null` with `Number(null)`, producing zero. Minimum-only ranges such as HDL `>= 40` and eGFR `>= 60` therefore became artificial ranges such as `40–0` and `60–0`.

## Correction

- Added explicit null/blank bound handling before numeric conversion.
- Missing lower or upper bounds remain null.
- Range state now honors the stored comparison operator.
- Bounded ranges evaluate both stored endpoints.
- No generic zero endpoint is introduced.

## Progress-bar scale

Each bar uses a linear numeric domain. Segment boundaries and the measured-value marker use the same percentage conversion:

`position = (value - domain minimum) / (domain maximum - domain minimum)`

Domain rules:

- Bounded range: extends 35% of the reference span beyond each stored endpoint, with a nonnegative lower display limit.
- Upper-limit range: starts at zero and extends to at least 140% of the threshold or enough to contain the measured value with 10% headroom.
- Lower-limit range: starts at zero and extends to at least 150% of the threshold or enough to contain the measured value with 10% headroom.

This keeps the visualization proportional within its displayed domain and prevents marker positions from being decorative or arbitrary.

## Rendering

- Green segment: values satisfying the stored laboratory range.
- Red segment: values outside the stored laboratory range.
- White marker: measured result.
- Gray unavailable state: no numeric result or no stored reference range.
- Value card: result and unit only.
- Left stack: biomarker, prior-result delta, stored range, and scaled bar.

## July 8, 2026 validation

Expected red: Total Cholesterol 255, LDL Cholesterol 178, Non-HDL Cholesterol 197.

Expected green: HDL Cholesterol 58 and all other reported numeric Quest values.

Expected unavailable: BUN/Creatinine Ratio, Not Reported.
