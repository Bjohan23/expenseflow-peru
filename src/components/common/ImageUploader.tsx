import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ImageStorageService, imageStorageService, ImageStorage } from '@/services/images.service';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImageSelect?: (image: ImageStorage) => void;
  onImagesChange?: (images: ImageStorage[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
  categoria?: string;
  multiple?: boolean;
}

export function ImageUploader({
  onImageSelect,
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
  categoria,
  multiple = false
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageStorage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validar tipo y tamaño de archivos
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach(file => {
      if (!ImageStorageService.isValidImageType(file)) {
        invalidFiles.push(`${file.name}: Tipo de archivo no válido`);
        return;
      }

      if (!ImageStorageService.isValidImageSize(file, maxSizeMB)) {
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
      await uploadImages(validFiles);
    }

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImages = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newImages: ImageStorage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(((i + 1) / files.length) * 100);

        const imageInfo = await imageStorageService.saveImage(file, categoria);
        newImages.push(imageInfo);
      }

      // Actualizar estado local
      const updatedImages = multiple ? [...images, ...newImages] : newImages;
      setImages(updatedImages);

      // Llamar callbacks
      onImagesChange?.(updatedImages);
      if (newImages.length > 0 && !multiple && onImageSelect) {
        onImageSelect(newImages[0]);
      }

      toast.success(`Se subió ${newImages.length} imagen(es) correctamente`);
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      toast.error('Error al subir las imágenes');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (imageId: string) => {
    const success = imageStorageService.deleteImage(imageId);
    if (success) {
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      onImagesChange?.(updatedImages);
      toast.success('Imagen eliminada');
    } else {
      toast.error('No se pudo eliminar la imagen');
    }
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botón de carga */}
      <Button
        onClick={triggerFileInput}
        disabled={isUploading || (multiple && images.length >= maxImages)}
        variant="outline"
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Subiendo...' : `Seleccionar Imagen${multiple ? 'es' : ''}`}
      </Button>

      {/* Información */}
      {!multiple && images.length > 0 && (
        <div className="text-sm text-gray-600">
          Imagen seleccionada: {images[0].name}
        </div>
      )}
      {multiple && (
        <div className="text-sm text-gray-600">
          Imágenes seleccionadas: {images.length}/{maxImages}
        </div>
      )}

      {/* Barra de progreso */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-xs text-gray-600 text-center">
            Subiendo... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Imágenes subidas:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="relative overflow-hidden">
                <CardContent className="p-3">
                  <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-3">
                    <img
                      src={image.data}
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
                        onClick={() => removeImage(image.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    {image.timestamp && (
                      <p className="text-xs text-gray-400">
                        {new Date(image.timestamp).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Información de almacenamiento */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <FileText className="w-3 h-3" />
        <span>
          Espacio utilizado: {imageStorageService.getStorageSizeReadable()}
        </span>
        <Badge variant="outline" className="text-xs">
          Local
        </Badge>
      </div>

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
        {multiple && (
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Máximo {maxImages} imágenes</span>
          </div>
        )}
      </div>
    </div>
  );
}