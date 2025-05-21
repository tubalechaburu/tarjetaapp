
/**
 * QR Code utility functions
 */

/**
 * Converts an SVG element to a downloadable PNG
 */
export const svgToPng = async (
  svg: SVGSVGElement,
  size: number,
  fileName: string
): Promise<void> => {
  if (!svg) return;
  
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  
  canvas.width = size;
  canvas.height = size;
  
  return new Promise((resolve) => {
    img.onload = () => {
      if (ctx) {
        // Create white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Convert to PNG and trigger download
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        
        downloadLink.download = fileName;
        downloadLink.href = pngFile;
        downloadLink.click();
        
        resolve();
      }
    };
    
    // Convert SVG to data URL for the image
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  });
};

/**
 * Ensures a URL is absolute with the current origin if not already
 */
export const ensureAbsoluteUrl = (url: string): string => {
  return url.startsWith('http') 
    ? url 
    : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
};
