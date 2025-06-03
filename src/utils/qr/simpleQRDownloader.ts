
import { toast } from "sonner";

export const downloadQRAsPNG = async (svgElement: SVGSVGElement, filename: string) => {
  try {
    console.log("Starting QR download...");
    
    // Create a canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error("No se pudo crear el canvas");
    }
    
    // Set canvas size
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Convert SVG to string
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);
    
    // Add namespace if missing
    if (!svgString.includes('xmlns')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    // Create an image
    const img = new Image();
    
    return new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          // Draw the image on canvas
          ctx.drawImage(img, 0, 0, size, size);
          
          // Convert to blob and download
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("No se pudo crear el archivo"));
              return;
            }
            
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
            
            console.log("QR downloaded successfully");
            toast.success("Código QR descargado correctamente");
            resolve();
          }, 'image/png');
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error("Error al cargar la imagen"));
      };
      
      // Set image source
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    });
    
  } catch (error) {
    console.error("Error downloading QR:", error);
    toast.error("Error al descargar el código QR");
    throw error;
  }
};
