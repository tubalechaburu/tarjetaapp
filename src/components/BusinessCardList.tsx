
import { BusinessCard } from "@/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrCode, CreditCard as CardIcon, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface BusinessCardListProps {
  cards: BusinessCard[];
  loading: boolean;
}

export const BusinessCardList = ({ cards, loading }: BusinessCardListProps) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <p>Cargando tarjetas...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 border rounded-lg">
        <CardIcon className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-xl font-medium">No tienes tarjetas</h3>
        <p className="text-muted-foreground mt-2">
          Crea tu primera tarjeta digital para compartirla fácilmente.
        </p>
        <Link to="/create" className="mt-6 inline-block">
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Crear mi primera tarjeta
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.id} className="overflow-hidden">
          <CardContent className="pt-6 pb-2">
            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 mb-2">
                {card.avatarUrl ? (
                  <AvatarImage src={card.avatarUrl} alt={card.name} />
                ) : (
                  <AvatarFallback className="text-lg">
                    {getInitials(card.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <h3 className="font-bold text-center mt-2">{card.name}</h3>
              {card.jobTitle && (
                <p className="text-sm text-muted-foreground text-center">
                  {card.jobTitle}
                </p>
              )}
              {card.company && (
                <p className="text-sm font-medium text-center">
                  {card.company}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-2 pt-2 pb-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => navigate(`/card/${card.id}`)}
            >
              <CardIcon className="h-4 w-4" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => navigate(`/share/${card.id}`)}
            >
              <QrCode className="h-4 w-4" />
              Compartir
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
