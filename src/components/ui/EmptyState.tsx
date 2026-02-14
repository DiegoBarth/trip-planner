interface EmptyStateProps {
  icon: string
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">{title}</p>
      {description && <p className="text-sm mt-2">{description}</p>}
    </div>
  )
}
