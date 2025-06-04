
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import { UserWithCards } from "@/types/admin";
import { useNavigate } from "react-router-dom";

interface SuperAdminUserExpandedRowProps {
  user: UserWithCards;
}

export const SuperAdminUserExpandedRow = ({ user }: SuperAdminUserExpandedRowProps) => {
  const navigate = useNavigate();

  const navigateToCard = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Store the current admin route to return to it later
    sessionStorage.setItem('returnToAdmin', 'true');
    navigate(url);
  };

  return (
    <TableRow className="bg-muted/30">
      <TableCell colSpan={5} className="p-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Información del usuario</h4>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <div><span className="font-medium">ID:</span> <span className="text-gray-600">{user.id}</span></div>
              <div><span className="font-medium">Email:</span> <span className="text-gray-600">{user.email}</span></div>
            </div>
            <div className="space-y-2">
              <div><span className="font-medium">Nombre completo:</span> <span className="text-gray-600">{user.full_name || 'No definido'}</span></div>
              <div><span className="font-medium">Última actualización:</span> <span className="text-gray-600">{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</span></div>
            </div>
          </div>
          
          {user.cards.length > 0 && (
            <div className="mt-6">
              <h5 className="font-semibold mb-3">Tarjetas del usuario ({user.cards.length})</h5>
              <div className="space-y-3">
                {user.cards.map((card) => (
                  <div key={card.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-semibold text-base">{card.name}</p>
                        <p className="text-sm text-gray-600">{card.jobTitle} {card.company && `en ${card.company}`}</p>
                        <p className="text-sm text-gray-500">{card.email}</p>
                        {card.phone && <p className="text-sm text-gray-500">{card.phone}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={(e) => navigateToCard(`/card/${card.id}`, e)}
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={(e) => navigateToCard(`/edit/${card.id}`, e)}
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {user.cards.length === 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-center">Este usuario no tiene tarjetas creadas.</p>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
