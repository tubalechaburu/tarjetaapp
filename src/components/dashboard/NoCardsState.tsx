
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NoCardsState = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <h2 className="text-xl font-semibold mb-4">No tienes tarjetas</h2>
        <p className="text-muted-foreground mb-6">
          Crea tu primera tarjeta digital para compartirla fácilmente.
        </p>
        <Button onClick={() => navigate('/create')} className="gap-1">
          <Plus className="h-4 w-4" />
          Crear mi primera tarjeta
        </Button>
      </CardContent>
    </Card>
  );
};
