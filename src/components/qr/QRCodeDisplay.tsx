
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
    console.log("QRCodeDisplay: useEffect triggered");
    console.log("QRCodeDisplay: qrRef.current available:", !!qrRef.current);
    console.log("QRCodeDisplay: onSvgRef available:", !!onSvgRef);
    
    // Multiple strategies to ensure the SVG is captured
    const captureQRRef = () => {
      const svgElement = qrRef.current;
      
      if (svgElement && onSvgRef) {
        console.log("QRCodeDisplay: SVG element found, checking content...");
        
        // Check if SVG has content (paths, rects, etc.)
        const hasContent = svgElement.querySelector('path, rect, circle, polygon');
        
        if (hasContent) {
          console.log("QRCodeDisplay: SVG has content, setting reference");
          onSvgRef(svgElement);
          return true;
        } else {
          console.log("QRCodeDisplay: SVG found but no content yet");
          return false;
        }
      }
      return false;
    };

    // Try immediately
    if (captureQRRef()) {
      return;
    }

    // Try with multiple timeouts to catch the SVG when it's ready
    const timeouts = [100, 250, 500, 1000, 2000];
    const timeoutIds: NodeJS.Timeout[] = [];

    timeouts.forEach((delay) => {
      const timeoutId = setTimeout(() => {
        if (captureQRRef()) {
          // Clear remaining timeouts if successful
          timeoutIds.forEach(clearTimeout);
        }
      }, delay);
      timeoutIds.push(timeoutId);
    });

    // Also try with a MutationObserver to detect when content is added
    let observer: MutationObserver | null = null;
    
    if (qrRef.current) {
      observer = new MutationObserver(() => {
        if (captureQRRef()) {
          observer?.disconnect();
          timeoutIds.forEach(clearTimeout);
        }
      });
      
      observer.observe(qrRef.current, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }

    return () => {
      timeoutIds.forEach(clearTimeout);
      observer?.disconnect();
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
