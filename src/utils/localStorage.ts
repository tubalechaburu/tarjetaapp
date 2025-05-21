
import { BusinessCard } from "../types";

const STORAGE_KEY = "business-cards";

export const saveCardLocally = (card: BusinessCard): void => {
  const cards = getCardsLocally();
  const existingCardIndex = cards.findIndex((c) => c.id === card.id);
  
  if (existingCardIndex >= 0) {
    cards[existingCardIndex] = card;
  } else {
    cards.push(card);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

export const getCardsLocally = (): BusinessCard[] => {
  const storedCards = localStorage.getItem(STORAGE_KEY);
  return storedCards ? JSON.parse(storedCards) : [];
};

export const getCardByIdLocally = (id: string): BusinessCard | undefined => {
  const cards = getCardsLocally();
  return cards.find((card) => card.id === id);
};

export const deleteCardLocally = (id: string): void => {
  const cards = getCardsLocally();
  const filteredCards = cards.filter((card) => card.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCards));
};
