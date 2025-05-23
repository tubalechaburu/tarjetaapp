
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BusinessCard, SupabaseBusinessCard, UserRole } from "@/types";
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
import { Edit, ExternalLink, Trash2, User, Download, Eye } from "lucide-react";
import { mapSupabaseToBusinessCard } from "@/utils/supabase/mappers";
import { deleteCard } from "@/utils/storage";
import { Link } from "react-router-dom";
import { updateUserRole } from "@/utils/userRoleUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check } from "lucide-react";

interface UserWithCardAndRole {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  card: BusinessCard | null;
  created_at: string;
  updated_at: string | null;
}

export const AllUsersTable = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithCardAndRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      
      // Obtener perfiles de usuarios
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Obtener todas las tarjetas
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*');
        
      if (cardsError) throw cardsError;
      
      // Obtener roles de usuarios
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;
      
      // Combinar datos
      const usersWithData: UserWithCardAndRole[] = profiles.map(profile => {
        const userCard = cards?.find(card => card.user_id === profile.id);
        const mappedCard = userCard ? mapSupabaseToBusinessCard(userCard as unknown as SupabaseBusinessCard) : null;
        
        const userRoles = rolesData.filter(role => role.user_id === profile.id);
        const roleName = userRoles.length > 0 ? userRoles[0].role : 'user';
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: mappedCard?.email || profile.id, // Usar email de la tarjeta o ID como fallback
          role: roleName as UserRole,
          card: mappedCard,
          created_at: profile.updated_at || new Date().toISOString(),
          updated_at: profile.updated_at
        };
      });
      
      // Ordenar por fecha de creación (más recientes primero)
      usersWithData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setUsers(usersWithData);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching all users:', error);
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
    fetchAllUsers();
  }, []);

  const handleDeleteCard = async (cardId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      try {
        await deleteCard(cardId);
        toast({
          title: "Tarjeta eliminada",
          description: "La tarjeta ha sido eliminada correctamente",
        });
        fetchAllUsers(); // Recargar datos
      } catch (error: any) {
        console.error("Error deleting card:", error);
        toast({
          title: "Error al eliminar tarjeta",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole, () => {
        toast({
          title: "Rol actualizado",
          description: `Rol de usuario actualizado a ${newRole}`,
        });
        fetchAllUsers(); // Recargar usuarios
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
      id: user.id,
      name: user.full_name || 'Sin nombre',
      email: user.email,
      role: user.role,
      hasCard: !!user.card,
      cardName: user.card?.name || null,
      company: user.card?.company || null,
      phone: user.card?.phone || null,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos_usuarios_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/15 text-destructive rounded-lg">
        <h3 className="font-medium">Error al cargar usuarios</h3>
        <p className="text-sm mt-1">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={fetchAllUsers}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Todos los Usuarios ({users.length})
        </h3>
        <Button onClick={exportAllUsers} variant="outline" className="gap-1">
          <Download className="h-4 w-4" />
          Exportar todos
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Tarjeta</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Fecha registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {user.full_name || "Sin nombre"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {user.id.slice(0, 8)}...
                    </p>
                  </div>
                </TableCell>
                <TableCell>{user.email || "Sin email"}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                    user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  {user.card ? (
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        {user.card.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.card.jobTitle}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Sin tarjeta</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.card?.company || (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{new Date(user.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    {user.card && (
                      <>
                        <Link to={`/card/${user.card.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-4 w-4" />
                            Ver
                          </Button>
                        </Link>
                        <Link to={`/edit/${user.card.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCard(user.card!.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Cambiar rol</DropdownMenuLabel>
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
