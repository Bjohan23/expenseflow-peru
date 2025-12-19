import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TempImageUploaderProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function TempImageUploader({
  onImagesChange,
  maxImages = 3,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = ''
}: TempImageUploaderProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{[key: number]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validar tipo y tamaño de archivos
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach(file => {
      if (!acceptedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name}: Tipo de archivo no válido`);
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        invalidFiles.push(`${file.name}: Excede el tamaño máximo de ${maxSizeMB}MB`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast.error('Archivos inválidos:\n' + invalidFiles.join('\n'));
      return;
    }

    if (validFiles.length > 0) {
      // Validar límite de imágenes
      const totalImages = images.length + validFiles.length;
      if (totalImages > maxImages) {
        toast.error(`Solo puedes subir máximo ${maxImages} imágenes`);
        return;
      }

      const updatedImages = [...images, ...validFiles];

      // Crear previews solo para las nuevas imágenes
      const newPreviewUrls: {[key: number]: string} = {};
      validFiles.forEach((file, index) => {
        const imageIndex = images.length + index;
        newPreviewUrls[imageIndex] = URL.createObjectURL(file);
      });

      setImages(updatedImages);
      setPreviewUrls(prev => ({ ...prev, ...newPreviewUrls }));
      onImagesChange(updatedImages);
      toast.success(`${validFiles.length} imagen(es) seleccionada(s) - Se guardarán al enviar el formulario`);
    }

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    // Liberar URL del objeto para evitar fugas de memoria
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }

    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviewUrls = { ...previewUrls };
    delete updatedPreviewUrls[index];

    setImages(updatedImages);
    setPreviewUrls(updatedPreviewUrls);
    onImagesChange(updatedImages);
    toast.success('Imagen eliminada');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Eliminado - usamos previewUrls en su lugar

  // Limpiar URLs al desmontar
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botón de carga */}
      <Button
        onClick={triggerFileInput}
        disabled={images.length >= maxImages}
        variant="outline"
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        Seleccionar Imágenes
      </Button>

      {/* Información */}
      <div className="text-sm text-gray-600">
        Imágenes seleccionadas: {images.length}/{maxImages}
      </div>

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Imágenes seleccionadas:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-3">
                  <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-3">
                    <img
                      src={previewUrls[index] || ''}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium truncate" title={image.name}>
                      {image.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(image.size)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Requisitos */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>Tamaño máximo: {maxSizeMB}MB por imagen</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>Formatos: {acceptedTypes.join(', ')}</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>Máximo {maxImages} imágenes</span>
        </div>
        <div className="flex items-center gap-1 text-blue-600">
          <AlertCircle className="w-3 h-3" />
          <span>Las imágenes se guardarán al enviar el formulario</span>
        </div>
      </div>
    </div>
  );
}