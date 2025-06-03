
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

  // Check if QR is ready periodically
  useEffect(() => {
    const checkQrReady = () => {
      if (qrRef.current) {
        const hasContent = qrRef.current.querySelector('path, rect, circle, polygon');
        const isReady = !!hasContent;
        console.log("QRCodeActions: QR ready check:", isReady);
        setIsQrReady(isReady);
        return isReady;
      }
      return false;
    };

    // Check immediately
    if (checkQrReady()) {
      return;
    }

    // Check periodically until ready
    const interval = setInterval(() => {
      if (checkQrReady()) {
        clearInterval(interval);
      }
    }, 200);

    // Clean up after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [qrRef]);

  // Get card name from the document or URL
  const getCardName = () => {
    return document.querySelector('h1')?.textContent?.replace('Tarjeta de ', '') || 'Contacto';
  };

  const handleDownloadQR = async () => {
    console.log("QRCodeActions: Download button clicked");
    console.log("QRCodeActions: QR ref available:", !!qrRef.current);
    console.log("QRCodeActions: Is QR ready:", isQrReady);
    
    if (!qrRef.current) {
      toast.error("Error: El código QR no está disponible. Espera un momento e inténtalo de nuevo.");
      return;
    }

    if (!isQrReady) {
      toast.error("El código QR aún se está cargando. Espera un momento e inténtalo de nuevo.");
      return;
    }

    const cardName = getCardName();
    try {
      await downloadSvgAsPng(qrRef.current, size, `QR_${cardName.replace(/\s+/g, '_')}.png`);
    } catch (error) {
      console.error("Error al descargar el QR:", error);
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
