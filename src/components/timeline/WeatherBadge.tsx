import { Droplets, Wind, ThermometerSun } from 'lucide-react'
import { getWeatherRecommendation } from '@/services/weatherService'
import type { WeatherData } from '@/types/Weather'

interface WeatherBadgeProps {
  weather: WeatherData
}

export function WeatherBadge({ weather }: WeatherBadgeProps) {
  const recommendation = getWeatherRecommendation(weather);
  const hasRainWarning = weather.pop > 0.4;
  const periods = weather.periods;
  const hasPeriods = periods && (periods.morning || periods.afternoon || periods.evening);

  return (
    <div className={`
      border-2 rounded-lg p-3 
      ${hasRainWarning ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}
    `}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{weather.icon}</span>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {weather.tempMin}° - {weather.tempMax}°
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {weather.description}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
          <div className="flex items-center gap-1 justify-end">
            <ThermometerSun className="w-4 h-4" />
            <span>min / max</span>
          </div>
        </div>
      </div>

      {hasPeriods && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
          {periods.morning && (
            <span className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Manhã</span>
              <span>{periods.morning.icon}</span>
              <span className="font-semibold">{periods.morning.temp}°</span>
              {periods.morning.pop > 0.3 && (
                <span className="text-xs text-blue-600 dark:text-blue-400">{Math.round(periods.morning.pop * 100)}%</span>
              )}
            </span>
          )}
          {periods.afternoon && (
            <span className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tarde</span>
              <span>{periods.afternoon.icon}</span>
              <span className="font-semibold">{periods.afternoon.temp}°</span>
              {periods.afternoon.pop > 0.3 && (
                <span className="text-xs text-blue-600 dark:text-blue-400">{Math.round(periods.afternoon.pop * 100)}%</span>
              )}
            </span>
          )}
          {periods.evening && (
            <span className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Noite</span>
              <span>{periods.evening.icon}</span>
              <span className="font-semibold">{periods.evening.temp}°</span>
              {periods.evening.pop > 0.3 && (
                <span className="text-xs text-blue-600 dark:text-blue-400">{Math.round(periods.evening.pop * 100)}%</span>
              )}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>até {Math.round(weather.pop * 100)}% chuva</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3" />
          <span>{weather.windSpeed.toFixed(1)} m/s</span>
        </div>
        <div className="flex items-center gap-1">
          💧 {weather.humidity}%
        </div>
      </div>

      <div className={`
        text-xs font-medium p-2 rounded
        ${hasRainWarning ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'}
      `}>
        {recommendation}
      </div>
    </div>
  );
}