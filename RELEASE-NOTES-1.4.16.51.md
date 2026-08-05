# Fizz Health v1.4.16.51 — Shuffle Rotation Persistence Repair

## Scope
This corrective release fixes Shuffle replacement placement after an episode completes.

## Changes
- Automatic audio-ended completion now publishes the completed Shuffle episode's stable contributing playlist IDs.
- Shuffle persists those completed contributors at the end of `podcast_shuffle_sources.rotation_position`.
- The visible Shuffle projection refreshes immediately after the rotation transaction commits.
- Replacement episodes are therefore appended at the bottom instead of returning to the source playlist's original configuration slot.
- Duplicate-suppressed episodes rotate all contributing playlist IDs together while retaining one visible episode card.
- Rotation order survives ordinary projection rebuilds because the persisted stable-ID order remains authoritative.
- Added focused coverage for consecutive completions, replacement projection order, duplicate contributors, and automatic completion event wiring.

## Version
- Application version: 1.4.16.51
- Build: 141651
- Deployment ID: FH-20260805-141651
