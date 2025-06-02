
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
  const [cards, setCards] = useState<BusinessCard[]>([]);
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
        
        // Cargar tarjetas usando la nueva función simplificada
        console.log("📋 Fetching cards using simplified method...");
        const fetchedCards = await getCardsSupabase();
        
        if (fetchedCards === null) {
          console.error("❌ Error loading cards - null response");
          setError("Error al cargar las tarjetas desde Supabase");
          setCards([]);
          setUserCard(null);
          toast.error("Error al cargar las tarjetas");
          return;
        }
        
        console.log("✅ Cards loaded successfully:", fetchedCards.length);
        console.log("📋 Cards details:", fetchedCards.map(c => ({ 
          id: c.id, 
          name: c.name, 
          userId: c.userId,
          userEmail: user.email
        })));
        
        setCards(fetchedCards);
        
        // Para superadmin, mostrar todas las tarjetas en el panel
        if (isSuperAdmin()) {
          console.log("🔐 Superadmin view - showing all cards in admin panel");
          // Buscar si el superadmin tiene su propia tarjeta
          const foundUserCard = fetchedCards.find(card => card.userId === user.id);
          console.log("👤 Superadmin's own card:", foundUserCard ? foundUserCard.name : "None");
          setUserCard(foundUserCard || null);
        } else {
          // Para usuarios normales, mostrar solo su tarjeta
          const foundUserCard = fetchedCards.find(card => card.userId === user.id);
          console.log("👤 User card found:", foundUserCard ? foundUserCard.name : "None");
          setUserCard(foundUserCard || null);
        }

        if (fetchedCards.length > 0) {
          const message = isSuperAdmin() 
            ? `${fetchedCards.length} tarjetas cargadas (vista de administrador)`
            : `${fetchedCards.length} tarjetas cargadas correctamente`;
          toast.success(message);
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
    setCards(prev => prev.filter(card => card.id !== userCard?.id));
    toast.success("Tarjeta eliminada correctamente");
  };

  const handleCardDeleted = (cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
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

        {/* Debug info mejorado */}
        <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
          <p><strong>Debug:</strong> Usuario: {user?.email}, Rol: {userRole}</p>
          <p><strong>Tarjetas cargadas:</strong> {cards.length}</p>
          <p><strong>Es superadmin:</strong> {isSuperAdmin() ? 'Sí' : 'No'}</p>
          <p><strong>Tarjeta propia:</strong> {userCard ? userCard.name : 'Ninguna'}</p>
          {isSuperAdmin() && (
            <p><strong>Vista admin:</strong> Mostrando {cards.length} tarjetas totales del sistema</p>
          )}
        </div>

        {/* Panel de superadmin para todas las tarjetas */}
        {isSuperAdmin() && (
          <div className="mb-6">
            <SuperAdminPanel 
              cards={cards} 
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
