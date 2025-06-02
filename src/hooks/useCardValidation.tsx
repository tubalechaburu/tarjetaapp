
import { useState, useEffect } from "react";
import { BusinessCard } from "@/types";
import { getCards } from "@/utils/storage";
import { useAuth } from "@/providers/AuthContext";

export const useCardValidation = (initialData?: BusinessCard) => {
  const { user, isSuperAdmin } = useAuth();
  const [existingCards, setExistingCards] = useState<BusinessCard[]>([]);

  // Check existing cards on component mount
  useEffect(() => {
    const checkExistingCards = async () => {
      if (user && !initialData) {
        try {
          const cards = await getCards();
          const userCards = cards.filter(card => card.userId === user.id);
          setExistingCards(userCards);
        } catch (error) {
          console.error("Error loading existing cards:", error);
          setExistingCards([]);
        }
      }
    };
    checkExistingCards();
  }, [user, initialData]);

  const canCreateCard = () => {
    if (initialData) return true; // Editing existing card
    if (isSuperAdmin()) return true; // Super admin can create multiple cards
    
    // Regular users have rate limiting (enforced by database trigger)
    // But we also check on frontend for better UX
    return existingCards.length < 5;
  };

  const getCardLimitMessage = () => {
    if (isSuperAdmin()) return null;
    const remaining = 5 - existingCards.length;
    if (remaining <= 0) return "You have reached the maximum limit of 5 cards.";
    return `You can create ${remaining} more card${remaining !== 1 ? 's' : ''}.`;
  };

  return {
    existingCards,
    canCreateCard,
    getCardLimitMessage,
    isSuperAdmin,
    user,
  };
};
