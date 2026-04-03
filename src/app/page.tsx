'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import FandomIcon from '@/components/ui/FandomIcon'
import { getRecruitPosts, type RecruitPost, type TagItem } from '@/lib/api'

// ─── 팬덤 배지 ───────────────────────────────────────────────────────────────

interface FandomBadgeProps {
  idolColor: string
}

function FandomBadge({ idolColor }: FandomBadgeProps) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl"
      style={{
        width: '49px',
        height: '46px',
        backgroundColor: `${idolColor}18`,
      }}
      aria-hidden="true"
    >
      <FandomIcon color={idolColor} size={22} />
    </div>
  )
}

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

// ─── 모집 카드 ───────────────────────────────────────────────────────────────

interface RecruitCardProps {
  card: RecruitPost
  onApply: (id: string) => void
}

function RecruitCard({ card, onApply }: RecruitCardProps) {
  const isClosed = card.status === '매칭 완료'

  return (
    <article
      className="bg-white border border-zinc-100 rounded-[40px] p-[25px] flex flex-col gap-4"
      style={{ boxShadow: '0px 8px 30px 0px rgba(0,0,0,0.04)' }}
      aria-label={`${card.title} 모집 카드`}
    >
      {/* 상단: 팬덤 로고 + 상태 */}
      <div className="flex items-start justify-between">
        <FandomBadge idolColor={card.idolColor} />
        <div className="flex flex-col items-end gap-1">
          <span
            className="inline-flex items-center h-[23px] px-[10px] rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: '#f4f4f5',
              color: isClosed ? '#71717a' : '#3f3f46',
            }}
          >
            {card.status}
          </span>
          <span
            className="text-[12px] font-bold leading-none"
            style={{ color: card.ddayColor }}
            aria-label={`마감일: ${card.dday}`}
          >
            {card.dday}
          </span>
        </div>
      </div>

      {/* 제목 + 태그 */}
      <div
        className={`flex flex-col gap-3 pb-2 ${isClosed ? 'opacity-60' : ''}`}
      >
        <h3
          className="font-bold text-[18px] leading-[28px] tracking-[-0.45px] text-zinc-900"
        >
          {card.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <TagChip key={tag.label} {...tag} />
          ))}
        </div>
      </div>

      {/* 하단: 시간 + 신청 */}
      <div
        className="flex items-center justify-between pt-[21px]"
        style={{ borderTop: '1px solid #fafafa' }}
      >
        <span className="text-[12px] text-zinc-400 leading-none">
          {card.timestamp}
        </span>
        {isClosed ? (
          <span className="text-[14px] font-bold text-zinc-400">마감됨</span>
        ) : (
          <button
            onClick={() => onApply(card.id)}
            className="flex items-center gap-0.5 text-[14px] font-bold text-zinc-900 hover:opacity-70 transition-opacity"
            aria-label={`${card.title} 신청하기`}
          >
            신청하기
            <ChevronRight size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </article>
  )
}

// ─── 필터 칩 ────────────────────────────────────────────────────────────────

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

// ─── 페이지 ──────────────────────────────────────────────────────────────────

const FILTER_ITEMS = [
  { id: 'all', label: '💎 팬덤 전체' },
  { id: 'seoul', label: '📍 서울/경기' },
  { id: 'age', label: '👩 20-30대' },
  { id: 'concert', label: '🎫 콘서트' },
]

export default function HomePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'fanmeet' | 'buddy'>('fanmeet')
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [posts, setPosts] = useState<RecruitPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getRecruitPosts(activeTab)
      setPosts(data)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  // 탭 포커스 시 새로고침 (글 작성 후 돌아왔을 때)
  useEffect(() => {
    const onFocus = () => loadPosts()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [loadPosts])

  const handleApply = (id: string) => {
    router.push(`/posts/${id}`)
  }

  const filteredPosts = posts.filter((post) => {
    if (searchText) {
      return post.title.includes(searchText) ||
        post.tags.some((t) => t.label.includes(searchText))
    }
    return true
  })

  return (
    <>
      <TopAppBar showMenu showNotification />

      <main className="pb-[128px]">
        {/* ── 탭 내비게이션 ── */}
        <section
          className="flex gap-8 px-6 pt-6"
          role="tablist"
          aria-label="덕메/비계친 탭"
        >
          <TabButton
            label="덕메 찾기"
            isActive={activeTab === 'fanmeet'}
            onClick={() => setActiveTab('fanmeet')}
          />
          <TabButton
            label="비계친 찾기"
            isActive={activeTab === 'buddy'}
            onClick={() => setActiveTab('buddy')}
          />
        </section>

        {/* ── 검색 섹션 ── */}
        <section className="flex flex-col px-5 pt-8 gap-0 relative" aria-label="검색 및 필터">
          {/* 검색창 */}
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="어떤 덕메를 찾으시나요?"
              aria-label="덕메 검색"
              className="w-full h-[56px] pl-[48px] pr-4 rounded-[40px] bg-zinc-100 text-zinc-400 text-[14px] font-normal placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </div>

          {/* 필터 칩 (좌측 오버랩) */}
          <div
            className="flex gap-2 overflow-x-auto scrollbar-hide pt-4 pb-2 -mx-5 px-5"
            role="group"
            aria-label="필터 선택"
          >
            {FILTER_ITEMS.map((f) => (
              <FilterChip
                key={f.id}
                label={f.label}
                isActive={activeFilter === f.id}
                onClick={() => setActiveFilter(f.id)}
              />
            ))}
          </div>
        </section>

        {/* ── 모집 카드 목록 ── */}
        <section
          className="flex flex-col gap-4 px-5 pt-8"
          aria-label="모집 목록"
          aria-live="polite"
          aria-busy={isLoading}
        >
          {isLoading ? (
            // 스켈레톤 로딩
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[180px] rounded-[40px] bg-zinc-100 animate-pulse"
                aria-hidden="true"
              />
            ))
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <span className="text-4xl mb-3">{searchText ? '🔍' : '💎'}</span>
              <p className="text-sm font-medium">
                {searchText ? '검색 결과가 없어요' : '아직 모집글이 없어요'}
              </p>
              {!searchText && (
                <p className="text-xs mt-1">첫 번째 모집글을 작성해보세요!</p>
              )}
            </div>
          ) : (
            filteredPosts.map((card) => (
              <RecruitCard key={card.id} card={card} onApply={handleApply} />
            ))
          )}
        </section>
      </main>

      {/* ── FAB 버튼 ── */}
      <Link href="/posts/create/fan-meet" aria-label="새 모집글 작성">
        <button
          className="fixed z-30 flex items-center justify-center"
          style={{
            bottom: '95px',
            right: 'calc(50% - 328px)',
            width: '64px',
            height: '64px',
            borderRadius: '24px',
            backgroundColor: '#18181b',
            boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
          }}
          aria-label="새 모집글 작성"
        >
          <Plus size={18} color="white" strokeWidth={2.5} />
        </button>
      </Link>

      <BottomNavBar />
    </>
  )
}
