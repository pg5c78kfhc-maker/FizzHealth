# Fizz Health v1.4.15.91 Release Notes

## Prepared Inventory & Nutrition Target Stabilization

This focused release completes the remaining approved target, prepared-inventory, and form-containment work without changing nutrition records or redesigning the application.

### Changes

- Set the centralized daily fiber target to **30 g** and maximum to **40 g**.
- Added schema migration 97 so existing installations receive the new fixed fiber configuration and dated target history.
- Preserved explicit deletion of individual prepared Recipe inventory records, including legacy zero-weight records; deletion does not remove the Recipe or restore historical ingredient inventory.
- Added hard validation preventing new prepared inventory when prepared weight, prepared quantity, serving weight, or calculated servings are zero or invalid.
- Reinforced viewport containment for Add Food, Recipe Contents, and Prepared Recipe forms so content ends above the persistent footer and respects safe-area insets.
- Updated About, package metadata, decision-engine version, service-worker cache, release history, and deployment identifiers to v1.4.15.91.

### Out of scope

No barcode, Shopping, product-enrichment, inventory-redesign, nutrition-redesign, or unrelated UI work was included.
