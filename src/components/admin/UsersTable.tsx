
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Check, ChevronDown, ChevronUp, Copy, MoreHorizontal, User, Download, ExternalLink } from "lucide-react";
import { updateUserRole } from "@/utils/userRoleUtils";
import { UserCardsSection } from "@/components/admin/UserCardsSection";
import { Link } from "react-router-dom";

// Define the allowed roles based on the database schema
type DatabaseRole = 'user' | 'superadmin';

interface UserWithRole {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
  updated_at: string | null;
  role: DatabaseRole;
}

export const UsersTable = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the secure RLS-protected query instead of manual role checking
      // If user is not superadmin, this query will return no results due to RLS
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          updated_at
        `);
      
      if (profilesError) {
        if (profilesError.message?.includes('permission denied') || profilesError.code === 'PGRST116') {
          throw new Error("No tienes permisos para acceder a esta información");
        }
        throw profilesError;
      }
      
      // Get user roles separately (also RLS-protected)
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) {
        console.error("Error loading roles:", rolesError);
        // Continue without roles if there's an error
      }
      
      // Combine profiles with roles
      const usersWithRoles = profilesData?.map(profile => {
        const userRole = rolesData?.find(role => role.user_id === profile.id);
        return {
          ...profile,
          role: (userRole?.role as DatabaseRole) || 'user',
          created_at: profile.updated_at // Use updated_at as fallback for created_at
        };
      }) || [];
      
      setUsers(usersWithRoles);
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

  const handleRoleUpdate = async (userId: string, newRole: DatabaseRole) => {
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

  const exportAllUsers = () => {
    const exportData = users.map(user => ({
      name: user.full_name || 'Sin nombre',
      email: user.email,
      role: user.role,
      updated_at: user.updated_at
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'todos_los_usuarios.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex justify-center p-4">Cargando usuarios...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Button onClick={fetchUsers} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Usuarios registrados ({users.length})</h3>
        <Button onClick={exportAllUsers} variant="outline" className="gap-1">
          <Download className="h-4 w-4" />
          Exportar todos
        </Button>
      </div>
      
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
            <>
              <TableRow key={user.id}>
                <TableCell>{user.full_name || "Sin nombre"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
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
                      Ver tarjetas
                    </Button>
                    
                    <Link to={`/profile`} target="_blank">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <User className="h-4 w-4" />
                        Perfil
                      </Button>
                    </Link>

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
                        <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'user')}>
                          Usuario
                          {user.role === 'user' && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
              {expandedUser === user.id && (
                <TableRow>
                  <TableCell colSpan={4} className="bg-muted/30">
                    <UserCardsSection userId={user.id} userEmail={user.email || ''} />
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
