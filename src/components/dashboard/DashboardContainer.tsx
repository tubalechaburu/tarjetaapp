
import { useState, useEffect } from "react";
import { BusinessCard } from "@/types";
import { getCardsSupabase, getAllCardsSupabase } from "@/utils/supabaseStorage";
import { useAuth } from "@/providers/AuthContext";
import { Header } from "@/components/Header";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import Footer from "@/components/Footer";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserCardDisplay } from "@/components/dashboard/UserCardDisplay";
import { NoCardsState } from "@/components/dashboard/NoCardsState";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { SuperAdminPanel } from "@/components/dashboard/SuperAdminPanel";
import { toast } from "sonner";

interface DashboardContainerProps {
  connectionStatus: boolean | null;
}

export const DashboardContainer = ({ connectionStatus }: DashboardContainerProps) => {
  const { user, userRole, isSuperAdmin } = useAuth();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [allCards, setAllCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCard, setUserCard] = useState<BusinessCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        console.log("❌ No user found, skipping data load");
        setLoading(false);
        return;
      }
      
      try {
        console.log("🔄 Loading data for user:", user.id, user.email);
        setError(null);
        setLoading(true);
        
        // Load user cards
        console.log("📋 Fetching user cards...");
        const fetchedCards = await getCardsSupabase();
        
        if (fetchedCards === null) {
          console.error("❌ Error loading cards - null response");
          setError("Error al cargar las tarjetas desde Supabase");
          setCards([]);
          setUserCard(null);
          toast.error("Error al cargar las tarjetas");
          return;
        }
        
        console.log("✅ User cards loaded:", fetchedCards.length);
        setCards(fetchedCards);
        
        // Find user's own card
        const foundUserCard = fetchedCards.find(card => card.userId === user.id);
        console.log("👤 User card found:", foundUserCard ? foundUserCard.name : "None");
        setUserCard(foundUserCard || null);

        // Load all cards for superadmin
        if (isSuperAdmin()) {
          console.log("👑 Loading all cards for superadmin...");
          const allCardsData = await getAllCardsSupabase();
          if (allCardsData && Array.isArray(allCardsData)) {
            console.log("✅ All cards loaded for superadmin:", allCardsData.length);
            setAllCards(allCardsData);
          } else {
            console.log("❌ Failed to load all cards or empty result");
            setAllCards([]);
          }
        }

        toast.success(`${fetchedCards.length} tarjetas cargadas correctamente`);

      } catch (error) {
        console.error("💥 Error loading data:", error);
        setError("Error al cargar los datos");
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isSuperAdmin]);

  const handleUserCardDeleted = () => {
    setUserCard(null);
    setCards(prev => prev.filter(card => card.id !== userCard?.id));
    toast.success("Tarjeta eliminada correctamente");
  };

  const handleCardDeleted = (cardId: string) => {
    setAllCards(prev => prev.filter(card => card.id !== cardId));
    if (userCard?.id === cardId) {
      setUserCard(null);
    }
    setCards(prev => prev.filter(card => card.id !== cardId));
    toast.success("Tarjeta eliminada correctamente");
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <ErrorState error={error} connectionStatus={connectionStatus} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <ConnectionStatus connectionStatus={connectionStatus} />
      
      <div className="max-w-4xl mx-auto">
        <DashboardHeader 
          userRole={userRole} 
          hasUserCard={!!userCard} 
          isSuperAdmin={isSuperAdmin()} 
        />

        {/* Debug info */}
        <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
          <p><strong>Debug:</strong> Usuario: {user?.email}, Rol: {userRole}</p>
          <p><strong>Tarjetas usuario:</strong> {cards.length}, <strong>Todas las tarjetas:</strong> {allCards.length}</p>
          <p><strong>Es superadmin:</strong> {isSuperAdmin() ? 'Sí' : 'No'}</p>
        </div>

        {/* Superadmin panel for all cards */}
        {isSuperAdmin() && allCards.length > 0 && (
          <div className="mb-6">
            <SuperAdminPanel 
              cards={allCards} 
              onCardDeleted={handleCardDeleted} 
            />
          </div>
        )}

        {loading ? (
          <LoadingState message="Cargando tarjetas..." />
        ) : userCard ? (
          <UserCardDisplay 
            userCard={userCard} 
            onCardDeleted={handleUserCardDeleted} 
          />
        ) : (
          <NoCardsState />
        )}
      </div>
      
      <Footer />
    </div>
  );
};
