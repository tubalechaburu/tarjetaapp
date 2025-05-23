
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, User } from "lucide-react";

interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  company?: string;
  job_title?: string;
  created_at?: string;
  last_sign_in_at?: string;
  role?: string;
  cards_count?: number;
}

export const AllUsersTable: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        toast.error('Error al cargar usuarios');
        return;
      }

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }

      // Get cards count for each user
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('user_id');

      if (cardsError) {
        console.error('Error fetching cards:', cardsError);
      }

      // Count cards per user
      const cardsCount = cardsData?.reduce((acc, card) => {
        acc[card.user_id] = (acc[card.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Combine all data
      const combinedUsers: UserProfile[] = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id);
        const userRole = userRoles?.find(r => r.user_id === authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email,
          full_name: profile?.full_name || authUser.user_metadata?.full_name,
          avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
          phone: profile?.phone || authUser.user_metadata?.phone,
          website: profile?.website || authUser.user_metadata?.website,
          linkedin: profile?.linkedin || authUser.user_metadata?.linkedin,
          company: profile?.company || authUser.user_metadata?.company,
          job_title: profile?.job_title || authUser.user_metadata?.job_title,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          role: userRole?.role || 'user',
          cards_count: cardsCount[authUser.id] || 0
        };
      });

      console.log('Loaded users:', combinedUsers);
      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-500 text-white';
      case 'admin':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">Cargando usuarios...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Todos los Usuarios ({users.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={loadUsers} variant="outline">
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.full_name || 'Usuario'} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{user.full_name || 'Sin nombre'}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleBadgeColor(user.role || 'user')}>
                    {user.role || 'user'}
                  </Badge>
                  <Badge variant="outline">
                    {user.cards_count} tarjeta{user.cards_count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Cargo:</span>
                  <p className="text-gray-600">{user.job_title || 'No especificado'}</p>
                </div>
                <div>
                  <span className="font-medium">Empresa:</span>
                  <p className="text-gray-600">{user.company || 'No especificada'}</p>
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span>
                  <p className="text-gray-600">{user.phone || 'No especificado'}</p>
                </div>
                <div>
                  <span className="font-medium">Registro:</span>
                  <p className="text-gray-600">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'No disponible'}
                  </p>
                </div>
              </div>
              
              {user.website && (
                <div>
                  <span className="font-medium text-sm">Sitio web:</span>
                  <p className="text-sm text-blue-600">{user.website}</p>
                </div>
              )}
              
              {user.linkedin && (
                <div>
                  <span className="font-medium text-sm">LinkedIn:</span>
                  <p className="text-sm text-blue-600">{user.linkedin}</p>
                </div>
              )}
            </div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron usuarios
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
