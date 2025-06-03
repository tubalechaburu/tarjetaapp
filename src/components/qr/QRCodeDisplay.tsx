
import React, { useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  url: string;
  size: number;
  onQRReady?: (ref: SVGSVGElement) => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, size, onQRReady }) => {
  const qrRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    // Simple timeout to ensure QR is rendered
    const timer = setTimeout(() => {
      if (qrRef.current && onQRReady) {
        console.log("QR Code is ready for download");
        onQRReady(qrRef.current);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [url, onQRReady]);

  return (
    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
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
