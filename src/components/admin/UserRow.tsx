import { useState } from "react";
import { UserRole } from "@/types";
import { updateUserRole } from "@/utils/userRoleUtils";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import { UserCardsSection } from "@/components/admin/UserCardsSection";

interface UserRowProps {
  user: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    updated_at?: string;
    role: UserRole;
  };
  onRefresh: () => void;
}

export const UserRow = ({ user, onRefresh }: UserRowProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCards, setShowCards] = useState(false);
  
  const handleRoleChange = async (newRole: UserRole) => {
    try {
      setIsUpdating(true);
      await updateUserRole(
        user.id, 
        newRole,
        () => {
          toast.success(`Rol actualizado a ${newRole}`);
          onRefresh();
        },
        (error) => {
          toast.error(`Error al actualizar rol: ${error.message}`);
        }
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <TableRow key={user.id}>
        <TableCell>{user.full_name || 'Sin nombre'}</TableCell>
        <TableCell>{user.id}</TableCell>
        <TableCell>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isUpdating}
              >
                {user.role || 'user'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="grid gap-2">
                <h4 className="font-medium leading-none mb-2">Cambiar rol</h4>
                <Button 
                  variant={user.role === 'user' ? 'default' : 'outline'} 
                  size="sm" 
                  className="justify-start"
                  onClick={() => handleRoleChange('user')}
                  disabled={isUpdating}
                >
                  Usuario
                </Button>
                <Button 
                  variant={user.role === 'admin' ? 'default' : 'outline'} 
                  size="sm" 
                  className="justify-start"
                  onClick={() => handleRoleChange('admin')}
                  disabled={isUpdating}
                >
                  Administrador
                </Button>
                <Button 
                  variant={user.role === 'superadmin' ? 'default' : 'outline'} 
                  size="sm" 
                  className="justify-start"
                  onClick={() => handleRoleChange('superadmin')}
                  disabled={isUpdating}
                >
                  Superadmin
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </TableCell>
        <TableCell>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowCards(!showCards)}
            className="gap-1"
          >
            {showCards ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Tarjetas
          </Button>
        </TableCell>
      </TableRow>
      {showCards && (
        <TableRow>
          <TableCell colSpan={4} className="bg-muted/30 p-0">
            <div className="p-4">
              <UserCardsSection userId={user.id} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
