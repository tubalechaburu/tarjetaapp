
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "Cargando..." }: LoadingStateProps) => {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p>{message}</p>
      </CardContent>
    </Card>
  );
};
