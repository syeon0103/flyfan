'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Bookmark } from 'lucide-react'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import { getSavedPosts, unsavePost, type SavedPost, type TagItem } from '@/lib/api'

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

// ─── 저장된 카드 ─────────────────────────────────────────────────────────────

interface SavedCardProps {
  post: SavedPost
  onUnsave: (id: string) => void
}

function SavedCard({ post, onUnsave }: SavedCardProps) {
  return (
    <article
      className="bg-white border border-zinc-100 rounded-[20px] p-[25px] flex flex-col gap-4"
      style={{ boxShadow: '0px 8px 30px 0px rgba(0,0,0,0.04)' }}
      aria-label={`${post.authorHandle}의 저장된 포스트`}
    >
      {/* 상단: 아바타 + 유저 정보 + 북마크 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* 아바타 */}
          <div
            className="flex items-center justify-center w-12 h-12 rounded-[16px] shrink-0"
            style={{ backgroundColor: post.avatarBg }}
            aria-hidden="true"
          >
            <span className="text-lg">💎</span>
          </div>
          {/* 유저 정보 */}
          <div className="flex flex-col gap-0.5 pb-px">
            <span className="text-[14px] font-bold text-zinc-900 leading-[20px]">
              {post.authorHandle}
            </span>
            <span className="text-[11px] font-medium text-zinc-400 leading-[16.5px]">
              {post.savedAt}
            </span>
          </div>
        </div>

        {/* 저장 해제 버튼 */}
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
        {/* 카테고리 태그 */}
        {post.categoryTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categoryTags.map((tag) => (
              <TagChip key={tag.label} {...tag} />
            ))}
          </div>
        )}

        {/* 본문 (3줄 클램프) */}
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

// ─── 탭 버튼 ────────────────────────────────────────────────────────────────

interface TabButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      className="relative flex flex-col items-center justify-center py-2 shrink-0"
    >
      <span
        className="text-[20px] font-bold leading-[28px] transition-colors"
        style={{ color: isActive ? '#18181b' : '#d4d4d8' }}
      >
        {label}
      </span>
      {isActive && (
        <span
          className="absolute bottom-[-4px] left-0 right-0 h-1 rounded-full"
          style={{ backgroundColor: '#18181b' }}
          aria-hidden="true"
        />
      )}
    </button>
  )
}

// ─── 빈 상태 (컬렉션 끝) ─────────────────────────────────────────────────────

function CollectionEnd() {
  return (
    <div className="flex flex-col items-center justify-center py-16 opacity-30">
      <div className="mb-3 text-3xl" aria-hidden="true">💎</div>
      <p className="text-[11px] font-bold text-zinc-900 tracking-[1.1px] uppercase">
        저장된 컬렉션의 끝입니다
      </p>
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function SavedPostsPage() {
  const [activeTab, setActiveTab] = useState<'fanmeet' | 'buddy'>('fanmeet')
  const [posts, setPosts] = useState<SavedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getSavedPosts(activeTab)
      setPosts(data)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleUnsave = async (id: string) => {
    await unsavePost(id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <>
      <TopAppBar showMenu showAvatar />

      <main className="pb-[192px] pt-8 px-5">
        {/* ── 에디토리얼 헤더 ── */}
        <header className="flex flex-col gap-1 mb-8">
          <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">
            저장된 포스트
          </h1>
          <p className="text-[14px] font-medium text-zinc-500 leading-[20px]">
            당신이 큐레이팅한 소중한 덕질의 순간들입니다.
          </p>
        </header>

        {/* ── 탭 내비게이션 ── */}
        <div
          className="flex gap-8 mb-8 px-1"
          role="tablist"
          aria-label="덕메/비계친 저장 탭"
        >
          <TabButton
            label="덕메"
            isActive={activeTab === 'fanmeet'}
            onClick={() => setActiveTab('fanmeet')}
          />
          <TabButton
            label="비계친"
            isActive={activeTab === 'buddy'}
            onClick={() => setActiveTab('buddy')}
          />
        </div>

        {/* ── 카드 목록 ── */}
        <section
          className="flex flex-col gap-4"
          aria-label="저장된 포스트 목록"
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
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <span className="text-4xl mb-3">🔖</span>
              <p className="text-sm font-medium">저장된 포스트가 없어요</p>
            </div>
          ) : (
            posts.map((post) => (
              <SavedCard key={post.id} post={post} onUnsave={handleUnsave} />
            ))
          )}
        </section>

        {/* ── 컬렉션 끝 ── */}
        {!isLoading && posts.length > 0 && <CollectionEnd />}
      </main>

      <BottomNavBar variant="saved" />
    </>
  )
}
