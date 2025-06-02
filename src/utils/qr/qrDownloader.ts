
import { toast } from "sonner";
import { processSvgForDownload, svgToPngBlob } from "./imageProcessor";

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
    
    // Process the SVG for download
    const processedSvg = processSvgForDownload(svgElement, 512);
    
    // Convert to PNG blob
    const blob = await svgToPngBlob(processedSvg, 512);
    
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
    
  } catch (error) {
    console.error("Error downloading QR code:", error);
    toast.error("Error al descargar el código QR");
    throw error;
  }
};
