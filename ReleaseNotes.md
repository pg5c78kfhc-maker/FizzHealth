# Fizz Health v1.4.16.36 — Main Settings Navigation Hotfix

Release ID: FH-20260804-141636  
Completed story: FH-1636.1-FH-1636.3

## Fixed

- Restored the main Settings component that was accidentally removed by a truncated source merge in v1.4.16.35.
- Restored the complete Podcasts render switch that had been cut off after the playback helper.
- Wrapped the Settings route in an application error boundary so future Settings render failures cannot produce an uncontained black screen.
- Preserved all v1.4.16.35 podcast interaction and persistence repairs.
