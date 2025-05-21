
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCardById } from "@/utils/storage";
import { BusinessCard } from "@/types";
import Footer from "@/components/Footer";
import ShareCardHeader from "@/components/navigation/ShareCardHeader";
import ShareCardDisplay from "@/components/card/ShareCardDisplay";
import ErrorDisplay from "@/components/card/ErrorDisplay";
import LoadingDisplay from "@/components/card/LoadingDisplay";
import useCardSharing from "@/hooks/useCardSharing";

const ShareCard = () => {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Generate the shareable URL for this card
  const cardShareUrl = id ? `/share/${id}` : '';
  const fullShareUrl = `${window.location.origin}${cardShareUrl}`;
  
  // Use the custom hook for sharing
  const { shareCard } = useCardSharing(card, fullShareUrl);

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

  if (loading) {
    return <LoadingDisplay />;
  }

  if (error || !card) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ShareCardHeader error={error} />
        <ErrorDisplay />
        <Footer />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ShareCardHeader error={null} />
      <ShareCardDisplay card={card} shareUrl={fullShareUrl} onShare={shareCard} />
      <Footer />
    </div>
  );
};

export default ShareCard;
