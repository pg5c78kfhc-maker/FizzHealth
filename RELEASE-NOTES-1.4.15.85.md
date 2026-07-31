# Fizz Health v1.4.15.85 Release Notes

## Prepared Recipe Save & Footer Corrective

This release fixes the Prepared Recipe save path and its mobile form in one focused corrective release.

### Changes

- Prepared Recipe creation now aborts immediately when a matched Pantry record cannot be converted or consumed.
- Deduction verifies that the complete required ingredient amount reached zero before the prepared batch can be created.
- Availability and deduction use the centralized inventory service with the same recipe/caller context.
- Pantry updates use the stable `pantry_id` identity and persist package, open-container, on-hand, and status changes together.
- Save failures identify the ingredient, Pantry record, and remaining unmet quantity.
- Save failures render directly below the Prepared Recipe header instead of beneath the final form section.
- The Prepared Recipe form is constrained to the viewport above the persistent footer and iPhone safe area.
- The Save checkmark is green while available and gray only during an active save.
- Duplicate submissions remain blocked while saving.

### Scope control

No barcode, enrichment, shopping, nutrition, inventory redesign, or unrelated UI work was included.
