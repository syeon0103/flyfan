import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'

interface TimelineItemProps {
  date: string
  title: string
  description: string
  isFirst?: boolean
  isLast?: boolean
  featured?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export default function TimelineItem({
  date,
  title,
  description,
  isFirst = false,
  isLast = false,
  featured = false,
  onEdit,
  onDelete,
}: TimelineItemProps) {
  return (
    <div className="flex gap-4 relative">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 bg-primary rounded-full mt-2" />
        {!isLast && <div className="w-1 h-16 bg-border" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className={`${
          featured
            ? 'border-2 border-primary bg-gradient-to-r from-accent-pink/10 to-accent-purple/10'
            : 'border border-border bg-white'
        } rounded-lg p-4`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-text-muted mb-1">{date}</p>
              <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
              <p className="text-sm text-text-secondary line-clamp-2">{description}</p>
            </div>
            <div className="flex gap-2 ml-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  <Edit2 size={16} className="text-text-muted" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
