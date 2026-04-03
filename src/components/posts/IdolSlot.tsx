import React from 'react'
import { Plus } from 'lucide-react'

interface IdolSlotProps {
  emoji: string
  name: string
  isActive?: boolean
  isAddButton?: boolean
  onClick?: () => void
}

export default function IdolSlot({
  emoji,
  name,
  isActive = false,
  isAddButton = false,
  onClick,
}: IdolSlotProps) {
  if (isAddButton) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
      >
        <div className="w-12 h-12 bg-border rounded-full flex items-center justify-center">
          <Plus size={20} className="text-text-muted" />
        </div>
        <span className="text-xs font-medium text-text-secondary text-center max-w-[60px]">
          추가
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
        isActive
          ? 'bg-muted shadow-md ring-2 ring-primary'
          : 'hover:bg-muted'
      }`}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-accent-pink to-accent-purple rounded-full flex items-center justify-center text-lg">
        {emoji}
      </div>
      <span className="text-xs font-medium text-text-primary text-center max-w-[60px] line-clamp-1">
        {name}
      </span>
    </button>
  )
}
