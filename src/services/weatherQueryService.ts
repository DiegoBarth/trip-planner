import { fetchWeatherForecast } from '@/services/weatherService';

export const weatherQueryKey = (city: string) => ['weather', city] as const;

export const getWeatherQueryOptions = (city: string) => ({
  queryKey: weatherQueryKey(city),
  queryFn: () => fetchWeatherForecast(city),
  staleTime: 1000 * 60 * 30, // 30 minutos
  retry: 1
});