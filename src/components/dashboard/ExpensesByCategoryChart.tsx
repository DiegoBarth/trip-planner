import {
   PieChart, Pie, Cell,
   Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import type { ExpenseByCategory } from '@/types/Dashboard';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

const capitalize = (s?: string) => {
   if (!s) return '';
   return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export function ExpensesByCategoryChart({ data }: { data: ExpenseByCategory[] }) {
   return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
         <h3 className="text-gray-700 dark:text-gray-200 font-bold text-lg mb-6 flex items-center gap-2">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm">📊</span>
            Gastos por Categoria
         </h3>

         <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                     data={data}
                     cx="50%"
                     cy="50%"
                     innerRadius={70}
                     outerRadius={100}
                     paddingAngle={5}
                     dataKey="total"
                     nameKey="category"
                     stroke="none"
                  >
                     {data.map((_, index) => (
                        <Cell
                           key={`cell-${index}`}
                           fill={COLORS[index % COLORS.length]}
                           className="hover:opacity-80 transition-opacity outline-none"
                        />
                     ))}
                  </Pie>

                  <Tooltip
                     formatter={(value: any, name: any) => [
                        formatCurrency(Number(value) || 0),
                        capitalize(String(name || ''))
                     ]}
                     contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '8px 12px'
                     }}
                  />

                  <Legend
                     verticalAlign="bottom"
                     height={36}
                     iconType="circle"
                     formatter={(value: string) => (
                        <span className="text-gray-600 text-sm font-medium">
                           {capitalize(value)}
                        </span>
                     )}
                  />
               </PieChart>
            </ResponsiveContainer>
         </div>
      </div>
   );
}