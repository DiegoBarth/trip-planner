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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between">
         <div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
            {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
         </div>

         <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-xl`}>
            {icon}
         </div>
      </div>
   )
}