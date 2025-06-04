
import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { useUsersWithCards } from "@/hooks/useUsersWithCards";
import { SuperAdminUserTableRow } from "./SuperAdminUserTableRow";
import { SuperAdminUserExpandedRow } from "./SuperAdminUserExpandedRow";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const SuperAdminUsersTable = () => {
  const { users, loading, error, refetch } = useUsersWithCards();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set());

  const handleToggleExpansion = (userId: string) => {
    console.log("🔄 SuperAdminUsersTable - Toggle expansion for user:", userId);
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
        console.log("🔄 SuperAdminUsersTable - Collapsing user:", userId);
      } else {
        newSet.add(userId);
        console.log("🔄 SuperAdminUsersTable - Expanding user:", userId);
      }
      return newSet;
    });
  };

  const handleRoleUpdate = async (userId: string, newRole: 'user' | 'superadmin', userName: string) => {
    try {
      // Check if user role record exists
      const { data: existingRole, error: fetchError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingRole) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Insert new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: userId, 
            role: newRole 
          });

        if (insertError) {
          throw insertError;
        }
      }

      toast.success(`Rol de ${userName} actualizado a ${newRole}`);
      refetch();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(`Error al actualizar el rol: ${error.message}`);
    }
  };

  const handleUserDeleted = async (userId: string) => {
    if (deletingUsers.has(userId)) return;
    
    setDeletingUsers(prev => new Set(prev).add(userId));

    try {
      // First delete all user's cards
      const { error: cardsError } = await supabase
        .from('cards')
        .delete()
        .eq('user_id', userId);

      if (cardsError) {
        throw new Error(`Error al eliminar tarjetas: ${cardsError.message}`);
      }

      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) {
        console.warn('Error deleting user role:', roleError);
      }

      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        throw new Error(`Error al eliminar perfil: ${profileError.message}`);
      }

      // Finally delete the user from auth (this requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.warn('Error deleting auth user (may require additional permissions):', authError);
        // Don't throw here as the main data is already deleted
      }

      toast.success("Usuario eliminado correctamente");
      refetch();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Error al eliminar usuario: ${error.message}`);
    } finally {
      setDeletingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const exportAllUsers = () => {
    const exportData = users.map(user => ({
      name: user.full_name || 'Sin nombre',
      email: user.email,
      role: user.role,
      cards_count: user.cards.length,
      updated_at: user.updated_at
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'usuarios_completo.json';
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
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Usuarios registrados ({users.length})</h3>
        <div className="flex gap-2">
          <Button onClick={exportAllUsers} variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={refetch} variant="outline" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Tarjetas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <React.Fragment key={user.id}>
              <SuperAdminUserTableRow
                user={user}
                isExpanded={expandedUsers.has(user.id)}
                onToggleExpansion={handleToggleExpansion}
                onRoleUpdate={handleRoleUpdate}
              />
              {expandedUsers.has(user.id) && (
                <SuperAdminUserExpandedRow
                  user={user}
                  onUserDeleted={handleUserDeleted}
                />
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
