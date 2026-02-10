import { useMemo } from 'react'
import { AttractionsGrid } from '@/components/attraction/AttractionsGrid'
import { useAttraction } from '@/hooks/useAttraction'
import { SkeletonList } from '@/components/ui/SkeletonList'
import { getNextAttractions } from '@/utils/getNextAttractions'
import { useToast } from '@/contexts/toast'
import { useCountry } from '@/contexts/CountryContext'

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
         <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            🗓️ Próximas Atrações
         </h2>

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