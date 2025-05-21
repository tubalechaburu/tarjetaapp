
import { useState, useEffect } from "react";
import { BusinessCard } from "@/types";
import { getCards } from "@/utils/storage";
import { checkSupabaseConnection } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

// Imported components
import { Header } from "@/components/Header";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { SuperAdminPanel } from "@/components/SuperAdminPanel";
import { SearchBar } from "@/components/SearchBar";
import { BusinessCardList } from "@/components/BusinessCardList";

const Index = () => {
  const { user, userRole, isSuperAdmin } = useAuth();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const initPage = async () => {
      // Verificar conexión con Supabase
      try {
        const connected = await checkSupabaseConnection();
        setConnectionStatus(connected);
        console.log("Supabase connection:", connected ? "OK" : "Failed");
      } catch (error) {
        console.error("Error checking Supabase connection:", error);
        setConnectionStatus(false);
      }

      // Cargar tarjetas
      try {
        setLoading(true);
        const fetchedCards = await getCards();
        setCards(fetchedCards);
      } catch (error) {
        console.error("Error al cargar tarjetas:", error);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, []);

  // Filtrar tarjetas según la búsqueda
  const filteredCards = cards.filter(card => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      card.name.toLowerCase().includes(query) ||
      (card.company && card.company.toLowerCase().includes(query)) ||
      (card.jobTitle && card.jobTitle.toLowerCase().includes(query)) ||
      (card.email && card.email.toLowerCase().includes(query))
    );
  });

  // Filtrar tarjetas del usuario actual
  const myCards = user 
    ? filteredCards.filter(card => card.userId === user.id)
    : filteredCards.filter(card => !card.userId || card.userId === "anonymous");

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <ConnectionStatus connectionStatus={connectionStatus} />
      <SuperAdminPanel isSuperAdmin={isSuperAdmin()} />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <BusinessCardList cards={myCards} loading={loading} />
    </div>
  );
};

export default Index;
