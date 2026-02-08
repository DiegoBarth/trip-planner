import { Layout } from '@/components/layout/Layout'

interface DashboardPageProps {
  onBack: () => void
}

export function DashboardPage({ onBack }: DashboardPageProps) {
  return (
    <Layout
      title="📊 Dashboard"
      onBack={onBack}
      headerClassName="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
    >
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Estatísticas da Viagem</h2>

          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-lg">Dashboard em desenvolvimento</p>
            <p className="text-sm mt-2">Aqui você verá gráficos e estatísticas da sua viagem</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-2">📍</div>
                <p className="text-sm text-gray-600">Atrações Visitadas</p>
                <p className="text-2xl font-bold text-gray-900">0/0</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="text-2xl font-bold text-gray-900">R$ 0,00</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm text-gray-600">Dias de Viagem</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
