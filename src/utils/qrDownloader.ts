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
    console.error("No SVG element provided");
    toast.error("Error: No se puede acceder al código QR");
    return;
  }
  
  try {
    console.log("Iniciando descarga del QR code...");
    console.log("SVG element found:", !!svgElement);
    console.log("Size:", size, "Filename:", filename);
    
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Set explicit dimensions on the cloned SVG
    clonedSvg.setAttribute('width', size.toString());
    clonedSvg.setAttribute('height', size.toString());
    
    // Create a canvas with higher resolution
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast.error("No se pudo crear el lienzo");
      return;
    }
    
    // Set canvas dimensions with scale for better quality
    const scale = 2;
    canvas.width = size * scale;
    canvas.height = size * scale;
    
    // Scale the context
    ctx.scale(scale, scale);
    
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Convert SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    console.log("SVG serializado correctamente, length:", svgString.length);
    
    // Create a new image
    const img = new Image();
    img.width = size;
    img.height = size;
    
    // Create a DataURL for the SVG to avoid CORS issues
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    // Create a promise to handle the image loading
    return new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          console.log("Imagen cargada en canvas");
          
          // Draw the image to canvas
          ctx.drawImage(img, 0, 0, size, size);
          
          // Clean up object URL
          URL.revokeObjectURL(url);
          
          // Convert to PNG and download
          canvas.toBlob((blob) => {
            if (blob) {
              // Create download link
              const link = document.createElement('a');
              link.download = filename;
              link.href = URL.createObjectURL(blob);
              
              // Trigger download
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              // Clean up
              URL.revokeObjectURL(link.href);
              console.log("QR descargado correctamente");
              toast.success("Código QR descargado correctamente");
              resolve();
            } else {
              console.error("Error al crear blob");
              toast.error("Error al crear la imagen");
              reject(new Error("Failed to create blob"));
            }
          }, 'image/png', 1.0);
        } catch (error) {
          console.error("Error during canvas operations:", error);
          toast.error("Error al procesar el código QR");
          reject(error);
        }
      };
      
      img.onerror = (e) => {
        console.error("Error al cargar la imagen:", e);
        URL.revokeObjectURL(url);
        toast.error("Error al procesar el código QR");
        reject(new Error("Failed to load image"));
      };
      
      // Set source after defining handlers
      img.src = url;
    });
  } catch (error) {
    console.error("Error downloading QR code:", error);
    toast.error("Error al descargar el código QR");
    throw error;
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
