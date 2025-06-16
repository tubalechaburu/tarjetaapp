import { useState, useEffect } from "react";
import { BusinessCard } from "@/types";
import { getCardsSupabase } from "@/utils/supabaseStorage";
import { useAuth } from "@/providers/AuthContext";
import Header from "@/components/Header";
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
        
        const isSuperAdminUser = userRole === 'superadmin' || (isSuperAdmin && isSuperAdmin());
        console.log("🎭 User is superadmin:", isSuperAdminUser);
        
        if (isSuperAdminUser) {
          // For superadmin: Load all cards AND their own cards separately
          console.log("🔐 Loading all cards for superadmin...");
          const { data: allCardsData, error: allCardsError } = await supabase
            .from('cards')
            .select('*');
          
          if (allCardsError) {
            console.error("❌ Error loading all cards:", allCardsError);
            toast.error("Error al cargar todas las tarjetas");
            setAllCards([]);
          } else {
            console.log("✅ All cards loaded:", allCardsData?.length || 0);
            const mappedAllCards = (allCardsData || []).map(item => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
            setAllCards(mappedAllCards);
          }
          
          // Load superadmin's own cards
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
            setUserCard(mappedOwnCards.length > 0 ? mappedOwnCards[0] : null);
          }
        } else {
          // For regular users: Only load their own cards
          console.log("👤 Loading cards for regular user:", user.id);
          const { data: cardsData, error: cardsError } = await supabase
            .from('cards')
            .select('*')
            .eq('user_id', user.id);
          
          if (cardsError) {
            console.error("❌ Error loading user cards:", cardsError);
            if (!cardsError.message?.includes('permission denied')) {
              toast.error("Error al cargar las tarjetas");
            }
            setUserCards([]);
            setUserCard(null);
          } else {
            console.log("✅ User cards loaded:", cardsData?.length || 0);
            const mappedCards = (cardsData || []).map(item => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
            
            // Log each card to verify ownership
            mappedCards.forEach(card => {
              console.log(`📋 Card loaded: ${card.name} (ID: ${card.id}, Owner: ${card.userId})`);
              if (card.userId !== user.id) {
                console.warn(`⚠️ WARNING: Card ${card.name} belongs to ${card.userId}, not current user ${user.id}`);
              }
            });
            
            setUserCards(mappedCards);
            setUserCard(mappedCards.length > 0 ? mappedCards[0] : null);
            setAllCards([]); // Regular users don't see admin panel
            
            if (mappedCards.length > 0) {
              toast.success(`${mappedCards.length} tarjeta(s) cargada(s) correctamente`);
            }
          }
        }

      } catch (error) {
        console.error("💥 Error loading data:", error);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    // Only load data when we have a user and role information
    if (user && userRole !== null) {
      loadData();
    } else if (user && userRole === null) {
      // Wait a bit for role to be loaded
      const timeout = setTimeout(() => {
        if (userRole === null) {
          console.log("⏳ Role still loading, proceeding anyway...");
          loadData();
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [user, userRole, isSuperAdmin]);

  const handleUserCardDeleted = () => {
    setUserCard(null);
    setUserCards(prev => prev.filter(card => card.id !== userCard?.id));
    // Only remove from admin panel if it's the same card
    if (userCard) {
      setAllCards(prev => prev.filter(card => card.id !== userCard.id));
    }
    toast.success("Tarjeta eliminada correctamente");
  };

  const handleCardDeleted = (cardId: string) => {
    setAllCards(prev => prev.filter(card => card.id !== cardId));
    // Only remove from user cards if it's their own card
    if (userCard?.id === cardId) {
      setUserCard(null);
      setUserCards(prev => prev.filter(card => card.id !== cardId));
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

  // Check if user is superadmin using the secure role system
  const isSuperAdminUser = userRole === 'superadmin' || (isSuperAdmin && isSuperAdmin());

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
            <p><strong>Tarjetas propias (Mis Tarjetas):</strong> {userCards.length}</p>
            <p><strong>Todas las tarjetas (Panel Admin):</strong> {allCards.length}</p>
            <p><strong>Es superadmin:</strong> {isSuperAdminUser ? 'Sí' : 'No'}</p>
            <p><strong>Mi tarjeta:</strong> {userCard ? userCard.name : 'Ninguna'}</p>
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
