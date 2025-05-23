
import { toast } from "sonner";

/**
 * Downloads an SVG element as a PNG image
 */
export const downloadSvgAsPng = async (
  svgElement: SVGSVGElement | null,
  size: number,
  filename: string
): Promise<void> => {
  if (!svgElement) {
    toast.error("Error al generar el código QR");
    return;
  }
  
  try {
    console.log("Iniciando descarga del QR code...");
    // Create a canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast.error("No se pudo crear el lienzo");
      return;
    }
    
    // Set canvas dimensions with better resolution
    const scale = 2;
    canvas.width = size * scale;
    canvas.height = size * scale;
    
    // Convert SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    console.log("SVG serializado correctamente");
    
    // Create data URL from SVG
    const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    
    // Create a new image and draw to canvas when loaded
    const img = new Image();
    
    // Create a promise to handle the image loading
    return new Promise((resolve, reject) => {
      img.onload = () => {
        console.log("Imagen cargada en canvas");
        // Scale the context for better resolution
        ctx.scale(scale, scale);
        
        // Clear canvas with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        // Draw the image
        ctx.drawImage(img, 0, 0, size, size);
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.download = filename;
            a.href = downloadUrl;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
            console.log("QR descargado correctamente");
            toast.success("Código QR descargado correctamente");
            resolve();
          } else {
            console.error("Error al crear blob");
            toast.error("Error al crear la imagen");
            reject(new Error("Failed to create blob"));
          }
        }, 'image/png');
      };
      
      img.onerror = (e) => {
        console.error("Error al cargar la imagen:", e);
        toast.error("Error al procesar el código QR");
        reject(new Error("Failed to load image"));
      };
      
      img.src = svgDataUrl;
    });
  } catch (error) {
    console.error("Error downloading QR code:", error);
    toast.error("Error al descargar el código QR");
  }
};

/**
 * Creates and downloads a shortcut file for the given URL
 */
export const createAndDownloadShortcut = (url: string, cardName: string): void => {
  try {
    // Check if it's a mobile device
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Mobile device: use Web Share API
      if (navigator.share) {
        navigator.share({
          title: `Tarjeta virtual ${cardName}`,
          url: url
        }).then(() => {
          toast.success("Enlace compartido");
        }).catch((err) => {
          console.error("Error sharing:", err);
          toast.error("Error al compartir");
        });
      } else {
        // Fallback for mobile devices without Web Share API
        window.open(url, '_blank');
        toast.success("Enlace abierto en nueva pestaña");
      }
    } else {
      // Desktop: create and download .url file
      let shortcutContent = '';
      
      // Check if it's Windows or other platform
      const isWindows = navigator.userAgent.indexOf('Windows') !== -1;
      
      if (isWindows) {
        // Windows .url format
        shortcutContent = `[InternetShortcut]\nURL=${url}`;
        const blob = new Blob([shortcutContent], { type: 'application/x-url' });
        const fileUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = `Tarjeta_virtual_${cardName}.url`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(fileUrl);
      } else {
        // macOS .webloc format
        shortcutContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>URL</key>
  <string>${url}</string>
</dict>
</plist>`;
        const blob = new Blob([shortcutContent], { type: 'application/xml' });
        const fileUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = `Tarjeta_virtual_${cardName}.webloc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(fileUrl);
      }
      
      toast.success("Acceso directo descargado");
    }
  } catch (error) {
    console.error("Error creating shortcut:", error);
    toast.error("Error al crear el acceso directo");
  }
};
