interface EmptyStateProps {
  icon: string
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-lg font-medium">{title}</p>
      {description && <p className="text-sm mt-2">{description}</p>}
    </div>
  )
}
