import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  charCount?: number
  maxLength?: number
  error?: string
}

export default function Textarea({
  label,
  charCount,
  maxLength,
  error,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      <div className="flex justify-between items-center mt-1">
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {maxLength && charCount !== undefined && (
          <p className="text-xs text-text-muted ml-auto">
            {charCount} / {maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
