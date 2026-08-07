# Fizz Health v1.4.17.10 — Program Lifecycle Tabs Hotfix

Completed story: FH-17110.1-FH-17110.4

This blocking hotfix restores the agreed Program lifecycle navigation with Active, Completed, and Set Up tabs. Set Up programs remain inactive, reusable, and date-free. Running a Set Up template now creates a separate Active program instance instead of converting the template in place. Migration 145 also repairs programs activated by v1.4.17.8/9 by reconstructing a reusable Set Up template while preserving the existing Active instance, routines, exercises, sets, execution state, and historical workout data.
