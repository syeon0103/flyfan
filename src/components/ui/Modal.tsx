import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  type?: 'center' | 'bottom-sheet'
  showDragHandle?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  type = 'bottom-sheet',
  showDragHandle = true,
}: ModalProps) {
  if (!isOpen) return null

  if (type === 'center') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-border">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-lg rounded-b-none max-h-[90vh] overflow-y-auto">
        {showDragHandle && (
          <div className="flex justify-center py-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-4 pb-20">
          {children}
        </div>
      </div>
    </div>
  )
}
