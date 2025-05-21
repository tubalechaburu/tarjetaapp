
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCardById, deleteCard, saveCard } from "@/utils/storage";
import { BusinessCard } from "@/types";
import CardPreview from "@/components/CardPreview";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { 
  ArrowLeft, 
  Share2, 
  Trash2, 
  QrCode, 
  Pencil, 
  Download, 
  MessageCircle 
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

const ViewCard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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
            
            // Asegurar que la tarjeta esté sincronizada con Supabase
            try {
              console.log("ViewCard: Ensuring card is synced with Supabase");
              await saveCard(foundCard);
            } catch (syncError) {
              console.error("Error syncing card with Supabase:", syncError);
            }
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

  const handleEdit = () => {
    if (id) {
      navigate(`/edit/${id}`);
    }
  };

  const shareCard = async () => {
    try {
      // Ensure the card exists in Supabase before sharing
      if (card) {
        try {
          await saveCard(card);
        } catch (error) {
          console.error("Error ensuring card exists in Supabase:", error);
        }
      }
      
      if (navigator.share) {
        await navigator.share({
          title: `Tarjeta de ${card?.name}`,
          text: `Información de contacto de ${card?.name} - ${card?.jobTitle} en ${card?.company}`,
          url: fullShareUrl
        });
      } else {
        await navigator.clipboard.writeText(fullShareUrl);
        toast.success("URL copiada al portapapeles");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("No se pudo compartir la tarjeta");
    }
  };

  // Generar vCard para descargar contacto
  const generateVCard = () => {
    if (!card) return;
    
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${card.name}`,
      card.jobTitle ? `TITLE:${card.jobTitle}` : "",
      card.company ? `ORG:${card.company}` : "",
      card.email ? `EMAIL:${card.email}` : "",
      card.phone ? `TEL:${card.phone}` : "",
      card.website ? `URL:${card.website}` : "",
      card.address ? `ADR:;;${card.address};;;` : "",
      "END:VCARD"
    ].filter(Boolean).join("\n");

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.name.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isOwner = () => {
    if (!card || !user) return false;
    return user.id === card.userId || !card.userId;
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
          <h1 className="text-2xl font-bold">Tarjeta de {card?.name}</h1>
          {isOwner() && (
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
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
          <>
            <CardPreview card={card} />
            
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button onClick={shareCard} className="gap-1">
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
              
              <Button onClick={generateVCard} variant="outline" className="gap-1">
                <Download className="h-4 w-4" />
                Guardar contacto
              </Button>
              
              {card.phone && (
                <Button 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => window.open(`https://wa.me/${card.phone.replace(/\D/g, "")}`, "_blank")}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              )}
            </div>
          </>
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
