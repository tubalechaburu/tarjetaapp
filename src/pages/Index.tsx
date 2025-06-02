
import { useState, useEffect } from "react";
import { BusinessCard } from "@/types";
import { getCardsSupabase, getAllCardsSupabase } from "@/utils/supabaseStorage";
import { checkSupabaseConnection } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthContext";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import Footer from "@/components/Footer";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserCardDisplay } from "@/components/dashboard/UserCardDisplay";
import { NoCardsState } from "@/components/dashboard/NoCardsState";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { SuperAdminPanel } from "@/components/dashboard/SuperAdminPanel";

const Index = () => {
  const { user, userRole, isSuperAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [allCards, setAllCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [userCard, setUserCard] = useState<BusinessCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle navigation when not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("❌ No user found, redirecting to auth...");
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const initPage = async () => {
      if (!user || authLoading) {
        console.log("⏳ Waiting for auth or no user, skipping initialization");
        return;
      }
      
      try {
        setError(null);
        setLoading(true);
        console.log("🚀 Starting page initialization for user:", user.email);
        console.log("🎭 Current user role:", userRole);
        
        // Check Supabase connection
        try {
          const connected = await checkSupabaseConnection();
          setConnectionStatus(connected);
        } catch (connectionError) {
          console.error("💥 Connection check error:", connectionError);
          setConnectionStatus(false);
        }

        // Load user cards
        try {
          console.log("📋 Loading user cards for:", user.email);
          
          const fetchedCards = await getCardsSupabase();
          console.log("📦 Fetched user cards:", fetchedCards?.length || 0, "cards");
          
          if (fetchedCards === null) {
            console.log("❌ getCardsSupabase returned null");
            setError("Error al cargar las tarjetas desde Supabase");
            setCards([]);
            setUserCard(null);
            return;
          }
          
          if (Array.isArray(fetchedCards)) {
            console.log("✅ Setting user cards:", fetchedCards.length, "cards found");
            setCards(fetchedCards);
            
            // Find user's card
            const foundUserCard = fetchedCards.find(card => card.userId === user.id);
            console.log("👤 Found user card:", foundUserCard ? "Yes" : "No");
            setUserCard(foundUserCard || null);
          }

        } catch (error) {
          console.error("💥 Error loading user cards:", error);
          setError("Error al cargar las tarjetas. Intenta refrescar la página.");
          setCards([]);
          setUserCard(null);
        }

        // Load all cards for superadmin
        if (isSuperAdmin()) {
          try {
            console.log("👑 Loading all cards for superadmin");
            const allCardsData = await getAllCardsSupabase();
            console.log("📦 Fetched all cards:", allCardsData?.length || 0, "cards");
            
            if (allCardsData && Array.isArray(allCardsData)) {
              setAllCards(allCardsData);
            }
          } catch (error) {
            console.error("💥 Error loading all cards:", error);
          }
        }

      } catch (error) {
        console.error("💥 Error in page initialization:", error);
        setError("Error al inicializar la página");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [user, authLoading, userRole, isSuperAdmin]);

  const handleUserCardDeleted = () => {
    setUserCard(null);
    setCards(prev => prev.filter(card => card.id !== userCard?.id));
  };

  const handleCardDeleted = (cardId: string) => {
    setAllCards(prev => prev.filter(card => card.id !== cardId));
    if (userCard?.id === cardId) {
      setUserCard(null);
    }
  };

  // Don't render anything if redirecting
  if (!authLoading && !user) {
    return null;
  }

  // Show loading only if auth is loading
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-lg">Cargando...</p>
          <p className="text-sm text-gray-500 mt-2">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Show error if there's one
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

export default Index;
