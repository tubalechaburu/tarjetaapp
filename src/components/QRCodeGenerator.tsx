
import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  url, 
  size = 200 
}) => {
  const qrRef = useRef<SVGSVGElement>(null);
  
  // Ensure URL is absolute with the current origin
  const fullUrl = url.startsWith('http') 
    ? url 
    : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  
  console.log("QR Code generated for URL:", fullUrl);
  
  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        
        downloadLink.download = `qrcode-${new Date().getTime()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };
  
  return (
    <Card className="flex flex-col items-center p-4 bg-white">
      <CardContent className="pt-4 flex flex-col items-center">
        <QRCodeSVG ref={qrRef} value={fullUrl} size={size} />
        <p className="mt-2 text-xs text-center text-gray-500 break-all">{fullUrl}</p>
        
        <Button 
          onClick={downloadQRCode} 
          variant="outline" 
          className="mt-4 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Descargar QR
        </Button>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
