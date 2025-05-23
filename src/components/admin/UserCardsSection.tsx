
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { BusinessCard, SupabaseBusinessCard } from "@/types";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mapSupabaseToBusinessCard } from "@/utils/supabase/mappers";

interface UserCardsSectionProps {
  userId: string;
  userEmail?: string;
}

export const UserCardsSection = ({ userId, userEmail }: UserCardsSectionProps) => {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserCards = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        // Map the Supabase data to BusinessCard format before setting state
        const mappedCards = data ? data.map((card) => 
          mapSupabaseToBusinessCard(card as unknown as SupabaseBusinessCard)
        ) : [];
        
        setCards(mappedCards);
      } catch (error) {
        console.error('Error fetching user cards:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserCards();
    }
  }, [userId]);

  const exportUserData = () => {
    const userData = {
      email: userEmail,
      userId: userId,
      cards: cards.map(card => ({
        name: card.name,
        jobTitle: card.jobTitle,
        company: card.company,
        email: card.email,
        phone: card.phone,
        website: card.website,
        createdAt: card.createdAt
      }))
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usuario_${userEmail || userId}_datos.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando tarjetas...</div>;
  }
  
  if (cards.length === 0) {
    return (
      <div className="text-sm text-muted-foreground space-y-2">
        <p>Este usuario no tiene tarjetas.</p>
        {userEmail && (
          <Button onClick={exportUserData} size="sm" variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Exportar datos del usuario
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="mt-2 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Tarjetas ({cards.length})</h4>
        {userEmail && (
          <Button onClick={exportUserData} size="sm" variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Exportar datos
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id}>
              <TableCell>{card.name}</TableCell>
              <TableCell>{card.company || '-'}</TableCell>
              <TableCell>{card.email || '-'}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Link to={`/card/${card.id}`} target="_blank">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <ExternalLink className="h-4 w-4" />
                      Ver tarjeta
                    </Button>
                  </Link>
                  <Link to={`/edit/${card.id}`} target="_blank">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Editar
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
