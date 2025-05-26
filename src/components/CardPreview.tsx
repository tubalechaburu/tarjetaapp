
import React, { useEffect } from "react";
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
  // Use themeColors array from the card data with safe fallbacks to black, white, orange
  const bgColor = (card.themeColors && card.themeColors[0]) || "#000000";
  const textColor = (card.themeColors && card.themeColors[1]) || "#ffffff";
  const accentColor = (card.themeColors && card.themeColors[2]) || "#dd8d0a";
  
  // Log colors for debugging
  useEffect(() => {
    console.log("CardPreview: Rendering with colors", { bgColor, textColor, accentColor });
    console.log("Card theme colors from props:", card.themeColors);
    console.log("Card has logoUrl:", !!card.logoUrl);
    console.log("Card has avatarUrl:", !!card.avatarUrl);
    console.log("Avatar visibility setting:", card.visibleFields?.avatarUrl);
    console.log("Logo visibility setting:", card.visibleFields?.logoUrl);
    if (card.logoUrl) {
      console.log("Logo preview (first 50 chars):", card.logoUrl.substring(0, 50) + "...");
    }
    if (card.avatarUrl) {
      console.log("Avatar preview (first 50 chars):", card.avatarUrl.substring(0, 50) + "...");
    }
  }, [bgColor, textColor, accentColor, card.themeColors, card.logoUrl, card.avatarUrl, card.visibleFields]);
  
  // Get visibility settings with defaults
  const visibleFields = card.visibleFields || {
    name: true,
    jobTitle: true,
    company: true,
    email: true,
    phone: true,
    website: true,
    address: true,
    description: true,
    avatarUrl: true,
    logoUrl: true,
  };
  
  return (
    <Card 
      className="w-full max-w-md mx-auto shadow-lg"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <CardHeader className="flex flex-col items-center pb-2">
        <div className="flex items-center justify-center gap-4 mb-2">
          {/* Avatar - Show if avatar is visible AND we have either an avatar URL or a name for initials */}
          {visibleFields.avatarUrl && (card.avatarUrl || card.name) && (
            <Avatar className="h-24 w-24" style={{ borderColor: accentColor, borderWidth: '2px' }}>
              {card.avatarUrl ? (
                <AvatarImage 
                  src={card.avatarUrl} 
                  alt={card.name}
                  onLoad={() => console.log('Avatar displayed successfully in card preview')}
                  onError={(e) => {
                    console.error('Error displaying avatar in card preview:', e);
                    console.error('Avatar URL that failed:', card.avatarUrl);
                  }}
                />
              ) : (
                <AvatarFallback className="text-2xl" style={{ backgroundColor: accentColor, color: textColor }}>
                  {getInitials(card.name)}
                </AvatarFallback>
              )}
            </Avatar>
          )}
          
          {/* Logo de empresa - Show logo if it exists, has valid data, and is visible */}
          {visibleFields.logoUrl && card.logoUrl && card.logoUrl.trim() !== "" && (
            <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg shadow-sm p-1">
              <img 
                src={card.logoUrl} 
                alt={`Logo de ${card.company || 'empresa'}`} 
                className="max-h-14 max-w-14 object-contain"
                onLoad={() => console.log('Logo displayed successfully in card preview')}
                onError={(e) => {
                  console.error('Error displaying logo in card preview:', e);
                  console.error('Logo URL that failed:', card.logoUrl);
                }}
              />
            </div>
          )}
        </div>
        
        {visibleFields.name && (
          <CardTitle className="text-xl font-bold text-center" style={{ color: textColor }}>
            {card.name}
          </CardTitle>
        )}
        
        {visibleFields.jobTitle && card.jobTitle && (
          <p className="text-center" style={{ color: textColor, opacity: 0.8 }}>
            {card.jobTitle}
          </p>
        )}
        
        {visibleFields.company && card.company && (
          <p className="font-semibold text-center" style={{ color: accentColor }}>
            {card.company}
          </p>
        )}
        
        {/* Descripción profesional */}
        {visibleFields.description && card.description && (
          <div className="mt-3 text-center px-2">
            <p className="text-sm whitespace-pre-wrap" style={{ color: textColor }}>
              {card.description}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <CardLinks 
          email={visibleFields.email ? card.email : undefined} 
          phone={visibleFields.phone ? card.phone : undefined} 
          website={visibleFields.website ? card.website : undefined} 
          address={visibleFields.address ? card.address : undefined} 
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
