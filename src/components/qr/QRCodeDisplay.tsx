
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
    console.log("QRCodeDisplay: useEffect triggered with URL:", url);
    
    // Wait for the QR code to be fully rendered
    const waitForQRRender = () => {
      const svgElement = qrRef.current;
      if (!svgElement) {
        console.log("QRCodeDisplay: SVG element not found");
        return false;
      }

      // Check if the QR code has actual content
      const pathElements = svgElement.querySelectorAll('path');
      const rectElements = svgElement.querySelectorAll('rect');
      
      console.log("QRCodeDisplay: Found paths:", pathElements.length, "rects:", rectElements.length);
      
      if (pathElements.length > 0 || rectElements.length > 0) {
        console.log("QRCodeDisplay: QR code is ready, calling onSvgRef");
        if (onSvgRef) {
          onSvgRef(svgElement);
        }
        return true;
      }
      
      return false;
    };

    // Try immediately
    if (waitForQRRender()) {
      return;
    }

    // If not ready, wait with multiple attempts
    const attempts = [100, 300, 600, 1000, 1500, 2000];
    const timeouts: NodeJS.Timeout[] = [];

    attempts.forEach((delay) => {
      const timeout = setTimeout(() => {
        if (waitForQRRender()) {
          // Clear remaining timeouts
          timeouts.forEach(clearTimeout);
        }
      }, delay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [url, onSvgRef]);

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
