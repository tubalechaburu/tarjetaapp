
import { useState, useEffect } from "react";
import { BusinessCard } from "@/types";
import { getCardsSupabase } from "@/utils/supabaseStorage";
import { checkSupabaseConnection, getSystemStats, debugDataCheck } from "@/integrations/supabase/client";
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

const Index = () => {
  const { user, userRole, isSuperAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [userCard, setUserCard] = useState<BusinessCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [debugData, setDebugData] = useState<any>(null);

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
      if (!user || authLoading) {
        console.log("❌ No user or auth loading, skipping initialization");
        return;
      }
      
      try {
        setError(null);
        console.log("🚀 Starting page initialization for user:", user.id);
        console.log("👤 User email:", user.email);
        console.log("🔑 User role:", userRole);
        
        // Check Supabase connection
        try {
          console.log("🔍 Checking Supabase connection...");
          const connected = await checkSupabaseConnection();
          console.log("📡 Connection check result:", connected);
          setConnectionStatus(connected);
        } catch (connectionError) {
          console.error("💥 Error during connection check:", connectionError);
          setConnectionStatus(false);
        }

        // Debug data to see what's actually in the database
        try {
          console.log("🔍 Running debug data check...");
          const debugResult = await debugDataCheck();
          console.log("📊 Debug data result:", debugResult);
          setDebugData(debugResult);
        } catch (debugError) {
          console.error("💥 Error in debug data check:", debugError);
        }

        // Get system stats for debugging
        try {
          console.log("📊 Getting system stats...");
          const stats = await getSystemStats();
          console.log("📊 System stats:", stats);
          setSystemStats(stats);
        } catch (statsError) {
          console.error("💥 Error getting system stats:", statsError);
        }

        // Load user cards from Supabase using the new function
        try {
          console.log("📋 Loading user cards from Supabase for user:", user.id);
          setLoading(true);
          
          const fetchedCards = await getCardsSupabase();
          console.log("📦 Fetched user cards result:", fetchedCards);
          
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
          console.error("💥 Error loading cards:", error);
          setError("Error al cargar las tarjetas. Intenta refrescar la página.");
          setCards([]);
          setUserCard(null);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error("💥 Error in page initialization:", error);
        setError("Error al inicializar la página");
        setLoading(false);
      }
    };

    initPage();
  }, [user, authLoading, userRole, isSuperAdmin]);

  const handleUserCardDeleted = () => {
    setUserCard(null);
    setCards(prev => prev.filter(card => card.id !== userCard?.id));
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
        
        {/* Debug information for troubleshooting */}
        {isSuperAdmin() && (
          <div className="mt-4 space-y-4">
            {systemStats && (
              <div className="p-4 bg-gray-100 rounded">
                <h4 className="font-semibold">Estadísticas del sistema:</h4>
                <p>Perfiles totales: {systemStats.total_profiles}</p>
                <p>Tarjetas totales: {systemStats.total_cards}</p>
                <p>Superadmins: {systemStats.superadmin_count}</p>
              </div>
            )}
            
            {debugData && (
              <div className="p-4 bg-blue-50 rounded">
                <h4 className="font-semibold">Datos de debug:</h4>
                {debugData.map((item: any, index: number) => (
                  <div key={index}>
                    <p><strong>{item.table_name}:</strong> {item.row_count} registros</p>
                    {item.sample_data && (
                      <p className="text-sm text-gray-600">Datos: {item.sample_data}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
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

        {/* Debug information for superadmins */}
        {isSuperAdmin() && (
          <div className="mb-6 space-y-4">
            {systemStats && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Estadísticas del sistema:</h4>
                <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                  <div>Perfiles: {systemStats.total_profiles}</div>
                  <div>Tarjetas: {systemStats.total_cards}</div>
                  <div>Superadmins: {systemStats.superadmin_count}</div>
                </div>
              </div>
            )}
            
            {debugData && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Datos reales en la base de datos:</h4>
                <div className="mt-2 text-sm space-y-1">
                  {debugData.map((item: any, index: number) => (
                    <div key={index}>
                      <strong>{item.table_name}:</strong> {item.row_count} registros
                      {item.sample_data && item.sample_data !== '' && (
                        <div className="ml-4 text-gray-600">→ {item.sample_data}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
