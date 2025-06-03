
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
    // Multiple attempts to ensure QR is rendered and ready
    const attempts = [500, 1000, 2000];
    const timers: NodeJS.Timeout[] = [];
    
    attempts.forEach((delay) => {
      const timer = setTimeout(() => {
        if (qrRef.current && onQRReady) {
          console.log(`QR Code ready after ${delay}ms`);
          onQRReady(qrRef.current);
        }
      }, delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [url, onQRReady]);

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
