
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCards } from "@/utils/storage";
import { BusinessCard } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus, QrCode } from "lucide-react";

const Index = () => {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true);
        const fetchedCards = await getCards();
        setCards(fetchedCards);
      } catch (error) {
        console.error("Error loading cards:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Tarjetas de Visita Virtuales</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Crea tu tarjeta de visita virtual con código QR y comparte fácilmente tu información de contacto
        </p>
        <Link to="/create">
          <Button size="lg" className="gap-2">
            <Plus size={18} />
            Crear Nueva Tarjeta
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center">
          <p>Cargando tarjetas...</p>
        </div>
      ) : cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link to={`/card/${card.id}`} key={card.id}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <QrCode className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription>{card.jobTitle} en {card.company}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <QrCode className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No tienes tarjetas todavía</h3>
          <p className="text-muted-foreground mb-6">
            Comienza creando tu primera tarjeta de visita virtual
          </p>
          <Link to="/create">
            <Button>Crear Mi Primera Tarjeta</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Index;
