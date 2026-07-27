# Fizz Health v1.4.15.12A — Menu/Chef Canonical Layout Build Corrective

Corrective stabilization release.

- **FH-1415.50:** Fix Pantry Save validation so an automatically populated unit does not falsely require package count and size.
- **FH-1415.51:** Give Menu Chef's Picks its own isolated class so standalone Chef-page styling cannot alter Menu geometry.
- **FH-1415.53:** Remove superseded v1.4.15.8/v1.4.15.9 Menu geometry patches, retain one canonical Menu/Chef layout contract, and fail integrity checks if the legacy shared implementation returns.

Release: 1.4.15.12A  
Build: 1415121  
Deployment: FH-20260727-1415121  
Schema: 72  
Created: 2026-07-27T23:32:00-04:00

- Corrected the unescaped apostrophe in the v1.4.15.12 release-history entry that prevented Vite from parsing `src/main.jsx`.
- Production build verified locally with Vite 8.1.5.

- FH-1415.54 — Correct release-history string quoting and restore production compilation.
