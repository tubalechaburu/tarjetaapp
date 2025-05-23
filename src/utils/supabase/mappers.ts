
import { BusinessCard, SupabaseBusinessCard, CardLink } from "../../types";
import { v4 as uuidv4 } from "uuid";

/**
 * Maps a Supabase business card to our application's BusinessCard format
 */
export const mapSupabaseToBusinessCard = (card: SupabaseBusinessCard): BusinessCard => {
  console.log("Mapping Supabase card:", card);
  
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

  // Extract theme colors from Supabase theme object
  let themeColors: string[] = ["#dd8d0a", "#000000", "#dd8d0a"]; // Default colors
  
  if (card.theme && typeof card.theme === 'object') {
    const theme = card.theme as any;
    if (theme.colors && Array.isArray(theme.colors) && theme.colors.length === 3) {
      themeColors = theme.colors;
    } else if (theme.background && theme.text && theme.accent) {
      // Legacy format support
      themeColors = [theme.background, theme.text, theme.accent];
    }
  }
  
  console.log("Mapped theme colors:", themeColors);
  
  return {
    id: card.id,
    name: card.name,
    jobTitle: card.title || "",
    company: card.company || "", 
    email: card.email || "",
    phone: card.phone || "",
    website: website || "",
    address: "", // Add default empty address
    avatarUrl: card.photo || "",
    createdAt: new Date(card.created_at).getTime(),
    userId: card.user_id,
    links: links,
    themeColors: themeColors,
    visibleFields: card.visible_fields || {
      name: true,
      jobTitle: true,
      company: true,
      email: true,
      phone: true,
      website: true,
      address: true,
      description: true,
    }
  };
};

/**
 * Prepares a BusinessCard object for Supabase format
 */
export const prepareSupabaseCard = (card: BusinessCard) => {
  // Ensure user ID is not undefined
  const userId = card.userId || "00000000-0000-0000-0000-000000000000";
  
  // Prepare links for Supabase
  const links = [];
  
  // Add website as link if it exists
  if (card.website) {
    links.push({ 
      id: uuidv4(),
      type: "website", 
      url: card.website,
      label: "Sitio web"
    });
  }
  
  // Add additional links if they exist
  if (card.links && card.links.length > 0) {
    // Filter to avoid duplicates (in case the website is already in the links)
    const additionalLinks = card.links.filter(link => 
      link.type !== "website" || link.url !== card.website
    );
    links.push(...additionalLinks);
  }

  // Prepare theme with custom colors
  const theme = {
    colors: card.themeColors || ["#dd8d0a", "#000000", "#dd8d0a"],
    background: (card.themeColors && card.themeColors[0]) || "#dd8d0a",
    text: (card.themeColors && card.themeColors[1]) || "#000000",
    accent: (card.themeColors && card.themeColors[2]) || "#dd8d0a"
  };
  
  console.log("Preparing card for Supabase with theme:", theme);
    
  return {
    id: card.id,
    name: card.name,
    title: card.jobTitle,
    company: card.company,
    email: card.email,
    phone: card.phone,
    photo: card.avatarUrl || null,
    links: links,
    user_id: userId,
    theme: theme,
    visible_fields: card.visibleFields
  };
};
