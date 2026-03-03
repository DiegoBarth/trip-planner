import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Timeline from '../Timeline';
import * as useWeatherHook from '@/hooks/useWeather';
import * as weatherService from '@/services/weatherService';
import { TimelineCard } from '@/components/timeline/TimelineCard';
import type { TimelineDay, TimelineSegment } from '@/types/Timeline';
import type { Attraction } from '@/types/Attraction';
import type { WeatherData, WeatherPeriodSummary } from '@/types/Weather';

// Mock child components to simplify tests
vi.mock('@/components/timeline/TimelineCard', () => ({
  TimelineCard: vi.fn((props) => {
    // chama onToggleVisited automaticamente para testes
    props.onToggleVisited?.(props.attraction.id);
    return <div data-testid="timeline-card" />;
  })
}));

vi.mock('@/components/timeline/WeatherBadge', () => ({
  WeatherBadge: vi.fn(() => <div data-testid="weather-badge" />)
}));

describe('Timeline Component', () => {
  // Optional periods for a richer weather forecast
  const morning: WeatherPeriodSummary = {
    temp: 18,
    icon: 'sunny',
    pop: 0
  };

  const afternoon: WeatherPeriodSummary = {
    temp: 22,
    icon: 'sunny',
    pop: 0.1
  };

  const evening: WeatherPeriodSummary = {
    temp: 16,
    icon: 'cloudy',
    pop: 0.2
  };

  // Full mock forecast
  const mockForecast: WeatherData[] = [
    {
      date: '2026-03-03',
      temp: 20,
      tempMin: 15,
      tempMax: 25,
      description: 'Sunny',
      icon: 'sunny',
      humidity: 50,
      windSpeed: 10,
      pop: 0,
      rain: 0,
      periods: {
        morning,
        afternoon,
        evening
      }
    }
  ];
  const mockAttractions: Attraction[] = [
    {
      id: 1,
      name: 'Tokyo Tower',
      country: 'japan',
      city: 'Tokyo',
      day: 1,
      date: '2026-03-03',
      dayOfWeek: 'Tuesday',
      type: 'viewpoint',
      order: 1,
      visited: true,
      needsReservation: false,
      couplePrice: 100,
      currency: 'JPY',
      priceInBRL: 4.5,
      duration: 90
    },
    {
      id: 2,
      name: 'Senso-ji Temple',
      country: 'japan',
      city: 'Tokyo',
      day: 1,
      date: '2026-03-03',
      dayOfWeek: 'Tuesday',
      type: 'temple',
      order: 2,
      visited: false,
      needsReservation: true,
      couplePrice: 0,
      currency: 'JPY',
      priceInBRL: 0,
      duration: 60
    }
  ];

  const mockSegments: TimelineSegment[] = [
    {
      from: mockAttractions[0],
      to: mockAttractions[1],
      durationMinutes: 15,
      distanceKm: 2.5,
      travelMode: 'walking'
    }
  ];

  const mockTimeline: TimelineDay = {
    dayNumber: 1,
    date: '2026-03-03',
    startTime: '08:00',
    endTime: '18:00',
    totalDistance: 12.3,
    totalTravelTime: 120,
    attractions: mockAttractions,
    segments: mockSegments,
    conflicts: [{ attractionId: 1, message: 'Conflict!', type: 'overlap', severity: 'warning' }]
  };

  beforeEach(() => {
    // Mock the useWeather hook
    vi.spyOn(useWeatherHook, 'useWeather').mockReturnValue({ forecast: mockForecast, isLoading: true, error: null });
    // Mock getWeatherForDate function
    vi.spyOn(weatherService, 'getWeatherForDate').mockReturnValue(mockForecast[0]);

    // Mock scrollIntoView globally
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders placeholder when no timeline is provided', () => {
    render(<Timeline timeline={null} />);
    expect(screen.getByText(/Nenhuma atração para mostrar/)).toBeInTheDocument();
  });

  it('renders timeline correctly with attractions', () => {
    render(<Timeline timeline={mockTimeline} />);
    expect(screen.getByText(/Dia 1/)).toBeInTheDocument();
    expect(screen.getByText(/03\/03\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/12.3 km/)).toBeInTheDocument();
    expect(screen.getByText(/120min/)).toBeInTheDocument();
    expect(screen.getAllByTestId('timeline-card').length).toBe(mockAttractions.length);
    expect(screen.getByTestId('weather-badge')).toBeInTheDocument();
  });

  it('renders conflicts when present', () => {
    render(<Timeline timeline={mockTimeline} />);
    expect(screen.getByText(/1 conflito detectado/)).toBeInTheDocument();
    expect(screen.getByText(/Verifique os avisos abaixo/)).toBeInTheDocument();
  });

  it('calls onToggleVisited when TimelineCard triggers it', () => {
    const onToggleVisited = vi.fn();
    render(<Timeline timeline={mockTimeline} onToggleVisited={onToggleVisited} />);
    const cardProps = (TimelineCard as any).mock.calls[0][0];
    cardProps.onToggleVisited?.(1);
    expect(onToggleVisited).toHaveBeenCalledWith(1);
  });

  it('scrolls to last visited attraction on render', () => {
    render(<Timeline timeline={mockTimeline} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('does not render weather badge if no date provided', () => {
    render(<Timeline timeline={{ ...mockTimeline, date: '' }} />);
    expect(screen.queryByTestId('weather-badge')).not.toBeInTheDocument();
  });
});