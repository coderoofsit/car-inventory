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
export async function fetchVehiclesFromBackend(filters?: Record<string, any>): Promise<any[]> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  let fetchUrl = `${backendUrl}/api/cars`;
  if (filters && Object.keys(filters).length > 0) {
    const params = new URLSearchParams();
    if (filters.make) params.append('make', filters.make);
    if (filters.model) params.append('model', filters.model);
    if (filters.fuel) params.append('fuel', filters.fuel);
    if (filters.transmission) params.append('transmission', filters.transmission);
    if (filters.ownership) params.append('ownership', filters.ownership);
    if (filters.minYear) params.append('minYear', filters.minYear);
    if (filters.maxYear) params.append('maxYear', filters.maxYear);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minMileage) params.append('minMileage', filters.minMileage);
    if (filters.maxMileage) params.append('maxMileage', filters.maxMileage);
    fetchUrl += `?${params.toString()}`;
  }
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