
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
  
  // FIXED: Handle visibility settings with proper boolean checks
  const normalizeVisibleFields = () => {
    // If no visibleFields exist, default to showing everything
    if (!card.visibleFields) {
      console.log("No visibleFields found, defaulting to show all");
      return {
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
    }
    
    // Return the existing visibleFields, but ensure proper boolean conversion
    const normalized: Record<string, boolean> = {};
    Object.keys(card.visibleFields).forEach(key => {
      // Convert to boolean - only true if explicitly true
      normalized[key] = card.visibleFields[key] === true;
    });
    
    return normalized;
  };
  
  const visibleFields = normalizeVisibleFields();
  
  // FIXED: More strict visibility logic - only show if explicitly set to true
  const shouldShowAvatar = visibleFields.avatarUrl === true && card.avatarUrl && card.avatarUrl.trim() !== "";
  const shouldShowLogo = visibleFields.logoUrl === true && card.logoUrl && card.logoUrl.trim() !== "";
  
  // Enhanced debug logging with card identification
  useEffect(() => {
    console.log("=== CardPreview Visibility Debug (FIXED) ===");
    console.log("Card name:", card.name);
    console.log("Card ID:", card.id);
    console.log("Raw card.visibleFields:", card.visibleFields);
    console.log("Normalized visibleFields:", visibleFields);
    console.log("visibleFields.avatarUrl:", visibleFields.avatarUrl);
    console.log("visibleFields.logoUrl:", visibleFields.logoUrl);
    console.log("card.avatarUrl exists:", !!card.avatarUrl);
    console.log("card.logoUrl exists:", !!card.logoUrl);
    console.log("shouldShowAvatar (FIXED):", shouldShowAvatar);
    console.log("shouldShowLogo (FIXED):", shouldShowLogo);
    console.log("=== End Fixed Visibility Debug ===");
  }, [card, visibleFields, shouldShowAvatar, shouldShowLogo]);
  
  return (
    <Card 
      className="w-full max-w-md mx-auto shadow-lg"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <CardHeader className="flex flex-col items-center pb-2">
        <div className="flex items-center justify-center gap-4 mb-2">
          {/* Avatar - Show ONLY if explicitly true AND we have content */}
          {shouldShowAvatar && (
            <Avatar className="h-24 w-24" style={{ borderColor: accentColor, borderWidth: '2px' }}>
              <AvatarImage 
                src={card.avatarUrl} 
                alt={card.name || "Avatar"}
                onLoad={() => console.log(`✅ Avatar displayed successfully for ${card.name}`)}
                onError={(e) => {
                  console.error(`❌ Error displaying avatar for ${card.name}:`, e);
                  console.error('Avatar URL that failed:', card.avatarUrl);
                }}
              />
            </Avatar>
          )}
          
          {/* Logo - Show ONLY if explicitly true AND we have content */}
          {shouldShowLogo && (
            <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg shadow-sm p-1">
              <img 
                src={card.logoUrl} 
                alt={`Logo de ${card.company || 'empresa'}`} 
                className="max-h-14 max-w-14 object-contain"
                onLoad={() => console.log(`✅ Logo displayed successfully for ${card.name}`)}
                onError={(e) => {
                  console.error(`❌ Error displaying logo for ${card.name}:`, e);
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
