
import { useState } from "react";
import { UserRole } from "@/types";
import { UserWithCards } from "@/types/admin";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateUserRole } from "@/utils/userRoleUtils";
import { useToast } from "@/components/ui/use-toast";
import { UserCardsList } from "./UserCardsList";

interface SuperAdminUserRowProps {
  user: UserWithCards;
  onUserUpdated: () => void;
}

export const SuperAdminUserRow = ({ user, onUserUpdated }: SuperAdminUserRowProps) => {
  const { toast } = useToast();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const handleRoleUpdate = async (userId: string, newRole: 'user' | 'superadmin', userName: string) => {
    try {
      await updateUserRole(userId, newRole, () => {
        toast({
          title: "Rol actualizado",
          description: `Rol de ${userName} actualizado a ${newRole}`,
        });
        onUserUpdated();
      }, (error: any) => {
        toast({
          title: "Error al actualizar el rol",
          description: error.message,
          variant: "destructive"
        });
      });
    } catch (error: any) {
      console.error("Error updating user role:", error);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      <TableRow key={user.id}>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">{user.full_name || "Sin nombre"}</span>
            <span className="text-xs text-gray-500">{user.id}</span>
          </div>
        </TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          <Badge className={getRoleBadgeColor(user.role)}>
            {user.role}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {user.cards.length} tarjeta{user.cards.length !== 1 ? 's' : ''}
            </Badge>
            {user.cards.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                className="gap-1"
              >
                {expandedUser === user.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex gap-1 justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Cambiar rol
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Seleccionar rol</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => handleRoleUpdate(user.id, 'user', user.full_name || user.email)}
                  disabled={user.role === 'user'}
                >
                  Usuario {user.role === 'user' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleRoleUpdate(user.id, 'superadmin', user.full_name || user.email)}
                  disabled={user.role === 'superadmin'}
                >
                  Superadmin {user.role === 'superadmin' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
      
      {/* Expanded row for user cards */}
      {expandedUser === user.id && user.cards.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} className="bg-muted/30 p-4">
            <UserCardsList 
              cards={user.cards}
              userName={user.full_name || user.email}
              onCardDeleted={onUserUpdated}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
