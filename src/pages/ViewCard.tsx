
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
  const [activeTab, setActiveTab] = useState<"preview" | "qrcode">("preview");

  useEffect(() => {
    if (id) {
      const foundCard = getCardById(id);
      if (foundCard) {
        setCard(foundCard);
      } else {
        toast.error("Tarjeta no encontrada");
        navigate("/");
      }
    }
  }, [id, navigate]);

  const handleDelete = () => {
    if (id && confirm("¿Estás seguro de que quieres eliminar esta tarjeta?")) {
      deleteCard(id);
      toast.success("Tarjeta eliminada");
      navigate("/");
    }
  };

  const shareCard = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tarjeta de ${card?.name}`,
          text: `Información de contacto de ${card?.name} - ${card?.jobTitle} en ${card?.company}`,
          url: shareUrl
        });
      } catch (error) {
        console.error("Error sharing:", error);
        toast.error("No se pudo compartir la tarjeta");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("URL copiada al portapapeles");
    }
  };

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Cargando...</p>
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
            <QRCodeGenerator url={window.location.href} size={200} />
            
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
