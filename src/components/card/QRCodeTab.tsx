
import React from "react";
import QRCodeGenerator from "../QRCodeGenerator";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeTabProps {
  shareUrl: string;
  fullShareUrl: string;
  onShare: () => void;
}

const QRCodeTab: React.FC<QRCodeTabProps> = ({ 
  shareUrl, 
  fullShareUrl
}) => {
  return (
    <div className="space-y-4 mt-6">
      <QRCodeGenerator url={shareUrl} size={200} />
      
      <div className="mt-4 flex justify-center">
        <Button 
          onClick={() => {
            const qrElement = document.querySelector('.qr-code-container svg');
            if (qrElement) {
              // Create a blob URL for download
              const xml = new XMLSerializer().serializeToString(qrElement as SVGElement);
              const blob = new Blob([xml], { type: 'image/svg+xml' });
              const url = URL.createObjectURL(blob);
              
              // Create link and trigger download
              const a = document.createElement('a');
              a.href = url;
              a.download = `QR-Tarjeta.svg`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          }}
          className="px-6 py-2 bg-gray-900 text-white rounded-md flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Download className="h-4 w-4" />
          Descargar QR
        </Button>
      </div>
    </div>
  );
};

export default QRCodeTab;
