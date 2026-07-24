# Fizz Health v1.4.11.17 — Restaurant Intelligence Completion

Released: July 23, 2026
Build: 141317
Deployment: FH-20260723-141317

## FH-1274 — Menu import modes

- Added explicit **Replace menu** and **Add menu items** actions.
- Replace deactivates the current menu before importing the approved replacement.
- Add/update preserves unrelated active items, updates strong identity matches, and inserts new items.
- Review clearly identifies destructive replacement versus non-destructive append behavior.

## FH-1275 / FH-1278 — Confidence Engine 2.0

- Replaced generic question-mark explanations with item-specific confidence breakdowns.
- Shows evidence source, verified and estimated fields, assumptions, deductions, and concrete ways to improve confidence.
- The entire confidence control is labeled and accessible.

## FH-1276 — Restaurant ranking prices

- Ranked cards display each captured price in the upper-left content area.
- Missing prices display **Price unknown**, never `$0.00`.

## FH-1277 — Navigation standardization

- Restaurant meal details now use the standard sticky upper-left Back control.
- Edit remains a page-specific action on the right.

## FH-1279 — Database quality

- Append imports match by item ID or normalized restaurant/name/category identity.
- Matched records are updated in place so favorites and historical references remain intact.

Completed stories: FH-1274 through FH-1279
