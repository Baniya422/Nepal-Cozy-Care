/**
 * Centralized API and environment configuration for Nepal Cozy Care Frontend.
 *
 * Reads:
 * - VITE_API_BASE_URL: Backend origin (e.g., https://your-backend.onrender.com or http://127.0.0.1:8000)
 * - VITE_API_TIMEOUT: Request timeout in milliseconds (default: 10000)
 * - VITE_GOOGLE_CLIENT_ID: Client ID for Google OAuth / Sign-In
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

// In development, fallback to local Laravel dev server if env variable is unset.
// In production, fallback to empty string (relative origin) rather than localhost.
export const API_BASE_URL: string = (
  rawBaseUrl && rawBaseUrl.trim() !== ''
    ? rawBaseUrl.trim()
    : import.meta.env.DEV
      ? 'http://127.0.0.1:8000'
      : ''
).replace(/\/+$/, '');

export const API_TIMEOUT: number = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

export const GOOGLE_CLIENT_ID: string = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

/**
 * Returns a full API endpoint URL.
 * Example: getApiUrl('/plants') => 'https://api.example.com/api/plants'
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const apiPath = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
  return `${API_BASE_URL}${apiPath}`;
}

/**
 * Returns a full URL for files stored on Laravel's public disk.
 * Handles existing absolute URLs and placeholder fallbacks.
 */
export function getStorageUrl(path?: string | null, fallback = '/images/placeholder-plant.jpg'): string {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/images/')) return path;

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const storagePath = cleanPath.startsWith('storage/') ? cleanPath : `storage/${cleanPath}`;
  return `${API_BASE_URL}/${storagePath}`;
}

export default {
  API_BASE_URL,
  API_TIMEOUT,
  GOOGLE_CLIENT_ID,
  getApiUrl,
  getStorageUrl,
};
