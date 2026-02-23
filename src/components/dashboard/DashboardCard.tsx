interface DashboardCardProps {
  label: string
  value: string | number
  subValue?: string
  icon: string
  iconClass: string
}

export function DashboardCard({ label, value, subValue, icon, iconClass }: DashboardCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 min-h-[100px]">
      <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${iconClass}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 truncate">{value}</p>
        {subValue && <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}