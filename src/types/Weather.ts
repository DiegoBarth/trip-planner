export interface WeatherPeriodSummary {
  temp: number
  icon: string
  description: string
  pop: number
}

export interface WeatherData {
  date: string
  temp: number
  tempMin: number
  tempMax: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  pop: number // Probability of precipitation (0-1)
  rain?: number // Rain volume in mm
  periods?: {
    morning?: WeatherPeriodSummary
    afternoon?: WeatherPeriodSummary
    evening?: WeatherPeriodSummary
  }
}

export interface WeatherForecast {
  city: string
  country: string
  forecast: WeatherData[]
}

export type WeatherCondition =
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'fog'