
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BusinessCard, SupabaseBusinessCard } from "@/types";
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
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import { mapSupabaseToBusinessCard } from "@/utils/supabase/mappers";
import { deleteCard } from "@/utils/storage";
import { Link } from "react-router-dom";

interface UserWithCard {
  id: string;
  email: string;
  card: BusinessCard | null;
}

export const UsersManagementTable = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsersWithCards = async () => {
    try {
      setLoading(true);
      
      // Get users from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email');
      
      if (profilesError) throw profilesError;
      
      // Get all cards
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*');
        
      if (cardsError) throw cardsError;
      
      // Combine data
      const usersWithCards: UserWithCard[] = profiles?.map(profile => {
        const userCard = cards?.find(card => card.user_id === profile.id);
        const mappedCard = userCard ? mapSupabaseToBusinessCard(userCard as unknown as SupabaseBusinessCard) : null;
        
        return {
          id: profile.id,
          email: profile.email,
          card: mappedCard
        };
      }) || [];
      
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

  const handleDeleteCard = async (cardId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      try {
        await deleteCard(cardId);
        toast({
          title: "Tarjeta eliminada",
          description: "La tarjeta ha sido eliminada correctamente",
        });
        fetchUsersWithCards(); // Reload data
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

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto space-y-4">
      <h3 className="text-lg font-semibold">Gestión de Usuarios ({users.length})</h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tarjeta</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email?.split('@')[0] || "Sin nombre"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.card ? (
                  <span className="text-green-600">Sí ({user.card.name})</span>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  {user.card && (
                    <>
                      <Link to={`/card/${user.card.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ExternalLink className="h-4 w-4" />
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
