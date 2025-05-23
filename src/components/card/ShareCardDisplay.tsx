
import React from "react";
import { Button } from "@/components/ui/button";
import { BusinessCard } from "@/types";
import CardPreview from "@/components/CardPreview";
import { Link } from "react-router-dom";
import { Share2, Download, Link2 } from "lucide-react";
import { downloadVCard } from "@/utils/linkUtils";

interface ShareCardDisplayProps {
  card: BusinessCard;
  shareUrl: string;
  onShare: () => void;
}

const ShareCardDisplay: React.FC<ShareCardDisplayProps> = ({ 
  card, 
  shareUrl, 
  onShare 
}) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          Tarjeta de contacto de {card.name}
        </h1>
        <p className="text-muted-foreground">
          {card.jobTitle} {card.company ? `en ${card.company}` : ''}
        </p>
      </div>

      <CardPreview card={card} actions={true} />
      
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={onShare} className="gap-1">
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
        
        <Button onClick={() => downloadVCard(card)} variant="outline" className="gap-1">
          <Download className="h-4 w-4" />
          Guardar contacto
        </Button>
        
        <Link to="/create" className="mt-4 w-full">
          <Button variant="default" className="w-full gap-1">
            <Link2 className="h-4 w-4" />
            Crea tu propia tarjeta
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ShareCardDisplay;
