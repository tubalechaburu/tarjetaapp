
import { useState, useEffect } from "react";
import { BusinessCard } from "@/types";
import { getCards } from "@/utils/storage";
import { useAuth } from "@/providers/AuthProvider";

export const useCardValidation = (initialData?: BusinessCard) => {
  const { user, isSuperAdmin } = useAuth();
  const [existingCards, setExistingCards] = useState<BusinessCard[]>([]);

  // Check existing cards on component mount
  useEffect(() => {
    const checkExistingCards = async () => {
      if (user && !initialData) {
        const cards = await getCards();
        const userCards = cards.filter(card => card.userId === user.id);
        setExistingCards(userCards);
      }
    };
    checkExistingCards();
  }, [user, initialData]);

  const canCreateCard = () => {
    if (initialData) return true; // Editing existing card
    if (isSuperAdmin()) return true; // Super admin can create multiple cards
    return existingCards.length === 0; // Regular users can only have one card
  };

  return {
    existingCards,
    canCreateCard,
    isSuperAdmin,
    user,
  };
};
