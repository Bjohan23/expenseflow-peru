// ===== SERVICIO DE ALMACENAMIENTO DE IMÁGENES LOCAL =====
export interface ImageStorage {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64
  timestamp: string;
  categoria?: string;
}

export class ImageStorageService {
  private readonly IMAGES_KEY = 'expenseflow_images';

  // Convertir archivo a base64
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Obtener imágenes del localStorage
  getImages(): ImageStorage[] {
    try {
      const data = localStorage.getItem(this.IMAGES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      return [];
    }
  }

  // Guardar imagen
  async saveImage(file: File, categoria?: string): Promise<ImageStorage> {
    try {
      const base64 = await ImageStorageService.fileToBase64(file);
      const imageInfo: ImageStorage = {
        id: this.generateId(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        timestamp: new Date().toISOString(),
        categoria
      };

      const images = this.getImages();
      images.push(imageInfo);
      this.saveImages(images);

      return imageInfo;
    } catch (error) {
      console.error('Error al guardar imagen:', error);
      throw new Error('No se pudo guardar la imagen');
    }
  }

  // Obtener imagen por ID
  getImageById(id: string): ImageStorage | null {
    const images = this.getImages();
    return images.find(img => img.id === id) || null;
  }

  // Obtener imágenes por categoría
  getImagesByCategory(categoria: string): ImageStorage[] {
    const images = this.getImages();
    return images.filter(img => img.categoria === categoria);
  }

  // Eliminar imagen
  deleteImage(id: string): boolean {
    const images = this.getImages();
    const index = images.findIndex(img => img.id === id);

    if (index === -1) return false;

    images.splice(index, 1);
    this.saveImages(images);

    return true;
  }

  // Obtener tamaño total almacenado
  getStorageSize(): number {
    const images = this.getImages();
    return images.reduce((total, img) => total + img.size, 0);
  }

  // Obtener tamaño en formato legible
  getStorageSizeReadable(): string {
    const bytes = this.getStorageSize();
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Limpiar imágenes antiguas (más de 30 días)
  cleanupOldImages(daysToKeep: number = 30): number {
    const images = this.getImages();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const initialLength = images.length;
    const filteredImages = images.filter(img => new Date(img.timestamp) >= cutoffDate);

    if (filteredImages.length < initialLength) {
      this.saveImages(filteredImages);
      return initialLength - filteredImages.length;
    }

    return 0;
  }

  // Validar tipo de archivo
  static isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  // Validar tamaño de archivo (por defecto 5MB)
  static isValidImageSize(file: File, maxSizeInMB: number = 5): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  private saveImages(images: ImageStorage[]) {
    try {
      localStorage.setItem(this.IMAGES_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Error al guardar imágenes:', error);
      throw new Error('No se pudieron guardar las imágenes en el almacenamiento local');
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const imageStorageService = new ImageStorageService();