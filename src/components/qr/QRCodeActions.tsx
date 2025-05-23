
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { downloadSvgAsPng, createAndDownloadShortcut } from "@/utils/qrDownloader";

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
    const cardName = getCardName();
    await downloadSvgAsPng(qrRef.current, size, `QR_${cardName.replace(/\s+/g, '_')}.png`);
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
      >
        <Download className="h-4 w-4" />
        Descargar código QR
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
