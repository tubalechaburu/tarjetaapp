
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Link as LinkIcon } from "lucide-react";
import { downloadVCard, formatWhatsAppNumber } from "@/utils/linkUtils";
import { BusinessCard } from "@/types";

interface ContactActionsProps {
  card: BusinessCard;
}

const ContactActions: React.FC<ContactActionsProps> = ({ card }) => {
  const handleWhatsAppClick = () => {
    if (card.phone) {
      const cleanNumber = formatWhatsAppNumber(card.phone);
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      console.log("Opening WhatsApp with URL:", whatsappUrl);
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {card.phone && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleWhatsAppClick}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => downloadVCard(card)}
      >
        <LinkIcon className="h-4 w-4" />
        Guardar contacto
      </Button>
    </div>
  );
};

export default ContactActions;
