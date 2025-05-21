
import React from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import QRCodeGenerator from "@/components/QRCodeGenerator";

interface QRCodeTabProps {
  shareUrl: string;
  fullShareUrl: string;
  onShare: () => void;
}

const QRCodeTab: React.FC<QRCodeTabProps> = ({ 
  shareUrl, 
  fullShareUrl,
  onShare 
}) => {
  return (
    <div className="text-center">
      <p className="mb-4 text-muted-foreground">
        Comparte tu tarjeta digital escaneando este código QR
      </p>
      <QRCodeGenerator url={shareUrl} size={200} />
      
      <div className="mt-4 p-3 bg-muted rounded-md">
        <p className="text-sm break-all">{fullShareUrl}</p>
      </div>
      
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={onShare} className="gap-1">
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
      </div>
    </div>
  );
};

export default QRCodeTab;
