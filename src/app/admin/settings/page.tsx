'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, Star, StarOff, X as XIcon, AlertCircle } from 'lucide-react'
import FandomIcon from '@/components/ui/FandomIcon'
import {
  getKeywords,
  createKeyword,
  deleteKeyword,
  toggleKeywordRecommended,
  type Keyword,
} from '@/lib/api'

// ─── 프리셋 색상 ─────────────────────────────────────────────────────────────

const PRESET_PAIRS = [
  { bg: '#fff7ed', color: '#c2410c', label: '오렌지' },
  { bg: '#fff1f2', color: '#be123c', label: '로즈' },
  { bg: '#faf5ff', color: '#7e22ce', label: '퍼플' },
  { bg: '#eff6ff', color: '#1d4ed8', label: '블루' },
  { bg: '#ecfdf5', color: '#047857', label: '그린' },
  { bg: '#fffbeb', color: '#b45309', label: '앰버' },
  { bg: '#f0fdf4', color: '#15803d', label: '에메랄드' },
  { bg: '#f4f4f5', color: '#3f3f46', label: '그레이' },
]

// ─── 키워드 뱃지 ─────────────────────────────────────────────────────────────

function KeywordChip({ kw }: { kw: Keyword }) {
  return (
    <span
      className="inline-flex items-center h-[28px] px-3 rounded-full text-[12px] font-bold"
      style={{ backgroundColor: kw.bg, color: kw.color }}
    >
      {kw.label}
    </span>
  )
}

// ─── 키워드 행 ────────────────────────────────────────────────────────────────

interface KeywordRowProps {
  kw: Keyword
  onDelete: (id: string) => void
  onToggleRecommended: (id: string, isRecommended: boolean) => void
}

