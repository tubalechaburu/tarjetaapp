
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
        <CardLinks 
          email={card.email} 
          phone={card.phone} 
          website={card.website} 
          address={card.address} 
          links={card.links} 
        />

        {/* Action buttons if required */}
        {actions && <ContactActions card={card} />}
      </CardContent>
    </Card>
  );
};

export default CardPreview;
