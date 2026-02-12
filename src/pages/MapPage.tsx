import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { MapView } from '@/components/map/MapView'

export function MapPage() {
   const navigate = useNavigate()

   return (
      <Layout
         title="🗺️ Mapa do Roteiro"
         subtitle="Visualize seus deslocamentos por período"
         onBack={() => navigate('/')}
         headerClassName="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
         containerClassName="max-w-full"
         contentClassName="p-0"
      >
         <MapView />
      </Layout>
   )
}