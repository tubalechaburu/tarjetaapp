
import { BusinessCard, SupabaseBusinessCard } from "../../types";

/**
 * Maps a Supabase business card to our application's BusinessCard format
 */
export const mapSupabaseToBusinessCard = (card: SupabaseBusinessCard): BusinessCard => {
  console.log("Mapping Supabase card:", card);
  
  // Safely access the website URL from links
  let website: string | undefined = undefined;
  if (card.links && Array.isArray(card.links) && card.links.length > 0) {
    const websiteLink = card.links.find(link => link.type === "website");
    website = websiteLink?.url;
  }
  
  return {
    id: card.id,
    name: card.name,
    jobTitle: card.title || "",
    company: card.company || "", 
    email: card.email || "",
    phone: card.phone || "",
    website: website,
    avatarUrl: card.photo,
    createdAt: new Date(card.created_at).getTime(),
    userId: card.user_id
  };
};

/**
 * Prepares a BusinessCard object for Supabase format
 */
export const prepareSupabaseCard = (card: BusinessCard) => {
  // Asegurarnos que el ID de usuario no es undefined
  const userId = card.userId || "00000000-0000-0000-0000-000000000000";
  
  // Crear un array de enlaces si existe un sitio web
  const links = card.website 
    ? [{ type: "website", url: card.website }] 
    : [];
  
  console.log("Preparing card for Supabase:", card.id, "with user ID:", userId);
    
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
    theme: {
      text: "#FFFFFF",
      accent: "#9061F9",
      background: "#121212"
    }
  };
};
