import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, ChevronUp, Copy, MoreHorizontal, User } from "lucide-react";
import { updateUserRole } from "@/utils/userRoleUtils";

export const UsersTable = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get users from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          updated_at
        `);
      
      if (error) throw error;
      
      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;
      
      // Combine data
      const usersWithRoles = data.map(user => {
        const userRoles = rolesData.filter(role => role.user_id === user.id);
        const roleName = userRoles.length > 0 ? userRoles[0].role : 'user';
        return {
          ...user,
          role: roleName as UserRole
        };
      });
      
      setUsers(usersWithRoles);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message);
      toast({
        title: "Error al cargar usuarios",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole, () => {
        toast({
          title: "Rol actualizado",
          description: `Rol de usuario actualizado a ${newRole}`,
        });
        fetchUsers(); // Recargar usuarios para reflejar el cambio
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

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name || "Sin nombre"}</TableCell>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Seleccionar rol</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'superadmin')}>
                      Superadmin
                      {user.role === 'superadmin' && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'admin')}>
                      Admin
                      {user.role === 'admin' && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'user')}>
                      Usuario
                      {user.role === 'user' && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
