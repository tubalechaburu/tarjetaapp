
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
        
        // SIEMPRE cargar solo las tarjetas propias del usuario actual para "Mis Tarjetas"
        console.log("👤 Loading user's own cards only...");
        const { data: ownCardsData, error: ownCardsError } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', user.id);
        
        if (ownCardsError) {
          console.error("❌ Error loading own cards:", ownCardsError);
          setUserCards([]);
          setUserCard(null);
          toast.error("Error al cargar tus tarjetas");
        } else {
          console.log("✅ Own cards loaded:", ownCardsData?.length || 0);
          const mappedOwnCards = (ownCardsData || []).map(item => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
          setUserCards(mappedOwnCards);
          
          // Buscar la tarjeta propia - debería ser la primera (y posiblemente única)
          const foundUserCard = mappedOwnCards.length > 0 ? mappedOwnCards[0] : null;
          setUserCard(foundUserCard);
          console.log("👤 User's own card:", foundUserCard ? foundUserCard.name : "None");
          
          if (mappedOwnCards.length > 0) {
            toast.success("Tus tarjetas cargadas correctamente");
          }
        }

        // Para superadmin: cargar TODAS las tarjetas del sistema para el panel de administración
        if (isSuperAdminUser) {
          console.log("🔐 Superadmin detected, loading all system cards for admin panel...");
          
          const { data: allSystemCards, error: allCardsError } = await supabase
            .from('cards')
            .select('*');
          
          if (allCardsError) {
            console.error("❌ Error loading all cards:", allCardsError);
            setAllCards([]);
            toast.error("Error al cargar las tarjetas del sistema");
          } else {
            console.log("✅ All system cards loaded for admin panel:", allSystemCards?.length || 0);
            const mappedAllCards = (allSystemCards || []).map(item => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
            setAllCards(mappedAllCards);
            toast.success(`${mappedAllCards.length} tarjetas cargadas en el panel de administración`);
          }
        } else {
          setAllCards([]); // Usuarios normales no ven el panel de administración
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
    // Solo eliminar del panel de admin si es la misma tarjeta
    if (userCard) {
      setAllCards(prev => prev.filter(card => card.id !== userCard.id));
    }
    toast.success("Tarjeta eliminada correctamente");
  };

  const handleCardDeleted = (cardId: string) => {
    setAllCards(prev => prev.filter(card => card.id !== cardId));
    // Solo eliminar de las tarjetas del usuario si es su propia tarjeta
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
