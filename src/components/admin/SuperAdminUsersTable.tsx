
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
import { Edit, ExternalLink, Trash2, User, Download, ChevronDown, ChevronUp } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface UserWithCards {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  cards: BusinessCard[];
  updated_at: string;
}

export const SuperAdminUsersTable = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithCards[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const fetchUsersWithCards = async () => {
    try {
      setLoading(true);
      
      // Get users from profiles table with proper email field
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, updated_at');
      
      if (profilesError) throw profilesError;
      
      // Get auth users to get actual email addresses
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.warn('Could not fetch auth users:', authError);
      }
      
      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;
      
      // Get all cards
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*');
        
      if (cardsError) throw cardsError;
      
      // Combine data
      const usersWithCards: UserWithCards[] = profiles.map(profile => {
        const userRoles = rolesData?.filter(role => role.user_id === profile.id) || [];
        const roleName = userRoles.length > 0 ? userRoles[0].role : 'user';
        const userCards = cards?.filter(card => card.user_id === profile.id) || [];
        const mappedCards = userCards.map(card => mapSupabaseToBusinessCard(card as unknown as SupabaseBusinessCard));
        
        // Get email from auth users if available, otherwise from profile
        const authUser = authUsers?.users?.find(user => user.id === profile.id);
        const emailToShow = authUser?.email || profile.email || profile.id;
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: emailToShow,
          role: roleName as UserRole,
          cards: mappedCards,
          updated_at: profile.updated_at || ''
        };
      });
      
      // Sort by role (superadmin first, then admin, then user) and then by name
      usersWithCards.sort((a, b) => {
        const roleOrder = { superadmin: 0, admin: 1, user: 2 };
        const roleCompare = roleOrder[a.role] - roleOrder[b.role];
        if (roleCompare !== 0) return roleCompare;
        return (a.full_name || '').localeCompare(b.full_name || '');
      });
      
      setUsers(usersWithCards);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching users with cards:', error);
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
    fetchUsersWithCards();
  }, []);

  const handleDeleteCard = async (cardId: string, cardName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la tarjeta "${cardName}"?`)) {
      try {
        await deleteCard(cardId);
        toast({
          title: "Tarjeta eliminada",
          description: `La tarjeta "${cardName}" ha sido eliminada correctamente`,
        });
        fetchUsersWithCards();
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

  const handleRoleUpdate = async (userId: string, newRole: UserRole, userName: string) => {
    try {
      await updateUserRole(userId, newRole, () => {
        toast({
          title: "Rol actualizado",
          description: `Rol de ${userName} actualizado a ${newRole}`,
        });
        fetchUsersWithCards();
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

  const exportAllData = () => {
    const exportData = users.map(user => ({
      name: user.full_name || 'Sin nombre',
      email: user.email,
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

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin': return 'bg-red-500 text-white';
      case 'admin': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Gestión de Usuarios ({users.length})</h3>
        <Button onClick={exportAllData} variant="outline" className="gap-1">
          <Download className="h-4 w-4" />
          Exportar todo
        </Button>
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
            <>
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.full_name || "Sin nombre"}</span>
                    <span className="text-xs text-gray-500">{user.id}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {user.cards.length} tarjeta{user.cards.length !== 1 ? 's' : ''}
                    </Badge>
                    {user.cards.length > 0 && (
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
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Cambiar rol
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Seleccionar rol</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleRoleUpdate(user.id, 'user', user.full_name || user.email)}
                          disabled={user.role === 'user'}
                        >
                          Usuario {user.role === 'user' && '✓'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRoleUpdate(user.id, 'admin', user.full_name || user.email)}
                          disabled={user.role === 'admin'}
                        >
                          Admin {user.role === 'admin' && '✓'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRoleUpdate(user.id, 'superadmin', user.full_name || user.email)}
                          disabled={user.role === 'superadmin'}
                        >
                          Superadmin {user.role === 'superadmin' && '✓'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
              
              {/* Expanded row for user cards */}
              {expandedUser === user.id && user.cards.length > 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="bg-muted/30 p-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Tarjetas de {user.full_name || user.email}</h4>
                      <div className="grid gap-3">
                        {user.cards.map((card) => (
                          <div key={card.id} className="flex items-center justify-between p-3 bg-white rounded border">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium">{card.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {card.company && `${card.company} • `}
                                    {card.email}
                                  </p>
                                  {card.phone && (
                                    <p className="text-sm text-gray-500">{card.phone}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Link to={`/card/${card.id}`} target="_blank">
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <ExternalLink className="h-4 w-4" />
                                  Ver
                                </Button>
                              </Link>
                              <Link to={`/edit/${card.id}`} target="_blank">
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <Edit className="h-4 w-4" />
                                  Editar
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteCard(card.id!, card.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
