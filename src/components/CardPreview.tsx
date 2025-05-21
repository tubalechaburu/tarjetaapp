
import React from "react";
import { BusinessCard, CardLink } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Linkedin, 
  Facebook, 
  Twitter, 
  Instagram,
  Calendar, 
  MessageCircle, 
  Link as LinkIcon 
} from "lucide-react";
import { Button } from "./ui/button";

interface CardPreviewProps {
  card: BusinessCard;
  actions?: boolean;
}

const CardPreview: React.FC<CardPreviewProps> = ({ card, actions = false }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getLinkIcon = (type: CardLink["type"]) => {
    switch (type) {
      case "website":
        return <Globe className="h-5 w-5 text-muted-foreground" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5 text-muted-foreground" />;
      case "facebook":
        return <Facebook className="h-5 w-5 text-muted-foreground" />;
      case "twitter":
        return <Twitter className="h-5 w-5 text-muted-foreground" />;
      case "instagram":
        return <Instagram className="h-5 w-5 text-muted-foreground" />;
      case "calendar":
        return <Calendar className="h-5 w-5 text-muted-foreground" />;
      case "whatsapp":
        return <MessageCircle className="h-5 w-5 text-muted-foreground" />;
      case "other":
      default:
        return <LinkIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getFormattedUrl = (link: CardLink) => {
    if (link.type === "whatsapp") {
      // Formatear número de WhatsApp
      let phoneNumber = link.url.replace(/\D/g, "");
      if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+" + phoneNumber;
      }
      return `https://wa.me/${phoneNumber}`;
    }
    
    // Para otros enlaces, asegurarse de que tengan https://
    if (link.url && !link.url.match(/^https?:\/\//i)) {
      return `https://${link.url}`;
    }
    
    return link.url;
  };

  // Construir vCard para descargar contacto
  const generateVCard = () => {
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

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.name.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
      <CardHeader className="flex flex-col items-center pb-2">
        <Avatar className="h-24 w-24 mb-2">
          {card.avatarUrl ? (
            <AvatarImage src={card.avatarUrl} alt={card.name} />
          ) : (
            <AvatarFallback className="text-2xl">
              {getInitials(card.name)}
            </AvatarFallback>
          )}
        </Avatar>
        <CardTitle className="text-xl font-bold text-center">{card.name}</CardTitle>
        {card.jobTitle && <p className="text-muted-foreground text-center">{card.jobTitle}</p>}
        {card.company && (
          <p className="text-muted-foreground font-semibold text-center">
            {card.company}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {card.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <a href={`mailto:${card.email}`} className="text-blue-600 hover:underline">
              {card.email}
            </a>
          </div>
        )}
        
        {card.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <a href={`tel:${card.phone}`} className="text-blue-600 hover:underline">
              {card.phone}
            </a>
          </div>
        )}
        
        {/* Mostrar enlaces tradicionales para compatibilidad */}
        {card.website && !card.links?.some(link => link.type === "website" && link.url === card.website) && (
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <a
              href={card.website.startsWith("http") ? card.website : `https://${card.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {card.website}
            </a>
          </div>
        )}
        
        {/* Mostrar enlaces adicionales */}
        {card.links && card.links.map(link => (
          <div key={link.id} className="flex items-center gap-2">
            {getLinkIcon(link.type)}
            <a
              href={getFormattedUrl(link)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {link.label || link.url}
            </a>
          </div>
        ))}
        
        {card.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span>{card.address}</span>
          </div>
        )}

        {/* Botones de acción si se requieren */}
        {actions && (
          <div className="flex flex-wrap gap-2 mt-4">
            {card.phone && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => window.open(`https://wa.me/${card.phone.replace(/\D/g, "")}`, "_blank")}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={generateVCard}
            >
              <LinkIcon className="h-4 w-4" />
              Guardar contacto
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardPreview;
