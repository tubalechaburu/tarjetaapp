
import { toast } from "sonner";

/**
 * Processes SVG elements for QR code image generation
 */
export const processSvgForDownload = (
  svgElement: SVGSVGElement,
  size: number = 512
): SVGSVGElement => {
  // Find the actual QR code SVG - it might be nested
  let qrSvg = svgElement;
  
  // If the element has a nested SVG, use that instead
  const nestedSvg = svgElement.querySelector('svg');
  if (nestedSvg) {
    qrSvg = nestedSvg;
  }
  
  // Create a clean clone
  const clonedSvg = qrSvg.cloneNode(true) as SVGSVGElement;
  
  // Set fixed dimensions for a clean QR code
  clonedSvg.setAttribute('width', size.toString());
  clonedSvg.setAttribute('height', size.toString());
  
  // Ensure proper viewBox
  const existingViewBox = clonedSvg.getAttribute('viewBox');
  if (!existingViewBox) {
    clonedSvg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  }
  
  // Add white background as a rect element
  const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  backgroundRect.setAttribute('width', '100%');
  backgroundRect.setAttribute('height', '100%');
  backgroundRect.setAttribute('fill', '#ffffff');
  clonedSvg.insertBefore(backgroundRect, clonedSvg.firstChild);
  
  return clonedSvg;
};

/**
 * Converts an SVG element to a PNG blob
 */
export const svgToPngBlob = async (
  svgElement: SVGSVGElement,
  size: number = 512
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error("No se pudo crear el lienzo"));
      return;
    }
    
    canvas.width = size;
    canvas.height = size;
    
    // Fill canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Convert SVG to string
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);
    
    // Ensure proper namespace
    if (!svgString.includes('xmlns')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    // Create image and load SVG
    const img = new Image();
    
    img.onload = () => {
      try {
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, size, size);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        }, 'image/png', 1.0);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    
    // Create data URL from SVG
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    img.src = svgDataUrl;
  });
};
