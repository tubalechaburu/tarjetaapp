
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/providers/AuthProvider";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BusinessCard, SupabaseBusinessCard } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ExternalLink, Edit, Plus } from "lucide-react";
import { mapSupabaseToBusinessCard } from "@/utils/supabase/mappers";
import { toast } from "sonner";

// Definir el tipo del perfil completo
interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  company?: string;
  job_title?: string;
  email?: string;
  description?: string;
  address?: string;
  updated_at?: string;
}

const Profile = () => {
  const { user, isSuperAdmin } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    website: '',
    linkedin: '',
    company: '',
    job_title: '',
    email: '',
    description: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserCards();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      const profileData = data as UserProfile;
      setProfile(profileData);
      setFormData({
        full_name: profileData?.full_name || '',
        phone: profileData?.phone || '',
        website: profileData?.website || '',
        linkedin: profileData?.linkedin || '',
        company: profileData?.company || '',
        job_title: profileData?.job_title || '',
        email: profileData?.email || user?.email || '',
        description: profileData?.description || '',
        address: profileData?.address || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const mappedCards = data ? data.map((card) => 
        mapSupabaseToBusinessCard(card as unknown as SupabaseBusinessCard)
      ) : [];
      
      setCards(mappedCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Perfil actualizado correctamente');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Información Personal</CardTitle>
            <Button 
              variant={editing ? "default" : "outline"} 
              onClick={() => editing ? handleSaveProfile() : setEditing(true)}
            >
              {editing ? "Guardar" : "Editar"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={formData.email}
                  onChange={handleFormChange}
                  disabled={!editing || !isSuperAdmin} // Only superadmin can change email 
                />
              </div>
              
              <div>
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input 
                  id="full_name" 
                  value={formData.full_name}
                  onChange={handleFormChange}
                  disabled={!editing}
                />
              </div>
              
              <div>
                <Label htmlFor="job_title">Cargo</Label>
                <Input 
                  id="job_title" 
                  value={formData.job_title}
                  onChange={handleFormChange}
                  disabled={!editing}
                />
              </div>
              
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input 
                  id="company" 
                  value={formData.company}
                  onChange={handleFormChange}
                  disabled={!editing}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={handleFormChange}
                  disabled={!editing}
                />
              </div>
              
              <div>
                <Label htmlFor="website">Sitio web</Label>
                <Input 
                  id="website" 
                  value={formData.website}
                  onChange={handleFormChange}
                  disabled={!editing}
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input 
                  id="linkedin" 
                  value={formData.linkedin}
                  onChange={handleFormChange}
                  disabled={!editing}
                />
              </div>
              
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input 
                  id="address" 
                  value={formData.address}
                  onChange={handleFormChange}
                  disabled={!editing}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Descripción profesional</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={handleFormChange}
                  disabled={!editing}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mis Tarjetas ({cards.length})</CardTitle>
            <Link to="/create">
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Nueva tarjeta
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {cards.length === 0 ? (
              <p className="text-muted-foreground">No tienes tarjetas creadas aún.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell>{card.name}</TableCell>
                      <TableCell>{card.company || '-'}</TableCell>
                      <TableCell>{card.email || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link to={`/card/${card.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ExternalLink className="h-4 w-4" />
                              Ver
                            </Button>
                          </Link>
                          <Link to={`/edit/${card.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Edit className="h-4 w-4" />
                              Editar
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
