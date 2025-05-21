
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCardById, deleteCard } from "@/utils/storage";
import { BusinessCard } from "@/types";
import CardPreview from "@/components/CardPreview";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { ArrowLeft, Download, Share2, Trash2, QrCode } from "lucide-react";
import { toast } from "sonner";

const ViewCard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "qrcode">("preview");
  
  // Generate the shareable URL for this card
  const cardShareUrl = id ? `/share/${id}` : '';
  const fullShareUrl = `${window.location.origin}${cardShareUrl}`;

  useEffect(() => {
    const fetchCard = async () => {
      if (id) {
        setLoading(true);
        try {
          const foundCard = await getCardById(id);
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

  const handleDelete = async () => {
    if (id && confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      try {
        await deleteCard(id);
        toast.success("Tarjeta eliminada");
        navigate("/");
      } catch (error) {
        console.error("Error al eliminar la tarjeta:", error);
        toast.error("Error al eliminar la tarjeta");
      }
    }
  };

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
          Volver
        </Button>
      </Link>

      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tarjeta de {card.name}</h1>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={activeTab === "preview" ? "default" : "outline"}
            onClick={() => setActiveTab("preview")}
            className="w-1/2"
          >
            Vista previa
          </Button>
          <Button
            variant={activeTab === "qrcode" ? "default" : "outline"}
            onClick={() => setActiveTab("qrcode")}
            className="w-1/2 gap-1"
          >
            <QrCode className="h-4 w-4" />
            Código QR
          </Button>
        </div>

        {activeTab === "preview" ? (
          <CardPreview card={card} />
        ) : (
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">
              Comparte tu tarjeta digital escaneando este código QR
            </p>
            <QRCodeGenerator url={cardShareUrl} size={200} />
            
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm break-all">{fullShareUrl}</p>
            </div>
            
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={shareCard} className="gap-1">
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCard;
