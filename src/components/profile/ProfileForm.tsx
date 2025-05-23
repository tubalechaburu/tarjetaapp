
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { BusinessCard, SupabaseBusinessCard } from "@/types";
import { mapSupabaseToBusinessCard } from "@/utils/supabase/mappers";

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

interface ProfileFormProps {
  profile: UserProfile | null;
  userId: string;
  isSuperAdmin: boolean;
  onProfileUpdated: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ 
  profile, 
  userId, 
  isSuperAdmin, 
  onProfileUpdated 
}) => {
  const [editing, setEditing] = useState(false);
  const [userCard, setUserCard] = useState<BusinessCard | null>(null);
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

  // Cargar datos del perfil y de la tarjeta del usuario
  useEffect(() => {
    const loadUserData = async () => {
      // Cargar tarjeta del usuario
      try {
        const { data: cardData, error: cardError } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (cardError) {
          console.error('Error loading user card:', cardError);
        } else if (cardData) {
          const mappedCard = mapSupabaseToBusinessCard(cardData as unknown as SupabaseBusinessCard);
          setUserCard(mappedCard);
          
          // Si hay tarjeta, usar sus datos como base
          setFormData({
            full_name: mappedCard.name || profile?.full_name || '',
            phone: mappedCard.phone || profile?.phone || '',
            website: mappedCard.website || profile?.website || '',
            linkedin: profile?.linkedin || '',
            company: mappedCard.company || profile?.company || '',
            job_title: mappedCard.jobTitle || profile?.job_title || '',
            email: mappedCard.email || profile?.email || '',
            description: mappedCard.description || profile?.description || '',
            address: mappedCard.address || profile?.address || ''
          });
        } else {
          // Si no hay tarjeta, usar solo datos del perfil
          setFormData({
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
            website: profile?.website || '',
            linkedin: profile?.linkedin || '',
            company: profile?.company || '',
            job_title: profile?.job_title || '',
            email: profile?.email || '',
            description: profile?.description || '',
            address: profile?.address || ''
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId, profile]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Perfil actualizado correctamente');
      setEditing(false);
      onProfileUpdated();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Información Personal</CardTitle>
        <div className="flex gap-2">
          {userCard && (
            <Button 
              variant="outline" 
              onClick={() => window.open(`/card/${userCard.id}`, '_blank')}
            >
              Ver tarjeta
            </Button>
          )}
          <Button 
            variant={editing ? "default" : "outline"} 
            onClick={() => editing ? handleSaveProfile() : setEditing(true)}
          >
            {editing ? "Guardar" : "Editar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              value={formData.email}
              onChange={handleFormChange}
              disabled={!editing || !isSuperAdmin}
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
        
        {userCard && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Los datos mostrados se sincronizan con tu tarjeta digital: <strong>{userCard.name}</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
