
import { CardLink } from "@/types";
import { 
  Globe, 
  Linkedin, 
  Facebook, 
  Twitter, 
  Instagram,
  Calendar, 
  MessageCircle, 
  Link as LinkIcon 
} from "lucide-react";

/**
 * Returns the appropriate icon for a given link type
 */
export const getLinkIcon = (type: CardLink["type"]) => {
  switch (type) {
    case "website":
      return Globe;
    case "linkedin":
      return Linkedin;
    case "facebook":
      return Facebook;
    case "twitter":
      return Twitter;
    case "instagram":
      return Instagram;
    case "calendar":
      return Calendar;
    case "whatsapp":
      return MessageCircle;
    case "other":
    default:
      return LinkIcon;
  }
};

/**
 * Formats a WhatsApp number correctly
 */
export const formatWhatsAppNumber = (phoneNumber: string) => {
  if (!phoneNumber) return "";
  
  // Remove all non-digit characters except +
  let cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
  
  // Remove + from the beginning if present
  if (cleanNumber.startsWith("+")) {
    cleanNumber = cleanNumber.substring(1);
  }
  
  // If it's a 9-digit Spanish number, add country code
  if (cleanNumber.length === 9 && cleanNumber.match(/^[67]/)) {
    cleanNumber = "34" + cleanNumber;
  }
  
  // If it starts with 34 but has more than 11 digits, it might be malformed
  if (cleanNumber.startsWith("34") && cleanNumber.length > 11) {
    // Take only the first 11 digits (34 + 9 digits)
    cleanNumber = cleanNumber.substring(0, 11);
  }
  
  // Ensure we have a valid international format
  if (!cleanNumber.match(/^\d{10,15}$/)) {
    console.warn("Invalid phone number format:", phoneNumber);
    return "";
  }
  
  return cleanNumber;
};

/**
 * Formats a URL appropriately based on the link type
 */
export const getFormattedUrl = (link: CardLink) => {
  if (link.type === "whatsapp") {
    // Format WhatsApp number
    const cleanNumber = formatWhatsAppNumber(link.url);
    if (!cleanNumber) {
      console.error("Could not format WhatsApp number:", link.url);
      return "#";
    }
    return `https://wa.me/${cleanNumber}`;
  }
  
  // For other links, ensure they have https://
  if (link.url && !link.url.match(/^https?:\/\//i)) {
    return `https://${link.url}`;
  }
  
  return link.url;
};

/**
 * Generates a vCard string from business card data
 */
export const generateVCardData = (card: {
  name: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}) => {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.name}`,
    card.jobTitle ? `TITLE:${card.jobTitle}` : "",
    card.company ? `ORG:${card.company}` : "",
    card.email ? `EMAIL:${card.email}` : "",
    card.phone ? `TEL:${card.phone}` : "",
    card.website ? `URL:${card.website}` : "",
    card.address ? `ADR:;;${card.address};;;` : "",
    "END:VCARD"
  ].filter(Boolean).join("\n");

  return vcard;
};

/**
 * Triggers a download of a vCard file
 */
export const downloadVCard = (card: {
  name: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}) => {
  const vcard = generateVCardData(card);
  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${card.name.replace(/\s+/g, "_")}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Gets initials from a name
 */
export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};
