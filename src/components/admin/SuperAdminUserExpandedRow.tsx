import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, UserX, Loader2 } from "lucide-react";
import { UserWithCards } from "@/types/admin";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SuperAdminUserExpandedRowProps {
  user: UserWithCards;
  onUserDeleted?: (userId: string) => void;
}

export const SuperAdminUserExpandedRow = ({ user, onUserDeleted }: SuperAdminUserExpandedRowProps) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const navigateToCard = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Store the current admin route to return to it later
    sessionStorage.setItem('returnToAdmin', 'true');
    navigate(url);
  };

  const handleDeleteUser = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmMessage = `¿Estás seguro de que quieres eliminar al usuario ${user.full_name || user.email}? Esta acción eliminará el usuario y todas sus tarjetas de forma permanente.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);

    try {
      console.log("Iniciando eliminación del usuario:", user.id);
      
      // 1. Eliminar todas las tarjetas del usuario
      const { error: cardsError } = await supabase
        .from('cards')
        .delete()
        .eq('user_id', user.id);

      if (cardsError) {
        throw new Error(`Error al eliminar tarjetas: ${cardsError.message}`);
      }
      console.log("✅ Tarjetas eliminadas");

      // 2. Eliminar roles del usuario
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (roleError) {
        console.warn('Error eliminando roles del usuario:', roleError);
        // No fallar aquí, continuar con la eliminación
      } else {
        console.log("✅ Roles eliminados");
      }

      // 3. Eliminar perfil del usuario
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        throw new Error(`Error al eliminar perfil: ${profileError.message}`);
      }
      console.log("✅ Perfil eliminado");

      // 4. Intentar eliminar el usuario de Auth (requiere permisos de admin)
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
        if (authError) {
          console.warn('Error eliminando usuario de Auth (puede requerir permisos adicionales):', authError);
          // No fallar aquí ya que los datos principales han sido eliminados
        } else {
          console.log("✅ Usuario eliminado de Auth");
        }
      } catch (authError) {
        console.warn('No se pudo eliminar el usuario de Auth:', authError);
      }

      toast.success(`Usuario ${user.full_name || user.email} eliminado correctamente`);
      
      // Notificar al componente padre para actualizar la lista
      if (onUserDeleted) {
        onUserDeleted(user.id);
      }

    } catch (error: any) {
      console.error('Error eliminando usuario:', error);
      toast.error(`Error al eliminar usuario: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow className="bg-muted/30">
      <TableCell colSpan={5} className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-lg">Información del usuario</h4>
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-2"
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserX className="h-4 w-4" />
              )}
              {isDeleting ? 'Eliminando...' : 'Eliminar Usuario'}
            </Button>
          </div>
          
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
