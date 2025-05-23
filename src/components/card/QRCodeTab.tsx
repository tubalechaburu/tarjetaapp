
import React from "react";
import QRCodeGenerator from "../QRCodeGenerator";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

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
    <div className="space-y-4">
      <QRCodeGenerator url={shareUrl} size={230} />
      
      <div className="mt-6 flex justify-center">
        <Button 
          onClick={onShare}
          className="px-6 py-2 bg-gray-900 text-white rounded-md flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Compartir tarjeta
        </Button>
      </div>
    </div>
  );
};

export default QRCodeTab;
