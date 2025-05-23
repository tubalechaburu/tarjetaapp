
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Copy } from "lucide-react";
import { toast } from "sonner";
import { BusinessCard } from "@/types";
import QRCodeDisplay from "@/components/qr/QRCodeDisplay";
import { downloadSvgAsPng, createAndDownloadShortcut } from "@/utils/qrDownloader";

interface QRCodeSectionProps {
  card: BusinessCard;
  fullShareUrl: string;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({ card, fullShareUrl }) => {
  const [qrRef, setQrRef] = useState<SVGSVGElement | null>(null);

  // Use useCallback to prevent the function from being recreated on every render
  const handleQRRef = useCallback((ref: SVGSVGElement | null) => {
    console.log("QRCodeSection: QR ref received:", !!ref);
    if (ref) {
      console.log("QRCodeSection: Setting QR reference");
      setQrRef(ref);
    }
  }, []);

  // Add a check to ensure the button is enabled when qrRef is available
  useEffect(() => {
    console.log("QRCodeSection: qrRef state changed:", !!qrRef);
  }, [qrRef]);

  const handleDownloadQR = async () => {
    console.log("QRCodeSection: Download button clicked");
    console.log("QRCodeSection: Card available:", !!card);
    console.log("QRCodeSection: QR ref available:", !!qrRef);
    
    if (!card) {
      toast.error("Error: No hay datos de la tarjeta");
      return;
    }
    
    if (!qrRef) {
      toast.error("Error: El código QR no está disponible. Espera un momento e inténtalo de nuevo.");
      console.error("QR reference not available");
      return;
    }
    
    console.log("Attempting to download QR code...");
    console.log("QR ref available:", !!qrRef);
    console.log("Card name:", card.name);
    
    const filename = `QR_${card.name.replace(/\s+/g, '_')}.png`;
    try {
      await downloadSvgAsPng(qrRef, 400, filename);
    } catch (error) {
      console.error("Error al descargar el QR:", error);
      toast.error("Error al descargar el código QR");
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      toast.success("URL copiada al portapapeles");
    } catch (error) {
      console.error("Error copying URL:", error);
      toast.error("No se pudo copiar la URL");
    }
  };

  const handleDownloadShortcut = () => {
    if (!card) return;
    createAndDownloadShortcut(fullShareUrl, card.name);
  };

  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <h3 className="text-lg font-medium mb-3 text-center">Código QR</h3>
      <div className="flex flex-col items-center space-y-4">
        <QRCodeDisplay 
          url={fullShareUrl} 
          size={200} 
          onSvgRef={handleQRRef} 
        />
        
        {/* QR and sharing actions */}
        <div className="flex flex-col w-full gap-2">
          <Button 
            onClick={handleDownloadQR} 
            variant="default" 
            className="flex items-center gap-2 w-full"
            disabled={!qrRef}
          >
            <Download className="h-4 w-4" />
            Descargar código QR
            {!qrRef && <span className="text-xs opacity-75">(Cargando...)</span>}
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
      </div>
    </div>
  );
};

export default QRCodeSection;
