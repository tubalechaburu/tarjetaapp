import { BusinessCard, SupabaseBusinessCard, CardLink } from "../../types";
import { v4 as uuidv4 } from "uuid";

/**
 * Maps a Supabase business card to our application's BusinessCard format
 */
export const mapSupabaseToBusinessCard = (card: SupabaseBusinessCard): BusinessCard => {
  console.log("Mapping Supabase card:", card);
  console.log("Logo field from Supabase:", card.logo);
  
  // Map links with correct format
  let links: CardLink[] = [];
  let website: string = "";
  
  if (card.links && Array.isArray(card.links) && card.links.length > 0) {
    links = card.links.map(link => ({
      id: link.id || uuidv4(),
      type: link.type as CardLink['type'] || 'website',
      url: link.url || '',
      label: link.label || '',
      title: link.label || link.url || '' // Ensure title is set for compatibility
    }));
    
    // Maintain compatibility with the website in the root for older cards
    const websiteLink = card.links.find(link => link.type === "website");
    website = websiteLink?.url || "";
  }

  // Extract theme colors from Supabase theme object with proper defaults
  let themeColors: string[] = ["#000000", "#ffffff", "#dd8d0a"]; // Default colors: black, white, orange
  
  if (card.theme && typeof card.theme === 'object') {
    const theme = card.theme as any;
    if (theme.colors && Array.isArray(theme.colors) && theme.colors.length === 3) {
      themeColors = theme.colors;
      console.log("Found theme colors from Supabase:", themeColors);
    } else if (theme.background && theme.text && theme.accent) {
      // Legacy format support
      themeColors = [theme.background, theme.text, theme.accent];
      console.log("Found legacy theme format:", themeColors);
    } else {
      console.log("No valid theme colors found, using defaults");
    }
  }
  
  console.log("Mapped theme colors:", themeColors);
  
  // Handle logo field - extract the logo data as base64 string
  let logoUrl = "";
  if (card.logo && typeof card.logo === 'string' && card.logo.trim() !== "") {
    logoUrl = card.logo;
    console.log("Logo mapped successfully from Supabase");
  }
  
  console.log("Final mapped logoUrl:", logoUrl ? "Logo data present" : "No logo data");
  
  // IMPROVED: Ensure avatarUrl and logoUrl are included in visibleFields
  let visibleFields = card.visible_fields || {};
  
  // If avatarUrl or logoUrl are missing from visible_fields, add them with appropriate defaults
  if (!visibleFields.hasOwnProperty('avatarUrl')) {
    visibleFields.avatarUrl = true; // Default to true if field is missing
  }
  if (!visibleFields.hasOwnProperty('logoUrl')) {
    visibleFields.logoUrl = true; // Default to true if field is missing
  }
  
  return {
    id: card.id,
    name: card.name,
    jobTitle: card.title || "",
    company: card.company || "", 
    email: card.email || "",
    phone: card.phone || "",
    website: website || "",
    address: "", // Add default empty address
    description: card.description || "",
    avatarUrl: card.photo || "",
    logoUrl: logoUrl,
    createdAt: new Date(card.created_at).getTime(),
    userId: card.user_id,
    links: links,
    themeColors: themeColors,
    visibleFields: visibleFields
  };
};

/**
 * Prepares a BusinessCard object for Supabase format
 */
export const prepareSupabaseCard = (card: BusinessCard) => {
  // Ensure user ID is not undefined
  const userId = card.userId || "00000000-0000-0000-0000-000000000000";
  
  // Prepare links for Supabase - include ALL links
  const links = [];
  
  // Add website as link if it exists and no website link is in card.links
  if (card.website && (!card.links || !card.links.some(link => link.type === 'website'))) {
    links.push({ 
      id: uuidv4(),
      type: "website", 
      url: card.website,
      label: "Sitio web"
    });
  }
  
  // Add all links from card.links regardless of type
  if (card.links && card.links.length > 0) {
    links.push(...card.links.map(link => ({
      id: link.id || uuidv4(),
      type: link.type,
      url: link.url,
      label: link.label || link.title
    })));
  }

  // Prepare theme with custom colors - use defaults if not provided
  const finalColors = card.themeColors && card.themeColors.length === 3 
    ? card.themeColors 
    : ["#000000", "#ffffff", "#dd8d0a"]; // black, white, orange defaults

  const theme = {
    colors: finalColors,
    background: finalColors[0],
    text: finalColors[1],
    accent: finalColors[2]
  };
  
  console.log("Preparing card for Supabase with theme:", theme);
  console.log("Original card colors:", card.themeColors);
  console.log("Sending logoUrl to Supabase:", card.logoUrl ? "Logo data present" : "No logo data");
    
  return {
    id: card.id,
    name: card.name,
    title: card.jobTitle,
    company: card.company,
    email: card.email,
    phone: card.phone,
    photo: card.avatarUrl || null,
    logo: card.logoUrl || null, // Make sure logo is saved as base64 string
    description: card.description || null,
    links: links,
    user_id: userId,
    theme: theme,
    visible_fields: card.visibleFields
  };
};
