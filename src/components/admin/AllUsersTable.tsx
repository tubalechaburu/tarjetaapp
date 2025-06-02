
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
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { UserCardsSection } from "@/components/admin/UserCardsSection";

// Define the allowed roles based on the database schema
type DatabaseRole = 'user' | 'superadmin';

export const AllUsersTable = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if current user is superadmin
      const { data: isSuperAdmin, error: roleError } = await supabase
        .rpc('is_current_user_superadmin');
      
      if (roleError) {
        console.error("Error checking superadmin status:", roleError);
        throw new Error("No tienes permisos para acceder a esta información");
      }
      
      if (!isSuperAdmin) {
        throw new Error("Solo los superadministradores pueden ver todos los usuarios");
      }
      
      // Get users from profiles table with all needed fields
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
      
      // Map the data to include a display name
      const usersWithData = data?.map(user => ({
        ...user,
        full_name: user.email?.split('@')[0] || 'Usuario', // Use email prefix as name fallback
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
