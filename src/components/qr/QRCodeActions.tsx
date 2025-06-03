
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { downloadQRAsPNG } from "@/utils/qr/simpleQRDownloader";
import { createAndDownloadShortcut } from "@/utils/qr/shortcutCreator";

interface QRCodeActionsProps {
  qrElement: SVGSVGElement | null;
  fullUrl: string;
}

const QRCodeActions: React.FC<QRCodeActionsProps> = ({ 
  qrElement,
  fullUrl 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const getCardName = () => {
    return document.querySelector('h1')?.textContent?.replace('Tarjeta de ', '') || 'Contacto';
  };

  const handleDownloadQR = async () => {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    
    try {
      // Try to find the QR SVG element if not provided
      let svgToDownload = qrElement;
      
      if (!svgToDownload) {
        console.log("No QR element provided, searching in DOM...");
        // Try to find it in the DOM
        const qrContainer = document.querySelector('.qr-code-container');
        if (qrContainer) {
          svgToDownload = qrContainer.querySelector('svg') as SVGSVGElement;
        }
        
        // If still not found, try a broader search
        if (!svgToDownload) {
          svgToDownload = document.querySelector('svg') as SVGSVGElement;
        }
      }
      
      if (!svgToDownload) {
        toast.error("No se pudo encontrar el código QR");
        return;
      }

      const cardName = getCardName();
      const filename = `QR_${cardName.replace(/\s+/g, '_')}.png`;
      
      console.log("Downloading QR with element:", svgToDownload);
      await downloadQRAsPNG(svgToDownload, filename);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Error al descargar el código QR");
    } finally {
      setIsDownloading(false);
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
        disabled={isDownloading}
      >
        <Download className="h-4 w-4" />
        {isDownloading ? "Descargando..." : "Descargar código QR"}
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
