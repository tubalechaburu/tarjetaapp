
import React from "react";
import { CardLink } from "@/types";
import { getLinkIcon, getFormattedUrl } from "@/utils/linkUtils";
import { ExternalLink, Mail, Phone, MapPin, Globe, MessageCircle } from "lucide-react";

interface CardLinksProps {
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  links?: CardLink[];
  accentColor?: string;
  textColor?: string;
}

const CardLinks: React.FC<CardLinksProps> = ({
  email,
  phone,
  website,
  address,
  links = [],
  accentColor = "#dd8d0a",
  textColor = "#000000"
}) => {
  const linkStyle = {
    color: accentColor,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem",
    borderRadius: "0.25rem",
    textDecoration: "none",
  };

  // Check if there's already a WhatsApp link in the custom links
  const hasWhatsAppInLinks = links.some(link => link.type === 'whatsapp');
  
  // Get website link from links array if it exists
  const websiteLinkIndex = links.findIndex(link => link.type === 'website');
  const hasWebsiteInLinks = websiteLinkIndex !== -1;

  // Format WhatsApp number correctly
  const formatWhatsAppNumber = (phoneNumber: string) => {
    // Remove all non-digit characters
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Ensure it starts with country code
    if (!cleanNumber.startsWith('34') && cleanNumber.length === 9) {
      cleanNumber = '34' + cleanNumber; // Add Spain country code if missing
    }
    
    return cleanNumber;
  };

  // Website from property (only show if no website in links)
  const websiteFromProperty = website && !hasWebsiteInLinks ? (
    <a
      href={website.startsWith("http") ? website : `https://${website}`}
      style={linkStyle}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Globe size={16} />
      <span>{website}</span>
    </a>
  ) : null;

  return (
    <div className="space-y-1">
      {email && (
        <a
          href={`mailto:${email}`}
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Mail size={16} />
          <span>{email}</span>
        </a>
      )}

      {phone && (
        <a
          href={`tel:${phone}`}
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Phone size={16} />
          <span>{phone}</span>
        </a>
      )}

      {/* Only show automatic WhatsApp if there's no custom WhatsApp link */}
      {phone && !hasWhatsAppInLinks && (
        <a
          href={`https://wa.me/${formatWhatsAppNumber(phone)}`}
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={16} />
          <span>WhatsApp</span>
        </a>
      )}

      {/* Show website from property if it exists and there's no website in links */}
      {websiteFromProperty}

      {address && (
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MapPin size={16} />
          <span>{address}</span>
        </a>
      )}

      {/* Show all links from links array */}
      {links.map((link) => {
        const IconComponent = getLinkIcon(link.type);
        let href = link.url;

        // Format URL based on link type
        if (link.type === 'whatsapp') {
          // For WhatsApp links, format the number correctly
          const cleanNumber = formatWhatsAppNumber(link.url);
          href = `https://wa.me/${cleanNumber}`;
        } else if (link.url && !link.url.match(/^https?:\/\//i)) {
          href = `https://${link.url}`;
        }

        return (
          <a
            key={link.id || link.url}
            href={href}
            style={linkStyle}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconComponent size={16} />
            <span>
              {link.label || link.title || link.type}
            </span>
          </a>
        );
      })}
    </div>
  );
};

export default CardLinks;
