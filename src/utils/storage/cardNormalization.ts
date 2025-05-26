
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
  
  // Normalize existing visibleFields to ensure proper boolean values and include missing fields
  const normalizedVisibleFields: Record<string, boolean> = {};
  Object.keys(defaultVisibleFields).forEach(key => {
    // If the field exists in the card's visibleFields, use its value (converted to boolean)
    // If it doesn't exist, default to true for avatarUrl and logoUrl, and existing behavior for others
    if (card.visibleFields.hasOwnProperty(key)) {
      normalizedVisibleFields[key] = card.visibleFields[key] === true;
    } else {
      // For missing fields, default avatarUrl and logoUrl to true if the card has content for them
      if (key === 'avatarUrl') {
        normalizedVisibleFields[key] = true; // Default to true, let the component decide based on content
      } else if (key === 'logoUrl') {
        normalizedVisibleFields[key] = true; // Default to true, let the component decide based on content
      } else {
        normalizedVisibleFields[key] = defaultVisibleFields[key];
      }
    }
  });
  
  console.log("Normalizing card visibility fields:", {
    cardName: card.name,
    original: card.visibleFields,
    normalized: normalizedVisibleFields,
    hasAvatar: !!card.avatarUrl,
    hasLogo: !!card.logoUrl
  });
  
  return {
    ...card,
    visibleFields: normalizedVisibleFields
  };
};
