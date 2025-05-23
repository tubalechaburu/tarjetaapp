
import React from "react";
import { BusinessCard } from "@/types";
import CardPreview from "@/components/CardPreview";
import QRCodeTab from "@/components/card/QRCodeTab";

interface PreviewContentProps {
  card: BusinessCard;
  shareUrl: string;
  fullShareUrl: string;
  onShare: () => void;
}

const PreviewContent: React.FC<PreviewContentProps> = ({ 
  card, 
  shareUrl, 
  fullShareUrl, 
  onShare 
}) => {
  return (
    <>
      <CardPreview card={card} />
      
      {/* Embed QR Code directly in the preview content */}
      <QRCodeTab 
        shareUrl={shareUrl}
        fullShareUrl={fullShareUrl}
        onShare={onShare}
      />
    </>
  );
};

export default PreviewContent;
