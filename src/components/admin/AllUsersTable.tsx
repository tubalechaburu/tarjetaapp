
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
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { UserCardsSection } from "@/components/admin/UserCardsSection";

export const AllUsersTable = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get users from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
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
        const userRoles = rolesData?.filter(role => role.user_id === user.id) || [];
        const roleName = userRoles.length > 0 ? userRoles[0].role : 'user';
        return {
          ...user,
          role: roleName as UserRole,
          email: user.email || user.id // Use profile email or fallback to ID
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
    return <div>Cargando usuarios...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Todos los usuarios ({users.length})</h3>
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
                </TableCell>
              </TableRow>
              {expandedUser === user.id && (
                <TableRow>
                  <TableCell colSpan={4} className="bg-muted/30">
                    <UserCardsSection userId={user.id} userEmail={user.email} />
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
