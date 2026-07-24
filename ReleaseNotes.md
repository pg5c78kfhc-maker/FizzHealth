# Fizz Health v1.4.11.36 — Data Management & Detail Screen Redesign

**Issued:** July 24, 2026  
**Build:** 141136  
**Deployment:** FH-20260724-141136  
**Schema:** 58

## Included stories

- **FH-1361–FH-1363:** Active, Archived, and All list filtering; restore and permanent-delete workflows; consistent archived-item gestures.
- **FH-1364–FH-1366:** Compact detail hierarchy, Consumption Role auto-save, and compact action rows.
- **FH-1367–FH-1371:** Data readiness filters, nutrient-enrichment and role queues, null-safe completeness rules, and visible missing-data badges.
- **FH-1372:** Archive source, archived timestamp, and restored timestamp metadata.

## Data readiness

Foods can be filtered by Complete, Needs Nutrients, Needs Role, Needs Review, or All Incomplete. A numeric zero is treated as known data; only null or blank values are missing.

## Archive behavior

Active records swipe left to archive. Archived records remain viewable; swiping right restores them and swiping left offers permanent deletion with confirmation. Historical Food Log snapshots remain unchanged.
