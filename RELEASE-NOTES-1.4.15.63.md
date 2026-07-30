# Fizz Health v1.4.15.63 — Recipe Serving Conversion Stabilization

Corrective stabilization release based exclusively on v1.4.15.62.

## Completed

- **FH-1563.1** — Recipe batch weight now resolves non-weight ingredient measures through the referenced Food common measure and gram-based serving definition.
- **FH-1563.2** — Recipe nutrition and dependent serving calculations use the same live Food conversion path, preventing duplicated conversion logic and stale derived values.
- **FH-1563.3** — Added regression coverage for Red Onion, imported/manual Foods, gram/ounce/pound/common-measure ingredients, live Food edits, and inventory non-mutation.

No unrelated UI or feature changes are included.
