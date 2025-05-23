
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
  const [saving, setSaving] = useState(false);
  const { userCard, formData, setFormData } = useProfileData(userId, profile);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (saving) return; // Prevent multiple submissions
    
    setSaving(true);
    console.log("Saving profile with data:", formData);
    
    try {
      // Prepare the profile data
      const profileData = {
        id: userId,
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        website: formData.website || null,
        linkedin: formData.linkedin || null,
        company: formData.company || null,
        job_title: formData.job_title || null,
        email: formData.email || null,
        description: formData.description || null,
        address: formData.address || null,
        updated_at: new Date().toISOString()
      };

      console.log("Upserting profile data:", profileData);

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log("Profile saved successfully:", data);
      toast.success('Perfil actualizado correctamente');
      setEditing(false);
      onProfileUpdated();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <ProfileHeader
        userCard={userCard}
        editing={editing}
        saving={saving}
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
