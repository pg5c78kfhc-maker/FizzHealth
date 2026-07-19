# Definition of Done — v1.4.1.1 Restaurant Intelligence Core

## FH-1106 — Restaurant Intelligence Engine
- Dedicated restaurant intelligence module builds current-day context and ranks menu items.
- Uses shared explainable decision traces and configured nutrition targets.

## FH-1107 — Restaurant Profiles
- Favorite restaurant, cuisine, visit history, favorite dishes, website, phone, address, price level, and notes.
- Restaurant visit recording and profile editing are available in Dining.

## FH-1108 — Menu Intelligence
- Active menu items are ranked using calories, protein, fiber, saturated fat, recommendation tier, evidence, and nutrition confidence.
- Each score opens a full explanation and audit trail.

## FH-1109 — Restaurant Decision Mode
- “What should I order?” ranks the full active menu for the current day.
- Best choice is identified and every result includes an action explanation.
- Meals can be reviewed, favorited, planned, or retired.

## Verification
- Automated tests pass.
- Release metadata verification passes.
- Production build passes.
