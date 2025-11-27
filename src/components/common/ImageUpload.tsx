import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  bucket: string;
  folder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  bucket,
  folder = "",
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`Tipo de archivo no permitido. Use: ${acceptedTypes.join(", ")}`);
      return;
    }

    // Validar tamaño
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`El archivo no debe superar ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);

    try {
      // Crear preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Generar nombre único
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Subir archivo
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

      onImageUploaded(publicUrlData.publicUrl);
      toast.success("Imagen subida correctamente");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen: " + error.message);
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;

    try {
      // Extraer el path del URL
      const urlParts = currentImageUrl.split("/");
      const bucketIndex = urlParts.findIndex((part) => part === bucket);
      if (bucketIndex !== -1) {
        const filePath = urlParts.slice(bucketIndex + 1).join("/");

        // Eliminar archivo del storage
        const { error } = await supabase.storage.from(bucket).remove([filePath]);

        if (error) {
          console.error("Error removing file:", error);
        }
      }

      setPreview(null);
      onImageRemoved();
      toast.success("Imagen eliminada correctamente");
    } catch (error: any) {
      console.error("Error removing image:", error);
      toast.error("Error al eliminar la imagen");
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {preview ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted">
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click para subir</span> o arrastra y suelta
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP o SVG (MAX. {maxSizeMB}MB)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={acceptedTypes.join(",")}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}

      {uploading && (
        <div className="flex items-center justify-center py-2">
          <Upload className="h-4 w-4 animate-pulse mr-2" />
          <span className="text-sm text-muted-foreground">Subiendo...</span>
        </div>
      )}
    </div>
  );
}
