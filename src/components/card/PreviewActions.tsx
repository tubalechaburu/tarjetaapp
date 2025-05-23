
import React from "react";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";
import { BusinessCard } from "@/types";
import { downloadVCard } from "@/utils/linkUtils";

interface PreviewActionsProps {
  card: BusinessCard;
  onShare: () => void;
}

const PreviewActions: React.FC<PreviewActionsProps> = ({ card, onShare }) => {
  return (
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
  );
};

export default PreviewActions;
