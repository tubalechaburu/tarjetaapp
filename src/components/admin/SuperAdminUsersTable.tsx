
import React, { useState } from "react";
import { useUsersWithCards } from "@/hooks/useUsersWithCards";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { updateUserRole } from "@/utils/userRoleUtils";
import { useToast } from "@/components/ui/use-toast";
import { SuperAdminUserTableRow } from "./SuperAdminUserTableRow";
import { SuperAdminUserExpandedRow } from "./SuperAdminUserExpandedRow";

export const SuperAdminUsersTable = () => {
  const { users, loading, error, refetch } = useUsersWithCards();
  const { toast } = useToast();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const handleRoleUpdate = async (userId: string, newRole: 'user' | 'superadmin', userName: string) => {
    try {
      await updateUserRole(userId, newRole, () => {
        toast({
          title: "Rol actualizado",
          description: `Rol de ${userName} actualizado a ${newRole}`,
        });
        refetch();
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

  const toggleUserExpansion = (userId: string) => {
    console.log("Toggling expansion for user:", userId);
    console.log("Current expandedUser:", expandedUser);
    setExpandedUser(prev => {
      const newValue = prev === userId ? null : userId;
      console.log("Setting expandedUser to:", newValue);
      return newValue;
    });
  };

  if (loading) {
    return <div className="flex justify-center p-4">Cargando usuarios...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Button onClick={refetch} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Gestión de Usuarios ({users.length})</h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Tarjeta</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <React.Fragment key={user.id}>
              <SuperAdminUserTableRow
                user={user}
                isExpanded={expandedUser === user.id}
                onToggleExpansion={toggleUserExpansion}
                onRoleUpdate={handleRoleUpdate}
              />
              
              {expandedUser === user.id && (
                <SuperAdminUserExpandedRow user={user} />
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
