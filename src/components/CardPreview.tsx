
import React from "react";
import { BusinessCard } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/linkUtils";
import CardLinks from "@/components/card/CardLinks";
import ContactActions from "@/components/card/ContactActions";

interface CardPreviewProps {
  card: BusinessCard;
  actions?: boolean;
}

const CardPreview: React.FC<CardPreviewProps> = ({ card, actions = false }) => {
  // Use themeColors array from the card data
  const bgColor = card.themeColors?.[0] || "#ffffff";
  const textColor = card.themeColors?.[1] || "#000000";
  const accentColor = card.themeColors?.[2] || "#dd8d0a";
  
  return (
    <Card 
      className="w-full max-w-md mx-auto shadow-lg"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <CardHeader className="flex flex-col items-center pb-2">
        <Avatar className="h-24 w-24 mb-2" style={{ borderColor: accentColor, borderWidth: '2px' }}>
          {card.avatarUrl ? (
            <AvatarImage src={card.avatarUrl} alt={card.name} />
          ) : (
            <AvatarFallback className="text-2xl" style={{ backgroundColor: accentColor, color: textColor }}>
              {getInitials(card.name)}
            </AvatarFallback>
          )}
        </Avatar>
        <CardTitle className="text-xl font-bold text-center" style={{ color: textColor }}>
          {card.name}
        </CardTitle>
        {card.jobTitle && (
          <p className="text-center" style={{ color: textColor, opacity: 0.8 }}>
            {card.jobTitle}
          </p>
        )}
        {card.company && (
          <div className="flex flex-col items-center">
            <p className="font-semibold text-center" style={{ color: accentColor }}>
              {card.company}
            </p>
            
            {/* Logo de empresa */}
            {card.logoUrl && (
              <div className="mt-2 p-1 rounded-md bg-white/80 max-h-16 flex items-center justify-center">
                <img 
                  src={card.logoUrl} 
                  alt={`Logo de ${card.company}`} 
                  className="max-h-14 max-w-32 object-contain"
                />
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <CardLinks 
          email={card.email} 
          phone={card.phone} 
          website={card.website} 
          address={card.address} 
          links={card.links} 
          accentColor={accentColor}
          textColor={textColor}
        />

        {/* Action buttons if required */}
        {actions && <ContactActions card={card} />}
      </CardContent>
    </Card>
  );
};

export default CardPreview;
