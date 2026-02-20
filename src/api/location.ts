import { apiGet } from '@/api/client'

export interface LocationResult {
  displayName: string
  lat: string
  lon: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

/**
 * Search locations via Apps Script
 */
export async function searchLocations(name: string, city?: string, country?: string): Promise<LocationResult[]> {
  if (!name) return [];

  const query = [name, city, country].filter(Boolean).join(', ');

  const response = await apiGet<ApiResponse<LocationResult[]>>({
    action: 'searchLocations',
    q: query
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch locations');
  }

  return response.data;
}