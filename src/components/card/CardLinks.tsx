
import React from "react";
import { CardLink } from "@/types";
import { getLinkIcon } from "@/utils/linkUtils";
import { ExternalLink, Mail, Phone, MapPin, Globe } from "lucide-react";

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

      {website && (
        <a
          href={website.startsWith("http") ? website : `https://${website}`}
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Globe size={16} />
          <span>{website}</span>
        </a>
      )}

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

      {links.map((link) => (
        <a
          key={link.id || link.url}
          href={link.url}
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
        >
          {React.createElement(getLinkIcon(link.type), { size: 16 })}
          <span>{link.label || link.title}</span>
        </a>
      ))}
    </div>
  );
};

export default CardLinks;
