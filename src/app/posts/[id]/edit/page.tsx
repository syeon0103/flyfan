'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X as XIcon, Plus, Shield } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import { getPostDetail, getIdols, updatePost, type PostDetail, type Idol } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const REGIONS = ['전국', '서울/경기', '부산/경남', '대구/경북', '광주/전라', '대전/충청', '제주']
const AGE_DECADES = ['9n', '8n', '7n', '0n', '1n', '연령무관']

// ─── 키워드 칩 ────────────────────────────────────────────────────────────────

function KeywordChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div
      className="flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px] font-bold"
      style={{ backgroundColor: '#18181b', color: '#fff' }}
    >
      {label}
      <button onClick={onRemove} aria-label={`${label} 제거`}>
        <XIcon size={11} strokeWidth={2.5} />
      </button>
    </div>
  )
}

function ExcludeChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div
      className="flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px] font-bold"
      style={{ backgroundColor: '#fff1f2', color: '#be123c', border: '1.5px solid #fecdd3' }}
    >
      <span className="text-[11px]">🚫</span>
      {label}
      <button onClick={onRemove} aria-label={`${label} 제거`}>
        <XIcon size={11} strokeWidth={2.5} />
      </button>
    </div>
  )
}

function ToggleChip({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className="h-10 px-4 rounded-[12px] text-[12px] font-bold transition-colors"
      style={{
        backgroundColor: isActive ? '#18181b' : '#fafafa',
        color: isActive ? '#fff' : '#a1a1aa',
        border: isActive ? 'none' : '1px solid #f4f4f5',
      }}
    >
      {label}
    </button>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function PostEditPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params?.id as string
  const { user, profile: authProfile, isLoading: authLoading } = useAuth()

  const [post, setPost] = useState<PostDetail | null>(null)
  const [idols, setIdols] = useState<Idol[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 공통 필드
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [region, setRegion] = useState('서울/경기')

  // 덕메 전용
  const [selectedArtist, setSelectedArtist] = useState('')
  const [showArtistDropdown, setShowArtistDropdown] = useState(false)
  const [date, setDate] = useState('')
  const [kwInput, setKwInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const kwRef = useRef<HTMLInputElement>(null)

  // 비계친 전용
  const [age, setAge] = useState('연령무관')
  const [excludeInput, setExcludeInput] = useState('')
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>([])
  const excludeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [authLoading, user, router])

  useEffect(() => {
    if (!postId) return
    Promise.all([getPostDetail(postId), getIdols()]).then(([p, i]) => {
      setPost(p)
      setIdols(i)

      // 폼 초기값 채우기
      setTitle(p.title)
      setContent(p.content)
      setRegion(p.rawRegion ?? '서울/경기')

      if (p.postType === 'fanmeet') {
        setSelectedArtist(p.rawIdolName ?? '')
        setDate(p.rawDate ?? '')
        const reqs = p.rawRequirements ?? []
        setKeywords(reqs)
      } else {
        // 비계친: requirements = [age, ...keywords, ...제한:xxx]
        const reqs = p.rawRequirements ?? []
        const ageVal = AGE_DECADES.find((a) => reqs[0] === a) ?? '연령무관'
        setAge(ageVal)
        const kws = reqs.slice(1).filter((r) => !r.startsWith('제한:'))
        const excls = reqs.filter((r) => r.startsWith('제한:')).map((r) => r.replace('제한:', ''))
        setKeywords(kws)
        setExcludeKeywords(excls)
      }

      setIsLoading(false)
    })
  }, [postId])

  // 작성자 본인 확인
  const isAuthor = !isLoading && post && authProfile?.handle === post.authorHandle

  const handleAddKw = useCallback(() => {
    const kw = kwInput.trim()
    if (!kw || keywords.includes(kw)) return
    setKeywords((p) => [...p, kw])
    setKwInput('')
    kwRef.current?.focus()
  }, [kwInput, keywords])

  const handleAddExclude = useCallback(() => {
    const kw = excludeInput.trim()
    if (!kw || excludeKeywords.includes(kw)) return
    setExcludeKeywords((p) => [...p, kw])
    setExcludeInput('')
    excludeRef.current?.focus()
  }, [excludeInput, excludeKeywords])

  const canSubmit = title.trim().length > 0 && content.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || !post) return
    setIsSubmitting(true)
    try {
      let requirements: string[]
      if (post.postType === 'fanmeet') {
        requirements = keywords
      } else {
        requirements = [age, ...keywords, ...excludeKeywords.map((k) => `제한:${k}`)]
      }
      const result = await updatePost(postId, {
        title,
        content,
        region,
        date: post.postType === 'fanmeet' ? date : undefined,
        requirements,
        idolName: post.postType === 'fanmeet' ? selectedArtist : undefined,
      })
      if (result.success) {
        router.replace(`/posts/${postId}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <TopAppBar showBack onBackClick={() => router.back()} />
        <div className="flex flex-col gap-4 px-5 pt-24">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-[20px] bg-zinc-100 animate-pulse" />
          ))}
        </div>
      </>
    )
  }

  if (!isAuthor) {
    return (
      <>
        <TopAppBar showBack onBackClick={() => router.back()} />
        <div className="flex flex-col items-center justify-center pt-40 gap-3 text-center px-5">
          <span className="text-4xl">🔒</span>
          <p className="text-[16px] font-bold text-zinc-900">수정 권한이 없어요</p>
          <p className="text-[13px] text-zinc-500">본인이 작성한 게시글만 수정할 수 있어요.</p>
        </div>
      </>
    )
  }

  const isBuddy = post!.postType === 'buddy'

  return (
    <>
      <TopAppBar showBack onBackClick={() => router.back()} title="게시글 수정" />

      <main className="pb-[128px] pt-6 px-5">

        {/* ── 제목 ── */}
        <section className="mb-8">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">제목</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 40))}
            className="w-full h-[56px] px-5 rounded-[16px] text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
          />
          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-zinc-400">{title.length} / 40</span>
          </div>
        </section>

        {/* ── 아티스트 (덕메만) ── */}
        {!isBuddy && (
          <section className="mb-8">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">아티스트</p>
            <div className="relative">
              <button
                onClick={() => setShowArtistDropdown((v) => !v)}
                className="w-full flex items-center justify-between h-[56px] px-5 rounded-[16px] text-[14px] font-medium"
                style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
              >
                <span style={{ color: selectedArtist ? '#18181b' : '#a1a1aa' }}>
                  {selectedArtist || '아티스트를 선택하세요'}
                </span>
                {selectedArtist && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedArtist('') }}
                    className="p-0.5"
                  >
                    <XIcon size={14} className="text-zinc-400" />
                  </button>
                )}
              </button>
              {showArtistDropdown && (
                <div
                  className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#f4f4f5] rounded-[16px] overflow-hidden z-10"
                  style={{ boxShadow: '0px 8px 30px rgba(0,0,0,0.08)', maxHeight: 240, overflowY: 'auto' }}
                >
                  {idols.map((idol) => (
                    <button
                      key={idol.id}
                      onClick={() => { setSelectedArtist(idol.name); setShowArtistDropdown(false) }}
                      className="w-full flex items-center gap-3 px-5 h-[48px] text-[14px] font-medium hover:bg-zinc-50"
                      style={{ color: selectedArtist === idol.name ? '#18181b' : '#52525b' }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: idol.color }} />
                      {idol.name}
                      {selectedArtist === idol.name && <span className="ml-auto text-[11px] font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 출생연도 (비계친만) ── */}
        {isBuddy && (
          <section className="mb-8">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-1">출생연도</p>
            <p className="text-[11px] text-zinc-400 mb-4">9n = 90년대생 · 8n = 80년대생 · 0n = 00년대생 · 1n = 10년대생</p>
            <div className="flex flex-wrap gap-2">
              {AGE_DECADES.map((a) => (
                <ToggleChip key={a} label={a} isActive={age === a} onClick={() => setAge(a)} />
              ))}
            </div>
          </section>
        )}

        {/* ── 지역 ── */}
        <section className="mb-8">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">지역</p>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <ToggleChip key={r} label={r} isActive={region === r} onClick={() => setRegion(r)} />
            ))}
          </div>
        </section>

        {/* ── 날짜 (덕메만) ── */}
        {!isBuddy && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">오프라인 날짜</p>
              <span className="text-[10px] text-zinc-400">(선택)</span>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-[56px] px-5 rounded-[16px] text-[14px] text-zinc-900 focus:outline-none"
              style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
            />
          </section>
        )}

        {/* ── 본문 ── */}
        <section className="mb-8">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
            {isBuddy ? '자기소개' : '소개글'}
          </p>
          <div
            className="rounded-[20px] p-5"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              rows={5}
              className="w-full bg-transparent text-[14px] text-zinc-900 placeholder:text-zinc-400 resize-none focus:outline-none leading-[24px]"
              placeholder="내용을 입력하세요..."
            />
          </div>
          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-zinc-400">{content.length} / 500</span>
          </div>
        </section>

        {/* ── 참여 조건/키워드 ── */}
        <section className="mb-8">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
            {isBuddy ? '같이 하고 싶은 것' : '참여 조건'}
          </p>
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-[16px] mb-3"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
          >
            <input
              ref={kwRef}
              type="text"
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKw() } }}
              placeholder="키워드 입력 후 Enter"
              className="flex-1 bg-transparent text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              maxLength={20}
            />
            <button
              onClick={handleAddKw}
              disabled={!kwInput.trim()}
              className="flex items-center justify-center w-7 h-7 rounded-full disabled:opacity-30 shrink-0"
              style={{ backgroundColor: '#18181b' }}
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

        {/* ── 이런 분은 사절 (비계친만) ── */}
        {isBuddy && (
          <section className="mb-8">
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
                  placeholder="제한 키워드 입력 후 Enter"
                  className="flex-1 bg-transparent text-[13px] placeholder:text-zinc-400 focus:outline-none"
                  style={{ color: '#be123c' }}
                  maxLength={20}
                />
                <button
                  onClick={handleAddExclude}
                  disabled={!excludeInput.trim()}
                  className="flex items-center justify-center w-7 h-7 rounded-full disabled:opacity-30 shrink-0"
                  style={{ backgroundColor: '#be123c' }}
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
        )}

        {/* ── 저장 ── */}
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
            '수정 완료'
          )}
        </button>
      </main>
    </>
  )
}
