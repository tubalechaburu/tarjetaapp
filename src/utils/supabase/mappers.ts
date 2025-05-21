
import { BusinessCard, SupabaseBusinessCard, CardLink } from "../../types";
import { v4 as uuidv4 } from "uuid";

/**
 * Maps a Supabase business card to our application's BusinessCard format
 */
export const mapSupabaseToBusinessCard = (card: SupabaseBusinessCard): BusinessCard => {
  console.log("Mapping Supabase card:", card);
  
  // Mapeamos los enlaces con formato correcto
  let links: CardLink[] = [];
  let website: string | undefined = undefined;
  
  if (card.links && Array.isArray(card.links) && card.links.length > 0) {
    links = card.links.map(link => ({
      id: link.id || uuidv4(),
      type: link.type as CardLink['type'],
      label: link.label,
      url: link.url
    }));
    
    // Mantener compatibilidad con el website en la raíz para tarjetas antiguas
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
    userId: card.user_id,
    links: links
  };
};

/**
 * Prepares a BusinessCard object for Supabase format
 */
export const prepareSupabaseCard = (card: BusinessCard) => {
  // Aseguramos que el ID de usuario no es undefined
  const userId = card.userId || "00000000-0000-0000-0000-000000000000";
  
  // Preparamos los enlaces para Supabase
  const links = [];
  
  // Añadimos el website como enlace si existe
  if (card.website) {
    links.push({ 
      id: uuidv4(),
      type: "website", 
      url: card.website,
      label: "Sitio web"
    });
  }
  
  // Añadimos los enlaces adicionales si existen
  if (card.links && card.links.length > 0) {
    // Filtrar para evitar duplicados (por si el website ya está en los links)
    const additionalLinks = card.links.filter(link => 
      link.type !== "website" || link.url !== card.website
    );
    links.push(...additionalLinks);
  }
  
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
