'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { X as XIcon, Shield, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import { createBuddyPost, getProfileSettings } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const REGIONS = ['전국', '서울/경기', '부산/경남', '대구/경북', '광주/전라']
// 출생연도 십년대 (앞자리): 9n=1990년대, 8n=1980년대, 7n=1970년대, 0n=2000년대, 1n=2010년대
const AGE_DECADES = ['9n', '8n', '7n', '0n', '1n', '연령무관']

// ─── 키워드 칩 (일반) ─────────────────────────────────────────────────────────

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

// ─── 제한 키워드 칩 (강조) ───────────────────────────────────────────────────

function ExcludeChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div
      className="flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px] font-bold"
      style={{ backgroundColor: '#fff1f2', color: '#be123c', border: '1.5px solid #fecdd3' }}
    >
      <span className="text-[11px]">🚫</span>
      {label}
      <button onClick={onRemove} aria-label={`${label} 제거`} className="flex items-center">
        <XIcon size={11} strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ─── 토글 버튼 ────────────────────────────────────────────────────────────────

function ToggleChip({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className="flex items-center justify-center h-10 px-4 rounded-[12px] text-[12px] font-bold transition-colors"
      style={{
        backgroundColor: isActive ? '#18181b' : '#fafafa',
        color: isActive ? '#ffffff' : '#a1a1aa',
        border: isActive ? 'none' : '1px solid #f4f4f5',
      }}
    >
      {label}
    </button>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function BuddyCreatePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const keywordRef = useRef<HTMLInputElement>(null)
  const excludeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login')
  }, [user, isLoading, router])

  const [title, setTitle] = useState('')
  const [age, setAge] = useState('연령무관')
  const [region, setRegion] = useState('전국')
  const [intro, setIntro] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [excludeInput, setExcludeInput] = useState('')
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // 프로필 키워드 + 세이프존 기본 반영
    getProfileSettings().then((profile) => {
      if (profile.keywords.length > 0) setKeywords(profile.keywords.slice())
      if (profile.safeZoneTags.length > 0) setExcludeKeywords(profile.safeZoneTags.slice())
    })
  }, [])

  const handleAddKeyword = useCallback(() => {
    const kw = keywordInput.trim()
    if (!kw || keywords.includes(kw)) return
    setKeywords((prev) => [...prev, kw])
    setKeywordInput('')
    keywordRef.current?.focus()
  }, [keywordInput, keywords])

  const handleAddExclude = useCallback(() => {
    const kw = excludeInput.trim()
    if (!kw || excludeKeywords.includes(kw)) return
    setExcludeKeywords((prev) => [...prev, kw])
    setExcludeInput('')
    excludeRef.current?.focus()
  }, [excludeInput, excludeKeywords])

  const canSubmit = title.trim().length > 0 && intro.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      const result = await createBuddyPost({ title, age, region, intro, keywords, excludeKeywords })
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
          <div
            className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full opacity-10"
            style={{ backgroundColor: '#ffffff' }}
            aria-hidden="true"
          />
          <div
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full mb-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Shield size={12} className="text-white" />
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

          {/* ── 출생연도 (십년대) ── */}
          <section className="mb-8" aria-label="출생연도대">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-1">출생연도</p>
            <p className="text-[11px] font-medium text-zinc-400 mb-4">
              9n = 90년대생 &nbsp;·&nbsp; 8n = 80년대생 &nbsp;·&nbsp; 0n = 00년대생 &nbsp;·&nbsp; 1n = 10년대생
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="출생연도 선택">
              {AGE_DECADES.map((a) => (
                <ToggleChip key={a} label={a} isActive={age === a} onClick={() => setAge(a)} />
              ))}
            </div>
          </section>

          {/* ── 지역 ── */}
          <section className="mb-8" aria-label="지역 선택">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">지역</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="지역">
              {REGIONS.map((r) => (
                <ToggleChip key={r} label={r} isActive={region === r} onClick={() => setRegion(r)} />
              ))}
            </div>
          </section>

          {/* ── 자기소개 ── */}
          <section className="mb-8" aria-label="자기소개">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">자기소개</p>
            <div
              className="rounded-[20px] p-5"
              style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
            >
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value.slice(0, 500))}
                placeholder="나의 덕질 스타일, 주로 하는 활동, 찾는 비계친의 조건을 자유롭게 적어주세요..."
                rows={5}
                className="w-full bg-transparent text-[14px] text-zinc-900 placeholder:text-zinc-400 resize-none focus:outline-none leading-[24px]"
              />
            </div>
            <div className="flex justify-end mt-1.5">
              <span className="text-[11px] text-zinc-400">{intro.length} / 500</span>
            </div>
          </section>

          {/* ── 같이 하고 싶은 것 키워드 ── */}
          <section className="mb-8" aria-label="키워드">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">같이 하고 싶은 것</p>
              <span className="text-[10px] text-zinc-400">(덕질 프로필 키워드 반영)</span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-[16px] mb-3"
              style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
            >
              <input
                ref={keywordRef}
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword() } }}
                placeholder="예: 직캠교환, 팝업투어, 앨범개봉 등"
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
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <KeywordChip key={kw} label={kw} onRemove={() => setKeywords((p) => p.filter((k) => k !== kw))} />
                ))}
              </div>
            )}
          </section>

          {/* ── 이런 분은 사절 (제한 키워드) ── */}
          <section className="mb-8" aria-label="제한 키워드">
            <div
              className="p-5 rounded-[24px]"
              style={{ backgroundColor: '#fff1f2', border: '1.5px solid #fecdd3' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} style={{ color: '#be123c' }} />
                <span className="text-[13px] font-bold" style={{ color: '#be123c' }}>이런 분은 사절이에요 🚫</span>
              </div>
              <p className="text-[12px] leading-[18px] mb-4" style={{ color: '#f43f5e' }}>
                아래 키워드에 해당하는 분은 신청하지 말아주세요.
                덕질 프로필 세이프존이 자동 반영돼요.
              </p>

              <div
                className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid #fecdd3' }}
              >
                <input
                  ref={excludeRef}
                  type="text"
                  value={excludeInput}
                  onChange={(e) => setExcludeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddExclude() } }}
                  placeholder="제한할 유형 입력 (예: 사생팬, 비방충, 사진유출)"
                  className="flex-1 bg-transparent text-[13px] placeholder:text-zinc-400 focus:outline-none leading-normal"
                  style={{ color: '#be123c' }}
                  maxLength={20}
                />
                <button
                  onClick={handleAddExclude}
                  disabled={!excludeInput.trim()}
                  className="flex items-center justify-center w-7 h-7 rounded-full disabled:opacity-30 transition-opacity shrink-0"
                  style={{ backgroundColor: '#be123c' }}
                  aria-label="제한 키워드 추가"
                >
                  <Plus size={14} color="white" strokeWidth={2.5} />
                </button>
              </div>

              {excludeKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {excludeKeywords.map((kw) => (
                    <ExcludeChip
                      key={kw}
                      label={kw}
                      onRemove={() => setExcludeKeywords((p) => p.filter((k) => k !== kw))}
                    />
                  ))}
                </div>
              )}
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
