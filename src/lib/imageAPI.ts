// src/lib/imageAPI.ts

/**
 * Uploads an image file to the backend Cloudinary upload endpoint.
 * @param {File} file - The image file to upload.
 * @param {(progress: number) => void} [onProgress] - Optional progress callback (0-100).
 * @returns {Promise<string>} - Resolves to the Cloudinary image URL.
 *
 * Usage:
 *   import { uploadImageToBackend } from './imageAPI';
 */
export async function uploadImageToBackend(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const uploadUrl = `${backendUrl}/api/cars/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.url) {
            resolve(response.url);
          } else {
            reject(new Error('No URL returned from backend'));
          }
        } catch (e) {
          reject(new Error('Invalid response from backend'));
        }
      } else {
        reject(new Error('Image upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Image upload failed'));
    xhr.send(formData);
  });
} 