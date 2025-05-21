
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCardById } from "@/utils/storage";
import { BusinessCard } from "@/types";
import CardPreview from "@/components/CardPreview";
import { ArrowLeft, Share2, Download, MessageCircle, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ShareCard = () => {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Generate the shareable URL for this card
  const fullShareUrl = window.location.href;

  useEffect(() => {
    const fetchCard = async () => {
      if (id) {
        setLoading(true);
        setError(null);
        try {
          console.log("ShareCard: Fetching card with ID:", id);
          // Try multiple times with a delay to ensure we get the data
          let attempts = 0;
          let foundCard = null;
          
          while (!foundCard && attempts < 3) {
            foundCard = await getCardById(id);
            console.log(`ShareCard: Card fetch attempt ${attempts + 1} result:`, foundCard);
            
            if (!foundCard && attempts < 2) {
              // Wait before trying again
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            attempts++;
          }
          
          if (foundCard) {
            setCard(foundCard);
          } else {
            console.error("Tarjeta no encontrada");
            setError(`Tarjeta con ID ${id} no encontrada en la base de datos o almacenamiento local`);
          }
        } catch (error) {
          console.error("Error al cargar la tarjeta:", error);
          setError(`Error al cargar la tarjeta: ${error instanceof Error ? error.message : String(error)}`);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4 gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
        
        <div className="max-w-md mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Tarjeta no encontrada</AlertTitle>
            <AlertDescription>
              {error || "La tarjeta que estás buscando no existe o ha sido eliminada."}
            </AlertDescription>
          </Alert>
          
          <div className="text-muted-foreground text-sm space-y-2 mt-4">
            <p>Posibles razones:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>La tarjeta fue eliminada</li>
              <li>El ID de la tarjeta no es correcto</li>
              <li>La tarjeta no se ha guardado correctamente en la base de datos</li>
              <li>La tarjeta está solo en almacenamiento local de otro dispositivo</li>
            </ul>
          </div>
          
          <div className="mt-6">
            <Link to="/">
              <Button>Ir a la página principal</Button>
            </Link>
          </div>
        </div>
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
            {card.jobTitle} {card.company ? `en ${card.company}` : ''}
          </p>
        </div>

        <CardPreview card={card} actions={true} />
        
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
          
          <Link to="/create" className="mt-4 w-full">
            <Button variant="default" className="w-full gap-1">
              <Link2 className="h-4 w-4" />
              Crea tu propia tarjeta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShareCard;
