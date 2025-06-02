
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { updateUserRole } from "@/utils/userRoleUtils";
import { UserTableHeader } from "@/components/admin/UserTableHeader";
import { UserTableRow } from "@/components/admin/UserTableRow";

type DatabaseRole = 'user' | 'superadmin';

interface User {
  id: string;
  full_name?: string;
  email: string;
  role: DatabaseRole;
  created_at: string;
  updated_at: string;
}

export const UserTableContainer = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: isSuperAdmin, error: roleError } = await supabase
        .rpc('is_current_user_superadmin');
      
      if (roleError) {
        console.error("Error checking superadmin status:", roleError);
        throw new Error("No tienes permisos para acceder a esta información");
      }
      
      if (!isSuperAdmin) {
        throw new Error("Solo los superadministradores pueden ver todos los usuarios");
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          role,
          created_at,
          updated_at
        `);
      
      if (error) throw error;
      
      const usersWithData = data?.map(user => ({
        ...user,
        full_name: user.email?.split('@')[0] || 'Usuario',
        role: user.role as DatabaseRole
      })) || [];
      
      setUsers(usersWithData);
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
        fetchUsers();
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
      <UserTableHeader 
        userCount={users.length}
        onExportAll={exportAllUsers}
      />
      
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
            <UserTableRow
              key={user.id}
              user={user}
              onRoleUpdate={handleRoleUpdate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
