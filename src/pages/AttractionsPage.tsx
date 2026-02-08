import { Layout } from '@/components/layout/Layout'
import { AttractionsList } from '@/components/attraction/AttractionsList'
import type { Attraction } from '@/types/Attraction'

interface AttractionsPageProps {
  onBack: () => void
}

// Mock data
const mockAttractions: Attraction[] = []

export function AttractionsPage({ onBack }: AttractionsPageProps) {
  const handleCreate = (data: Omit<Attraction, 'id'>) => {
    console.log('Criar atração:', data)
  }

  const handleUpdate = (attraction: Attraction) => {
    console.log('Atualizar atração:', attraction)
  }

  const handleToggleVisited = (id: number) => {
    console.log('Toggle visitado:', id)
  }

  return (
    <Layout
      title="🗺️ Atrações"
      onBack={onBack}
      headerClassName="bg-gradient-to-r from-green-600 to-teal-600 text-white"
    >
      <AttractionsList
        attractions={mockAttractions}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onToggleVisited={handleToggleVisited}
      />
    </Layout>
  )
}
