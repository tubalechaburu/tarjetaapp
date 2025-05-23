
import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  url: string;
  size: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, size }) => {
  const qrRef = useRef<SVGSVGElement>(null);
  
  return (
    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 qr-code-container">
      <QRCodeSVG 
        ref={qrRef} 
        value={url} 
        size={size}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
        includeMargin={true}
      />
    </div>
  );
};

export default QRCodeDisplay;
