
import React, { useState } from "react";
import { BusinessCard } from "@/types";
import QRCodeDisplay from "@/components/qr/QRCodeDisplay";
import QRCodeActions from "@/components/qr/QRCodeActions";

interface QRCodeSectionProps {
  card: BusinessCard;
  fullShareUrl: string;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({ card, fullShareUrl }) => {
  const [qrElement, setQrElement] = useState<SVGSVGElement | null>(null);

  const handleQRReady = (svgElement: SVGSVGElement) => {
    console.log("QR element received in QRCodeSection");
    setQrElement(svgElement);
  };

  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <h3 className="text-lg font-medium mb-3 text-center">Código QR</h3>
      <div className="flex flex-col items-center space-y-4">
        <QRCodeDisplay 
          url={fullShareUrl} 
          size={200} 
          onQRReady={handleQRReady} 
        />
        
        <QRCodeActions 
          qrElement={qrElement}
          fullUrl={fullShareUrl}
        />
      </div>
    </div>
  );
};

export default QRCodeSection;
