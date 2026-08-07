# Fizz Health v1.4.17.10 — Program Lifecycle Tabs Hotfix

## Release title
Program Lifecycle Tabs Hotfix

## Implemented scope

- Restored the agreed three-section Programs lifecycle navigation: **Active**, **Completed**, and **Set Up**.
- **Set Up** now contains reusable program templates only. Templates remain **Inactive**, have no start or end dates, and retain their routines, exercises, sets, progression settings, and ordering.
- **Run** now creates a separate **Active program instance** from the selected Set Up template instead of converting the template in place.
- Active instances receive the activation date as their default start date and retain the existing active-program execution, weekly progression, rest timing, and workout history behavior.
- **Completed** shows completed and prematurely terminated program instances for historical reference.
- Switching programs preserves the previous active instance as **Terminated** rather than turning it back into a Set Up template.
- Added migration 145 recovery for programs activated by v1.4.17.8/v1.4.17.9: the existing Active instance is preserved and a date-free reusable Set Up template is reconstructed with its routines, exercises, and sets.

## User-facing behavior

The Programs page now shows the three lifecycle tabs directly below the standard page header. Tab counts are shown for quick orientation. The Set Up tab labels templates as **Inactive** and suppresses start/end dates. Running a template moves the user to Active and displays the newly created independent instance while the original template remains available in Set Up.

## Migration notes

Schema version advances from **144 to 145**. Migration 145 adds `workout_programs.template_program_id`, reconstructs missing Set Up templates for Active programs created in-place by earlier releases, clones only planning/template records, and leaves execution/history tables unchanged. Existing imported workout history is not rewritten.

## Known limitations

The local package registry still does not provide the project's pinned `xlsx@0.18.5`, so dependencies cannot be installed and the Vite production build cannot be executed in this environment. No successful production build is claimed.
