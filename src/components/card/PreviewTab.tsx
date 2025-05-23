
import React from "react";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";
import { BusinessCard } from "@/types";
import CardPreview from "@/components/CardPreview";
import { downloadVCard } from "@/utils/linkUtils";
import QRCodeTab from "@/components/card/QRCodeTab"; // Import QR code component

interface PreviewTabProps {
  card: BusinessCard;
  onShare: () => void;
  shareUrl: string; // Add this prop
  fullShareUrl: string; // Add this prop
}

const PreviewTab: React.FC<PreviewTabProps> = ({ 
  card, 
  onShare,
  shareUrl,
  fullShareUrl 
}) => {
  return (
    <>
      <CardPreview card={card} />
      
      {/* Embed QR Code directly in the preview tab */}
      <QRCodeTab 
        shareUrl={shareUrl}
        fullShareUrl={fullShareUrl}
        onShare={onShare}
      />
      
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={onShare} className="gap-1">
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
        
        <Button onClick={() => downloadVCard(card)} variant="outline" className="gap-1">
          <Download className="h-4 w-4" />
          Guardar contacto
        </Button>
      </div>
    </>
  );
};

export default PreviewTab;
