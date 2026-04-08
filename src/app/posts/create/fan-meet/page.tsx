'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { X as XIcon, ChevronDown, Lightbulb, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import { createFanMeetPost, getIdols, getMyMatchingFanmeetDates, getProfileSettings, type Idol } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const REGIONS = ['전국', '서울/경기', '부산/경남', '대구/경북', '광주/전라', '대전/충청', '제주']

// ─── 키워드 칩 ────────────────────────────────────────────────────────────────

function KeywordChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div
      className="flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px] font-bold"
      style={{ backgroundColor: '#18181b', color: '#ffffff' }}
    >
      {label}
      <button onClick={onRemove} aria-label={`${label} 제거`} className="flex items-center">
        <XIcon size={11} strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function FanMeetCreatePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const keywordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading, router])

  const [idols, setIdols] = useState<Idol[]>([])
  const [title, setTitle] = useState('')
  const [selectedArtist, setSelectedArtist] = useState('')
  const [showArtistDropdown, setShowArtistDropdown] = useState(false)
  const [region, setRegion] = useState('서울/경기')
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)
  const [date, setDate] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getIdols().then(setIdols)
    // 프로필 키워드 기본 반영
    getProfileSettings().then((profile) => {
      if (profile.keywords.length > 0) {
        setKeywords(profile.keywords.slice())
      }
    })
  }, [])

  const handleAddKeyword = useCallback(() => {
    const kw = keywordInput.trim()
    if (!kw || keywords.includes(kw)) return
    setKeywords((prev) => [...prev, kw])
    setKeywordInput('')
    keywordRef.current?.focus()
  }, [keywordInput, keywords])

  const handleRemoveKeyword = useCallback((kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw))
  }, [])

  const canSubmit = title.trim().length > 0 && selectedArtist.trim().length > 0 && region && description.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setError(null)
    setIsSubmitting(true)
    try {
      if (date) {
        const matchingDates = await getMyMatchingFanmeetDates()
        if (matchingDates.includes(date)) {
          setError('해당 날짜에 이미 매칭 중인 덕메 모집글이 있어요.')
          return
        }
      }
      const result = await createFanMeetPost({
        title,
        artists: [selectedArtist],
        region,
        date,
        requirements: keywords,
        description,
      })
      router.replace(`/posts/${result.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <TopAppBar showBack onBackClick={() => router.back()} />

      <main className="pb-[128px] pt-6 px-5">
        <header className="flex flex-col gap-1 mb-8">
          <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">
            덕메 모집글 작성
          </h1>
          <p className="text-[14px] font-medium text-zinc-500 leading-[20px]">
            함께할 덕질 메이트를 찾아보세요.
          </p>
        </header>

        {/* ── 제목 ── */}
        <section className="mb-8" aria-label="제목">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">제목</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 40))}
            placeholder="모집글 제목을 입력하세요"
            className="w-full h-[56px] px-5 rounded-[16px] text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
          />
          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-zinc-400">{title.length} / 40</span>
          </div>
        </section>

        {/* ── 아티스트 선택 ── */}
        <section className="mb-8" aria-label="아티스트 선택">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">아티스트</p>
          <div className="relative">
            <button
              onClick={() => { setShowArtistDropdown(!showArtistDropdown); setShowRegionDropdown(false) }}
              className="w-full flex items-center justify-between h-[56px] px-5 rounded-[16px] text-[14px] font-medium"
              style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
              aria-haspopup="listbox"
              aria-expanded={showArtistDropdown}
            >
              <span style={{ color: selectedArtist ? '#18181b' : '#a1a1aa' }}>
                {selectedArtist || '아티스트를 선택하세요'}
              </span>
              <div className="flex items-center gap-2">
                {selectedArtist && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedArtist('') }}
                    aria-label="선택 해제"
                    className="p-0.5"
                  >
                    <XIcon size={14} strokeWidth={2.5} className="text-zinc-400" />
                  </button>
                )}
                <ChevronDown size={18} className="text-zinc-400" />
              </div>
            </button>
            {showArtistDropdown && (
              <div
                className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#f4f4f5] rounded-[16px] overflow-hidden z-10"
                style={{ boxShadow: '0px 8px 30px 0px rgba(0,0,0,0.08)', maxHeight: 280, overflowY: 'auto' }}
                role="listbox"
              >
                {idols.map((idol) => (
                  <button
                    key={idol.id}
                    onClick={() => { setSelectedArtist(idol.name); setShowArtistDropdown(false) }}
                    role="option"
                    aria-selected={selectedArtist === idol.name}
                    className="w-full flex items-center gap-3 px-5 h-[52px] text-[14px] font-medium transition-colors hover:bg-zinc-50"
                    style={{ color: selectedArtist === idol.name ? '#18181b' : '#52525b' }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: idol.color }} />
                    {idol.name}
                    {selectedArtist === idol.name && (
                      <span className="ml-auto text-[11px] font-bold" style={{ color: '#18181b' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── 지역 선택 ── */}
        <section className="mb-8" aria-label="지역 선택">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">지역</p>
          <div className="relative">
            <button
              onClick={() => { setShowRegionDropdown(!showRegionDropdown); setShowArtistDropdown(false) }}
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

        {/* ── 날짜 (선택) ── */}
        <section className="mb-8" aria-label="오프라인 만남 날짜">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">오프라인 만남 날짜</p>
            <span className="text-[10px] font-medium text-zinc-400">(선택)</span>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-[56px] px-5 rounded-[16px] text-[14px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
          />
        </section>

        {/* ── 참여 조건 키워드 ── */}
        <section className="mb-8" aria-label="참여 조건 키워드">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">참여 조건</p>
            <span className="text-[10px] font-medium text-zinc-400">(선택 · 덕질 프로필 키워드 자동 반영)</span>
          </div>

          {/* 키워드 입력 */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-[16px]"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
          >
            <input
              ref={keywordRef}
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword() } }}
              placeholder="조건 입력 (예: 여성만, 직캠덕, 굿즈교환 등)"
              className="flex-1 bg-transparent text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none leading-normal"
              maxLength={20}
            />
            <button
              onClick={handleAddKeyword}
              disabled={!keywordInput.trim()}
              className="flex items-center justify-center w-7 h-7 rounded-full disabled:opacity-30 transition-opacity shrink-0"
              style={{ backgroundColor: '#18181b' }}
              aria-label="키워드 추가"
            >
              <Plus size={14} color="white" strokeWidth={2.5} />
            </button>
          </div>

          {/* 추가된 키워드 */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {keywords.map((kw) => (
                <KeywordChip key={kw} label={kw} onRemove={() => handleRemoveKeyword(kw)} />
              ))}
            </div>
          )}
        </section>

        {/* ── 소개글 ── */}
        <section className="mb-8" aria-label="소개글">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">소개글</p>
          <div
            className="rounded-[20px] p-5"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="함께하고 싶은 활동, 선호 조건, 연락 방법 등을 자유롭게 작성해주세요..."
              rows={5}
              className="w-full bg-transparent text-[14px] text-zinc-900 placeholder:text-zinc-400 resize-none focus:outline-none leading-[24px]"
            />
          </div>
          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-zinc-400">{description.length} / 500</span>
          </div>
        </section>

        {/* ── Flyfan Tip ── */}
        <div
          className="flex gap-3 p-5 rounded-[24px] mb-8"
          style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}
          role="note"
        >
          <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-bold text-amber-700">Flyfan Tip</span>
            <p className="text-[12px] font-medium text-amber-600 leading-[18px]">
              날짜가 다른 덕메 모집글은 여러 개 등록할 수 있어요.
              상세한 소개글과 명확한 조건 설정으로 매칭 성공률을 높여보세요! 💎
            </p>
          </div>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 mb-6 p-4 rounded-[16px] text-[13px] font-medium"
            style={{ backgroundColor: '#fff1f2', color: '#be123c' }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full flex items-center justify-center py-4 rounded-[20px] text-[16px] font-bold text-white disabled:opacity-40 transition-opacity"
          style={{
            backgroundColor: '#18181b',
            boxShadow: '0px 10px 15px -3px rgba(24,24,27,0.1), 0px 4px 6px -4px rgba(24,24,27,0.1)',
          }}
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
