# Fizz Health v1.4.10.43

**Build:** 141043  
**Release ID:** FH-20260722-141043  
**Released:** July 22, 2026

## Daily Decision Brief

- Replaces the flat expanded intelligence stack with a concise daily decision brief.
- Ranks immediate priorities and explains why each matters and its expected benefit.
- Adds Today’s Outlook, Watch Today, and Use First sections.
- Preserves detailed forecasts, alternatives, timeline, and command-center tools under More Insights.
- Repairs horizontal overflow throughout the expanded intelligence experience.
- New health readings now initialize from the device’s current local date and time and cannot default into the future.
- Existing reading timestamps remain preserved when edited.

## Architecture foundation

The brief separates immediate action, projected outcomes, warnings, inventory pressure, and supporting evidence so future historical trends and planned meals or restaurant events can feed the same decision experience.

## Artifacts

- Full source: `Source.1.4.10.43.zip`
- Changed files: `Changed.1.4.10.43.zip`

# Fizz Health v1.4.10.42b

**Build:** 141042B  
**Release ID:** FH-20260722-141042B  
**Created:** 2026-07-22T22:55:00-04:00

## Corrective scope

Completed stories: FH-1 through FH-3

- Rebuilt the mobile Highest Impact Next Action card as a single-column layout.
- Kept the score in a compact horizontal header so the recommendation receives the full card width.
- Removed the mobile chevron column and retained the Tap for options affordance.
- Forced all recommendation text, metadata, and rationale to wrap inside the card.
- Preserved Restaurant Day behavior and the full v1.4.10.42 decision-support experience.

## Artifacts

- Full source: `Source.1.4.10.42b.zip`
- Changed files: `Changed.1.4.10.42b.zip`
