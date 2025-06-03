
import React from "react";
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
  // Get card name from the document or URL
  const getCardName = () => {
    return document.querySelector('h1')?.textContent?.replace('Tarjeta de ', '') || 'Contacto';
  };

  const handleDownloadQR = async () => {
    console.log("QRCodeActions: Download button clicked");
    console.log("QRCodeActions: QR ref available:", !!qrRef.current);
    
    if (!qrRef.current) {
      toast.error("Error: El código QR no está disponible. Espera un momento e inténtalo de nuevo.");
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
        disabled={!qrRef.current}
      >
        <Download className="h-4 w-4" />
        Descargar código QR
        {!qrRef.current && <span className="text-xs opacity-75">(Cargando...)</span>}
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
