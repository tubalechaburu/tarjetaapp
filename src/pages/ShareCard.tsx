
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCardById } from "@/utils/storage";
import { BusinessCard } from "@/types";
import CardPreview from "@/components/CardPreview";
import { ArrowLeft, Share2, QrCode } from "lucide-react";
import { toast } from "sonner";

const ShareCard = () => {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Generate the shareable URL for this card
  const fullShareUrl = window.location.href;

  useEffect(() => {
    const fetchCard = async () => {
      if (id) {
        setLoading(true);
        try {
          const foundCard = await getCardById(id);
          if (foundCard) {
            setCard(foundCard);
          } else {
            console.error("Tarjeta no encontrada");
          }
        } catch (error) {
          console.error("Error al cargar la tarjeta:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCard();
  }, [id]);

  const shareCard = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Tarjeta de ${card?.name}`,
          text: `Información de contacto de ${card?.name} - ${card?.jobTitle} en ${card?.company}`,
          url: fullShareUrl
        });
      } else {
        navigator.clipboard.writeText(fullShareUrl);
        toast.success("URL copiada al portapapeles");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("No se pudo compartir la tarjeta");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Tarjeta no encontrada</h2>
        <p className="mb-6">La tarjeta que estás buscando no existe o ha sido eliminada.</p>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/">
        <Button variant="ghost" className="mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Inicio
        </Button>
      </Link>

      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            Tarjeta de contacto de {card.name}
          </h1>
          <p className="text-muted-foreground">
            {card.jobTitle} en {card.company}
          </p>
        </div>

        <CardPreview card={card} />

        <div className="mt-6 flex justify-center">
          <Button onClick={shareCard} className="gap-1">
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareCard;
