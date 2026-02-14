import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ChecklistList } from '@/components/checklist/ChecklistList'
import { useChecklist } from '@/hooks/useChecklist'
import { useToast } from '@/contexts/toast'
import type { ChecklistItem } from '@/types/ChecklistItem'

export function ChecklistPage() {
   const navigate = useNavigate()
   const { items, createItem, updateItem, deleteItem, togglePacked, isLoading } = useChecklist()
   const toast = useToast()

   const handleCreate = async (data: Omit<ChecklistItem, 'id'>) => {
      try {
         await createItem(data)
         toast.success('Item adicionado com sucesso!')
      } catch (error) {
         console.error('Error creating checklist item:', error)
         toast.error('Erro ao adicionar item')
      }
   }

   const handleUpdate = async (item: ChecklistItem) => {
      try {
         await updateItem(item)
         toast.success('Item atualizado com sucesso!')
      } catch (error) {
         console.error('Error updating checklist item:', error)
         toast.error('Erro ao atualizar item')
      }
   }

   const handleDelete = async (id: number) => {
      try {
         await deleteItem(id)
         toast.success('Item excluído com sucesso!')
      } catch (error) {
         console.error('Error deleting checklist item:', error)
         toast.error('Erro ao excluir item')
      }
   }

   const handleTogglePacked = async (id: number, isPacked: boolean) => {
      try {
         await togglePacked({ id, isPacked })
         if (isPacked) {
            toast.success('Item marcado como empacotado!')
         } else {
            toast.success('Item desmarcado!')
         }
      } catch (error) {
         console.error('Error toggling checklist item:', error)
         toast.error('Erro ao atualizar item')
      }
   }

   return (
      <Layout
         title="✅ Checklist"
         onBack={() => navigate('/')}
         headerClassName="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
      >
         <ChecklistList
            items={items}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onTogglePacked={handleTogglePacked}
            isLoading={isLoading}
         />
      </Layout>
   )
}
