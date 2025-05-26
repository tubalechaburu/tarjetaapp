
import { BusinessCard } from "../../types";

// IMPROVED: Normalize card data to ensure consistent visibility fields
export const normalizeCardData = (card: BusinessCard): BusinessCard => {
  // Ensure visibleFields exists and has proper boolean values
  const defaultVisibleFields = {
    name: true,
    jobTitle: true,
    company: true,
    email: true,
    phone: true,
    website: true,
    address: true,
    description: true,
    avatarUrl: true,
    logoUrl: true,
  };
  
  // If no visibleFields, use defaults
  if (!card.visibleFields) {
    console.log("Normalizing card - no visibleFields, using defaults");
    return {
      ...card,
      visibleFields: defaultVisibleFields
    };
  }
  
  // Normalize existing visibleFields to ensure proper boolean values
  const normalizedVisibleFields: Record<string, boolean> = {};
  Object.keys(defaultVisibleFields).forEach(key => {
    // Only set to true if explicitly true, otherwise false
    normalizedVisibleFields[key] = card.visibleFields[key] === true;
  });
  
  console.log("Normalizing card visibility fields:", {
    original: card.visibleFields,
    normalized: normalizedVisibleFields
  });
  
  return {
    ...card,
    visibleFields: normalizedVisibleFields
  };
};
