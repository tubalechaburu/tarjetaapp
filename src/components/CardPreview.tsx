
import React from "react";
import { BusinessCard } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Globe, MapPin } from "lucide-react";

interface CardPreviewProps {
  card: BusinessCard;
}

const CardPreview: React.FC<CardPreviewProps> = ({ card }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
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
        <p className="text-muted-foreground text-center">{card.jobTitle}</p>
        <p className="text-muted-foreground font-semibold text-center">
          {card.company}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <a href={`mailto:${card.email}`} className="text-blue-600 hover:underline">
            {card.email}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <a href={`tel:${card.phone}`} className="text-blue-600 hover:underline">
            {card.phone}
          </a>
        </div>
        {card.website && (
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
        {card.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span>{card.address}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardPreview;
