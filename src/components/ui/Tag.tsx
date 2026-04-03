import React from 'react'
import { X } from 'lucide-react'

interface TagProps {
  label: string
  onRemove?: () => void
  variant?: 'default' | 'filter' | 'status'
  className?: string
}

export default function Tag({
  label,
  onRemove,
  variant = 'default',
  className = '',
}: TagProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-text-primary',
    filter: 'bg-gray-100 text-text-primary border border-border',
    status: 'bg-status-open text-white',
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
        variantClasses[variant]
      } ${className}`}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex items-center justify-center hover:opacity-70 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
