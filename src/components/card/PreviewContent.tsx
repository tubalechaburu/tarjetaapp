
import React from "react";
import { BusinessCard } from "@/types";
import CardPreview from "@/components/CardPreview";

interface PreviewContentProps {
  card: BusinessCard;
  shareUrl?: string;
  fullShareUrl?: string;
  onShare?: () => void;
}

const PreviewContent: React.FC<PreviewContentProps> = ({ 
  card
}) => {
  return (
    <CardPreview card={card} />
  );
};

export default PreviewContent;
