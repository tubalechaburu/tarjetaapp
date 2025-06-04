
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCardById } from "@/utils/storage";
import { BusinessCard } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthContext";
import Footer from "@/components/Footer";
import BackButton from "@/components/navigation/BackButton";
import CardActions from "@/components/card/CardActions";
import ViewCardContent from "@/components/card/ViewCardContent";

const ViewCard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Generate the shareable URL for this card
  const cardShareUrl = id ? `/share/${id}` : '';
  const fullShareUrl = `${window.location.origin}${cardShareUrl}`;

  useEffect(() => {
    const fetchCard = async () => {
      if (id) {
        setLoading(true);
        try {
          console.log("ViewCard: Fetching card with ID:", id);
          
          // Intenta varias veces para asegurar que la tarjeta se encuentre
          let attempts = 0;
          let foundCard = null;
          
          while (!foundCard && attempts < 2) {
            foundCard = await getCardById(id);
            console.log(`ViewCard: Card fetch attempt ${attempts + 1} result:`, foundCard);
            
            if (!foundCard && attempts < 1) {
              // Esperar antes de intentar de nuevo
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            attempts++;
          }
          
          if (foundCard) {
            setCard(foundCard);
          } else {
            toast.error("Tarjeta no encontrada");
            navigate("/");
          }
        } catch (error) {
          console.error("Error al cargar la tarjeta:", error);
          toast.error("Error al cargar la tarjeta");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCard();
  }, [id, navigate]);

  const isOwner = () => {
    if (!card || !user) return false;
    return user.id === card.userId || !card.userId;
  };

  const handleShare = async () => {
    if (!card) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Tarjeta de ${card.name}`,
          text: `Información de contacto de ${card.name} - ${card.jobTitle} en ${card.company}`,
          url: fullShareUrl
        });
      } else {
        await navigator.clipboard.writeText(fullShareUrl);
        toast.success("Enlace copiado al portapapeles");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("No se pudo compartir la tarjeta");
    }
  };

  // Determinar a dónde debe llevar el botón volver
  const getBackRoute = () => {
    // Check if we came from admin panel
    const returnToAdmin = sessionStorage.getItem('returnToAdmin');
    if (returnToAdmin === 'true') {
      // Clear the flag and return to admin
      sessionStorage.removeItem('returnToAdmin');
      return "/admin";
    }
    
    // Si el usuario está autenticado, llevarlo al dashboard
    if (user) {
      return "/dashboard";
    }
    // Si no está autenticado, llevarlo a la landing
    return "/";
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
        <Link to={getBackRoute()}>
          <Button>Volver al inicio</Button>
        </Link>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton to={getBackRoute()} />

      <div className="max-w-md mx-auto">
        <CardActions 
          card={card} 
          isOwner={isOwner()} 
          shareUrl={fullShareUrl}
          onDelete={() => navigate(getBackRoute())}
        />

        <ViewCardContent 
          card={card}
          fullShareUrl={fullShareUrl}
          onShare={handleShare}
        />
      </div>
      <Footer />
    </div>
  );
};

export default ViewCard;
