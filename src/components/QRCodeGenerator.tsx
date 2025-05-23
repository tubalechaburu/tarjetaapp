
import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { ensureAbsoluteUrl } from "@/utils/qrUtils";
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
  
  const downloadQRCode = () => {
    if (!qrRef.current) {
      toast.error("Error al generar el código QR");
      return;
    }
    
    try {
      // Get card name from the document or URL
      const cardName = document.querySelector('h1')?.textContent?.replace('Tarjeta de ', '') || 'Contacto';
      
      // Create a canvas to convert SVG to PNG
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        toast.error("Error al crear el código QR");
        return;
      }
      
      canvas.width = size;
      canvas.height = size;
      
      // Create an image from the SVG
      const svgData = new XMLSerializer().serializeToString(qrRef.current);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      
      img.onload = () => {
        // Fill canvas with white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the SVG image
        ctx.drawImage(img, 0, 0, size, size);
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `QR Tarjeta virtual ${cardName}.png`;
            link.href = downloadUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
            toast.success("Código QR descargado correctamente");
          }
        }, "image/png");
        
        // Clean up
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        console.error("Error loading SVG image");
        toast.error("Error al generar el código QR");
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
      
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Error al descargar el código QR");
    }
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

  const downloadShortcut = () => {
    try {
      // Get card name
      const cardName = document.querySelector('h1')?.textContent?.replace('Tarjeta de ', '') || 'Contacto';
      
      // Create desktop shortcut content based on platform
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Mobile device: use Web Share API
        if (navigator.share) {
          navigator.share({
            title: `Tarjeta virtual ${cardName}`,
            url: fullUrl
          }).then(() => {
            toast.success("Enlace compartido");
          }).catch((err) => {
            console.error("Error sharing:", err);
            toast.error("Error al compartir");
          });
        } else {
          // Fallback for mobile devices without Web Share API
          window.open(fullUrl, '_blank');
          toast.success("Enlace abierto en nueva pestaña");
        }
      } else {
        // Desktop: create and download .url file
        let shortcutContent = '';
        
        // Check if it's Windows or other platform
        const isWindows = navigator.userAgent.indexOf('Windows') !== -1;
        
        if (isWindows) {
          // Windows .url format
          shortcutContent = `[InternetShortcut]\nURL=${fullUrl}`;
          const blob = new Blob([shortcutContent], { type: 'application/x-url' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Tarjeta virtual ${cardName}.url`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          // macOS .webloc format
          shortcutContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>URL</key>
  <string>${fullUrl}</string>
</dict>
</plist>`;
          const blob = new Blob([shortcutContent], { type: 'application/xml' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Tarjeta virtual ${cardName}.webloc`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
        
        toast.success("Acceso directo descargado");
      }
    } catch (error) {
      console.error("Error creating shortcut:", error);
      toast.error("Error al crear el acceso directo");
    }
  };
  
  return (
    <Card className="flex flex-col items-center p-4 bg-white">
      <CardContent className="pt-4 flex flex-col items-center space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Comparte tu tarjeta digital escaneando este código QR
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 qr-code-container">
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
              onClick={downloadShortcut} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Acceso directo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
