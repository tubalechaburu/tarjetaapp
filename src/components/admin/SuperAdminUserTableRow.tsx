
import React, { useState } from "react";
import { BusinessCard } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { deleteCard } from "@/utils/storage";
import { toast } from "sonner";
import { EditUserCardForm } from "./EditUserCardForm";

interface SuperAdminUserTableRowProps {
  card: BusinessCard;
  onCardDeleted: (cardId: string) => void;
}

export const SuperAdminUserTableRow: React.FC<SuperAdminUserTableRowProps> = ({
  card,
  onCardDeleted,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (card.id && confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      try {
        await deleteCard(card.id);
        onCardDeleted(card.id);
        toast.success("Tarjeta eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar la tarjeta:", error);
        toast.error("Error al eliminar la tarjeta");
      }
    }
  };

  const handleEdit = () => {
    // Set a flag to indicate we came from admin panel
    sessionStorage.setItem('returnToAdmin', 'true');
    navigate(`/edit/${card.id}`);
  };

  const handleCardSaved = () => {
    setShowEditForm(false);
    toast.success("Tarjeta actualizada correctamente");
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {card.avatarUrl && (
                <img 
                  src={card.avatarUrl} 
                  alt={card.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold">{card.name}</h3>
                <p className="text-sm text-gray-600">{card.email}</p>
                <p className="text-sm text-gray-500">
                  {card.company} {card.jobTitle && `- ${card.jobTitle}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link to={`/card/${card.id}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {showDetails && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Teléfono:</strong> {card.phone || 'No especificado'}
                </div>
                <div>
                  <strong>Sitio web:</strong> {card.website || 'No especificado'}
                </div>
                <div>
                  <strong>Dirección:</strong> {card.address || 'No especificado'}
                </div>
                <div>
                  <strong>Creado:</strong> {new Date(card.createdAt).toLocaleDateString()}
                </div>
              </div>
              {card.description && (
                <div className="mt-2">
                  <strong>Descripción:</strong> {card.description}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showEditForm && (
        <EditUserCardForm
          cardId={card.id}
          onClose={() => setShowEditForm(false)}
          onSaved={handleCardSaved}
        />
      )}
    </>
  );
};
