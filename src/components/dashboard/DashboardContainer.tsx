
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
        
        // Use RLS-protected query - will automatically filter based on user permissions
        console.log("👤 Loading cards using RLS policies...");
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('*');
        
        if (cardsError) {
          console.error("❌ Error loading cards:", cardsError);
          // Don't show error for permission denied - it's expected for new users
          if (!cardsError.message?.includes('permission denied')) {
            toast.error("Error al cargar las tarjetas");
          }
          setUserCards([]);
          setAllCards([]);
          setUserCard(null);
        } else {
          console.log("✅ Cards loaded (RLS-filtered):", cardsData?.length || 0);
          const mappedCards = (cardsData || []).map(item => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
          
          // For regular users, these will be their own cards
          // For superadmins, these will be all cards in the system
          const isSuperAdminUser = userRole === 'superadmin' || (isSuperAdmin && isSuperAdmin());
          
          if (isSuperAdminUser) {
            // Superadmin sees all cards
            setAllCards(mappedCards);
            // Find their own cards within all cards
            const ownCards = mappedCards.filter(card => card.userId === user.id);
            setUserCards(ownCards);
            setUserCard(ownCards.length > 0 ? ownCards[0] : null);
            if (mappedCards.length > 0) {
              toast.success(`${mappedCards.length} tarjetas cargadas en el panel de administración`);
            }
          } else {
            // Regular user sees only their own cards
            setUserCards(mappedCards);
            setUserCard(mappedCards.length > 0 ? mappedCards[0] : null);
            setAllCards([]); // Regular users don't see admin panel
            if (mappedCards.length > 0) {
              toast.success("Tus tarjetas cargadas correctamente");
            }
          }
        }

      } catch (error) {
        console.error("💥 Error loading data:", error);
        setError("Error al cargar los datos");
        // Don't show toast for every error to avoid spam
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
