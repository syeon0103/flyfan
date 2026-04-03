import React from 'react'
import { Eye, MessageCircle } from 'lucide-react'
import Tag from '@/components/ui/Tag'
import Link from 'next/link'

interface RecruitmentCardProps {
  id: string
  title: string
  avatar?: string
  username?: string
  status: 'open' | 'closed'
  statusLabel: string
  tags: string[]
  views?: number
  comments?: number
  timestamp?: string
}

export default function RecruitmentCard({
  id,
  title,
  status,
  statusLabel,
  tags,
  views = 0,
  comments = 0,
  timestamp,
}: RecruitmentCardProps) {
  const statusColor =
    status === 'open' ? 'bg-status-open text-white' : 'bg-status-closed text-white'

  return (
    <Link href={`/posts/${id}`}>
      <div className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
        {/* Header with status */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-text-primary flex-1 text-sm line-clamp-2">
            {title}
          </h3>
          <span className={`${statusColor} px-2 py-1 rounded-full text-xs font-semibold ml-2 whitespace-nowrap`}>
            {statusLabel}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, idx) => (
            <Tag key={idx} label={tag} variant="filter" />
          ))}
        </div>

        {/* Footer with stats */}
        <div className="flex items-center gap-4 text-xs text-text-muted pt-3 border-t border-border">
          {views > 0 && (
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{views}</span>
            </div>
          )}
          {comments > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle size={14} />
              <span>{comments}</span>
            </div>
          )}
          {timestamp && <span>{timestamp}</span>}
        </div>
      </div>
    </Link>
  )
}
