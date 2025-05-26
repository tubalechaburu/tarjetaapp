
// Re-export local storage functions as they might be used directly
export { 
  saveCardLocally, 
  getCardsLocally, 
  getCardByIdLocally, 
  deleteCardLocally 
} from "../localStorage";

// Export main storage operations
export {
  saveCard,
  getCards,
  getCardById,
  deleteCard
} from "./storageOperations";

// Export normalization utilities
export { normalizeCardData } from "./cardNormalization";

// Export types
export type { StorageOperationResult, StorageConfig } from "./types";
