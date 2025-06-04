
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
    setExpandedUser(expandedUser === userId ? null : userId);
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
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserExpansion(user.id)}
                      className="p-1 h-6 w-6"
                    >
                      {expandedUser === user.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <span>{user.full_name || "Sin nombre"}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.cards.length > 0 ? (
                    <span className="text-green-600">Sí ({user.cards[0].name})</span>
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
              
              {/* Fila expandida para mostrar información adicional del usuario */}
              {expandedUser === user.id && (
                <TableRow>
                  <TableCell colSpan={5} className="bg-muted/30 p-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Información del usuario</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">ID:</span> {user.id}
                        </div>
                        <div>
                          <span className="font-medium">Última actualización:</span> {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      
                      {user.cards.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-2">Tarjetas ({user.cards.length})</h5>
                          <div className="space-y-2">
                            {user.cards.map((card) => (
                              <div key={card.id} className="border rounded p-3 bg-white">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{card.name}</p>
                                    <p className="text-sm text-gray-600">{card.jobTitle} en {card.company}</p>
                                    <p className="text-sm text-gray-500">{card.email}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <Link to={`/card/${card.id}`} target="_blank">
                                      <Button variant="ghost" size="sm" className="gap-1">
                                        <Eye className="h-4 w-4" />
                                        Ver
                                      </Button>
                                    </Link>
                                    <Link to={`/edit/${card.id}`} target="_blank">
                                      <Button variant="ghost" size="sm" className="gap-1">
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
