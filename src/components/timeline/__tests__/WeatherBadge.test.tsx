import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherBadge } from '../WeatherBadge'
import { getWeatherRecommendation } from '@/services/weatherService'
import type { WeatherData } from '@/types/Weather'

vi.mock('@/services/weatherService', () => ({
  getWeatherRecommendation: vi.fn(),
}))

const mockWeatherBase: WeatherData = {
  date: '2026-03-03',
  temp: 25,
  tempMin: 18,
  tempMax: 28,
  description: 'ensolarado',
  icon: '☀️',
  humidity: 60,
  windSpeed: 3.5,
  pop: 0.1,
  rain: 0,
  periods: {
    morning: { temp: 20, icon: '🌤️', pop: 0.2 },
    afternoon: { temp: 26, icon: '☀️', pop: 0.5 },
    evening: { temp: 22, icon: '🌙', pop: 0.4 },
  },
}

describe('WeatherBadge Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getWeatherRecommendation).mockReturnValue('Recomendação Teste')
  })

  it('renders default weather when weather is null (Coverage line 31)', () => {
    render(<WeatherBadge weather={null} />)

    expect(screen.getByLabelText('weather-icon-main')).toHaveTextContent('🌤️')
    expect(screen.getByText('0° - 0°')).toBeInTheDocument()
    expect(screen.getByText('Sem previsão disponível')).toBeInTheDocument()
    expect(screen.getByText(/Previsão disponível/)).toBeInTheDocument()
    expect(screen.getByText(/até 0% chuva/)).toBeInTheDocument()
  })

  it('renders all periods and handles POP visibility (Coverage line 88 & 113-122)', () => {
    render(<WeatherBadge weather={mockWeatherBase} />)

    const morning = screen.getByTestId('period-morning')
    expect(within(morning).queryByText('20%')).not.toBeInTheDocument()

    const afternoon = screen.getByTestId('period-afternoon')
    expect(within(afternoon).getByText('50%')).toBeInTheDocument()

    const evening = screen.getByTestId('period-evening')
    expect(within(evening).getByText('Noite')).toBeInTheDocument()
    expect(within(evening).getByLabelText('icon-evening')).toHaveTextContent('🌙')
    expect(within(evening).getByText('22°')).toBeInTheDocument()
    expect(within(evening).getByText('40%')).toBeInTheDocument()
  })

  it('applies rain warning styles and colors (Coverage line 162)', () => {
    const rainWeather = { 
      ...mockWeatherBase, 
      pop: 0.8
    }
    
    const { container } = render(<WeatherBadge weather={rainWeather} />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('bg-blue-50')

    const recBox = screen.getByText('Recomendação Teste')
    expect(recBox).toHaveClass('bg-blue-100')
    expect(recBox).not.toHaveClass('bg-green-100')
  })

  it('applies normal styles when no rain warning is present', () => {
    render(<WeatherBadge weather={mockWeatherBase} />)

    const recBox = screen.getByText('Recomendação Teste')
    expect(recBox).toHaveClass('bg-green-100')
  })

  it('renders correctly when periods are missing', () => {
    const weatherNoPeriods = { 
      ...mockWeatherBase, 
      periods: { morning: undefined, afternoon: undefined, evening: undefined } 
    }
    render(<WeatherBadge weather={weatherNoPeriods} />)
    
    expect(screen.queryByTestId('period-morning')).not.toBeInTheDocument()
    expect(screen.queryByTestId('period-afternoon')).not.toBeInTheDocument()
    expect(screen.queryByTestId('period-evening')).not.toBeInTheDocument()
  })
})