
import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { svgToPng, ensureAbsoluteUrl } from "@/utils/qrUtils";

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
  const fullUrl = ensureAbsoluteUrl(url);
  
  console.log("QR Code generated for URL:", fullUrl);
  
  const downloadQRCode = async () => {
    if (!qrRef.current) return;
    
    const fileName = `tarjeta-${new Date().getTime()}.png`;
    await svgToPng(qrRef.current, size, fileName);
  };
  
  return (
    <Card className="flex flex-col items-center p-4 bg-white">
      <CardContent className="pt-4 flex flex-col items-center">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">Comparte tu tarjeta digital escaneando este código QR</p>
        </div>
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
