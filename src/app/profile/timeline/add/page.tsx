'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import { addTimelineItem } from '@/lib/api'

const EMOJI_OPTIONS = ['🎫', '💿', '📸', '🎤', '💎', '🌟', '🎉', '🏆', '🎶', '💌']

export default function AddMilestonePage() {
  const router = useRouter()
  const [emoji, setEmoji] = useState('🎫')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const canSave = title.trim().length > 0 && date.length > 0

  const handleSave = async () => {
    if (!canSave) return
    setIsSaving(true)
    try {
      await addTimelineItem({ emoji, title: title.trim(), date, description: description.trim(), isFeatured: false })
      router.back()
    } catch {
      // 저장 실패 시 그냥 남아있음
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <TopAppBar showBack onBackClick={() => router.back()} />

      <main className="pb-[128px] pt-6 px-5">
        {/* ── 헤더 ── */}
        <header className="flex flex-col gap-1 mb-8">
          <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">
            새 마일스톤
          </h1>
          <p className="text-[14px] font-medium text-zinc-500 leading-[20px]">
            소중한 덕질 순간을 기록하세요.
          </p>
        </header>

        {/* ── 이모지 선택 ── */}
        <section className="mb-8" aria-label="이모지 선택">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
            이모지
          </p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="이모지 선택">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                role="radio"
                aria-checked={emoji === e}
                className="flex items-center justify-center w-12 h-12 rounded-[14px] text-xl transition-all"
                style={{
                  backgroundColor: emoji === e ? '#18181b' : '#fafafa',
                  border: emoji === e ? 'none' : '1px solid #f4f4f5',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </section>

        {/* ── 제목 ── */}
        <section className="mb-6" aria-label="마일스톤 제목">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
            제목
          </p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="어떤 순간인가요?"
            aria-label="마일스톤 제목"
            className="w-full h-[56px] px-5 rounded-[16px] text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
          />
        </section>

        {/* ── 날짜 ── */}
        <section className="mb-6" aria-label="날짜 선택">
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

        {/* ── 메모 ── */}
        <section className="mb-8" aria-label="메모">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
            메모 (선택)
          </p>
          <div
            className="rounded-[20px] p-5"
            style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 순간에 대한 기억, 느낌을 자유롭게 적어주세요..."
              aria-label="메모 입력"
              rows={4}
              className="w-full bg-transparent text-[14px] text-zinc-900 placeholder:text-zinc-400 resize-none focus:outline-none leading-[24px]"
            />
          </div>
        </section>

        {/* ── 미리보기 ── */}
        {title && date && (
          <section className="mb-8" aria-label="미리보기">
            <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
              미리보기
            </p>
            <div
              className="flex gap-4 p-5 bg-white border border-[#f4f4f5] rounded-[20px]"
              style={{ boxShadow: '0px 8px 30px 0px rgba(0,0,0,0.04)' }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-[14px] shrink-0"
                style={{ backgroundColor: '#f4f4f5' }}
                aria-hidden="true"
              >
                <span className="text-lg">{emoji}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-bold text-zinc-900">{title}</span>
                <span className="text-[11px] text-zinc-400">{date}</span>
                {description && (
                  <p className="text-[12px] text-zinc-600 leading-[18px] mt-0.5">{description}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 저장 버튼 ── */}
        <button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="w-full flex items-center justify-center py-4 rounded-[20px] text-[16px] font-bold text-white disabled:opacity-40 transition-opacity"
          style={{
            backgroundColor: '#18181b',
            boxShadow: '0px 10px 15px -3px rgba(24,24,27,0.1), 0px 4px 6px -4px rgba(24,24,27,0.1)',
          }}
          aria-label="마일스톤 저장"
        >
          {isSaving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            '마일스톤 저장'
          )}
        </button>
      </main>

      <BottomNavBar />
    </>
  )
}
