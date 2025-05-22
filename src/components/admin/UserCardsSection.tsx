
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { BusinessCard } from "@/types";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserCardsSectionProps {
  userId: string;
}

export const UserCardsSection = ({ userId }: UserCardsSectionProps) => {
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
        
        setCards(data || []);
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
  
  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando tarjetas...</div>;
  }
  
  if (cards.length === 0) {
    return <div className="text-sm text-muted-foreground">Este usuario no tiene tarjetas.</div>;
  }
  
  return (
    <div className="mt-2">
      <h4 className="text-sm font-medium mb-2">Tarjetas ({cards.length})</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id}>
              <TableCell>{card.name}</TableCell>
              <TableCell>{card.company || '-'}</TableCell>
              <TableCell>
                <Link to={`/card/${card.id}`} target="_blank">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ExternalLink className="h-4 w-4" />
                    Ver
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
