# Fizz Health v1.4.14.4C

## Database Categories and Compact Menu Nutrition

Completed stories: FH-1414.11C / FH-1414.12C

### FH-1414.11C
- Added a `food_categories` SQLite lookup table as the single source of truth for standardized food classifications.
- Seeded the approved list: Breakfast, Appetizer, Tapas, Soup, Salad, Entrée, Side, Snack, Dessert, Beverage, Alcohol, and Condiment.
- Menu category editing now reads its options directly from the database rather than a hard-coded meal-occasion list.
- **No Classification** remains a UI action that clears the assigned category and is not stored as a category record.
- Original restaurant menu sections remain independent source metadata.

### FH-1414.12C
- Reduced the gap between calorie and protein values on Menu cards.
- Tightened the divider spacing and card minimum height to save vertical space while preserving readability.

Schema updated to version 67 for the canonical category repository.
