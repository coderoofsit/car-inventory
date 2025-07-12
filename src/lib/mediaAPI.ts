// src/lib/mediaAPI.ts

/**
 * Uploads a media file (image or video) to the backend Cloudinary upload endpoint.
 * @param {File} file - The media file to upload (image or video).
 * @param {(progress: number) => void} [onProgress] - Optional progress callback (0-100).
 * @returns {Promise<string>} - Resolves to the Cloudinary media URL.
 *
 * Usage:
 *   import { uploadMediaToBackend } from './mediaAPI';
 */
export async function uploadMediaToBackend(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const formData = new FormData();
  formData.append('media', file);

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
        reject(new Error('Media upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Media upload failed'));
    xhr.send(formData);
  });
} 