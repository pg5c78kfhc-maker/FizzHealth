// Compatibility module. Inventory math lives only in inventory/service.js.
export {
 consumeInventory,
 consumePantryQuantity,
 foodDefinition,
 inventoryAvailableQuantity,
 inventoryAvailableServings,
 inventoryHasStock,
 inventoryModel,
 inventorySufficient,
 isContainerInventory,
 pantryAvailableQuantity
} from './service.js';
