import { MapView } from '@/components/map/MapView'
import { PageHeader } from '@/components/ui/PageHeader'

export function MapPage() {
   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6 flex flex-col">
         <PageHeader
            title="Mapa"
            subtitle="Visualize suas atrações no mapa"
         />
         <main className="flex-1">
            <MapView />
         </main>
      </div>
   )
}