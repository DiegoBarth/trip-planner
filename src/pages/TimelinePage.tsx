import { useMemo } from 'react'
import { Calendar, CloudSun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAttraction } from '@/hooks/useAttraction'
import { Timeline } from '@/components/timeline/Timeline'
import { useCountry } from '@/contexts/CountryContext'
import { dateToInputFormat } from '@/utils/formatters'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/contexts/toast'
import type { Attraction, Country } from '@/types/Attraction'

export function TimelinePage() {
  const { country, day, accommodations, attractions, isReady } = useCountry()
  const { toggleVisited } = useAttraction(country)
  const { success, error } = useToast()

  const handleToggleVisited = async (id: number) => {
    try {
      await toggleVisited(id)
      success('Status da atração atualizado')
    } catch (err) {
      error('Erro ao atualizar atração')
      console.error(err)
    }
  }

  // Filter attractions for the timeline
  const timelineAttractions = useMemo(() => {
    const mappable = attractions.filter(a => a.lat && a.lng)
    if (mappable.length === 0) return [];

    let filtered: typeof mappable = [];
    if (day !== 'all') {
      filtered = mappable.filter(a => a.day === day);
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureAttractions = mappable
        .filter(a => a.date)
        .map(a => ({
          ...a,
          parsedDate: new Date(dateToInputFormat(a.date))
        }))
        .filter(a => a.parsedDate >= today);
      if (futureAttractions.length === 0) return [];
      futureAttractions.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
      const nextDate = futureAttractions[0].parsedDate.getTime();
      filtered = futureAttractions
        .filter(a => a.parsedDate.getTime() === nextDate)
        .map(({ parsedDate, ...rest }) => rest);
    }

    // Adiciona acomodação da cidade ao início, se houver
    if (filtered.length > 0 && accommodations.length > 0) {
      const city = filtered[0].city;
      const acc = accommodations.find(a => a.city === city);
      if (acc && acc.lat && acc.lng) {
        // Cria um objeto limpo de atração para acomodação (sem copiar imagem de outra atração)
        const accAttraction: Attraction = {
          id: -999,
          name: acc.description,
          lat: acc.lat,
          lng: acc.lng,
          city: acc.city,
          region: filtered[0].region,
          country: acc.country as Country,
          order: 0,
          date: filtered[0].date,
          day: filtered[0].day,
          dayOfWeek: filtered[0].dayOfWeek,
          type: 'other',
          duration: 0,
          couplePrice: 0,
          priceInBRL: 0,
          currency: filtered[0].currency,
          visited: false,
          needsReservation: false,
          openingTime: undefined,
          closingTime: undefined,
          imageUrl: undefined, // Explicitamente sem imagem
        };
        return [accAttraction, ...filtered];
      }
    }
    return filtered;
  }, [attractions, day, accommodations])

  const dayLabel = useMemo(() => {
    if (timelineAttractions.length === 0) return ''
    if (day === 'all') return `Próximo Dia (Dia ${timelineAttractions[0]?.day || 1})`
    return `Dia ${day}`
  }, [timelineAttractions, day])

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

   return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
         <PageHeader
            title="Timeline do Roteiro"
            subtitle={`${dayLabel} - Visualize seu dia com rotas e clima`}
         />

         {/* Main content */}
         <main className="max-w-6xl mx-auto px-4 py-6">
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
            <Timeline 
              attractions={timelineAttractions}
              onToggleVisited={handleToggleVisited}
            />
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
