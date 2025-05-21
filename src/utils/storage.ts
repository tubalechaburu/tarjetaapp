
import { BusinessCard } from "../types";

const STORAGE_KEY = "business-cards";

export const saveCard = (card: BusinessCard): void => {
  const cards = getCards();
  const existingCardIndex = cards.findIndex((c) => c.id === card.id);
  
  if (existingCardIndex >= 0) {
    cards[existingCardIndex] = card;
  } else {
    cards.push(card);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

export const getCards = (): BusinessCard[] => {
  const storedCards = localStorage.getItem(STORAGE_KEY);
  return storedCards ? JSON.parse(storedCards) : [];
};

export const getCardById = (id: string): BusinessCard | undefined => {
  const cards = getCards();
  return cards.find((card) => card.id === id);
};

export const deleteCard = (id: string): void => {
  const cards = getCards();
  const filteredCards = cards.filter((card) => card.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCards));
};
