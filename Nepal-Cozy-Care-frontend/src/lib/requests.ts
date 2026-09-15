import { API_BASE_URL } from '../config/api';

const API_ENDPOINT = `${API_BASE_URL}/api`;
export const apiClient = {
  fetch: async (endpoint: string) => {
    const response = await fetch(`${API_ENDPOINT}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  }
};
