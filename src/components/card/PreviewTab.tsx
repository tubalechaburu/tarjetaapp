
import React from "react";
import { BusinessCard } from "@/types";
import PreviewContent from "./PreviewContent";
import PreviewActions from "./PreviewActions";

interface PreviewTabProps {
  card: BusinessCard;
  onShare: () => void;
  shareUrl: string;
  fullShareUrl: string;
}

const PreviewTab: React.FC<PreviewTabProps> = ({ 
  card, 
  onShare,
  shareUrl,
  fullShareUrl 
}) => {
  return (
    <>
      <PreviewContent 
        card={card}
        shareUrl={shareUrl}
        fullShareUrl={fullShareUrl}
        onShare={onShare}
      />
      
      <PreviewActions 
        card={card}
        onShare={onShare}
      />
    </>
  );
};

export default PreviewTab;
