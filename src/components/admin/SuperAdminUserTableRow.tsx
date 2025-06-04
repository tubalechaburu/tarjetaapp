
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserWithCards } from "@/types/admin";

interface SuperAdminUserTableRowProps {
  user: UserWithCards;
  isExpanded: boolean;
  onToggleExpansion: (userId: string) => void;
  onRoleUpdate: (userId: string, newRole: 'user' | 'superadmin', userName: string) => void;
}

export const SuperAdminUserTableRow = ({
  user,
  isExpanded,
  onToggleExpansion,
  onRoleUpdate
}: SuperAdminUserTableRowProps) => {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleToggleExpansion = () => {
    console.log("🔄 SuperAdminUserTableRow - Toggle clicked for user:", user.id);
    onToggleExpansion(user.id);
  };

  const openCardInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpansion}
            className="p-1 h-8 w-8 hover:bg-gray-100 flex items-center justify-center shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <span className="font-medium">{user.full_name || "Sin nombre"}</span>
        </div>
      </TableCell>
      <TableCell className="text-gray-600">{user.email}</TableCell>
      <TableCell>
        <Badge className={getRoleBadgeColor(user.role)}>
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>
        {user.cards.length > 0 ? (
          <span className="text-green-600 font-medium">Sí ({user.cards[0].name})</span>
        ) : (
          <span className="text-gray-500">No</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-1 justify-end">
          {user.cards.length > 0 && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                onClick={() => openCardInNewTab(`/card/${user.cards[0].id}`)}
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                onClick={() => openCardInNewTab(`/edit/${user.cards[0].id}`)}
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button variant="ghost" size="sm" className="gap-1 text-red-600">
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Cambiar rol
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Seleccionar rol</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => onRoleUpdate(user.id, 'user', user.full_name || user.email)}
                disabled={user.role === 'user'}
              >
                Usuario {user.role === 'user' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onRoleUpdate(user.id, 'superadmin', user.full_name || user.email)}
                disabled={user.role === 'superadmin'}
              >
                Superadmin {user.role === 'superadmin' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
