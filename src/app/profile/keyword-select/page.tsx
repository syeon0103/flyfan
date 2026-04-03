'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Info, X as XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import { getKeywords, saveKeywords, type Keyword } from '@/lib/api'

// ─── 키워드 칩 ───────────────────────────────────────────────────────────────

interface KeywordChipProps {
  keyword: Keyword
  onToggle: (id: string) => void
}

function KeywordChip({ keyword, onToggle }: KeywordChipProps) {
  const isSelected = keyword.isSelected

  return (
    <button
      onClick={() => onToggle(keyword.id)}
      aria-pressed={isSelected}
      aria-label={`${keyword.label} 키워드 ${isSelected ? '선택됨' : '선택 안됨'}`}
      className="flex items-center gap-2 h-9 px-5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all"
      style={
        isSelected
          ? {
              backgroundColor: keyword.bg,
              color: keyword.color,
              boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
            }
          : {
              backgroundColor: '#fafafa',
              color: '#3f3f46',
              border: '1px solid #f4f4f5',
            }
      }
    >
      {keyword.label}
      {isSelected && (
        <span aria-hidden="true">
          <XIcon size={13} strokeWidth={2.5} />
        </span>
      )}
    </button>
  )
}

// ─── 배경 (프로필 설정 화면 흐림) ─────────────────────────────────────────────

function BackgroundDimmed() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none" aria-hidden="true">
      {/* 프로필 헤더 */}
      <div className="flex flex-col items-center gap-4 pt-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(45deg, #e4e4e7 0%, #a1a1aa 100%)' }}
        >
          <div className="w-[84px] h-[84px] rounded-full bg-zinc-200 flex items-center justify-center">
            <span className="text-3xl">💎</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[20px] font-bold text-zinc-900">Moonlight_Stay</span>
          <span className="text-[14px] text-zinc-500">Stay | Stray Kids 팬</span>
        </div>
      </div>
      {/* 설정 항목들 */}
      <div className="flex flex-col gap-4 mt-8 px-6">
        {['계정 보안', '세이프 존 가이드라인', '알림 설정'].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between bg-zinc-50 rounded-[20px] p-5"
          >
            <span className="text-[16px] font-medium text-zinc-900">{item}</span>
            <span className="text-zinc-400">›</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function KeywordSelectPage() {
  const router = useRouter()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const data = await getKeywords()
        setKeywords(data)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleToggle = useCallback((id: string) => {
    setKeywords((prev) =>
      prev.map((kw) =>
        kw.id === id ? { ...kw, isSelected: !kw.isSelected } : kw
      )
    )
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const selected = keywords.filter((kw) => kw.isSelected).map((kw) => kw.label)
      await saveKeywords(selected)
      router.back()
    } finally {
      setIsSaving(false)
    }
  }

  const filteredKeywords = keywords.filter((kw) =>
    kw.label.toLowerCase().includes(searchText.toLowerCase())
  )

  const recommendedKeywords = filteredKeywords.filter((kw) => kw.isRecommended)

  const selectedCount = keywords.filter((kw) => kw.isSelected).length

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <TopAppBar showBack onBackClick={() => router.back()} showAvatar />

      {/* 배경 (프로필 화면 흐림 처리) */}
      <div className="absolute inset-0 top-16" aria-hidden="true">
        <BackgroundDimmed />
      </div>

      {/* 모달 오버레이 */}
      <div
        className="absolute inset-0 top-16"
        style={{ backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.4)' }}
        aria-hidden="true"
      />

      {/* 바텀 시트 모달 */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white overflow-hidden z-10"
        style={{
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
          maxHeight: '80vh',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="세이프 존 키워드 선택"
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-8 pb-1">
          <div className="w-12 h-1.5 bg-zinc-200 rounded-full" aria-hidden="true" />
        </div>

        {/* 제목 영역 */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-[24px] font-bold text-zinc-900 tracking-[-0.6px] leading-[32px]">
            세이프 존 키워드
          </h2>
          <p className="text-[14px] text-zinc-500 leading-[20px] mt-0.5">
            자신만의 경계와 선호하는 만남 분위기를 설정하세요.
          </p>
        </div>

        {/* 검색 바 */}
        <div className="px-6 pb-6">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="키워드 검색..."
              aria-label="키워드 검색"
              className="w-full h-[56px] pl-[48px] pr-4 rounded-[16px] bg-zinc-50 text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </div>
        </div>

        {/* 키워드 영역 (스크롤) */}
        <div
          className="overflow-y-auto px-6 pb-4"
          style={{ maxHeight: 'calc(80vh - 340px)' }}
        >
          {/* 관리자 추천 키워드 레이블 */}
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase leading-[16.5px] mb-4">
            관리자 추천 키워드
          </p>

          {/* 키워드 칩 (래핑 레이아웃) */}
          {isLoading ? (
            <div className="flex flex-wrap gap-2 mb-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-9 w-20 rounded-full bg-zinc-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="키워드 선택">
              {recommendedKeywords.map((kw) => (
                <KeywordChip key={kw.id} keyword={kw} onToggle={handleToggle} />
              ))}
            </div>
          )}

          {/* 안내 카드 */}
          <div
            className="flex gap-3 p-[21px] bg-zinc-50 border border-zinc-100 rounded-[24px]"
          >
            <Info size={17} className="text-zinc-500 shrink-0 mt-0.5" />
            <p className="text-[13px] font-medium text-zinc-600 leading-[21px]">
              키워드를 설정하면 매칭 확률이 높아집니다.{' '}
              <strong className="font-bold text-zinc-900">관리자 추천</strong> 태그는 안전하고
              쾌적한 MZ 덕질 트렌드를 반영합니다.
            </p>
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div
          className="flex flex-col px-6 pt-6 pb-6"
          style={{ borderTop: '1px solid #fafafa' }}
        >
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center w-full py-4 rounded-[20px] text-[16px] font-bold text-white transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: '#18181b',
              boxShadow: '0px 10px 15px -3px rgba(24,24,27,0.1), 0px 4px 6px -4px rgba(24,24,27,0.1)',
            }}
            aria-label={`${selectedCount}개 키워드 선택 완료`}
          >
            {isSaving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `선택 완료${selectedCount > 0 ? ` (${selectedCount})` : ''}`
            )}
          </button>
        </div>
      </div>

      <BottomNavBar />
    </div>
  )
}
