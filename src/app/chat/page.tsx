'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Bookmark } from 'lucide-react'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import { getAllSavedPosts, unsavePost, type SavedPost, type TagItem } from '@/lib/api'

// ─── 태그 칩 ────────────────────────────────────────────────────────────────

function TagChip({ label, bg, color }: TagItem) {
  return (
    <span
      className="inline-flex items-center h-[28.5px] px-3 rounded-[32px] text-[11px] font-bold leading-none"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  )
}

// ─── 타입 배지 ───────────────────────────────────────────────────────────────

function TypeBadge({ tab }: { tab: 'fanmeet' | 'buddy' }) {
  const label = tab === 'fanmeet' ? '덕메' : '비계친'
  const bg = tab === 'fanmeet' ? '#eef2ff' : '#dcfce7'
  const color = tab === 'fanmeet' ? '#4338ca' : '#15803d'
  return (
    <span
      className="inline-flex items-center h-[22px] px-2.5 rounded-full text-[10px] font-bold leading-none"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  )
}

// ─── 북마크 카드 ─────────────────────────────────────────────────────────────

interface BookmarkCardProps {
  post: SavedPost
  onUnsave: (id: string) => void
}

function BookmarkCard({ post, onUnsave }: BookmarkCardProps) {
  return (
    <article
      className="bg-white border border-zinc-100 rounded-[20px] p-[25px] flex flex-col gap-4"
      style={{ boxShadow: '0px 8px 30px 0px rgba(0,0,0,0.04)' }}
      aria-label={`${post.authorHandle}의 저장된 포스트`}
    >
      {/* 상단: 아바타 + 유저 정보 + 북마크 해제 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-[16px] shrink-0"
            style={{ backgroundColor: post.avatarBg }}
            aria-hidden="true"
          >
            <span className="text-lg">💎</span>
          </div>
          <div className="flex flex-col gap-1 pb-px">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-zinc-900 leading-[20px]">
                {post.authorHandle}
              </span>
              <TypeBadge tab={post.tab} />
            </div>
            <span className="text-[11px] font-medium text-zinc-400 leading-[16.5px]">
              {post.savedAt}
            </span>
          </div>
        </div>

        <button
          onClick={() => onUnsave(post.id)}
          aria-label="저장 해제"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 transition-colors mt-1"
        >
          <Bookmark size={18} className="text-zinc-900 fill-zinc-900" />
        </button>
      </div>

      {/* 태그 + 본문 */}
      <div className="flex flex-col gap-3">
        {post.categoryTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categoryTags.map((tag) => (
              <TagChip key={tag.label} {...tag} />
            ))}
          </div>
        )}
        <p
          className="text-[14px] font-normal text-zinc-600 leading-[22.75px] line-clamp-3 overflow-hidden"
          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
        >
          {post.content}
        </p>
      </div>
    </article>
  )
}

// ─── 필터 칩 ────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'fanmeet' | 'buddy'

interface FilterChipProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function FilterChip({ label, isActive, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className="flex-shrink-0 flex items-center h-[38px] px-5 rounded-full text-[12px] font-bold transition-colors"
      style={
        isActive
          ? { backgroundColor: '#18181b', color: '#ffffff', boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)' }
          : { backgroundColor: '#ffffff', color: '#52525b', border: '1px solid #f4f4f5', boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)' }
      }
    >
      {label}
    </button>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

const FILTER_ITEMS: { id: FilterType; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'fanmeet', label: '덕메' },
  { id: 'buddy', label: '비계친' },
]

export default function ChatPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [posts, setPosts] = useState<SavedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAllSavedPosts()
      setPosts(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleUnsave = async (id: string) => {
    await unsavePost(id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter((p) => p.tab === filter)

  return (
    <>
      <TopAppBar showMenu showAvatar />

      <main className="pb-[128px] pt-8 px-5">
        {/* ── 에디토리얼 헤더 ── */}
        <header className="flex flex-col gap-1 mb-6">
          <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">
            북마크
          </h1>
          <p className="text-[14px] font-medium text-zinc-500 leading-[20px]">
            저장한 덕메·비계친 모집글을 모아볼 수 있어요.
          </p>
        </header>

        {/* ── 필터 칩 ── */}
        <div
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5"
          role="group"
          aria-label="타입 필터"
        >
          {FILTER_ITEMS.map((f) => (
            <FilterChip
              key={f.id}
              label={f.label}
              isActive={filter === f.id}
              onClick={() => setFilter(f.id)}
            />
          ))}
        </div>

        {/* ── 카드 목록 ── */}
        <section
          className="flex flex-col gap-4"
          aria-label="저장된 모집글 목록"
          aria-live="polite"
          aria-busy={isLoading}
        >
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[200px] rounded-[20px] bg-zinc-100 animate-pulse"
                aria-hidden="true"
              />
            ))
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <span className="text-4xl mb-3">🔖</span>
              <p className="text-sm font-medium">저장된 글이 없어요</p>
              <p className="text-xs mt-1">덕메·비계친 글을 북마크해보세요!</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <BookmarkCard key={post.id} post={post} onUnsave={handleUnsave} />
            ))
          )}
        </section>

        {/* ── 컬렉션 끝 ── */}
        {!isLoading && filteredPosts.length > 0 && (
          <div className="flex flex-col items-center justify-center py-16 opacity-30">
            <div className="mb-3 text-3xl" aria-hidden="true">💎</div>
            <p className="text-[11px] font-bold text-zinc-900 tracking-[1.1px] uppercase">
              저장된 컬렉션의 끝입니다
            </p>
          </div>
        )}
      </main>

      <BottomNavBar />
    </>
  )
}
