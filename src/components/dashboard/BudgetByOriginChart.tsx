import {
   BarChart, Bar, XAxis, YAxis, CartesianGrid,
   Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { BudgetByOrigin } from "@/types/Dashboard";
import { formatCurrency } from '@/utils/formatters';

const tooltipFormatter = (value: any) => {
   if (typeof value !== 'number') return value;
   return formatCurrency(value);
};

export function BudgetByOriginChart({ data }: { data: BudgetByOrigin[] }) {
   return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
         <h3 className="text-gray-700 dark:text-gray-200 font-bold text-lg mb-6 flex items-center gap-2">
            <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg text-sm">💳</span>
            Orçamento vs. Realizado
         </h3>

         <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                     dataKey="origin"
                     axisLine={false}
                     tickLine={false}
                     tick={{ fill: '#6B7280' }}
                     dy={10}
                  />
                  <YAxis
                     axisLine={false}
                     tickLine={false}
                     tick={{ fill: '#6B7280' }}
                     tickFormatter={(val) => `R$${val / 1000}k`}
                  />
                  <Tooltip
                     formatter={tooltipFormatter}
                     cursor={{ fill: '#F3F4F6' }}
                     contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                     }}
                  />
                  <Legend
                     verticalAlign="top"
                     align="right"
                     iconType="circle"
                     wrapperStyle={{ paddingBottom: '20px' }}
                  />
                  <Bar dataKey="totalBudget" name="Orçado" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="spent" name="Gasto" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={30} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
   );
}