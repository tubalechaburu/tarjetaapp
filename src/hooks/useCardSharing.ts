
import { useState } from "react";
import { toast } from "sonner";
import { BusinessCard } from "@/types";
import { saveCardSupabase } from "@/utils/supabase/cardOperations";

export const useCardSharing = (card: BusinessCard | null, shareUrl: string) => {
  const [isSharing, setIsSharing] = useState(false);

  const shareCard = async () => {
    if (!card || isSharing) return;
    
    setIsSharing(true);
    
    try {
      console.log("🔄 Preparando tarjeta para compartir...");
      console.log("🔗 URL a compartir:", shareUrl);
      
      // Asegurar que la tarjeta existe en Supabase antes de compartir
      const saved = await saveCardSupabase(card);
      
      if (!saved) {
        toast.error("Error: No se pudo sincronizar la tarjeta con la base de datos. Verifica tu conexión a internet.");
        return;
      }
      
      console.log("✅ Tarjeta confirmada en Supabase, procediendo a compartir");
      
      if (navigator.share) {
        console.log("📱 Usando API nativa de compartir");
        await navigator.share({
          title: `Tarjeta de ${card?.name}`,
          text: `Información de contacto de ${card?.name} - ${card?.jobTitle} en ${card?.company}`,
          url: shareUrl
        });
        toast.success("Tarjeta compartida correctamente");
      } else {
        console.log("📋 Copiando enlace al portapapeles");
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Enlace copiado - La tarjeta está lista para compartir");
      }
    } catch (error) {
      console.error("💥 Error sharing:", error);
      toast.error("No se pudo compartir la tarjeta. Inténtalo de nuevo.");
    } finally {
      setIsSharing(false);
    }
  };

  return { shareCard, isSharing };
};

export default useCardSharing;
