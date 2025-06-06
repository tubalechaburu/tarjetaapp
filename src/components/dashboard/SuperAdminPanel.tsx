
import { BusinessCard } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteCard } from "@/utils/storage";
import { toast } from "sonner";

interface SuperAdminPanelProps {
  cards: BusinessCard[];
  onCardDeleted: (cardId: string) => void;
}

export const SuperAdminPanel = ({ cards, onCardDeleted }: SuperAdminPanelProps) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleDeleteCard = async (card: BusinessCard) => {
    if (confirm("¿Eliminar esta tarjeta?")) {
      try {
        await deleteCard(card.id!);
        onCardDeleted(card.id!);
        toast.success("Tarjeta eliminada");
      } catch (error) {
        toast.error("Error al eliminar la tarjeta");
      }
    }
  };

  const handleEditCard = (card: BusinessCard) => {
    // Set flag to return to admin panel after editing
    sessionStorage.setItem('returnToAdmin', 'true');
    navigate(`/edit/${card.id}`);
  };

  if (cards.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Panel de Administración (Superadmin)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12">
                  {card.avatarUrl ? (
                    <AvatarImage src={card.avatarUrl} alt={card.name} />
                  ) : (
                    <AvatarFallback>
                      {getInitials(card.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{card.name}</p>
                  <p className="text-sm text-muted-foreground">{card.email}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/card/${card.id}`)}
                >
                  Ver tarjeta
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditCard(card)}
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteCard(card)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
