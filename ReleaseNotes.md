# Fizz Health v1.4.11.25 — JSX Build Repair

Release type: Hotfix

Completed story: FH-1322 through FH-1327 build repair

## What changed

- Repaired malformed JSX in the Food/Recipe details screen that blocked the Vite production build.
- Removed an unnecessary JSX expression wrapper and its mismatched closing brace.
- Preserved all v1.4.11.24 Daily Brief, narration navigation, food-role classification, and classified meal-promotion behavior.
- Advanced centralized release metadata, About information, decision-engine version, package version, and service-worker cache to v1.4.11.25 / build 141125.

## Data safety

- Database schema remains version 55.
- No user-data migration or destructive database change was introduced.
