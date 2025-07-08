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
  const response = await api.post('/contacts/', contactData);
  return response.data;
};

// ✅ Create Opportunity API
export const createOpportunity = async (opportunityData) => {
  const pipelineId = "fZddfNFf75RykTgQfAtx"; // ✅ Your correct pipeline ID
  const url = `/pipelines/${pipelineId}/opportunities/`;
  const response = await api.post(url, opportunityData);
  return response.data;
};

