# Definition of Done — v1.4.11.27

- Migration 55 creates `app_releases` with `CREATE TABLE IF NOT EXISTS` before use.
- Upgrade path from a schema-54 database without `app_releases` succeeds.
- Production Vite build succeeds.
- Centralized release metadata reports v1.4.11.27 / build 141127 / schema 55.
