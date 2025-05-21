
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCards } from "@/utils/storage";
import { BusinessCard } from "@/types";
import { 
  Plus, 
  User, 
  LogOut, 
  LogIn,
  Trash2,
  QrCode, 
  CreditCard as CardIcon,
  Search
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { checkSupabaseConnection } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { Input } from "@/components/ui/input";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const initPage = async () => {
      // Verificar conexión con Supabase
      try {
        const connected = await checkSupabaseConnection();
        setConnectionStatus(connected);
        console.log("Supabase connection:", connected ? "OK" : "Failed");
      } catch (error) {
        console.error("Error checking Supabase connection:", error);
        setConnectionStatus(false);
      }

      // Cargar tarjetas
      try {
        setLoading(true);
        const fetchedCards = await getCards();
        setCards(fetchedCards);
      } catch (error) {
        console.error("Error al cargar tarjetas:", error);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Filtrar tarjetas según la búsqueda
  const filteredCards = cards.filter(card => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      card.name.toLowerCase().includes(query) ||
      (card.company && card.company.toLowerCase().includes(query)) ||
      (card.jobTitle && card.jobTitle.toLowerCase().includes(query)) ||
      (card.email && card.email.toLowerCase().includes(query))
    );
  });

  // Filtrar tarjetas del usuario actual
  const myCards = user 
    ? filteredCards.filter(card => card.userId === user.id)
    : filteredCards.filter(card => !card.userId || card.userId === "anonymous");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Tarjetas Digitales</h1>
        <div className="flex gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline" className="gap-1">
                <LogIn className="h-4 w-4" />
                Acceder
              </Button>
            </Link>
          )}
          <Link to="/create">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Crear tarjeta
            </Button>
          </Link>
        </div>
      </div>

      {connectionStatus === false && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
          <p>
            No se pudo conectar con Supabase. Las tarjetas se guardarán localmente.
          </p>
        </div>
      )}

      {/* Buscador */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar tarjetas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p>Cargando tarjetas...</p>
        </div>
      ) : myCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {myCards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardContent className="pt-6 pb-2">
                <div className="flex flex-col items-center">
                  <Avatar className="h-16 w-16 mb-2">
                    {card.avatarUrl ? (
                      <AvatarImage src={card.avatarUrl} alt={card.name} />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {getInitials(card.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <h3 className="font-bold text-center mt-2">{card.name}</h3>
                  {card.jobTitle && (
                    <p className="text-sm text-muted-foreground text-center">
                      {card.jobTitle}
                    </p>
                  )}
                  {card.company && (
                    <p className="text-sm font-medium text-center">
                      {card.company}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center gap-2 pt-2 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => navigate(`/card/${card.id}`)}
                >
                  <CardIcon className="h-4 w-4" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => navigate(`/share/${card.id}`)}
                >
                  <QrCode className="h-4 w-4" />
                  Compartir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-lg">
          <CardIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-xl font-medium">No tienes tarjetas</h3>
          <p className="text-muted-foreground mt-2">
            Crea tu primera tarjeta digital para compartirla fácilmente.
          </p>
          <Link to="/create" className="mt-6 inline-block">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Crear mi primera tarjeta
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Index;
