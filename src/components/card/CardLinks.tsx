
import React from "react";
import { CardLink } from "@/types";
import { Mail, Phone, Globe, MapPin } from "lucide-react";
import { getLinkIcon, getFormattedUrl } from "@/utils/linkUtils";

interface CardLinksProps {
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  links?: CardLink[];
}

const CardLinks: React.FC<CardLinksProps> = ({ 
  email, 
  phone, 
  website, 
  address, 
  links 
}) => {
  return (
    <div className="space-y-2">
      {email && (
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
            {email}
          </a>
        </div>
      )}
      
      {phone && (
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
            {phone}
          </a>
        </div>
      )}
      
      {/* Show website if not already in links */}
      {website && !links?.some(link => link.type === "website" && link.url === website) && (
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <a
            href={website.startsWith("http") ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {website}
          </a>
        </div>
      )}
      
      {/* Display additional links */}
      {links && links.map(link => {
        const IconComponent = getLinkIcon(link.type);
        return (
          <div key={link.id} className="flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-muted-foreground" />
            <a
              href={getFormattedUrl(link)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {link.label || link.url}
            </a>
          </div>
        );
      })}
      
      {address && (
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <span>{address}</span>
        </div>
      )}
    </div>
  );
};

export default CardLinks;
