
import { useState, useEffect } from "react";
import { BusinessCard } from "@/types";
import { getCardsSupabase } from "@/utils/supabaseStorage";
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
import { supabase } from "@/integrations/supabase/client";
import { mapSupabaseToBusinessCard } from "@/utils/supabase/mappers";
import { SupabaseBusinessCard } from "@/types";

interface DashboardContainerProps {
  connectionStatus: boolean | null;
}

export const DashboardContainer = ({ connectionStatus }: DashboardContainerProps) => {
  const { user, userRole, isSuperAdmin } = useAuth();
  const [allCards, setAllCards] = useState<BusinessCard[]>([]);
  const [userCards, setUserCards] = useState<BusinessCard[]>([]);
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
        console.log("🔄 Loading cards for user:", user.id, user.email, "Role:", userRole);
        setError(null);
        setLoading(true);
        
        // Verificar si es superadmin
        const isSuperAdminUser = user.email === 'tubal@tubalechaburu.com' || userRole === 'superadmin' || (isSuperAdmin && isSuperAdmin());
        
        if (isSuperAdminUser) {
          console.log("🔐 Superadmin detected, loading all cards AND user's own cards...");
          
          // Para superadmin: cargar TODAS las tarjetas del sistema usando la función RPC
          const { data: allSystemCards, error: allCardsError } = await supabase.rpc('get_all_cards');
          
          if (allCardsError) {
            console.error("❌ Error loading all cards:", allCardsError);
            setError("Error al cargar las tarjetas del sistema");
            setAllCards([]);
            toast.error("Error al cargar las tarjetas del sistema");
          } else {
            console.log("✅ All system cards loaded:", allSystemCards?.length || 0);
            const mappedAllCards = (allSystemCards || []).map(item => mapSupabaseToBusinessCard(item as unknown as SupabaseBusinessCard));
            setAllCards(mappedAllCards);
            toast.success(`${mappedAllCards.length} tarjetas cargadas (vista de administrador)`);
          }
          
          // Cargar las tarjetas propias del usuario de forma separada
          const { data: ownCardsData, error: ownCardsError } = await supabase
            .from('cards')
            .select('*')
            .eq('user_id', user.id);
          
          if (ownCardsError) {
            console.error("❌ Error loading own cards:", ownCardsError);
            setUserCards([]);
            setUserCard(null);
          } else {
            console.log("✅ Own cards loaded:", ownCardsData?.length || 0);
            const mappedOwnCards = (ownCardsData || []).map(item => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
            setUserCards(mappedOwnCards);
            
            // Buscar la tarjeta propia
            const foundUserCard = mappedOwnCards.find(card => card.userId === user.id);
            setUserCard(foundUserCard || null);
            console.log("👤 User's own card:", foundUserCard ? foundUserCard.name : "None");
          }
          
        } else {
          // Para usuarios normales: solo sus propias tarjetas
          console.log("👤 Regular user, loading own cards only...");
          const fetchedCards = await getCardsSupabase();
          
          if (fetchedCards === null) {
            console.error("❌ Error loading cards");
            setError("Error al cargar las tarjetas");
            setUserCards([]);
            setUserCard(null);
            toast.error("Error al cargar las tarjetas");
            return;
          }
          
          console.log("✅ User cards loaded:", fetchedCards.length);
          setUserCards(fetchedCards);
          setAllCards([]); // No mostrar todas las tarjetas a usuarios normales
          
          // Buscar la tarjeta del usuario actual
          const foundUserCard = fetchedCards.find(card => card.userId === user.id);
          console.log("👤 User's own card:", foundUserCard ? foundUserCard.name : "None");
          setUserCard(foundUserCard || null);
          
          if (fetchedCards.length > 0) {
            toast.success("Tarjetas cargadas correctamente");
          }
        }

      } catch (error) {
        console.error("💥 Error loading data:", error);
        setError("Error al cargar los datos");
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, userRole, isSuperAdmin]);

  const handleUserCardDeleted = () => {
    setUserCard(null);
    setUserCards(prev => prev.filter(card => card.id !== userCard?.id));
    setAllCards(prev => prev.filter(card => card.id !== userCard?.id));
    toast.success("Tarjeta eliminada correctamente");
  };

  const handleCardDeleted = (cardId: string) => {
    setAllCards(prev => prev.filter(card => card.id !== cardId));
    setUserCards(prev => prev.filter(card => card.id !== cardId));
    if (userCard?.id === cardId) {
      setUserCard(null);
    }
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

  // Verificar si es superadmin
  const isSuperAdminUser = user?.email === 'tubal@tubalechaburu.com' || userRole === 'superadmin' || (isSuperAdmin && isSuperAdmin());

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <ConnectionStatus connectionStatus={connectionStatus} />
      
      <div className="max-w-4xl mx-auto">
        <DashboardHeader 
          userRole={userRole} 
          hasUserCard={!!userCard} 
          isSuperAdmin={isSuperAdminUser} 
        />

        {/* Debug info mejorado */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
            <p><strong>Debug:</strong> Usuario: {user?.email}, Rol: {userRole}</p>
            <p><strong>Tarjetas propias:</strong> {userCards.length}</p>
            <p><strong>Todas las tarjetas (admin):</strong> {allCards.length}</p>
            <p><strong>Es superadmin:</strong> {isSuperAdminUser ? 'Sí' : 'No'}</p>
            <p><strong>Tarjeta propia:</strong> {userCard ? userCard.name : 'Ninguna'}</p>
          </div>
        )}

        {/* Panel de superadmin para todas las tarjetas del sistema */}
        {isSuperAdminUser && allCards.length > 0 && (
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
