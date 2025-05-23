
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
  const [formData, setFormData] = useState({
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
  );
};

export default ProfileForm;
