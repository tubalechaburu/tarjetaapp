
import React from "react";
import { BusinessCard } from "@/types";
import PreviewContent from "./PreviewContent";
import PreviewActions from "./PreviewActions";
import QRCodeSection from "./QRCodeSection";

interface ViewCardContentProps {
  card: BusinessCard;
  fullShareUrl: string;
  onShare: () => void;
}

const ViewCardContent: React.FC<ViewCardContentProps> = ({ 
  card, 
  fullShareUrl, 
  onShare 
}) => {
  return (
    <div className="space-y-6">
      <PreviewContent card={card} />
      
      <PreviewActions 
        card={card}
        onShare={onShare}
      />
      
      <QRCodeSection 
        card={card}
        fullShareUrl={fullShareUrl}
      />
    </div>
  );
};

export default ViewCardContent;
