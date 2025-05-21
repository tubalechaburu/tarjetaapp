
import { BusinessCard, SupabaseBusinessCard } from "../../types";

/**
 * Maps a Supabase business card to our application's BusinessCard format
 */
export const mapSupabaseToBusinessCard = (card: SupabaseBusinessCard): BusinessCard => {
  console.log("Mapping Supabase card:", card);
  return {
    id: card.id,
    name: card.name,
    jobTitle: card.title || "",
    company: card.company || "", 
    email: card.email || "",
    phone: card.phone || "",
    website: card.links && Array.isArray(card.links) && card.links.length > 0 
      ? card.links[0].url 
      : undefined,
    avatarUrl: card.photo,
    createdAt: new Date(card.created_at).getTime(),
    userId: card.user_id
  };
};

/**
 * Prepares a BusinessCard object for Supabase format
 */
export const prepareSupabaseCard = (card: BusinessCard) => {
  return {
    id: card.id,
    name: card.name,
    title: card.jobTitle,
    company: card.company,
    email: card.email,
    phone: card.phone,
    photo: card.avatarUrl || null,
    links: card.website ? [{ type: "website", url: card.website }] : [],
    user_id: card.userId || "00000000-0000-0000-0000-000000000000", // Use default user ID if not provided
    theme: {
      text: "#FFFFFF",
      accent: "#9061F9",
      background: "#121212"
    }
  };
};
