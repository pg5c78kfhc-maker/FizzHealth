# Fizz Health v1.4.17.6 — Historical Workout Planning UI Infrastructure

Release ID: FH-20260807-141706  
Stories: FH-1716.1-FH-1716.5

- Program-card plus actions now open the imported historical workout library instead of creating a blank workout.
- Historical workouts are presented most recent first and can be expanded to preview their exercises and performed sets, including weight, reps, and RIR.
- Copying a historical workout creates an independent, editable program workout while retaining source links for traceability.
- Exercise order, equipment, prescription text, target RIR, set order, weight, reps, RIR, and source linkage are copied into the plan.
- Historical workout, exercise, set, and exercise-library rows are never modified by the copy workflow.
- Copied program workouts support swipe-left Delete with explicit confirmation; deletion cascades only through the planned copy.
- Migration 142 adds source-link and RIR columns required by the planning copy without changing imported history.
