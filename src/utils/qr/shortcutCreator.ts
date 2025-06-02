
import { toast } from "sonner";

/**
 * Detects the current platform
 */
const detectPlatform = () => {
  const userAgent = navigator.userAgent;
  return {
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isWindows: userAgent.indexOf('Windows') !== -1,
    hasWebShare: !!navigator.share
  };
};

/**
 * Creates a Windows .url shortcut file content
 */
const createWindowsShortcut = (url: string): string => {
  return `[InternetShortcut]\nURL=${url}`;
};

/**
 * Creates a macOS .webloc shortcut file content
 */
const createMacShortcut = (url: string): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>URL</key>
  <string>${url}</string>
</dict>
</plist>`;
};

/**
 * Downloads a blob as a file
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const fileUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = fileUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(fileUrl);
};

/**
 * Handles mobile sharing using Web Share API or fallback
 */
const handleMobileShare = async (url: string, cardName: string, hasWebShare: boolean): Promise<void> => {
  if (hasWebShare) {
    try {
      await navigator.share({
        title: `Tarjeta virtual ${cardName}`,
        url: url
      });
      toast.success("Enlace compartido");
    } catch (err) {
      console.error("Error sharing:", err);
      toast.error("Error al compartir");
    }
  } else {
    // Fallback for mobile devices without Web Share API
    window.open(url, '_blank');
    toast.success("Enlace abierto en nueva pestaña");
  }
};

/**
 * Handles desktop shortcut creation
 */
const handleDesktopShortcut = (url: string, cardName: string, isWindows: boolean): void => {
  let shortcutContent: string;
  let filename: string;
  let mimeType: string;
  
  if (isWindows) {
    shortcutContent = createWindowsShortcut(url);
    filename = `Tarjeta_virtual_${cardName}.url`;
    mimeType = 'application/x-url';
  } else {
    shortcutContent = createMacShortcut(url);
    filename = `Tarjeta_virtual_${cardName}.webloc`;
    mimeType = 'application/xml';
  }
  
  const blob = new Blob([shortcutContent], { type: mimeType });
  downloadBlob(blob, filename);
  toast.success("Acceso directo descargado");
};

/**
 * Creates and downloads a shortcut file for the given URL
 */
export const createAndDownloadShortcut = async (url: string, cardName: string): Promise<void> => {
  try {
    const { isMobile, isWindows, hasWebShare } = detectPlatform();
    
    if (isMobile) {
      await handleMobileShare(url, cardName, hasWebShare);
    } else {
      handleDesktopShortcut(url, cardName, isWindows);
    }
  } catch (error) {
    console.error("Error creating shortcut:", error);
    toast.error("Error al crear el acceso directo");
  }
};
