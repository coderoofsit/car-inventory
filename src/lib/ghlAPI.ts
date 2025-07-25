// src/lib/ghlAPI.ts

import axios from 'axios';

//console.log("🔐 GHL KEY:", import.meta.env.VITE_GHL_API_KEY);

const api = axios.create({
  baseURL: 'https://rest.gohighlevel.com/v1',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_GHL_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
// 
// ✅ Create Contact API
export const createContact = async (contactData: unknown) => {
  //console.log('[GHL] About to POST to /contacts/ with:', contactData);
 
  try {
    const response = await api.post('/contacts/', contactData);
    //console.log('[GHL] Response from /contacts/:', response.data);
    return response.data;
  } catch (error) {
    console.error('[GHL] Error posting to /contacts/:', error);
    throw error;
  }
};

// ✅ Create Opportunity API
export const createOpportunity = async (opportunityData) => {
  // Get required values from .env
  const pipelineId = import.meta.env.VITE__PIPELINE_ID;
  const locationId = import.meta.env.VITE_LOCATION_ID;
  const pipelineStageId = import.meta.env.VITE_INITIAL_STAGE_ID;
  // const assignedTo = import.meta.env.VITE_GHL_ASSIGNED_TO;
  const token = import.meta.env.VITE_INTEGRATION_TOKEN;
  const apiVersion = '2021-07-28';

  // Compose payload
  const payload = {
    ...opportunityData,
    pipelineId: opportunityData.pipelineId || pipelineId,
    locationId: opportunityData.locationId || locationId,
    pipelineStageId: opportunityData.pipelineStageId || pipelineStageId,
    
  };

  const url = 'https://services.leadconnectorhq.com/opportunities/';
  const headers = {
    Authorization: `Bearer ${token}`,
    Version: apiVersion,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const response = await axios.post(url, payload, { headers });
  return response.data;
};

export const getGhlLocations = async () => {
  const response = await api.get('/locations/');
  return response.data;
};


export const debugStageIds = async () => {
  try {
    const response = await api.get(`/pipelines/fZddfNFf75RykTgQfAtx/`);
    //console.log('🔍 DEBUG: Available Stage IDs:');
    response.data.stages?.forEach((stage, index) => {
      //console.log(`${index + 1}. "${stage.name}" → ID: "${stage.id}"`);
    });
    return response.data.stages;
  } catch (error) {
    console.error('❌ Error fetching stages:', error);
    return [];
  }
};