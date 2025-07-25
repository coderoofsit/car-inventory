import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Car interface for type safety
export interface Car {
  _id?: string; // Backend MongoDB ID
  id: string | number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  kmRun?: number;
  location: string;
  location_id: string;
  fuel: string;
  transmission: string;
  media: string[];
  condition: string;
  description: string;
  vin: string;
  status: 'Available' | 'Sold' | 'Reserved' | 'Pending';
}

// Utility function to find the first image URL from an array
export function findFirstMediaUrl(urls: string[]): string | null {
  if (!Array.isArray(urls) || urls.length === 0) {
    return null;
  }
  
  // Common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.avif'];
  
  for (const url of urls) {
    if (typeof url === 'string' && url.trim()) {
      // Check if URL has an image extension
      const hasImageExtension = imageExtensions.some(ext => 
        url.toLowerCase().includes(ext)
      );
      
      if (hasImageExtension) {
        return url;
      }
    }
  }
  
  // If no image found, return the first valid URL (could be video or other media)
  return urls[0] || null;
}

// Utility function to find the first video URL from an array
export function findFirstVideoUrl(urls: string[]): string | null {
  if (!Array.isArray(urls) || urls.length === 0) {
    return null;
  }
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
  for (const url of urls) {
    if (typeof url === 'string' && url.trim()) {
      if (videoExtensions.some(ext => url.toLowerCase().includes(ext))) {
        return url;
      }
    }
  }
  return null;
}

// Utility function to get the best media URL for a car (image > image field > video > null)
export function getCarCardMediaUrl(car: any): { url: string; type: 'image' | 'video' | 'placeholder' } {
  // 1. Check media array for a valid image
  if (Array.isArray(car.media) && car.media.length > 0) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.avif'];
    const image = car.media.find((url: string) =>
      typeof url === 'string' && imageExtensions.some(ext => url.toLowerCase().includes(ext))
    );
    if (image) return { url: image, type: 'image' };
    // If only videos, optionally return the first video
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
    const video = car.media.find((url: string) =>
      typeof url === 'string' && videoExtensions.some(ext => url.toLowerCase().includes(ext))
    );
    if (video) return { url: video, type: 'video' };
  }
  // 2. Check for single image field (URL or base64)
  if (car.image && typeof car.image === 'string') {
    if (
      car.image.startsWith('http') ||
      car.image.startsWith('data:image')
    ) {
      return { url: car.image, type: 'image' };
    }
  }
  // 3. Fallback: no image or video found
  return { url: '', type: 'placeholder' };
}