function KeywordRow({ kw, onDelete, onToggleRecommended }: KeywordRowProps) {
  return (
    <div
      className="flex items-center gap-3 p-4 bg-white border border-[#f4f4f5] rounded-[18px]"
      style={{ boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.03)' }}
    >
      <KeywordChip kw={kw} />

      <div className="flex-1 min-w-0">
        {kw.isRecommended && (
          <span className="text-[10px] font-bold text-amber-500">추천 키워드</span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggleRecommended(kw.id, !kw.isRecommended)}
          className="flex items-center justify-center w-8 h-8 rounded-[10px] transition-colors hover:bg-zinc-100"
          aria-label={kw.isRecommended ? '추천 해제' : '추천 설정'}
          title={kw.isRecommended ? '추천 해제' : '추천으로 설정'}
        >
          {kw.isRecommended
            ? <Star size={15} className="text-amber-400 fill-amber-400" />
            : <StarOff size={15} className="text-zinc-300" />
          }
        </button>
        <button
          onClick={() => onDelete(kw.id)}
          className="flex items-center justify-center w-8 h-8 rounded-[10px] transition-colors hover:bg-red-50"
          aria-label={`${kw.label} 삭제`}
        >
          <Trash2 size={15} className="text-rose-400" />
        </button>
      </div>
    </div>
  )
}

// ─── 키워드 추가 폼 ───────────────────────────────────────────────────────────

interface AddKeywordFormProps {
  onAdd: (label: string, bg: string, color: string, isRecommended: boolean) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

function AddKeywordForm({ onAdd, onCancel, isLoading }: AddKeywordFormProps) {
  const [label, setLabel] = useState('')
  const [selectedPair, setSelectedPair] = useState(PRESET_PAIRS[0])
  const [isRecommended, setIsRecommended] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    await onAdd(label.trim(), selectedPair.bg, selectedPair.color, isRecommended)
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
    >
      <div
        className="w-full bg-white overflow-y-auto"
        style={{
          maxWidth: '680px',
          maxHeight: '80vh',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        <div className="flex justify-center pt-6 pb-1">
          <div className="w-12 h-1.5 bg-zinc-200 rounded-full" />
        </div>

        <div className="px-6 pt-4 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-bold text-zinc-900">키워드 추가</h2>
            <button onClick={onCancel} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-zinc-100">
              <XIcon size={18} className="text-zinc-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* 라벨 */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">키워드</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="예: 남성 사절, 사진 금지..."
                required
                className="w-full h-[52px] px-5 rounded-[16px] text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
              />
            </div>

            {/* 미리보기 */}
            {label && (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">미리보기</span>
                <span
                  className="inline-flex items-center h-[28px] px-3 rounded-full text-[12px] font-bold"
                  style={{ backgroundColor: selectedPair.bg, color: selectedPair.color }}
                >
                  {label}
                </span>
              </div>
            )}

            {/* 색상 선택 */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">색상</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_PAIRS.map((pair) => (
                  <button
                    key={pair.label}
                    type="button"
                    onClick={() => setSelectedPair(pair)}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px] font-bold border-2 transition-all"
                    style={{
                      backgroundColor: pair.bg,
                      color: pair.color,
                      borderColor: selectedPair.label === pair.label ? pair.color : 'transparent',
                    }}
                  >
                    {pair.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 추천 여부 */}
            <div className="flex items-center justify-between p-4 rounded-[16px]" style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-bold text-zinc-900">추천 키워드로 표시</span>
                <span className="text-[12px] text-zinc-400">유저 프로필 설정에서 상단에 노출됩니다</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRecommended((v) => !v)}
                className="relative w-12 h-6 rounded-full transition-colors shrink-0"
                style={{ backgroundColor: isRecommended ? '#18181b' : '#e4e4e7' }}
                aria-checked={isRecommended}
                role="switch"
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{ transform: isRecommended ? 'translateX(24px)' : 'translateX(2px)' }}
                />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 h-12 rounded-[16px] text-[14px] font-bold text-zinc-600 border border-[#f4f4f5]"
                style={{ backgroundColor: '#fafafa' }}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!label.trim() || isLoading}
                className="flex-1 flex items-center justify-center h-12 rounded-[16px] text-[14px] font-bold text-white disabled:opacity-40"
                style={{ backgroundColor: '#18181b' }}
              >
                {isLoading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : '추가하기'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    const data = await getKeywords()
    setKeywords(data)
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async (label: string, bg: string, color: string, isRecommended: boolean) => {
    setIsMutating(true)
    setError(null)
    try {
      const kw = await createKeyword(label, bg, color, isRecommended)
      setKeywords((prev) => [...prev, kw])
      setShowForm(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteKeyword(id)
      setKeywords((prev) => prev.filter((k) => k.id !== id))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const handleToggleRecommended = async (id: string, isRecommended: boolean) => {
    await toggleKeywordRecommended(id, isRecommended)
    setKeywords((prev) => prev.map((k) => k.id === id ? { ...k, isRecommended } : k))
  }

  const recommended = keywords.filter((k) => k.isRecommended)
  const others = keywords.filter((k) => !k.isRecommended)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header
        className="sticky top-0 z-30 bg-white border-b border-[#f4f4f5]"
        style={{ boxShadow: '0px 1px 0px 0px #f4f4f5' }}
      >
        <div className="flex items-center justify-between px-5 h-16 mx-auto" style={{ maxWidth: '680px' }}>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100">
              <ChevronLeft size={18} className="text-zinc-600" />
            </Link>
            <div className="flex items-center gap-2">
              <FandomIcon color="#FFA33B" size={16} />
              <span className="text-[15px] font-bold text-zinc-900">서비스 설정</span>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setError(null) }}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[12px] text-[12px] font-bold text-white"
            style={{ backgroundColor: '#18181b' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            키워드 추가
          </button>
        </div>
      </header>

      <main className="px-5 py-8 mx-auto" style={{ maxWidth: '680px' }}>
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">서비스 설정</h1>
          <p className="text-[14px] font-medium text-zinc-500">세이프 키워드 프리셋을 관리하세요.</p>
        </div>

        {/* 에러 */}
        {error && (
          <div
            className="flex items-center gap-3 p-4 mb-6 rounded-[16px]"
            style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}
            role="alert"
          >
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span className="text-[13px] font-medium text-rose-700">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <XIcon size={14} className="text-rose-400" />
            </button>
          </div>
        )}

        {/* 추천 키워드 섹션 */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <h2 className="text-[13px] font-bold text-zinc-900 tracking-[0.5px]">
              추천 키워드 <span className="text-zinc-400 font-medium">({recommended.length})</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[64px] rounded-[18px] bg-zinc-100 animate-pulse" />
              ))}
            </div>
          ) : recommended.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-zinc-400 text-[13px]">
              추천 키워드가 없습니다
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recommended.map((kw) => (
                <KeywordRow
                  key={kw.id}
                  kw={kw}
                  onDelete={handleDelete}
                  onToggleRecommended={handleToggleRecommended}
                />
              ))}
            </div>
          )}
        </section>

        {/* 일반 키워드 섹션 */}
        {!isLoading && others.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-[13px] font-bold text-zinc-900 tracking-[0.5px]">
                일반 키워드 <span className="text-zinc-400 font-medium">({others.length})</span>
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {others.map((kw) => (
                <KeywordRow
                  key={kw.id}
                  kw={kw}
                  onDelete={handleDelete}
                  onToggleRecommended={handleToggleRecommended}
                />
              ))}
            </div>
          </section>
        )}

        {!isLoading && keywords.length > 0 && (
          <p className="text-[11px] text-zinc-400 text-center mt-6">
            총 {keywords.length}개 키워드 등록됨
          </p>
        )}
      </main>

      {showForm && (
        <AddKeywordForm
          onAdd={handleAdd}
          onCancel={() => { setShowForm(false); setError(null) }}
          isLoading={isMutating}
        />
      )}
    </div>
  )
}
