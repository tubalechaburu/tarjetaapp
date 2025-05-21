
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Link as LinkIcon } from "lucide-react";
import { downloadVCard } from "@/utils/linkUtils";
import { BusinessCard } from "@/types";

interface ContactActionsProps {
  card: BusinessCard;
}

const ContactActions: React.FC<ContactActionsProps> = ({ card }) => {
  return (
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
        onClick={() => downloadVCard(card)}
      >
        <LinkIcon className="h-4 w-4" />
        Guardar contacto
      </Button>
    </div>
  );
};

export default ContactActions;
