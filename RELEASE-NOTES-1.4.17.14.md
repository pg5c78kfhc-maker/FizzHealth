# Fizz Health v1.4.17.14 — Compact Program Cards

## Release title

Compact Program Cards

## Implemented scope

- Remove redundant **Active** badge/action from program cards already displayed under the Active lifecycle tab.
- Compact the Active program card so program title, goal, schedule metadata, and description use the available horizontal space instead of wrapping early.
- Move the expand/collapse chevron to the centered bottom edge of the program card so it points directly toward the nested workout section.
- Preserve the existing Active / Completed / Set Up lifecycle tabs, edit/add actions, program execution state, and nested workout hierarchy.

## Migration notes

No database migration is required. Database schema remains version 146.

## Known limitations

Production build verification may remain environment-blocked if the configured package registry cannot provide pinned dependency `xlsx@0.18.5`.
