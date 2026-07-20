# FH-1259 — One-Time Food Logging

**Release:** v1.4.10.9, build 14108  
**Implementation status:** Partial — first complete vertical slice delivered; FH remains open  
**User-facing name:** Log Once

## Implemented scope

- Added a prominent **Log Once** entry point to the Add Food screen.
- Added a keyboard-safe, dismissible editor for food/meal name, quantity, unit, meal type, consumed time, notes, and nutrition.
- Blank nutrition values remain unknown; explicit zero remains a verified zero.
- Saves directly to the existing `meals` event source with `source='one_time'` and a unique `source_record_id`.
- Does not create or modify records in Foods, Recipes, Pantry, or Favorites.
- Appears automatically in Meal Log and the FH-1262 unified Health Timeline.
- Uses the existing meal delete, Undo, nutrition-total, dashboard, and timeline refresh behavior.
- Preserves source classification for future promotion intelligence and analytics.

## Behavioral impact

A user can record an ad-hoc meal without cluttering reusable knowledge or inventory. The entry behaves like every other consumed meal after save, while retaining a durable one-time source classification.

## Presentation impact

The Add Food screen now begins with a Log Once action card. The editor explicitly explains that the entry is history-only and includes visible Cancel and Close controls.

## Test proof

- Automated FH-1259 source-contract tests verify the entry point, `one_time` classification, nullable `food_id`, no Pantry/Foods/Recipes writes, nutrition semantics, and keyboard-safe escape controls.
- Existing FH-1262 timeline tests verify all meal rows flow into the unified timeline.
- Full automated suite and production build must pass before packaging.

## Deferred scope — FH-1259 remains open

- Universal Capture / AI photo analysis feeding directly into Log Once.
- Photo and attachment persistence on one-time meals.
- Promote an existing one-time meal to Food Database.
- Convert an existing one-time meal to Recipe.
- Re-log and duplicate matching tailored to one-time foods.
- Barcode and restaurant-specific Log Once entry points.
- Broader nutrition field set beyond the six core fields in this slice.
- FH-1260 promotion recommendations and learning from accept/dismiss feedback.

## Product-owner acceptance checklist

- [ ] Open Add Food and verify Log Once is visible.
- [ ] Save a Log Once entry with name, quantity, nutrition, and notes.
- [ ] Confirm it appears in Food Log and Health Timeline once.
- [ ] Confirm no Food Database, Recipe, or Pantry record was created.
- [ ] Delete it from Food Log and confirm it disappears from Timeline and totals.
- [ ] Undo deletion and confirm the complete entry returns.
- [ ] Log a past-dated item and confirm it appears on the correct date and time.
- [ ] Verify Cancel, Close, and keyboard scrolling remain usable on iPhone.

## v1.4.10.10 Entry-Point Correction

Product-owner acceptance testing identified that the Food hub did not expose the meal-logging flow. The only visible Food destination was Pantry, whose Add Food control correctly opened the pantry inventory editor but was easy to mistake for Log Once.

Implemented correction:
- Added **Log food** as the first Food hub destination.
- Log food opens the existing Add Meal workflow, where **Log Once** is prominently available.
- Renamed the Pantry action from **Add food** to **Add to pantry** so inventory creation is unambiguous.
- Added regression tests proving the two workflows remain distinct.

FH-1259 remains open for the previously documented deferred capabilities.
