
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useUsersWithCards } from "@/hooks/useUsersWithCards";
import { SuperAdminUserRow } from "./SuperAdminUserRow";

export const SuperAdminUsersTable = () => {
  const { users, loading, error, refetch } = useUsersWithCards();

  const exportAllData = () => {
    const exportData = users.map(user => ({
      name: user.full_name || user.email?.split('@')[0] || 'Sin nombre',
      email: user.email || 'Sin email',
      role: user.role,
      cards_count: user.cards.length,
      cards: user.cards.map(card => ({
        name: card.name,
        company: card.company,
        email: card.email,
        phone: card.phone,
        created_at: card.createdAt
      })),
      updated_at: user.updated_at
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'superadmin_usuarios_completo.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex justify-center p-4">Cargando usuarios y sincronizando perfiles...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Gestión de Usuarios ({users.length})</h3>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" className="gap-1">
            Sincronizar perfiles
          </Button>
          <Button onClick={exportAllData} variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Exportar todo
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Tarjetas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <SuperAdminUserRow 
              key={user.id} 
              user={user} 
              onUserUpdated={refetch}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
