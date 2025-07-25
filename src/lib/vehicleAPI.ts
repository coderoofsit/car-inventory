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

  // Always include location_id
  const payload = {
    ...vehicleData,
    location_id: vehicleData.location_id || import.meta.env.VITE_LOCATION_ID,
  };

  try {
    const response = await fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
 * Updates a vehicle in the backend database.
 * @param {string} id - The vehicle ID to update.
 * @param {any} vehicleData - The updated vehicle data.
 * @returns {Promise<any>} - Resolves to the updated vehicle data from the backend.
 *
 * Usage:
 *   import { updateVehicleToBackend } from './vehicleAPI';
 */
export async function updateVehicleToBackend(id: string, vehicleData: any): Promise<any> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const updateUrl = `${backendUrl}/api/cars/${id}`;

  // Always include location_id
  const payload = {
    ...vehicleData,
    location_id: vehicleData.location_id || import.meta.env.VITE_LOCATION_ID,
  };

  try {
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const updatedVehicle = await response.json();
    return updatedVehicle;
  } catch (error) {
    console.error('Error updating vehicle to backend:', error);
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
export async function fetchVehiclesFromBackend(params?: Record<string, any>): Promise<any[]> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  let url = `${backendUrl}/api/cars`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });
    if (Array.from(searchParams).length > 0) {
      url += `?${searchParams.toString()}`;
    }
  }
  //console.log('fetchVehiclesFromBackend URL:', url); // <-- Debug log
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching vehicles from backend:', error);
    throw error;
  }
}

export async function fetchCarById(id: string) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const res = await fetch(`${backendUrl}/api/${id}`);
  if (!res.ok) throw new Error('Failed to fetch car');
  return await res.json();
}

export async function fetchFilterMetadataFromBackend(): Promise<any> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const url = `${backendUrl}/api/filters`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching filter metadata from backend:', error);
    throw error;
  }
}

// Inspection Report API
export async function fetchInspectionReportByCarId(carId: string) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const res = await fetch(`${backendUrl}/api/inspection-reports/car/${carId}`);
  if (!res.ok) throw new Error('Failed to fetch inspection report');
  return await res.json();
}

export async function createInspectionReport(data: any) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const res = await fetch(`${backendUrl}/api/inspection-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create inspection report');
  return await res.json();
}

export async function updateInspectionReport(id: string, data: any) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const res = await fetch(`${backendUrl}/api/inspection-reports/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update inspection report');
  return await res.json();
} 