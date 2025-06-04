
import React, { useState } from "react";
import { useUsersWithCards } from "@/hooks/useUsersWithCards";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types";
import { Link } from "react-router-dom";
import { updateUserRole } from "@/utils/userRoleUtils";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
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
              <TableRow className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserExpansion(user.id)}
                      className="p-1 h-8 w-8 hover:bg-gray-100 flex items-center justify-center shrink-0"
                    >
                      {expandedUser === user.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <span className="font-medium">{user.full_name || "Sin nombre"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.cards.length > 0 ? (
                    <span className="text-green-600 font-medium">Sí ({user.cards[0].name})</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    {user.cards.length > 0 && (
                      <>
                        <Link to={`/card/${user.cards[0].id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-4 w-4" />
                            Ver
                          </Button>
                        </Link>
                        <Link to={`/edit/${user.cards[0].id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="gap-1 text-red-600">
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </>
                    )}
                    
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
              
              {/* Expanded row showing user details */}
              {expandedUser === user.id && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={5} className="p-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Información del usuario</h4>
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                          <div><span className="font-medium">ID:</span> <span className="text-gray-600">{user.id}</span></div>
                          <div><span className="font-medium">Email:</span> <span className="text-gray-600">{user.email}</span></div>
                        </div>
                        <div className="space-y-2">
                          <div><span className="font-medium">Nombre completo:</span> <span className="text-gray-600">{user.full_name || 'No definido'}</span></div>
                          <div><span className="font-medium">Última actualización:</span> <span className="text-gray-600">{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</span></div>
                        </div>
                      </div>
                      
                      {user.cards.length > 0 && (
                        <div className="mt-6">
                          <h5 className="font-semibold mb-3">Tarjetas del usuario ({user.cards.length})</h5>
                          <div className="space-y-3">
                            {user.cards.map((card) => (
                              <div key={card.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <p className="font-semibold text-base">{card.name}</p>
                                    <p className="text-sm text-gray-600">{card.jobTitle} {card.company && `en ${card.company}`}</p>
                                    <p className="text-sm text-gray-500">{card.email}</p>
                                    {card.phone && <p className="text-sm text-gray-500">{card.phone}</p>}
                                  </div>
                                  <div className="flex gap-2">
                                    <Link to={`/card/${card.id}`} target="_blank">
                                      <Button variant="outline" size="sm" className="gap-1">
                                        <Eye className="h-4 w-4" />
                                        Ver
                                      </Button>
                                    </Link>
                                    <Link to={`/edit/${card.id}`} target="_blank">
                                      <Button variant="outline" size="sm" className="gap-1">
                                        <Edit className="h-4 w-4" />
                                        Editar
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {user.cards.length === 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-600 text-center">Este usuario no tiene tarjetas creadas.</p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
