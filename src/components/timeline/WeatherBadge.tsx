import { Droplets, Wind, ThermometerSun } from 'lucide-react'
import type { WeatherData } from '@/types/Weather'
import { getWeatherRecommendation } from '@/services/weatherService'

interface WeatherBadgeProps {
  weather: WeatherData
}

export function WeatherBadge({ weather }: WeatherBadgeProps) {
  const recommendation = getWeatherRecommendation(weather)
  const hasRainWarning = weather.pop > 0.4

  return (
    <div className={`
      border-2 rounded-lg p-3 
      ${hasRainWarning ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
    `}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{weather.icon}</span>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {weather.temp}°C
            </div>
            <div className="text-xs text-gray-600 capitalize">
              {weather.description}
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 text-right">
          <div className="flex items-center gap-1 justify-end">
            <ThermometerSun className="w-4 h-4" />
            <span>{weather.tempMin}° - {weather.tempMax}°</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>{Math.round(weather.pop * 100)}% chuva</span>
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
        ${hasRainWarning ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
      `}>
        {recommendation}
      </div>
    </div>
  )
}
