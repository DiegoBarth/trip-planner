import { useMemo } from 'react'
import { ArrowLeft, Calendar, CloudSun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAttraction } from '@/hooks/useAttraction'
import { Timeline } from '@/components/timeline/Timeline'
import { useCountry } from '@/contexts/CountryContext'
import { dateToInputFormat } from '@/utils/formatters'

export function TimelinePage() {
  const { country, day } = useCountry()
  const { attractions, isLoading } = useAttraction(country)

  // Filter attractions for the timeline
  const timelineAttractions = useMemo(() => {
    const mappable = attractions.filter(a => a.lat && a.lng)
    
    if (mappable.length === 0) return []
    
    // If a specific day is selected, use it
    if (day !== 'all') {
      return mappable.filter(a => a.day === day)
    }
    
    // If 'all', get the next day (similar to NextAttractions logic)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const futureAttractions = mappable
      .filter(a => a.date)
      .map(a => ({
        ...a,
        parsedDate: new Date(dateToInputFormat(a.date))
      }))
      .filter(a => a.parsedDate >= today)
    
    if (futureAttractions.length === 0) return []
    
    // Sort by date
    futureAttractions.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
    
    // Get the next day
    const nextDate = futureAttractions[0].parsedDate.getTime()
    
    return futureAttractions
      .filter(a => a.parsedDate.getTime() === nextDate)
      .map(({ parsedDate, ...rest }) => rest)
  }, [attractions, day])

  const dayLabel = useMemo(() => {
    if (timelineAttractions.length === 0) return ''
    if (day === 'all') return `Próximo Dia (Dia ${timelineAttractions[0]?.day || 1})`
    return `Dia ${day}`
  }, [timelineAttractions, day])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="hover:bg-white/10 p-2 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Timeline do Roteiro</h1>
                <p className="text-sm opacity-90">
                  {dayLabel} - Visualize seu dia com cálculo de rotas
                </p>
              </div>
            </div>
            <Calendar className="w-8 h-8" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Weather info banner */}
        {!import.meta.env.VITE_OPENWEATHER_API_KEY && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-3">
              <CloudSun className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  🌤️ Clima Integrado Disponível
                </h3>
                <p className="text-sm text-blue-800">
                  Configure sua chave da API OpenWeather no arquivo <code className="bg-blue-100 px-1 rounded">.env</code> para 
                  ver previsões do tempo integradas à timeline. É grátis! 
                  <a 
                    href="https://openweathermap.org/api" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-600 ml-1"
                  >
                    Obtenha sua chave aqui
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {timelineAttractions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {day === 'all' ? 'Nenhuma atração futura' : `Nenhuma atração para o Dia ${day}`}
            </h3>
            <p className="text-gray-600 mb-4">
              {day === 'all' 
                ? 'Não há atrações futuras planejadas com coordenadas'
                : 'Adicione coordenadas (lat/lng) às suas atrações para visualizar a timeline'
              }
            </p>
            <Link
              to="/attractions"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ir para Atrações
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <Timeline attractions={timelineAttractions} />
          </div>
        )}
      </main>

      {/* Info footer */}
      {timelineAttractions.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Como funciona a Timeline
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Rotas calculadas automaticamente usando OSRM</li>
              <li>• Tempo de deslocamento estimado com base na distância</li>
              <li>• Conflitos detectados automaticamente (horários, fechamentos)</li>
              <li>• Duração: use o campo "Duração" da atração (padrão: 60min se não informado)</li>
              <li>• Use o filtro na home para selecionar o dia da timeline</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
