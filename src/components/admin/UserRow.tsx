
import { UserRole } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Shield, UserCheck } from "lucide-react";
import { updateUserRole } from "@/utils/userRoleUtils";
import { useToast } from "@/components/ui/use-toast";

interface UserRowProps {
  user: {
    id: string;
    full_name?: string;
    updated_at?: string;
    role?: UserRole;
  };
  onRoleUpdate: () => void;
}

export const UserRow = ({ user, onRoleUpdate }: UserRowProps) => {
  const { toast } = useToast();

  const handleRoleUpdate = async (userId: string, role: UserRole) => {
    try {
      await updateUserRole(
        userId, 
        role,
        () => {
          toast({
            title: "Rol actualizado",
            description: `Usuario actualizado a ${role}`,
          });
          onRoleUpdate();
        },
        (error: any) => {
          toast({
            title: "Error al actualizar rol",
            description: error.message,
            variant: "destructive"
          });
        }
      );
    } catch (error) {
      console.error("Error in role update:", error);
    }
  };

  return (
    <TableRow key={user.id}>
      <TableCell className="font-mono text-xs">{user.id}</TableCell>
      <TableCell>{user.full_name || 'Sin nombre'}</TableCell>
      <TableCell>
        {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}
      </TableCell>
      <TableCell>
        <Badge variant={user.role === 'superadmin' ? 'destructive' : user.role === 'admin' ? 'default' : 'secondary'}>
          <Shield className="h-3 w-3 mr-1" />
          {user.role || 'user'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleRoleUpdate(user.id, 'admin')}
            disabled={user.role === 'admin'}
          >
            <UserCheck className="h-3.5 w-3.5 mr-1" />
            Admin
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleRoleUpdate(user.id, 'superadmin')}
            disabled={user.role === 'superadmin'}
          >
            <Shield className="h-3.5 w-3.5 mr-1" />
            SuperAdmin
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
