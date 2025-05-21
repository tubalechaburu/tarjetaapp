
import React from "react";
import { Button } from "@/components/ui/button";
import { Share2, Download, MessageCircle } from "lucide-react";
import { BusinessCard } from "@/types";
import CardPreview from "@/components/CardPreview";
import { downloadVCard } from "@/utils/linkUtils";

interface PreviewTabProps {
  card: BusinessCard;
  onShare: () => void;
}

const PreviewTab: React.FC<PreviewTabProps> = ({ card, onShare }) => {
  return (
    <>
      <CardPreview card={card} />
      
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={onShare} className="gap-1">
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
        
        <Button onClick={() => downloadVCard(card)} variant="outline" className="gap-1">
          <Download className="h-4 w-4" />
          Guardar contacto
        </Button>
        
        {card.phone && (
          <Button 
            variant="outline" 
            className="gap-1"
            onClick={() => window.open(`https://wa.me/${card.phone.replace(/\D/g, "")}`, "_blank")}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        )}
      </div>
    </>
  );
};

export default PreviewTab;
