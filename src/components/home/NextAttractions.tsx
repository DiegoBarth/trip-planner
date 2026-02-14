import { useMemo } from 'react'
import { AttractionsGrid } from '@/components/attraction/AttractionsGrid'
import { useAttraction } from '@/hooks/useAttraction'
import { SkeletonList } from '@/components/ui/SkeletonList'
import { getNextAttractions } from '@/utils/getNextAttractions'
import { useToast } from '@/contexts/toast'
import { useCountry } from '@/contexts/CountryContext'
import { Calendar } from 'lucide-react'

export function NextAttractions() {
   const { country } = useCountry()
   const { attractions, isLoading, toggleVisited } = useAttraction(country)
   const { success, error } = useToast()
   
   const nextAttractions = useMemo(
      () => getNextAttractions(attractions),
      [attractions]
   )

   const handleToggleVisited = async (id: number) => {
      try {
         await toggleVisited(id)
         success('Status da atração atualizado')
      } catch (err) {
         error('Erro ao atualizar atração')
         console.error(err)
      }
   }

   return (
      <div>
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
               <Calendar className="w-5 h-5 text-gray-600" />
               Próximas Atrações
            </h2>
            {nextAttractions.length > 0 && (
               <span className="text-sm text-gray-500">
                  {nextAttractions.length} {nextAttractions.length === 1 ? 'local' : 'locais'}
               </span>
            )}
         </div>

         {isLoading ? (
            <SkeletonList />
         ) : (
            <AttractionsGrid
               attractions={nextAttractions}
               onToggleVisited={handleToggleVisited}
               groupBy="none"
               emptyTitle="Nenhuma atração próxima"
               emptyDescription="Você não tem atrações futuras planejadas"
            />
         )}
      </div>
   )
}