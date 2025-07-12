// src/lib/vehicleAPI.ts

/**
 * Saves a vehicle to the backend database.
 * @param {any} vehicleData - The vehicle data to save.
 * @returns {Promise<any>} - Resolves to the saved vehicle data from the backend.
 *
 * Usage:
 *   import { saveVehicleToBackend } from './vehicleAPI';
 */
export async function saveVehicleToBackend(vehicleData: any): Promise<any> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const saveUrl = `${backendUrl}/api/cars`;

  try {
    const response = await fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const savedVehicle = await response.json();
    return savedVehicle;
  } catch (error) {
    console.error('Error saving vehicle to backend:', error);
    throw error;
  }
}

/**
 * Fetches all vehicles from the backend database.
 * @returns {Promise<any[]>} - Resolves to an array of vehicles.
 *
 * Usage:
 *   import { fetchVehiclesFromBackend } from './vehicleAPI';
 */
export async function fetchVehiclesFromBackend(): Promise<any[]> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const fetchUrl = `${backendUrl}/api/cars`;

  try {
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const vehicles = await response.json();
    return vehicles;
  } catch (error) {
    console.error('Error fetching vehicles from backend:', error);
    throw error;
  }
}

export async function fetchCarById(id: string) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const res = await fetch(`${backendUrl}/api/cars/${id}`);
  if (!res.ok) throw new Error('Failed to fetch car');
  return await res.json();
} 