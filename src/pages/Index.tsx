
import { useState, useEffect } from "react";
import { BusinessCard } from "@/types";
import { getCardsSupabase } from "@/utils/supabaseStorage";
import { checkSupabaseConnection } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthContext";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import Footer from "@/components/Footer";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserCardDisplay } from "@/components/dashboard/UserCardDisplay";
import { NoCardsState } from "@/components/dashboard/NoCardsState";
import { SuperAdminPanel } from "@/components/dashboard/SuperAdminPanel";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { ErrorState } from "@/components/dashboard/ErrorState";

const Index = () => {
  const { user, userRole, isSuperAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [userCard, setUserCard] = useState<BusinessCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle navigation when not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("No user found, redirecting to auth...");
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const initPage = async () => {
      // Solo cargar datos si hay usuario autenticado
      if (!user || authLoading) return;
      
      try {
        setError(null);
        console.log("Starting page initialization...");
        
        // Check Supabase connection
        try {
          console.log("Checking Supabase connection...");
          const connected = await checkSupabaseConnection();
          console.log("Connection check result:", connected);
          setConnectionStatus(connected);
          
          if (connected) {
            console.log("✅ Supabase connection successful");
          } else {
            console.log("⚠️ Supabase connection failed");
          }
        } catch (connectionError) {
          console.error("Error during connection check:", connectionError);
          setConnectionStatus(false);
        }

        // Load cards from Supabase only
        try {
          console.log("Loading cards from Supabase for user:", user.id);
          setLoading(true);
          const fetchedCards = await getCardsSupabase();
          console.log("Fetched cards from Supabase:", fetchedCards);
          
          if (fetchedCards && Array.isArray(fetchedCards)) {
            console.log("Setting cards:", fetchedCards);
            setCards(fetchedCards);
            
            // Find user's card
            const foundUserCard = fetchedCards.find(card => card.userId === user.id);
            console.log("Found user card:", foundUserCard);
            setUserCard(foundUserCard || null);
            
          } else {
            console.log("No cards returned or invalid format");
            setCards([]);
            setUserCard(null);
          }
        } catch (error) {
          console.error("Error loading cards:", error);
          setError("Error al cargar las tarjetas. Intenta refrescar la página.");
          setCards([]);
          setUserCard(null);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in page initialization:", error);
        setError("Error al inicializar la página");
        setLoading(false);
      }
    };

    initPage();
  }, [user, authLoading, userRole]);

  const handleUserCardDeleted = () => {
    setUserCard(null);
    setCards(prev => prev.filter(card => card.id !== userCard?.id));
  };

  const handleCardDeleted = (cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
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

        {loading ? (
          <LoadingState message="Cargando tarjetas desde Supabase..." />
        ) : userCard ? (
          <UserCardDisplay 
            userCard={userCard} 
            onCardDeleted={handleUserCardDeleted} 
          />
        ) : (
          <NoCardsState />
        )}

        {/* Show all cards for superadmin */}
        {isSuperAdmin() && (
          <SuperAdminPanel 
            cards={cards} 
            onCardDeleted={handleCardDeleted} 
          />
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
