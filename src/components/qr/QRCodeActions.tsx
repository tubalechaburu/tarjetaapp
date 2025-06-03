
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { downloadSvgAsPng } from "@/utils/qr/qrDownloader";
import { createAndDownloadShortcut } from "@/utils/qr/shortcutCreator";

interface QRCodeActionsProps {
  qrRef: React.RefObject<SVGSVGElement>;
  fullUrl: string;
  size: number;
}

const QRCodeActions: React.FC<QRCodeActionsProps> = ({ 
  qrRef,
  fullUrl, 
  size 
}) => {
  const [isQrReady, setIsQrReady] = useState(false);

  // Enhanced QR readiness detection
  useEffect(() => {
    console.log("QRCodeActions: Setting up QR readiness check");
    
    const checkQrReady = () => {
      const svgElement = qrRef.current;
      if (!svgElement) {
        console.log("QRCodeActions: No SVG element found");
        return false;
      }

      const pathElements = svgElement.querySelectorAll('path');
      const rectElements = svgElement.querySelectorAll('rect');
      const isReady = pathElements.length > 0 || rectElements.length > 0;
      
      console.log("QRCodeActions: QR ready check - paths:", pathElements.length, "rects:", rectElements.length, "ready:", isReady);
      
      if (isReady && !isQrReady) {
        console.log("QRCodeActions: QR is now ready!");
        setIsQrReady(true);
      }
      
      return isReady;
    };

    // Check immediately
    if (checkQrReady()) {
      return;
    }

    // Check periodically with increasing intervals
    const intervals = [200, 500, 1000];
    const timeouts: NodeJS.Timeout[] = [];

    intervals.forEach((delay) => {
      const timeout = setTimeout(() => {
        checkQrReady();
      }, delay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [qrRef, isQrReady]);

  const getCardName = () => {
    return document.querySelector('h1')?.textContent?.replace('Tarjeta de ', '') || 'Contacto';
  };

  const handleDownloadQR = async () => {
    console.log("QRCodeActions: Download button clicked");
    console.log("QRCodeActions: QR ref available:", !!qrRef.current);
    console.log("QRCodeActions: Is QR ready:", isQrReady);
    
    if (!qrRef.current) {
      console.error("QRCodeActions: No QR ref available");
      toast.error("Error: El código QR no está disponible.");
      return;
    }

    if (!isQrReady) {
      console.error("QRCodeActions: QR not ready yet");
      toast.error("El código QR aún se está cargando. Espera un momento...");
      return;
    }

    const cardName = getCardName();
    const filename = `QR_${cardName.replace(/\s+/g, '_')}.png`;
    
    console.log("QRCodeActions: Attempting download with filename:", filename);
    
    try {
      await downloadSvgAsPng(qrRef.current, size, filename);
      console.log("QRCodeActions: Download successful");
    } catch (error) {
      console.error("QRCodeActions: Download failed:", error);
      toast.error("Error al descargar el código QR");
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("URL copiada al portapapeles");
    } catch (error) {
      console.error("Error copying URL:", error);
      toast.error("No se pudo copiar la URL");
    }
  };

  const handleDownloadShortcut = () => {
    const cardName = getCardName();
    createAndDownloadShortcut(fullUrl, cardName);
  };

  return (
    <div className="flex flex-col w-full gap-2">
      <Button 
        onClick={handleDownloadQR} 
        variant="default" 
        className="flex items-center gap-2 w-full"
        disabled={!isQrReady}
      >
        <Download className="h-4 w-4" />
        {isQrReady ? "Descargar código QR" : "Cargando QR..."}
      </Button>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={handleCopyUrl} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copiar URL
        </Button>
        
        <Button 
          onClick={handleDownloadShortcut} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Acceso directo
        </Button>
      </div>
    </div>
  );
};

export default QRCodeActions;
