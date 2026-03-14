import { fetchWeatherForecast } from '@/services/weatherService';
import { WEATHER_STALE_TIME_MS } from '@/config/constants';

export const weatherQueryKey = (city: string) => ['weather', city] as const;

export const getWeatherQueryOptions = (city: string) => ({
  queryKey: weatherQueryKey(city),
  queryFn: () => fetchWeatherForecast(city),
  staleTime: WEATHER_STALE_TIME_MS,
  retry: 1
});