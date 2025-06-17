
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { BusinessCard } from "@/types";
import { deleteCard } from "@/utils/storage/storageOperations";
import { ensureCardInSupabase } from "@/utils/storage/storageOperations";

interface CardActionsProps {
  card: BusinessCard;
  isOwner: boolean;
  shareUrl: string;
  onDelete?: () => void;
}

const CardActions: React.FC<CardActionsProps> = ({ 
  card, 
  isOwner, 
  shareUrl,
  onDelete 
}) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (card.id && confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      try {
        await deleteCard(card.id);
        toast.success("Tarjeta eliminada");
        if (onDelete) {
          onDelete();
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error al eliminar la tarjeta:", error);
        toast.error("Error al eliminar la tarjeta");
      }
    }
  };

  const handleEdit = () => {
    if (card.id) {
      navigate(`/edit/${card.id}`);
    }
  };

  const shareCard = async () => {
    try {
      console.log("🔄 Preparando tarjeta para compartir...");
      
      // Usar la nueva función para asegurar que esté en Supabase
      const isInSupabase = await ensureCardInSupabase(card);
      
      if (!isInSupabase) {
        toast.error("Error: No se pudo preparar la tarjeta para compartir. Verifica tu conexión a internet.");
        return;
      }
      
      console.log("✅ Tarjeta confirmada en la base de datos, procediendo a compartir");
      
      if (navigator.share) {
        await navigator.share({
          title: `Tarjeta de ${card?.name}`,
          text: `Información de contacto de ${card?.name} - ${card?.jobTitle} en ${card?.company}`,
          url: shareUrl
        });
        toast.success("Tarjeta compartida correctamente");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Enlace copiado al portapapeles - La tarjeta está lista para compartir");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("No se pudo compartir la tarjeta. Inténtalo de nuevo.");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tarjeta de {card?.name}</h1>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={shareCard} className="gap-1">
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
      </div>
    </>
  );
};

export default CardActions;
