
import { useState } from "react";
import { toast } from "sonner";
import { BusinessCard } from "@/types";

export const useCardSharing = (card: BusinessCard | null, shareUrl: string) => {
  const shareCard = async () => {
    try {
      if (!card) return;
      
      if (navigator.share) {
        await navigator.share({
          title: `Tarjeta de ${card?.name}`,
          text: `Información de contacto de ${card?.name} - ${card?.jobTitle} en ${card?.company}`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("URL copiada al portapapeles");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("No se pudo compartir la tarjeta");
    }
  };

  return { shareCard };
};

export default useCardSharing;
