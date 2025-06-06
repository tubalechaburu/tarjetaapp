
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BusinessCard } from "@/types";
import { getCardById } from "@/utils/storage";
import { useAuth } from "@/providers/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/navigation/BackButton";
import CardForm from "@/components/CardForm";

const EditCard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole, isSuperAdmin } = useAuth();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      if (id) {
        try {
          const foundCard = await getCardById(id);
          if (foundCard) {
            // Verificar permisos: propietario de la tarjeta O superadmin
            const isOwner = user && foundCard.userId === user.id;
            const isSuperAdminUser = userRole === 'superadmin' || (isSuperAdmin && isSuperAdmin());
            
            if (!isOwner && !isSuperAdminUser) {
              toast.error("No tienes permisos para editar esta tarjeta");
              navigate("/dashboard");
              return;
            }
            setCard(foundCard);
          } else {
            toast.error("Tarjeta no encontrada");
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Error al cargar la tarjeta:", error);
          toast.error("Error al cargar la tarjeta");
          navigate("/dashboard");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCard();
  }, [id, navigate, user, userRole, isSuperAdmin]);

  const getBackRoute = () => {
    // Check if we came from admin panel
    const returnToAdmin = sessionStorage.getItem('returnToAdmin');
    if (returnToAdmin === 'true') {
      // Clear the flag and return to admin
      sessionStorage.removeItem('returnToAdmin');
      return "/admin";
    }
    
    // Si el usuario está autenticado, llevarlo al dashboard
    if (user) {
      return "/dashboard";
    }
    // Si no está autenticado, llevarlo a la landing
    return "/";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="text-center">
          <p>Cargando tarjeta...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Tarjeta no encontrada</h2>
          <p>La tarjeta que intentas editar no existe.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <BackButton to={getBackRoute()} />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Editar Tarjeta</h1>
        <CardForm initialData={card} />
      </div>
      
      <Footer />
    </div>
  );
};

export default EditCard;
