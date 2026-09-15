import { API_BASE_URL, API_TIMEOUT } from '../config/api';

const API_ENDPOINT = `${API_BASE_URL}/api`;
/**
 * API Service for making HTTP requests to the Laravel backend
 */
class ApiService {
  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_ENDPOINT}${cleanEndpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    const defaultOptions: RequestInit = {
      signal: options.signal || controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    try {
      const response = await fetch(url, defaultOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
  /**
   * Test API connection
   */
  async ping(): Promise<{ status: string; message: string }> {
    return this.get<{ status: string; message: string }>('/ping');
  }
}
export const apiService = new ApiService();
export default apiService;
