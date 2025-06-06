
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2, ChevronDown, ChevronUp, User } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { UserWithCards } from "@/types/admin";

interface SuperAdminUserTableRowProps {
  user: UserWithCards;
  isExpanded: boolean;
  onToggleExpansion: (userId: string) => void;
  onRoleUpdate: (userId: string, newRole: 'user' | 'superadmin', userName: string) => Promise<void>;
}

export const SuperAdminUserTableRow: React.FC<SuperAdminUserTableRowProps> = ({
  user,
  isExpanded,
  onToggleExpansion,
  onRoleUpdate,
}) => {
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const handleRoleToggle = async () => {
    setIsUpdatingRole(true);
    try {
      const newRole = user.role === 'superadmin' ? 'user' : 'superadmin';
      await onRoleUpdate(user.id, newRole, user.full_name || 'Usuario sin nombre');
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error al actualizar el rol");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'superadmin' ? 'text-red-600 font-semibold' : 'text-gray-600';
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <div className="text-sm font-medium">{user.full_name || 'Sin nombre'}</div>
            <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-sm">{user.email || 'Sin email'}</div>
      </TableCell>
      
      <TableCell>
        <div className={`text-sm ${getRoleColor(user.role)}`}>
          {user.role}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-sm">
          {user.cards.length} {user.cards.length === 1 ? 'tarjeta' : 'tarjetas'}
        </div>
      </TableCell>
      
      <TableCell className="text-right">
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRoleToggle}
            disabled={isUpdatingRole}
            className="text-xs"
          >
            {isUpdatingRole ? 'Actualizando...' : 
             user.role === 'superadmin' ? 'Quitar Admin' : 'Hacer Admin'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpansion(user.id)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
