import { useState } from 'react'
import { Plus, Filter, Search } from 'lucide-react'
import { AttractionCard } from './AttractionCard'
import { ModalAttraction } from './ModalAttraction'
import type { Attraction, Country, AttractionType } from '@/types/Attraction'
import { COUNTRIES, ATTRACTION_TYPES } from '@/config/constants'

interface AttractionsListProps {
  attractions: Attraction[]
  onUpdate: (attraction: Attraction) => void
  onCreate: (attraction: Omit<Attraction, 'id'>) => void
  onToggleVisited: (id: number) => void
}

export function AttractionsList({ attractions, onUpdate, onCreate, onToggleVisited }: AttractionsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAttraction, setEditingAttraction] = useState<Attraction | undefined>()
  const [filters, setFilters] = useState({
    country: 'all' as Country | 'all',
    city: '',
    day: 'all' as number | 'all',
    type: 'all' as AttractionType | 'all',
    visited: 'all' as 'all' | 'yes' | 'no',
    search: ''
  })

  // Filter attractions
  const filteredAttractions = attractions.filter(attraction => {
    if (filters.country !== 'all' && attraction.country !== filters.country) return false
    if (filters.city && !attraction.city.toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.day !== 'all' && attraction.day !== filters.day) return false
    if (filters.type !== 'all' && attraction.type !== filters.type) return false
    if (filters.visited === 'yes' && !attraction.visited) return false
    if (filters.visited === 'no' && attraction.visited) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        attraction.name.toLowerCase().includes(search) ||
        attraction.city.toLowerCase().includes(search) ||
        attraction.region?.toLowerCase().includes(search)
      )
    }
    return true
  })

  // Agrupar por dia
  const groupedByDay = filteredAttractions.reduce((acc, attraction) => {
    if (!acc[attraction.day]) {
      acc[attraction.day] = []
    }
    acc[attraction.day].push(attraction)
    return acc
  }, {} as Record<number, Attraction[]>)

  // Ordenar cada dia pela ordem
  Object.keys(groupedByDay).forEach(day => {
    groupedByDay[Number(day)].sort((a, b) => a.order - b.order)
  })

  const handleOpenModal = (attraction?: Attraction) => {
    setEditingAttraction(attraction)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingAttraction(undefined)
    setIsModalOpen(false)
  }

  const handleSave = (data: Omit<Attraction, 'id'>) => {
    if (editingAttraction) {
      onUpdate({
        ...data,
        id: editingAttraction.id
      } as Attraction)
    } else {
      onCreate(data)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🎯 Atrações
              <span className="text-sm font-normal text-gray-500">
                ({filteredAttractions.length})
              </span>
            </h1>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nova Atração
            </button>
          </div>

          {/* Filtros */}
          <div className="space-y-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar atração, cidade, região..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Outros filtros */}
            <div className="flex gap-2 flex-wrap items-center">
              <Filter className="w-5 h-5 text-gray-500" />
              
              <select
                value={filters.country}
                onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value as Country | 'all' }))}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Todos países</option>
                {Object.entries(COUNTRIES).map(([key, country]) => (
                  <option key={key} value={key}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Cidade..."
                value={filters.city}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-32"
              />

              <select
                value={filters.day}
                onChange={(e) => setFilters(prev => ({ ...prev, day: e.target.value === 'all' ? 'all' : Number(e.target.value) }))}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Todos dias</option>
                {Array.from({ length: 20 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>Dia {day}</option>
                ))}
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as AttractionType | 'all' }))}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Todos tipos</option>
                {Object.entries(ATTRACTION_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.visited}
                onChange={(e) => setFilters(prev => ({ ...prev, visited: e.target.value as 'all' | 'yes' | 'no' }))}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Todos status</option>
                <option value="yes">✅ Visitados</option>
                <option value="no">⏳ Não visitados</option>
              </select>

              {(filters.country !== 'all' || filters.city || filters.day !== 'all' || filters.type !== 'all' || filters.visited !== 'all' || filters.search) && (
                <button
                  onClick={() => setFilters({
                    country: 'all',
                    city: '',
                    day: 'all',
                    type: 'all',
                    visited: 'all',
                    search: ''
                  })}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Attractions list grouped by day */}
      <main className="max-w-6xl mx-auto p-4 space-y-8">
        {Object.keys(groupedByDay).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-lg">Nenhuma atração encontrada</p>
            <p className="text-sm">Comece adicionando sua primeira atração!</p>
          </div>
        ) : (
          Object.entries(groupedByDay)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([day, dayAttractions]) => (
              <section key={day}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold">
                    Dia {day}
                  </h2>
                  {dayAttractions[0]?.date && (
                    <span className="text-sm text-gray-500">
                      {new Date(dayAttractions[0].date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long'
                      })}
                    </span>
                  )}
                  <span className="text-sm text-gray-400">
                    {dayAttractions.length} {dayAttractions.length === 1 ? 'atração' : 'atrações'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayAttractions.map(attraction => (
                    <AttractionCard
                      key={attraction.id}
                      attraction={attraction}
                      onCheckVisited={onToggleVisited}
                      onClick={() => handleOpenModal(attraction)}
                    />
                  ))}
                </div>
              </section>
            ))
        )}
      </main>

      {/* Modal */}
      <ModalAttraction
        attraction={editingAttraction}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  )
}
