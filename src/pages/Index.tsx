import { useState, useEffect } from "react";
import { BusinessCard } from "@/types";
import { getCards, deleteCard } from "@/utils/storage";
import { checkSupabaseConnection } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

// Imported components
import { Header } from "@/components/Header";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import Footer from "@/components/Footer";

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
    console.log("Index component mounted");
    console.log("Auth loading:", authLoading);
    console.log("User:", user);
    console.log("User role:", userRole);
    
    const initPage = async () => {
      try {
        setError(null);
        console.log("Starting page initialization...");
        
        // Check Supabase connection
        try {
          console.log("Checking Supabase connection...");
          const connected = await checkSupabaseConnection();
          setConnectionStatus(connected);
          console.log("Supabase connection status:", connected);
        } catch (error) {
          console.error("Error checking Supabase connection:", error);
          setConnectionStatus(false);
        }

        // Load cards with better error handling
        if (user) {
          try {
            console.log("Loading cards...");
            setLoading(true);
            const fetchedCards = await getCards();
            console.log("Fetched cards:", fetchedCards);
            
            if (fetchedCards && Array.isArray(fetchedCards)) {
              // Remove duplicates by keeping only the latest card per user
              const uniqueCards = fetchedCards.reduce((acc: BusinessCard[], card) => {
                const existingIndex = acc.findIndex(c => c.userId === card.userId);
                if (existingIndex >= 0) {
                  // Keep the one with the latest createdAt timestamp
                  if ((card.createdAt || 0) > (acc[existingIndex].createdAt || 0)) {
                    acc[existingIndex] = card;
                  }
                } else {
                  acc.push(card);
                }
                return acc;
              }, []);
              
              console.log("Unique cards:", uniqueCards);
              setCards(uniqueCards);
              
              // Find user's card
              const foundUserCard = uniqueCards.find(card => card.userId === user.id);
              console.log("Found user card:", foundUserCard);
              setUserCard(foundUserCard || null);
            } else {
              console.log("No cards returned or invalid format");
              setCards([]);
              setUserCard(null);
            }
          } catch (error) {
            console.error("Error loading cards:", error);
            setError("Error al cargar las tarjetas. Revisa la conexión a Supabase.");
            toast.error("Error al cargar las tarjetas");
            // Still set empty arrays to prevent undefined errors
            setCards([]);
            setUserCard(null);
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error in page initialization:", error);
        setError("Error al inicializar la página");
        setLoading(false);
      }
    };

    // Only initialize if we have a user and auth is not loading
    if (!authLoading && user) {
      initPage();
    }
  }, [user, authLoading, userRole]); // Added userRole to dependencies

  // Don't render anything if redirecting
  if (!authLoading && !user) {
    return null;
  }

  const handleDeleteCard = async () => {
    if (!userCard) return;
    
    if (confirm("¿Estás seguro de que quieres eliminar tu tarjeta?")) {
      try {
        await deleteCard(userCard.id!);
        setUserCard(null);
        // Also update the cards array
        setCards(prev => prev.filter(card => card.id !== userCard.id));
        toast.success("Tarjeta eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar la tarjeta:", error);
        toast.error("Error al eliminar la tarjeta");
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Show loading only if auth is loading
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="text-center py-20">
          <p>Cargando...</p>
          <p className="text-sm text-gray-500">Verificando autenticación...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error if there's one
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="text-center py-20">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <ConnectionStatus connectionStatus={connectionStatus} />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mis Tarjetas Digitales</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {userRole || 'user'}
            </span>
            {(!userCard || isSuperAdmin()) && (
              <Button onClick={() => navigate('/create')} className="gap-1">
                <Plus className="h-4 w-4" />
                Crear tarjeta
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p>Cargando tarjetas...</p>
            </CardContent>
          </Card>
        ) : userCard ? (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {userCard.avatarUrl ? (
                      <AvatarImage src={userCard.avatarUrl} alt={userCard.name} />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {getInitials(userCard.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{userCard.name}</CardTitle>
                    {userCard.jobTitle && (
                      <p className="text-muted-foreground">{userCard.jobTitle}</p>
                    )}
                    {userCard.company && (
                      <p className="font-medium">{userCard.company}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/edit/${userCard.id}`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteCard}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-3">Información Personal</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <div className="flex items-center gap-2">
                        <span>{userCard.email || '-'}</span>
                        {userCard.visibleFields?.email ? (
                          <Eye className="h-3 w-3 text-green-600" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Descripción:</span>
                      <div className="flex items-center gap-2">
                        <span>{userCard.description || '-'}</span>
                        {userCard.visibleFields?.description ? (
                          <Eye className="h-3 w-3 text-green-600" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nombre completo:</span>
                      <div className="flex items-center gap-2">
                        <span>{userCard.name}</span>
                        {userCard.visibleFields?.name ? (
                          <Eye className="h-3 w-3 text-green-600" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cargo:</span>
                      <div className="flex items-center gap-2">
                        <span>{userCard.jobTitle || '-'}</span>
                        {userCard.visibleFields?.jobTitle ? (
                          <Eye className="h-3 w-3 text-green-600" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Empresa:</span>
                      <div className="flex items-center gap-2">
                        <span>{userCard.company || '-'}</span>
                        {userCard.visibleFields?.company ? (
                          <Eye className="h-3 w-3 text-green-600" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teléfono:</span>
                      <div className="flex items-center gap-2">
                        <span>{userCard.phone || '-'}</span>
                        {userCard.visibleFields?.phone ? (
                          <Eye className="h-3 w-3 text-green-600" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sitio web:</span>
                      <div className="flex items-center gap-2">
                        <span>{userCard.website || '-'}</span>
                        {userCard.visibleFields?.website ? (
                          <Eye className="h-3 w-3 text-green-600" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dirección:</span>
                      <div className="flex items-center gap-2">
                        <span>{userCard.address || '-'}</span>
                        {userCard.visibleFields?.address ? (
                          <Eye className="h-3 w-3 text-green-600" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Descripción profesional</h3>
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-muted-foreground flex-1">
                      {userCard.description || 'Sin descripción'}
                    </p>
                    {userCard.visibleFields?.description ? (
                      <Eye className="h-3 w-3 text-green-600 mt-1" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-gray-400 mt-1" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button onClick={() => navigate(`/card/${userCard.id}`)}>
                  Ver tarjeta
                </Button>
                <Button variant="outline" onClick={() => navigate(`/edit/${userCard.id}`)}>
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold mb-4">No tienes tarjetas</h2>
              <p className="text-muted-foreground mb-6">
                Crea tu primera tarjeta digital para compartirla fácilmente.
              </p>
              <Button onClick={() => navigate('/create')} className="gap-1">
                <Plus className="h-4 w-4" />
                Crear mi primera tarjeta
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Show all cards for superadmin */}
        {isSuperAdmin() && cards.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Todas las tarjetas (Superadmin)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                  <div key={card.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-12 w-12">
                        {card.avatarUrl ? (
                          <AvatarImage src={card.avatarUrl} alt={card.name} />
                        ) : (
                          <AvatarFallback>
                            {getInitials(card.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{card.name}</p>
                        <p className="text-sm text-muted-foreground">{card.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/card/${card.id}`)}
                      >
                        Ver tarjeta
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={async () => {
                          if (confirm("¿Eliminar esta tarjeta?")) {
                            try {
                              await deleteCard(card.id!);
                              setCards(prev => prev.filter(c => c.id !== card.id));
                              toast.success("Tarjeta eliminada");
                            } catch (error) {
                              toast.error("Error al eliminar la tarjeta");
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
