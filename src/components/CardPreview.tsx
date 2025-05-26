
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
  
  // Get visibility settings with defaults - if undefined, default to true
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
  
  // Fix visibility logic - if field is not explicitly false, show it
  const shouldShowAvatar = visibleFields.avatarUrl !== false && (card.avatarUrl || card.name);
  const shouldShowLogo = visibleFields.logoUrl !== false && card.logoUrl && card.logoUrl.trim() !== "";
  
  // Enhanced debug logging
  useEffect(() => {
    console.log("=== CardPreview Visibility Debug (ENHANCED) ===");
    console.log("Raw card.visibleFields:", card.visibleFields);
    console.log("Processed visibleFields:", visibleFields);
    console.log("visibleFields.avatarUrl value:", visibleFields.avatarUrl);
    console.log("visibleFields.avatarUrl type:", typeof visibleFields.avatarUrl);
    console.log("visibleFields.logoUrl value:", visibleFields.logoUrl);
    console.log("visibleFields.logoUrl type:", typeof visibleFields.logoUrl);
    console.log("card.avatarUrl exists:", !!card.avatarUrl);
    console.log("card.avatarUrl value:", card.avatarUrl?.substring(0, 50) + "...");
    console.log("card.logoUrl exists:", !!card.logoUrl);
    console.log("shouldShowAvatar calculation:", `${visibleFields.avatarUrl} !== false && (${!!card.avatarUrl} || ${!!card.name}) = ${shouldShowAvatar}`);
    console.log("shouldShowLogo calculation:", `${visibleFields.logoUrl} !== false && ${!!card.logoUrl} = ${shouldShowLogo}`);
    console.log("Final decision - Avatar will show:", shouldShowAvatar);
    console.log("Final decision - Logo will show:", shouldShowLogo);
    console.log("=== End Enhanced Visibility Debug ===");
  }, [visibleFields, card.avatarUrl, card.logoUrl, card.visibleFields, shouldShowAvatar, shouldShowLogo]);
  
  return (
    <Card 
      className="w-full max-w-md mx-auto shadow-lg"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <CardHeader className="flex flex-col items-center pb-2">
        <div className="flex items-center justify-center gap-4 mb-2">
          {/* Avatar - Show if not explicitly false AND we have content */}
          {shouldShowAvatar && (
            <Avatar className="h-24 w-24" style={{ borderColor: accentColor, borderWidth: '2px' }}>
              {card.avatarUrl ? (
                <AvatarImage 
                  src={card.avatarUrl} 
                  alt={card.name || "Avatar"}
                  onLoad={() => console.log('✅ Avatar displayed successfully in card preview')}
                  onError={(e) => {
                    console.error('❌ Error displaying avatar in card preview:', e);
                    console.error('Avatar URL that failed:', card.avatarUrl);
                  }}
                />
              ) : card.name ? (
                <AvatarFallback className="text-2xl" style={{ backgroundColor: accentColor, color: textColor }}>
                  {getInitials(card.name)}
                </AvatarFallback>
              ) : null}
            </Avatar>
          )}
          
          {/* Logo - Show if not explicitly false AND we have content */}
          {shouldShowLogo && (
            <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg shadow-sm p-1">
              <img 
                src={card.logoUrl} 
                alt={`Logo de ${card.company || 'empresa'}`} 
                className="max-h-14 max-w-14 object-contain"
                onLoad={() => console.log('✅ Logo displayed successfully in card preview')}
                onError={(e) => {
                  console.error('❌ Error displaying logo in card preview:', e);
                  console.error('Logo URL that failed:', card.logoUrl);
                }}
              />
            </div>
          )}
        </div>
        
        {visibleFields.name !== false && (
          <CardTitle className="text-xl font-bold text-center" style={{ color: textColor }}>
            {card.name}
          </CardTitle>
        )}
        
        {visibleFields.jobTitle !== false && card.jobTitle && (
          <p className="text-center" style={{ color: textColor, opacity: 0.8 }}>
            {card.jobTitle}
          </p>
        )}
        
        {visibleFields.company !== false && card.company && (
          <p className="font-semibold text-center" style={{ color: accentColor }}>
            {card.company}
          </p>
        )}
        
        {/* Descripción profesional */}
        {visibleFields.description !== false && card.description && (
          <div className="mt-3 text-center px-2">
            <p className="text-sm whitespace-pre-wrap" style={{ color: textColor }}>
              {card.description}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <CardLinks 
          email={visibleFields.email !== false ? card.email : undefined} 
          phone={visibleFields.phone !== false ? card.phone : undefined} 
          website={visibleFields.website !== false ? card.website : undefined} 
          address={visibleFields.address !== false ? card.address : undefined} 
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
