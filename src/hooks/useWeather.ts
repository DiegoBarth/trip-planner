import { useQuery } from '@tanstack/react-query';
import { getWeatherQueryOptions } from '@/services/weatherQueryService';
import type { WeatherData } from '@/types/Weather';

export function useWeather(city: string) {
  const { data: forecast = [], isLoading, error } = useQuery<WeatherData[]>(getWeatherQueryOptions(city));

  return { forecast, isLoading, error };
}