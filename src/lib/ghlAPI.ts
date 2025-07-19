// src/lib/ghlAPI.ts

import axios from 'axios';

console.log("🔐 GHL KEY:", import.meta.env.VITE_GHL_API_KEY);

const api = axios.create({
  baseURL: 'https://rest.gohighlevel.com/v1',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_GHL_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ✅ Create Contact API
export const createContact = async (contactData: unknown) => {
  console.log('[GHL] About to POST to /contacts/ with:', contactData);
  try {
    const response = await api.post('/contacts/', contactData);
    console.log('[GHL] Response from /contacts/:', response.data);
    return response.data;
  } catch (error) {
    console.error('[GHL] Error posting to /contacts/:', error);
    throw error;
  }
};

// ✅ Create Opportunity API
export const createOpportunity = async (opportunityData) => {
  const pipelineId = "fZddfNFf75RykTgQfAtx"; // ✅ Your correct pipeline ID
  const url = `/pipelines/${pipelineId}/opportunities/`;
  const response = await api.post(url, opportunityData);
  return response.data;
};

export const debugStageIds = async () => {
  try {
    const response = await api.get(`/pipelines/fZddfNFf75RykTgQfAtx/`);
    console.log('🔍 DEBUG: Available Stage IDs:');
    response.data.stages?.forEach((stage, index) => {
      console.log(`${index + 1}. "${stage.name}" → ID: "${stage.id}"`);
    });
    return response.data.stages;
  } catch (error) {
    console.error('❌ Error fetching stages:', error);
    return [];
  }
};