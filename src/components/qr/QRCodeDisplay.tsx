
import React, { useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  url: string;
  size: number;
  onSvgRef?: (ref: SVGSVGElement | null) => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, size, onSvgRef }) => {
  const qrRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (qrRef.current && onSvgRef) {
      console.log("QRCodeDisplay: SVG element is available, setting reference");
      onSvgRef(qrRef.current);
    }
  }, [onSvgRef]); // Run this effect when onSvgRef changes

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
