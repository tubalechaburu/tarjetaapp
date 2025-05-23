
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BusinessCard, SupabaseBusinessCard } from "@/types";
import { mapSupabaseToBusinessCard } from "@/utils/supabase/mappers";
import ProfileForm from "@/components/profile/ProfileForm";
import UserCardsTable from "@/components/profile/UserCardsTable";
import ProfileLoading from "@/components/profile/ProfileLoading";

// Define the type of the profile
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
      
      setProfile(data as UserProfile);
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

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <ProfileLoading />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <div className="max-w-4xl mx-auto space-y-6">
        <ProfileForm 
          profile={profile} 
          userId={user.id}
          isSuperAdmin={isSuperAdmin()}
          onProfileUpdated={fetchProfile}
        />

        <UserCardsTable cards={cards} />
      </div>
    </div>
  );
};

export default Profile;
