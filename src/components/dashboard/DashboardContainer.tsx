
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
        
        // Cargar tarjetas usando getCardsSupabase - esta función ya maneja superadmin vs usuario normal
        console.log("🔍 Loading cards...");
        const fetchedCards = await getCardsSupabase();
        
        if (fetchedCards === null) {
          console.error("❌ Error loading cards");
          setError("Error al cargar las tarjetas");
          setAllCards([]);
          setUserCards([]);
          setUserCard(null);
          toast.error("Error al cargar las tarjetas");
          return;
        }
        
        console.log("✅ Cards loaded:", fetchedCards.length);
        
        if (isSuperAdminUser) {
          // Para superadmin: mostrar todas las tarjetas
          setAllCards(fetchedCards);
          
          // También cargar las tarjetas propias del usuario
          const ownCards = fetchedCards.filter(card => card.userId === user.id);
          setUserCards(ownCards);
          
          // Buscar la tarjeta propia
          const foundUserCard = ownCards.find(card => card.userId === user.id);
          setUserCard(foundUserCard || null);
          
          toast.success(`${fetchedCards.length} tarjetas cargadas (vista de administrador)`);
          
        } else {
          // Para usuarios normales: solo sus propias tarjetas
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
