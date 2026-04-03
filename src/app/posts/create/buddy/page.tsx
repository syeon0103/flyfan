'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { X as XIcon, Shield, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import { createBuddyPost } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

// ─── 아이돌 슬롯 ──────────────────────────────────────────────────────────────

interface IdolSlotProps {
  name?: string
  index: number
  onRemove: (index: number) => void
}

function IdolSlot({ name, index, onRemove }: IdolSlotProps) {
  if (!name) {
    return (
      <div
        className="flex items-center justify-center w-16 h-16 rounded-[20px] border-2 border-dashed border-zinc-200"
        style={{ backgroundColor: '#fafafa' }}
        aria-label="아이돌 슬롯 비어있음"
      >
        <span className="text-xl text-zinc-300">+</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-[20px]"
        style={{ backgroundColor: '#f4f4f5' }}
        aria-label={`선택된 아이돌: ${name}`}
      >
        <span className="text-[11px] font-bold text-zinc-900 text-center px-1 leading-[14px]">
          {name}
        </span>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#18181b' }}
        aria-label={`${name} 제거`}
      >
        <XIcon size={10} className="text-white" strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ─── 지역 버튼 ────────────────────────────────────────────────────────────────

interface RegionButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function RegionButton({ label, isActive, onClick }: RegionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className="flex items-center justify-center h-10 px-4 rounded-[12px] text-[12px] font-bold transition-colors"
      style={{
        backgroundColor: isActive ? '#f4f4f5' : '#fafafa',
        color: isActive ? '#18181b' : '#a1a1aa',
        border: isActive ? 'none' : '1px solid #f4f4f5',
      }}
    >
      {label}
    </button>
  )
}

// ─── 세이프존 제한 태그 ────────────────────────────────────────────────────────

interface SafeZoneRestrictionProps {
  label: string
  isActive: boolean
  onToggle: (label: string) => void
  onRemove: (label: string) => void
}

function SafeZoneRestriction({ label, isActive, onToggle, onRemove }: SafeZoneRestrictionProps) {
  return (
    <div
      className="flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px] font-bold cursor-pointer"
      style={
        isActive
          ? { backgroundColor: '#fff1f2', color: '#f43f5e' }
          : { backgroundColor: '#fafafa', color: '#a1a1aa', border: '1px solid #f4f4f5' }
      }
      onClick={() => onToggle(label)}
      role="button"
      aria-pressed={isActive}
      aria-label={`${label} 제한 ${isActive ? '활성' : '비활성'}`}
    >
      {label}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(label) }}
        aria-label={`${label} 제거`}
        className="flex items-center"
      >
        <XIcon size={11} strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

const INITIAL_SAFE_ZONE_TAGS = ['사생 금지', '타팬덤 존중', '사진 유출 금지', '비방 금지']
const REGIONS = ['전국', '서울/경기', '부산/경남', '대구/경북', '광주/전라']
const AGE_GROUPS = ['10대', '20대 초반', '20대 후반', '30대', '연령무관']

export default function BuddyCreatePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  const [idols, setIdols] = useState<string[]>([])
  const [idolSearch, setIdolSearch] = useState('')
  const [search, setSearch] = useState('')
  const [age, setAge] = useState('20대 초반')
  const [region, setRegion] = useState('전국')
  const [intro, setIntro] = useState('')
  const [safeZoneTags, setSafeZoneTags] = useState<string[]>(INITIAL_SAFE_ZONE_TAGS)
  const [activeSafeZoneTags, setActiveSafeZoneTags] = useState<string[]>(['사생 금지'])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddIdol = useCallback(() => {
    const trimmed = idolSearch.trim()
    if (!trimmed || idols.includes(trimmed) || idols.length >= 4) return
    setIdols((prev) => [...prev, trimmed])
    setIdolSearch('')
  }, [idolSearch, idols])

  const handleRemoveIdol = useCallback((index: number) => {
    setIdols((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSafeZoneToggle = useCallback((label: string) => {
    setActiveSafeZoneTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    )
  }, [])

  const handleSafeZoneRemove = useCallback((label: string) => {
    setSafeZoneTags((prev) => prev.filter((t) => t !== label))
    setActiveSafeZoneTags((prev) => prev.filter((t) => t !== label))
  }, [])

  const canSubmit = intro.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      const result = await createBuddyPost({ idols, search, age, region, intro, safeZoneTags: activeSafeZoneTags })
      router.replace(`/posts/${result.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <TopAppBar showBack onBackClick={() => router.back()} />

      <main className="pb-[128px]">
        {/* ── 히어로 헤더 ── */}
        <div
          className="px-5 pt-8 pb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)' }}
        >
          {/* 배경 장식 */}
          <div
            className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full opacity-10"
            style={{ backgroundColor: '#ffffff' }}
            aria-hidden="true"
          />

          {/* 세이프 존 뱃지 */}
          <div
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full mb-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Shield size={12} className="text-white" aria-hidden="true" />
            <span className="text-[11px] font-bold text-white">Safe Zone</span>
          </div>

          <h1 className="text-[24px] font-bold text-white leading-[32px] tracking-[-0.6px] mb-2">
            비계친 모집글 작성
          </h1>
          <p className="text-[14px] font-medium leading-[20px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            비슷한 덕질 취향의 친구를 찾아보세요.
          </p>
        </div>

        <div className="px-5 pt-8">
          {/* ── 아이돌 선택 ── */}
          <section className="mb-8" aria-label="아이돌 선택">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
              최애 아이돌
            </p>

            {/* 슬롯들 */}
            <div className="flex gap-3 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <IdolSlot key={i} name={idols[i]} index={i} onRemove={handleRemoveIdol} />
              ))}
            </div>

            {/* 검색 입력 */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                type="text"
                value={idolSearch}
                onChange={(e) => setIdolSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddIdol()}
                placeholder="아이돌 이름 검색 후 Enter..."
                aria-label="아이돌 검색"
                className="w-full h-[48px] pl-[44px] pr-16 rounded-[14px] text-[13px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
              />
              <button
                onClick={handleAddIdol}
                disabled={!idolSearch.trim() || idols.length >= 4}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-7 px-3 rounded-[10px] text-[11px] font-bold text-white disabled:opacity-40"
                style={{ backgroundColor: '#18181b' }}
                aria-label="추가"
              >
                추가
              </button>
            </div>
          </section>

          {/* ── 검색 키워드 ── */}
          <section className="mb-8" aria-label="검색 키워드">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
              검색 키워드
            </p>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="관심사, 활동 등 키워드..."
                aria-label="검색 키워드 입력"
                className="w-full h-[56px] pl-[44px] pr-4 rounded-[16px] text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
              />
            </div>
          </section>

          {/* ── 연령대 ── */}
          <section className="mb-8" aria-label="연령대 선택">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
              연령대
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="연령대">
              {AGE_GROUPS.map((a) => (
                <RegionButton
                  key={a}
                  label={a}
                  isActive={age === a}
                  onClick={() => setAge(a)}
                />
              ))}
            </div>
          </section>

          {/* ── 지역 ── */}
          <section className="mb-8" aria-label="지역 선택">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
              지역
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="지역">
              {REGIONS.map((r) => (
                <RegionButton
                  key={r}
                  label={r}
                  isActive={region === r}
                  onClick={() => setRegion(r)}
                />
              ))}
            </div>
          </section>

          {/* ── 자기소개 ── */}
          <section className="mb-8" aria-label="자기소개">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
              자기소개
            </p>
            <div
              className="rounded-[20px] p-5"
              style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
            >
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="나의 덕질 스타일, 주로 하는 활동, 찾는 비계친의 조건을 자유롭게 적어주세요..."
                aria-label="자기소개 입력"
                rows={5}
                className="w-full bg-transparent text-[14px] text-zinc-900 placeholder:text-zinc-400 resize-none focus:outline-none leading-[24px]"
              />
            </div>
            <div className="flex justify-end mt-1.5">
              <span className="text-[11px] text-zinc-400">{intro.length} / 500</span>
            </div>
          </section>

          {/* ── 세이프 존 제한 ── */}
          <section className="mb-8" aria-label="세이프 존 제한">
            <div
              className="p-5 rounded-[24px]"
              style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield size={14} className="text-zinc-500" aria-hidden="true" />
                <span className="text-[13px] font-bold text-zinc-900">세이프 존 제한</span>
              </div>
              <p className="text-[12px] text-zinc-500 leading-[18px] mb-4">
                이 활동들은 비계친과의 관계에서 제한하고 싶어요.
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="제한 선택">
                {safeZoneTags.map((tag) => (
                  <SafeZoneRestriction
                    key={tag}
                    label={tag}
                    isActive={activeSafeZoneTags.includes(tag)}
                    onToggle={handleSafeZoneToggle}
                    onRemove={handleSafeZoneRemove}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ── 제출 버튼 ── */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full flex items-center justify-center py-4 rounded-[20px] text-[16px] font-bold text-white disabled:opacity-40 transition-opacity"
            style={{
              backgroundColor: '#18181b',
              boxShadow: '0px 10px 15px -3px rgba(24,24,27,0.1), 0px 4px 6px -4px rgba(24,24,27,0.1)',
            }}
            aria-label="모집글 등록"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              '비계친 모집글 등록'
            )}
          </button>
        </div>
      </main>

      <BottomNavBar />
    </>
  )
}
