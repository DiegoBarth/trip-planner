import type { WeatherData, WeatherPeriodSummary } from '@/types/Weather'

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * City coordinates for weather lookup
 */
const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // Japan
  'Tokyo': { lat: 35.6762, lon: 139.6503 },
  'Tóquio': { lat: 35.6762, lon: 139.6503 },
  'Kyoto': { lat: 35.0116, lon: 135.7681 },
  'Osaka': { lat: 34.6937, lon: 135.5023 },
  'Nara': { lat: 34.6851, lon: 135.8048 },
  'Hiroshima': { lat: 34.3853, lon: 132.4553 },
  'Hakone': { lat: 35.2328, lon: 139.1070 },

  // South Korea
  'Seoul': { lat: 37.5665, lon: 126.9780 },
  'Seul': { lat: 37.5665, lon: 126.9780 },
  'Busan': { lat: 35.1796, lon: 129.0756 },
  'Jeju': { lat: 33.4996, lon: 126.5312 },
  'Incheon': { lat: 37.4563, lon: 126.7052 },
  'Daegu': { lat: 35.8714, lon: 128.6014 }
}

/**
 * Get weather icon emoji based on OpenWeather icon code
 */
function getWeatherEmoji(iconCode: string): string {
  const code = iconCode.substring(0, 2);

  const iconMap: Record<string, string> = {
    '01': '☀️',  // clear sky
    '02': '🌤️',  // few clouds
    '03': '☁️',  // scattered clouds
    '04': '☁️',  // broken clouds
    '09': '🌧️',  // shower rain
    '10': '🌦️',  // rain
    '11': '⛈️',  // thunderstorm
    '13': '❄️',  // snow
    '50': '🌫️'   // mist/fog
  };

  return iconMap[code] || '🌤️';
}


/**
 * Fetch weather forecast for a city
 */
export async function fetchWeatherForecast(city: string): Promise<WeatherData[]> {
  // Check if API key is configured
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key not configured');

    return [];
  }

  // Get coordinates for the city
  const coords = CITY_COORDINATES[city];

  if (!coords) {
    console.warn(`Coordinates not found for city: ${city}`);

    return [];
  }

  try {
    const url = `${OPENWEATHER_BASE_URL}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { signal: controller.signal });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error('Weather API error:', response.status);

      return [];
    }

    const data = await response.json();

    if (!data.list || data.list.length === 0) {
      return [];
    }

    const timezoneOffsetSeconds = data.city?.timezone ?? 0;

    const toLocalDateAndHour = (dt: number) => {
      const d = new Date((dt + timezoneOffsetSeconds) * 1000);
      const date = d.toISOString().slice(0, 10);
      const hour = d.getUTCHours();
      return { date, hour };
    };

    type Slot = { hour: number; item: any };

    const slotsByDate: Record<string, Slot[]> = {};

    data.list.forEach((item: any) => {
      const { date, hour } = toLocalDateAndHour(item.dt);

      if (!slotsByDate[date]) slotsByDate[date] = [];

      slotsByDate[date].push({ hour, item });
    });

    const dailyForecasts: WeatherData[] = [];

    Object.entries(slotsByDate).forEach(([date, slots]) => {
      if (slots.length === 0) return;

      const tempMin = Math.min(...slots.map(s => s.item.main.temp_min));
      const tempMax = Math.max(...slots.map(s => s.item.main.temp_max));
      const maxPop = Math.max(...slots.map(s => s.item.pop || 0));

      const noonSlot = slots.find(s => s.hour === 12);
      const refSlot = noonSlot || slots[Math.floor(slots.length / 2)] || slots[0];
      const ref = refSlot.item;

      const periodSlot = (h: number) => slots.find(s => s.hour === h)?.item;

      const periodFromSlot = (item: any): WeatherPeriodSummary | undefined => item ? {
        temp: Math.round(item.main.temp),
        icon: getWeatherEmoji(item.weather[0].icon),
        description: item.weather[0].description,
        pop: item.pop || 0
      } : undefined;

      const morningItem = periodSlot(9) || periodSlot(6);
      const afternoonItem = periodSlot(15) || periodSlot(12);
      const eveningItem = periodSlot(21) || periodSlot(18);

      dailyForecasts.push({
        date,
        temp: Math.round(ref.main.temp),
        tempMin: Math.round(tempMin),
        tempMax: Math.round(tempMax),
        description: ref.weather[0].description,
        icon: getWeatherEmoji(ref.weather[0].icon),
        humidity: ref.main.humidity,
        windSpeed: ref.wind.speed,
        pop: maxPop,
        rain: ref.rain?.['3h'] || 0,
        periods: {
          ...(morningItem && { morning: periodFromSlot(morningItem) }),
          ...(afternoonItem && { afternoon: periodFromSlot(afternoonItem) }),
          ...(eveningItem && { evening: periodFromSlot(eveningItem) })
        }
      });
    });

    return dailyForecasts.sort((a, b) => a.date.localeCompare(b.date));
  }
  catch (error) {
    console.error('Error fetching weather:', error);

    return [];
  }
}

/**
 * Normalize date to YYYY-MM-DD for matching forecast entries
 */
function normalizeToYYYYMMDD(date: string): string {
  if (!date || typeof date !== 'string') return '';

  const trimmed = date.trim();

  if (trimmed.includes('T')) return trimmed.split('T')[0];

  if (trimmed.includes('/')) {
    const parts = trimmed.split('/').map(p => p.trim());

    if (parts.length === 3) {
      const isYearLast = parts[2].length === 4;
      const isYearFirst = parts[0].length === 4;

      if (isYearLast) {
        const [day, month, year] = parts;

        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      if (isYearFirst) {
        const [year, month, day] = parts;

        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
  }
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-');

    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return trimmed;
}

/**
 * Get weather for a specific date.
 * Só retorna previsão quando a data está no forecast (API OpenWeather = máx. 5 dias).
 * Datas fora da janela (ex.: 01/04/2026) retornam null para não exibir clima incorreto.
 */
export function getWeatherForDate(forecast: WeatherData[], date: string): WeatherData | null {
  const searchDate = normalizeToYYYYMMDD(date);

  if (!searchDate || !forecast?.length) return null;

  return forecast.find(w => w.date === searchDate) || null;
}

/**
 * Get weather recommendation based on conditions
 */
export function getWeatherRecommendation(weather: WeatherData): string {
  if (weather.pop > 0.7) {
    return '☔ Alta chance de chuva - leve guarda-chuva';
  }

  if (weather.pop > 0.4) {
    return '🌂 Possibilidade de chuva - considere levar guarda-chuva';
  }

  if (weather.temp > 30) {
    return '🌡️ Muito calor - use protetor solar e hidrate-se';
  }

  if (weather.temp < 10) {
    return '🧥 Frio - leve casaco';
  }

  if (weather.windSpeed > 10) {
    return '💨 Vento forte - se agasalhe';
  }

  if (weather.description.toLowerCase().includes('neve')) {
    return '❄️ Neve - vista roupas apropriadas';
  }

  return '✅ Clima favorável para passeios';
}