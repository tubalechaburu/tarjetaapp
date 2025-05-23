
import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Link2, Copy } from "lucide-react";
import { svgToPng, ensureAbsoluteUrl } from "@/utils/qrUtils";
import { toast } from "sonner";

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
    
    const fileName = `tarjeta-qr-${new Date().getTime()}.png`;
    await svgToPng(qrRef.current, size, fileName);
    toast.success("Código QR descargado correctamente");
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("URL copiada al portapapeles");
    } catch (error) {
      console.error("Error copying URL:", error);
      toast.error("No se pudo copiar la URL");
    }
  };

  const downloadDirectLink = () => {
    // Crear un archivo de texto con el enlace directo
    const linkContent = `Enlace directo a la tarjeta digital:
${fullUrl}

Comparte este enlace para que otros puedan ver tu tarjeta de contacto.`;
    
    const blob = new Blob([linkContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enlace-tarjeta-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Enlace directo descargado");
  };
  
  return (
    <Card className="flex flex-col items-center p-4 bg-white">
      <CardContent className="pt-4 flex flex-col items-center space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Comparte tu tarjeta digital escaneando este código QR
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <QRCodeSVG 
            ref={qrRef} 
            value={fullUrl} 
            size={size}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={true}
          />
        </div>
        
        <div className="w-full max-w-xs">
          <p className="text-xs text-center text-gray-500 break-all bg-gray-50 p-2 rounded border">
            {fullUrl}
          </p>
        </div>
        
        <div className="flex flex-col w-full gap-2">
          <Button 
            onClick={downloadQRCode} 
            variant="default" 
            className="flex items-center gap-2 w-full"
          >
            <Download className="h-4 w-4" />
            Descargar código QR
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={copyUrl} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar URL
            </Button>
            
            <Button 
              onClick={downloadDirectLink} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Link2 className="h-4 w-4" />
              Descargar enlace
            </Button>
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-500">
            El código QR y el enlace llevan directamente a tu tarjeta
          </p>
          <p className="text-xs text-gray-400">
            Funciona sin necesidad de apps adicionales
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
