
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image } from "lucide-react";

interface ImageUploaderProps {
  id: string;
  label: string;
  description: string;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  id,
  label,
  description,
  preview,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          {preview ? (
            <img 
              src={preview} 
              alt="Vista previa" 
              className={`w-full h-full ${id.includes('logo') ? 'object-contain p-2' : 'object-cover'}`}
            />
          ) : (
            <Image className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="relative">
            <Input
              id={id}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onChange}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById(id)?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir imagen
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
