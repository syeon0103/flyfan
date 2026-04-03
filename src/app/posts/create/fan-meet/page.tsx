'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { X as XIcon, ChevronDown, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import { createFanMeetPost } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

// ─── 아티스트 칩 ──────────────────────────────────────────────────────────────

interface ArtistChipProps {
  label: string
  isSelected: boolean
  onToggle: (label: string) => void
}

function ArtistChip({ label, isSelected, onToggle }: ArtistChipProps) {
  return (
    <button
      onClick={() => onToggle(label)}
      aria-pressed={isSelected}
      className="flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px] font-bold transition-all whitespace-nowrap"
      style={
        isSelected
          ? { backgroundColor: '#18181b', color: '#ffffff' }
          : { backgroundColor: '#ffffff', color: '#52525b', border: '1px solid #f4f4f5', boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)' }
      }
    >
      {label}
      {isSelected && <XIcon size={11} strokeWidth={2.5} aria-hidden="true" />}
    </button>
  )
}

// ─── 요구사항 카드 ────────────────────────────────────────────────────────────

interface RequirementCardProps {
  label: string
  bg: string
  color: string
  isSelected: boolean
  onToggle: (label: string) => void
}

function RequirementCard({ label, bg, color, isSelected, onToggle }: RequirementCardProps) {
  return (
    <button
      onClick={() => onToggle(label)}
      aria-pressed={isSelected}
      className="flex items-center justify-center h-[64px] rounded-[16px] transition-all"
      style={{
        backgroundColor: isSelected ? bg : '#fafafa',
        border: isSelected ? 'none' : '1px solid #f4f4f5',
      }}
    >
      <span
        className="text-[12px] font-bold"
        style={{ color: isSelected ? color : '#a1a1aa' }}
      >
        {label}
      </span>
    </button>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

const ARTISTS = ['NewJeans', 'IVE', 'aespa', 'BLACKPINK', 'BTS', 'Stray Kids', 'TWICE', 'EXO']

const REQUIREMENTS = [
  { label: '여성만', bg: '#fff1f2', color: '#be123c' },
  { label: '동갑내기', bg: '#fff7ed', color: '#9a3412' },
  { label: '오프위주', bg: '#f0f9ff', color: '#075985' },
  { label: '카페투어', bg: '#ecfdf5', color: '#065f46' },
]

const REGIONS = ['전국', '서울/경기', '부산/경남', '대구/경북', '광주/전라', '대전/충청', '제주']

export default function FanMeetCreatePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [region, setRegion] = useState('서울/경기')
  const [date, setDate] = useState('')
  const [requirements, setRequirements] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)

  const handleArtistToggle = useCallback((label: string) => {
    setSelectedArtists((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    )
  }, [])

  const handleRequirementToggle = useCallback((label: string) => {
    setRequirements((prev) =>
      prev.includes(label) ? prev.filter((r) => r !== label) : [...prev, label]
    )
  }, [])

  const canSubmit = selectedArtists.length > 0 && region && description.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      const result = await createFanMeetPost({ artists: selectedArtists, region, date, requirements, description })
      router.replace(`/posts/${result.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <TopAppBar showBack onBackClick={() => router.back()} />

      <main className="pb-[128px] pt-6 px-5">
        {/* ── 헤더 ── */}
        <header className="flex flex-col gap-1 mb-8">
          <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">
            덕메 모집글 작성
          </h1>
          <p className="text-[14px] font-medium text-zinc-500 leading-[20px]">
            함께할 덕질 메이트를 찾아보세요.
          </p>
        </header>

        {/* ── 아티스트 선택 ── */}
        <section className="mb-8" aria-label="아티스트 선택">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
            아티스트
          </p>
          <div
            className="flex gap-2 flex-wrap"
            role="group"
            aria-label="아티스트 선택"
          >
            {ARTISTS.map((artist) => (
              <ArtistChip
                key={artist}
                label={artist}
                isSelected={selectedArtists.includes(artist)}
                onToggle={handleArtistToggle}
              />
            ))}
          </div>
        </section>

        {/* ── 지역 선택 ── */}
        <section className="mb-8" aria-label="지역 선택">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
            지역
          </p>
          <div className="relative">
            <button
              onClick={() => setShowRegionDropdown(!showRegionDropdown)}
              className="w-full flex items-center justify-between h-[56px] px-5 rounded-[16px] text-[14px] font-medium"
              style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
              aria-haspopup="listbox"
              aria-expanded={showRegionDropdown}
            >
              <span className="text-zinc-900">{region}</span>
              <ChevronDown size={18} className="text-zinc-400" />
            </button>
            {showRegionDropdown && (
              <div
                className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#f4f4f5] rounded-[16px] overflow-hidden z-10"
                style={{ boxShadow: '0px 8px 30px 0px rgba(0,0,0,0.08)' }}
                role="listbox"
                aria-label="지역 목록"
              >
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRegion(r); setShowRegionDropdown(false) }}
                    role="option"
                    aria-selected={region === r}
                    className="w-full flex items-center px-5 h-[48px] text-[14px] font-medium transition-colors hover:bg-zinc-50"
                    style={{ color: region === r ? '#18181b' : '#52525b' }}
                  >
                    {r}
                    {region === r && (
                      <span className="ml-auto text-[11px] font-bold" style={{ color: '#18181b' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── 날짜 ── */}
        <section className="mb-8" aria-label="날짜 선택">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
            날짜
          </p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="날짜 선택"
            className="w-full h-[56px] px-5 rounded-[16px] text-[14px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
          />
        </section>

        {/* ── 요구사항 그리드 ── */}
        <section className="mb-8" aria-label="참여 조건">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
            참여 조건
          </p>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="조건 선택">
            {REQUIREMENTS.map((req) => (
              <RequirementCard
                key={req.label}
                {...req}
                isSelected={requirements.includes(req.label)}
                onToggle={handleRequirementToggle}
              />
            ))}
          </div>
        </section>

        {/* ── 소개글 ── */}
        <section className="mb-8" aria-label="소개글">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
            소개글
          </p>
          <div
            className="rounded-[20px] p-5"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="함께하고 싶은 활동, 선호 조건, 연락 방법 등을 자유롭게 작성해주세요..."
              aria-label="소개글 입력"
              rows={5}
              className="w-full bg-transparent text-[14px] text-zinc-900 placeholder:text-zinc-400 resize-none focus:outline-none leading-[24px]"
            />
          </div>
          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-zinc-400">{description.length} / 500</span>
          </div>
        </section>

        {/* ── Flyfan Tip 카드 ── */}
        <div
          className="flex gap-3 p-5 rounded-[24px] mb-8"
          style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}
          role="note"
          aria-label="Flyfan 팁"
        >
          <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-bold text-amber-700">Flyfan Tip</span>
            <p className="text-[12px] font-medium text-amber-600 leading-[18px]">
              상세한 소개글과 명확한 조건 설정은 좋은 덕메를 찾을 확률을 높여줍니다.
              세이프 존 키워드를 설정하면 매칭 성공률이 올라가요! 💎
            </p>
          </div>
        </div>

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
            '모집글 등록하기'
          )}
        </button>
      </main>

      <BottomNavBar />
    </>
  )
}
