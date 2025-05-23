
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

interface ProfileFormDataProps {
  formData: FormData;
  editing: boolean;
  isSuperAdmin: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ProfileFormData: React.FC<ProfileFormDataProps> = ({
  formData,
  editing,
  isSuperAdmin,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          value={formData.email}
          onChange={onChange}
          disabled={!editing || !isSuperAdmin}
        />
      </div>
      
      <div>
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input 
          id="full_name" 
          value={formData.full_name}
          onChange={onChange}
          disabled={!editing}
        />
      </div>
      
      <div>
        <Label htmlFor="job_title">Cargo</Label>
        <Input 
          id="job_title" 
          value={formData.job_title}
          onChange={onChange}
          disabled={!editing}
        />
      </div>
      
      <div>
        <Label htmlFor="company">Empresa</Label>
        <Input 
          id="company" 
          value={formData.company}
          onChange={onChange}
          disabled={!editing}
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input 
          id="phone" 
          value={formData.phone}
          onChange={onChange}
          disabled={!editing}
        />
      </div>
      
      <div>
        <Label htmlFor="website">Sitio web</Label>
        <Input 
          id="website" 
          value={formData.website}
          onChange={onChange}
          disabled={!editing}
        />
      </div>
      
      <div>
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input 
          id="linkedin" 
          value={formData.linkedin}
          onChange={onChange}
          disabled={!editing}
        />
      </div>
      
      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input 
          id="address" 
          value={formData.address}
          onChange={onChange}
          disabled={!editing}
        />
      </div>
      
      <div className="col-span-2">
        <Label htmlFor="description">Descripción profesional</Label>
        <Textarea 
          id="description" 
          value={formData.description}
          onChange={onChange}
          disabled={!editing}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default ProfileFormData;
