
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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

interface FormData {
  full_name: string;
  phone: string;
  website: string;
  linkedin: string;
  company: string;
  job_title: string;
  email: string;
  description: string;
  address: string;
}

export const useProfileData = (userId: string, profile: UserProfile | null) => {
  const [userCard, setUserCard] = useState<BusinessCard | null>(null);
  const [formData, setFormData] = useState<FormData>({
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
    const loadUserData = async () => {
      try {
        console.log("Loading user data for:", userId);
        
        // Get user's profile data first
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('Error loading profile:', profileError);
        }

        console.log("Profile data loaded:", profileData);
        
        // Get user's card data
        const { data: cardData, error: cardError } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (cardError) {
          console.error('Error loading user card:', cardError);
        }

        console.log("Card data loaded:", cardData);

        if (cardData) {
          const mappedCard = mapSupabaseToBusinessCard(cardData as unknown as SupabaseBusinessCard);
          setUserCard(mappedCard);
          
          const linkedinLink = mappedCard.links?.find(link => link.type === 'linkedin')?.url || '';
          
          setFormData({
            full_name: mappedCard.name || profileData?.full_name || profile?.full_name || '',
            phone: mappedCard.phone || profile?.phone || '',
            website: mappedCard.website || profile?.website || '',
            linkedin: linkedinLink || profile?.linkedin || '',
            company: mappedCard.company || profile?.company || '',
            job_title: mappedCard.jobTitle || profile?.job_title || '',
            email: mappedCard.email || profileData?.email || profile?.email || '',
            description: mappedCard.description || profile?.description || '',
            address: mappedCard.address || profile?.address || ''
          });
        } else {
          // No card, use profile data or create empty form
          setFormData({
            full_name: profileData?.full_name || profile?.full_name || '',
            phone: profile?.phone || '',
            website: profile?.website || '',
            linkedin: profile?.linkedin || '',
            company: profile?.company || '',
            job_title: profile?.job_title || '',
            email: profileData?.email || profile?.email || '',
            description: profile?.description || '',
            address: profile?.address || ''
          });
        }
        
        console.log("Form data set:", formData);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId, profile]);

  return {
    userCard,
    formData,
    setFormData
  };
};
