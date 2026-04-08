'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Plus, ChevronRight, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import FandomIcon from '@/components/ui/FandomIcon'
import { getRecruitPosts, savePost, unsavePost, type RecruitPost, type TagItem } from '@/lib/api'

// ─── 팬덤 배지 / 페르소나 배지 ──────────────────────────────────────────────

interface AuthorBadgeProps {
  postType: 'fanmeet' | 'buddy'
  idolColor: string
  authorPersonaEmoji?: string
}

function AuthorBadge({ postType, idolColor, authorPersonaEmoji }: AuthorBadgeProps) {
  if (postType === 'buddy' && authorPersonaEmoji) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl shrink-0"
        style={{ width: 49, height: 46, backgroundColor: '#f4f4f5' }}
        aria-hidden="true"
      >
        <span style={{ fontSize: 22 }}>{authorPersonaEmoji}</span>
      </div>
    )
  }
  return (
    <div
      className="flex items-center justify-center rounded-2xl shrink-0"
      style={{ width: 49, height: 46, backgroundColor: `${idolColor}18` }}
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

// 아이돌 칩: 해당 아이돌 색, 나머지: 중립 스타일
function TagChipNeutral({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center h-[28.5px] px-3 rounded-[32px] text-[11px] font-bold leading-none"
      style={{ backgroundColor: '#f4f4f5', color: '#71717a' }}
    >
      {label}
    </span>
  )
}

// ─── 모집 카드 ───────────────────────────────────────────────────────────────

interface RecruitCardProps {
  card: RecruitPost
  onApply: (id: string) => void
  onToggleSave: (id: string, saved: boolean) => void
}

function RecruitCard({ card, onApply, onToggleSave }: RecruitCardProps) {
  const isClosed = card.status === '매칭 완료'
  const isMatching = card.status === '매칭 중'
  const isReported = card.isReported ?? false
  const isSaved = card.isSaved ?? false

  return (
    <article
      className="bg-white border border-zinc-100 rounded-[40px] p-[25px] flex flex-col gap-4"
      style={{ boxShadow: '0px 8px 30px 0px rgba(0,0,0,0.04)' }}
      aria-label={`${card.title} 모집 카드`}
    >
      {/* 상단: 팬덤/페르소나 배지 + 상태 */}
      <div className="flex items-start justify-between">
        <AuthorBadge
          postType={card.postType}
          idolColor={card.idolColor}
          authorPersonaEmoji={card.authorPersonaEmoji}
        />
        <div className="flex flex-col items-end gap-1">
          <span
            className="inline-flex items-center h-[23px] px-[10px] rounded-full text-[10px] font-bold"
            style={
              isReported
                ? { backgroundColor: '#fee2e2', color: '#991b1b' }
                : isMatching
                ? { backgroundColor: '#fef3c7', color: '#78350f' }
                : isClosed
                ? { backgroundColor: '#e4e4e7', color: '#71717a' }
                : { backgroundColor: '#dcfce7', color: '#15803d' }
            }
          >
            {isReported ? '신고 접수 중' : card.status}
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
        className={`flex flex-col gap-3 pb-2 ${isClosed || isMatching ? 'opacity-60' : ''}`}
      >
        <h3
          className="font-bold text-[18px] leading-[28px] tracking-[-0.45px] text-zinc-900"
        >
          {card.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {card.tags.map((tag) =>
            tag.label === card.idolName ? (
              <TagChip key={tag.label} {...tag} />
            ) : (
              <TagChipNeutral key={tag.label} label={tag.label} />
            )
          )}
        </div>
      </div>

      {/* 하단: 시간 + 북마크 + 신청 */}
      <div
        className="flex items-center justify-between pt-[21px]"
        style={{ borderTop: '1px solid #fafafa' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-zinc-400 leading-none">
            {card.timestamp}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(card.id, isSaved) }}
            aria-label={isSaved ? '저장 취소' : '저장하기'}
            aria-pressed={isSaved}
            className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <Bookmark
              size={14}
              strokeWidth={2}
              style={{ color: isSaved ? '#18181b' : '#d4d4d8' }}
              fill={isSaved ? '#18181b' : 'none'}
            />
          </button>
        </div>
        {isReported ? (
          <span className="text-[14px] font-bold" style={{ color: '#991b1b' }}>신고 처리 중</span>
        ) : isClosed ? (
          <span className="text-[14px] font-bold text-zinc-400">마감됨</span>
        ) : isMatching ? (
          <span className="text-[14px] font-bold" style={{ color: '#78350f' }}>매칭중</span>
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

// ─── 프로모 배너 ─────────────────────────────────────────────────────────────

function PromoBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-[28px] cursor-pointer select-none"
      style={{
        height: 160,
        background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 55%, #e0f2fe 100%)',
      }}
      role="img"
      aria-label="플라이팬 가이드 배너"
    >
      {/* 배경 글로우 볼들 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* 큰 핑크 구 */}
        <div style={{
          position: 'absolute', width: 140, height: 140,
          right: -20, top: -30,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 32%, #fff1f9, #f9a8d4 55%, #e879f9)',
          opacity: 0.9,
          boxShadow: 'inset -6px -6px 16px rgba(219,39,119,0.12), inset 5px 5px 14px rgba(255,255,255,0.7)',
        }} />
        {/* 중간 라벤더 구 */}
        <div style={{
          position: 'absolute', width: 72, height: 72,
          right: 90, bottom: -16,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #f5f3ff, #c4b5fd 60%, #a78bfa)',
          opacity: 0.95,
          boxShadow: 'inset -4px -4px 10px rgba(109,40,217,0.15), inset 3px 3px 8px rgba(255,255,255,0.7)',
        }} />
        {/* 작은 스카이 구 */}
        <div style={{
          position: 'absolute', width: 36, height: 36,
          right: 155, top: 12,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #f0f9ff, #7dd3fc 65%)',
          opacity: 0.9,
          boxShadow: 'inset -2px -2px 6px rgba(14,165,233,0.2), inset 2px 2px 5px rgba(255,255,255,0.7)',
        }} />
        {/* 링 장식 */}
        <div style={{
          position: 'absolute', width: 80, height: 80,
          right: 30, bottom: 10,
          borderRadius: '50%',
          border: '9px solid rgba(167,139,250,0.3)',
          transform: 'rotate(-25deg) scaleX(0.6)',
        }} />
        {/* 작은 핑크 링 */}
        <div style={{
          position: 'absolute', width: 44, height: 44,
          right: 170, top: 60,
          borderRadius: '50%',
          border: '6px solid rgba(249,168,212,0.5)',
          transform: 'rotate(15deg) scaleX(0.55)',
        }} />
        {/* 반짝임 dot들 */}
        {[
          { w: 5, h: 5, top: 28, right: 220, op: 0.55, color: '#e879f9' },
          { w: 4, h: 4, top: 80, right: 200, op: 0.45, color: '#a78bfa' },
          { w: 6, h: 6, top: 50, right: 250, op: 0.35, color: '#f9a8d4' },
        ].map((d, i) => (
          <div key={i} style={{
            position: 'absolute', width: d.w, height: d.h,
            top: d.top, right: d.right,
            borderRadius: '50%', backgroundColor: d.color, opacity: d.op,
          }} />
        ))}
      </div>

      {/* 텍스트 영역 */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 pointer-events-none">
        <div
          className="inline-flex items-center gap-1.5 mb-2 self-start px-3 h-6 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: 'rgba(167,139,250,0.18)', color: '#7c3aed', backdropFilter: 'blur(4px)' }}
        >
          ✨ NEW
        </div>
        <h2
          className="text-[22px] font-extrabold leading-[28px] tracking-[-0.5px] mb-1.5"
          style={{ color: '#5b21b6' }}
        >
          플라이팬을 소개할게요!
        </h2>
        <p className="text-[12px] font-medium" style={{ color: '#a855f7' }}>
          덕메 & 비계친 찾는 방법 가이드 →
        </p>
      </div>
    </div>
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

  const handleToggleSave = useCallback(async (id: string, currentlySaved: boolean) => {
    // 낙관적 업데이트
    setPosts((prev) =>
      prev.map((p) => p.id === id ? { ...p, isSaved: !currentlySaved } : p)
    )
    try {
      if (currentlySaved) {
        await unsavePost(id)
      } else {
        await savePost(id)
      }
    } catch {
      // 실패 시 롤백
      setPosts((prev) =>
        prev.map((p) => p.id === id ? { ...p, isSaved: currentlySaved } : p)
      )
    }
  }, [])

  const filteredPosts = posts.filter((post) => {
    if (searchText) {
      return post.title.includes(searchText) ||
        post.tags.some((t) => t.label.includes(searchText))
    }
    return true
  })

  return (
    <>
      <TopAppBar showPersonaMenu />

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

        {/* ── 플라이팬 소개 배너 ── */}
        <div className="px-5 pt-6">
          <Link href="/guide" aria-label="플라이팬 가이드 보기">
            <PromoBanner />
          </Link>
        </div>

        {/* ── 모집 카드 목록 ── */}
        <section
          className="flex flex-col gap-4 px-5 pt-6"
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
              <RecruitCard key={card.id} card={card} onApply={handleApply} onToggleSave={handleToggleSave} />
            ))
          )}
        </section>

        {/* ── 아티스트 추가 요청 배너 ── */}
        <div className="px-5 pt-2 pb-4">
          <Link href="/request-artist">
            <div
              className="flex items-center justify-between px-5 py-4 rounded-[20px] transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-zinc-900">내가 좋아하는 아티스트가 없다면?</span>
                <span className="text-[11px] font-medium text-zinc-400">직접 추가해주세요! 관리자가 검토 후 등록해요.</span>
              </div>
              <ChevronRight size={16} className="text-zinc-300 shrink-0" />
            </div>
          </Link>
        </div>
      </main>

      {/* ── FAB 버튼 ── */}
      <Link
        href={activeTab === 'fanmeet' ? '/posts/create/fan-meet' : '/posts/create/buddy'}
        aria-label="새 모집글 작성"
      >
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
