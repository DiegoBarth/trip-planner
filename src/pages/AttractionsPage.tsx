import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { AttractionsList } from '@/components/attraction/AttractionsList'
import { useAttraction } from '@/hooks/useAttraction'
import { useToast } from '@/contexts/toast'
import { bulkUpdateAttractions } from '@/api/attraction'
import type { Attraction } from '@/types/Attraction'
import { useCountry } from '@/contexts/CountryContext'
import { dateToInputFormat } from '@/utils/formatters'

export function AttractionsPage() {
   const navigate = useNavigate()
   const { country } = useCountry()

   const {
      attractions,
      isLoading,
      createAttraction,
      updateAttraction,
      deleteAttraction,
      toggleVisited,
      invalidateAttractionsCache
   } = useAttraction(country)

   const { success, error } = useToast()

   const handleCreate = async (data: Omit<Attraction, 'id'>) => {
      try {
         await createAttraction(data as any)
         success('Atração criada com sucesso!')
      } catch (err) {
         error('Erro ao criar atração')
         console.error(err)
      }
   }

   const handleUpdate = async (attraction: Attraction) => {
      try {
         await updateAttraction(attraction as any)
         success('Atração atualizada com sucesso!')
      } catch (err) {
         error('Erro ao atualizar atração')
         console.error(err)
      }
   }

   const handleDelete = async (id: number) => {
      try {
         await deleteAttraction(id)
         success('Atração excluída com sucesso!')
      } catch (err) {
         error('Erro ao excluir atração')
         console.error(err)
      }
   }

   const handleToggleVisited = async (id: number) => {
      try {
         await toggleVisited(id)
         success('Status da atração atualizado')
      } catch (err) {
         error('Erro ao atualizar atração')
         console.error(err)
      }
   }

   const handleBulkUpdate = async (attractions: Attraction[]) => {
      try {
         // Preparar os dados formatando as datas e enviando tudo em uma única requisição
         const formattedAttractions = attractions.map(attr => ({
            ...attr,
            date: dateToInputFormat(attr.date)
         }))

         await bulkUpdateAttractions(formattedAttractions as any)
         
         // Invalidar o cache para recarregar as atrações com a nova ordem
         invalidateAttractionsCache()
         
         success('Atrações reordenadas com sucesso!')
      } catch (err) {
         error('Erro ao reordenar atrações')
         console.error(err)
      }
   }

   return (
      <Layout
         title="🗺️ Atrações"
         onBack={() => navigate('/')}
         headerClassName="bg-gradient-to-r from-green-600 to-teal-600 text-white"
      >
         <AttractionsList
            attractions={attractions}
            isLoading={isLoading}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToggleVisited={handleToggleVisited}
            onBulkUpdate={handleBulkUpdate}
         />
      </Layout>
   )
}
