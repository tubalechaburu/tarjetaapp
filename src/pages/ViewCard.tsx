
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCardById } from "@/utils/storage";
import { BusinessCard } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import Footer from "@/components/Footer";
import BackButton from "@/components/navigation/BackButton";
import CardActions from "@/components/card/CardActions";
import PreviewContent from "@/components/card/PreviewContent";
import PreviewActions from "@/components/card/PreviewActions";
import QRCodeDisplay from "@/components/qr/QRCodeDisplay";
import { downloadSvgAsPng, createAndDownloadShortcut } from "@/utils/qrDownloader";
import { Download, Share2, Copy } from "lucide-react";

const ViewCard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrRef, setQrRef] = useState<SVGSVGElement | null>(null);
  
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

  const handleDownloadQR = async () => {
    if (!card || !qrRef) {
      toast.error("Error: No se puede acceder al código QR");
      return;
    }
    
    console.log("Attempting to download QR code...");
    console.log("QR ref available:", !!qrRef);
    console.log("Card name:", card.name);
    
    const filename = `QR_${card.name.replace(/\s+/g, '_')}.png`;
    try {
      await downloadSvgAsPng(qrRef, 400, filename);
    } catch (error) {
      console.error("Error al descargar el QR:", error);
      toast.error("Error al descargar el código QR");
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      toast.success("URL copiada al portapapeles");
    } catch (error) {
      console.error("Error copying URL:", error);
      toast.error("No se pudo copiar la URL");
    }
  };

  const handleDownloadShortcut = () => {
    if (!card) return;
    createAndDownloadShortcut(fullShareUrl, card.name);
  };

  const handleQRRef = (ref: SVGSVGElement | null) => {
    console.log("QR ref received:", !!ref);
    setQrRef(ref);
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton to="/" />

      <div className="max-w-md mx-auto">
        <CardActions 
          card={card} 
          isOwner={isOwner()} 
          shareUrl={fullShareUrl}
          onDelete={() => navigate("/")}
        />

        {/* Contenido de la tarjeta */}
        <div className="space-y-6">
          <PreviewContent 
            card={card}
          />
          
          <PreviewActions 
            card={card}
            onShare={handleShare}
          />
          
          {/* QR Code section */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-3 text-center">Código QR</h3>
            <div className="flex flex-col items-center space-y-4">
              <QRCodeDisplay 
                url={fullShareUrl} 
                size={200} 
                onSvgRef={handleQRRef} 
              />
              
              {/* QR and sharing actions */}
              <div className="flex flex-col w-full gap-2">
                <Button 
                  onClick={handleDownloadQR} 
                  variant="default" 
                  className="flex items-center gap-2 w-full"
                >
                  <Download className="h-4 w-4" />
                  Descargar código QR
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleCopyUrl} 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar URL
                  </Button>
                  
                  <Button 
                    onClick={handleDownloadShortcut} 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Acceso directo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewCard;
