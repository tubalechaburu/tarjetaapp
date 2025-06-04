import { useState, useEffect } from "react";
import { useUsersWithCards } from "@/hooks/useUsersWithCards";
import { getAllCardsSupabase } from "@/utils/supabaseStorage";
import { BusinessCard } from "@/types";
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
import { SuperAdminUserTableRow } from "./SuperAdminUserTableRow";

export const AllUsersTable = () => {
  const { users, loading, error, refetch } = useUsersWithCards();
  const [allCards, setAllCards] = useState<BusinessCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  // Load all cards for admin view
  useEffect(() => {
    const loadAllCards = async () => {
      try {
        setCardsLoading(true);
        console.log("🔍 Admin loading all cards...");
        
        const cards = await getAllCardsSupabase();
        console.log("📦 Admin fetched cards:", cards?.length || 0);
        
        if (cards) {
          setAllCards(cards);
        }
      } catch (error) {
        console.error("💥 Error loading all cards:", error);
      } finally {
        setCardsLoading(false);
      }
    };

    loadAllCards();
  }, []);

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

  if (loading || cardsLoading) {
    return <div className="flex justify-center p-4">Cargando usuarios y tarjetas...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Todos los Usuarios ({users.length})</h3>
          <p className="text-sm text-muted-foreground">Total de tarjetas en el sistema: {allCards.length}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" className="gap-1">
            Actualizar datos
          </Button>
          <Button onClick={exportAllData} variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Exportar todo
          </Button>
        </div>
      </div>

      {/* Debug info for admin */}
      <div className="p-3 bg-yellow-50 rounded text-sm">
        <p><strong>Debug:</strong> Usuarios cargados: {users.length}, Tarjetas totales: {allCards.length}</p>
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
            <SuperAdminUserTableRow 
              key={user.id} 
              user={user}
              isExpanded={false}
              onToggleExpansion={() => {}}
              onRoleUpdate={() => {}}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
