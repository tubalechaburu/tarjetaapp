
import { BusinessCard } from "@/types";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteCard } from "@/utils/storage";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { EditUserCardForm } from "./EditUserCardForm";

interface UserCardsListProps {
  cards: BusinessCard[];
  userName: string;
  onCardDeleted: () => void;
}

export const UserCardsList = ({ cards, userName, onCardDeleted }: UserCardsListProps) => {
  const { toast } = useToast();
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const handleDeleteCard = async (cardId: string, cardName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la tarjeta "${cardName}"?`)) {
      try {
        await deleteCard(cardId);
        toast({
          title: "Tarjeta eliminada",
          description: `La tarjeta "${cardName}" ha sido eliminada correctamente`,
        });
        onCardDeleted();
      } catch (error: any) {
        console.error("Error deleting card:", error);
        toast({
          title: "Error al eliminar tarjeta",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  if (cards.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-3">
        No hay tarjetas disponibles
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <h4 className="font-medium">Tarjetas de {userName}</h4>
        <div className="grid gap-3">
          {cards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-3 bg-white rounded border">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{card.name}</p>
                    <p className="text-sm text-gray-600">
                      {card.company && `${card.company} • `}
                      {card.email}
                    </p>
                    {card.phone && (
                      <p className="text-sm text-gray-500">{card.phone}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Link to={`/card/${card.id}`} target="_blank">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ExternalLink className="h-4 w-4" />
                    Ver
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => setEditingCardId(card.id!)}
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteCard(card.id!, card.name)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingCardId && (
        <EditUserCardForm
          cardId={editingCardId}
          onClose={() => setEditingCardId(null)}
          onSaved={onCardDeleted}
        />
      )}
    </>
  );
};
