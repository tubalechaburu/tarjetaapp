
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import ProfileHeader from "./ProfileHeader";
import ProfileFormData from "./ProfileFormData";
import UserCardInfo from "./UserCardInfo";
import { useProfileData } from "./useProfileData";

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
  const { userCard, formData, setFormData } = useProfileData(userId, profile);

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
      <ProfileHeader
        userCard={userCard}
        editing={editing}
        onEditToggle={() => setEditing(true)}
        onSave={handleSaveProfile}
      />
      <CardContent className="space-y-4">
        <ProfileFormData
          formData={formData}
          editing={editing}
          isSuperAdmin={isSuperAdmin}
          onChange={handleFormChange}
        />
        
        {userCard && <UserCardInfo userCard={userCard} />}
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
