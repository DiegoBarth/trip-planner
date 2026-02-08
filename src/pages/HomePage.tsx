import { useState } from 'react'
import { Plus, MapPin, DollarSign, BarChart3 } from 'lucide-react'
import { BudgetCard } from '@/components/home/BudgetCard'
import { AttractionCard } from '@/components/attraction/AttractionCard'
import type { Country } from '@/types/Attraction'
import { COUNTRIES } from '@/config/constants'

interface HomePageProps {
  onNavigate?: (page: 'budget' | 'expenses' | 'attractions' | 'dashboard') => void
}

// Mock data
const mockBudgetSummary = {
  Diego: { total: 5000, spent: 1200, remaining: 3800 },
  Pamela: { total: 5000, spent: 900, remaining: 4100 },
  Casal: { total: 5000, spent: 2100, remaining: 2900 }
}

const mockAttractions = [
  {
    id: 1,
    name: 'Templo Senso-ji',
    country: 'japan' as Country,
    city: 'Tóquio',
    region: 'Asakusa',
    day: 3,
    date: '2026-04-15',
    dayOfWeek: 'Quarta-feira',
    type: 'temple' as const,
    order: 1,
    visited: false,
    needsReservation: false,
    couplePrice: 500,
    currency: 'JPY' as const,
    priceInBRL: 16.5,
    openingTime: '09:00',
    duration: 120,
  },
  {
    id: 2,
    name: 'Tokyo Skytree',
    country: 'japan' as Country,
    city: 'Tóquio',
    region: 'Sumida',
    day: 3,
    date: '2026-04-15',
    dayOfWeek: 'Quarta-feira',
    type: 'viewpoint' as const,
    order: 2,
    visited: false,
    needsReservation: true,
    couplePrice: 2100,
    currency: 'JPY' as const,
    priceInBRL: 69.3,
    openingTime: '14:00',
    duration: 180,
  }
]

export function HomePage({ onNavigate }: HomePageProps = {}) {
  const [selectedCountry, setSelectedCountry] = useState<Country | 'all'>('all')
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all')

  const totalBudget = mockBudgetSummary.Diego.total + mockBudgetSummary.Pamela.total + mockBudgetSummary.Casal.total
  const totalSpent = mockBudgetSummary.Diego.spent + mockBudgetSummary.Pamela.spent + mockBudgetSummary.Casal.spent
  const totalRemaining = totalBudget - totalSpent

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              🗾 Viagem Japão & Coreia
            </h1>
            <button className="text-2xl">🌙</button>
          </div>

          <div className="flex gap-3 flex-wrap">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value as Country | 'all')}
              className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all">Todos os países</option>
              {Object.entries(COUNTRIES).map(([key, country]) => (
                <option key={key} value={key} className="text-gray-900">
                  {country.flag} {country.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all">Todos os dias</option>
              {Array.from({ length: 15 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day} className="text-gray-900">
                  Dia {day}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            💰 Resumo Financeiro
          </h2>
          
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-6 shadow-lg mb-6">
            <h3 className="text-lg mb-2 opacity-90">Saldo Total</h3>
            <p className="text-4xl font-bold mb-4">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRemaining)}
            </p>
            <div className="flex justify-between text-sm opacity-90">
              <span>Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudget)}</span>
              <span>Gasto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BudgetCard origin="Diego" {...mockBudgetSummary.Diego} />
            <BudgetCard origin="Pamela" {...mockBudgetSummary.Pamela} />
            <BudgetCard origin="Casal" {...mockBudgetSummary.Casal} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            🗓️ Próximas Atrações {selectedDay !== 'all' && `(Dia ${selectedDay})`}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAttractions.map(attraction => (
              <AttractionCard
                key={attraction.id}
                attraction={attraction}
                onCheckVisited={(id) => console.log('Marcar visitado:', id)}
                onClick={() => console.log('Abrir detalhes:', attraction.id)}
              />
            ))}
          </div>

          {mockAttractions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhuma atração encontrada para os filtros selecionados</p>
            </div>
          )}
        </section>

        <section className="sticky bottom-6">
          <div className="bg-white rounded-xl shadow-lg p-4 flex justify-around items-center border-2 border-gray-200">
            <button 
              onClick={() => onNavigate?.('budget')}
              className="flex flex-col items-center gap-1 p-3 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <DollarSign className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium">Orçamento</span>
            </button>

            <button 
              onClick={() => onNavigate?.('expenses')}
              className="flex flex-col items-center gap-1 p-3 hover:bg-red-50 rounded-lg transition-colors"
            >
              <DollarSign className="w-6 h-6 text-red-600" />
              <span className="text-xs font-medium">Gasto</span>
            </button>

            <button 
              onClick={() => onNavigate?.('attractions')}
              className="flex flex-col items-center gap-1 p-3 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Plus className="w-6 h-6 text-purple-600" />
              <span className="text-xs font-medium">Atração</span>
            </button>

            <button 
              onClick={() => onNavigate?.('dashboard')}
              className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 rounded-lg transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium">Dashboard</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
