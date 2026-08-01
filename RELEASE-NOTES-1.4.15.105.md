# Fizz Health v1.4.15.105 — JSX Build Hotfix

## Scope

This hotfix corrects the remaining JSX syntax defect in the Chef Recommendations renderer introduced during the Menu copy release.

## Changes

- Removed the stray closing React fragment (`</>`) after the `chef-section` root element in `src/main.jsx`.
- Preserved the v1.4.15.103 Menu copy workflow and v1.4.15.102 recommendation behavior.
- Advanced centralized application, build, deployment, package, schema, CSS, and service-worker metadata to v1.4.15.105.
- Added a focused regression test that verifies the Chef Recommendations block has one enclosing root and no stray fragment closure.

## Build status

A clean production build was attempted locally. Dependency installation could not complete because the execution environment's npm proxy returned HTTP 404 for `xlsx@0.18.5`. Therefore no successful local production build is claimed. The Cloudflare log identified the corrected source error precisely at `src/main.jsx:1364`.
