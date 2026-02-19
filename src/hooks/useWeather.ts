import { useQuery } from '@tanstack/react-query'
import { fetchWeatherForecast } from '@/services/weatherService'
import type { WeatherData } from '@/types/Weather'

export function useWeather(city: string) {
  const { data: forecast = [], isLoading, error } = useQuery<WeatherData[]>({
    queryKey: ['weather', city],
    queryFn: () => fetchWeatherForecast(city),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!city,
    retry: 1
  });

  return {
    forecast,
    isLoading,
    error
  };
}