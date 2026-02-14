interface DashboardCardProps {
   label: string
   value: string | number
   subValue?: string
   icon: string
   colorClass: string
}

export function DashboardCard({
   label,
   value,
   subValue,
   icon,
   colorClass,
}: DashboardCardProps) {
   return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between">
         <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</h4>
            {subValue && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subValue}</p>}
         </div>

         <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 text-xl`}>
            {icon}
         </div>
      </div>
   )
}