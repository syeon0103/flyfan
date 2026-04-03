'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, X as XIcon, ChevronRight, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import {
  getProfileSettings,
  saveProfileSettings,
  type ProfileSettings,
  type PersonaSlot,
  type TimelineItem,
} from '@/lib/api'

// ─── 페르소나 슬롯 ────────────────────────────────────────────────────────────

interface PersonaSlotCardProps {
  slot: PersonaSlot
  isActive: boolean
  onSelect: (id: string) => void
}

function PersonaSlotCard({ slot, isActive, onSelect }: PersonaSlotCardProps) {
  const router = useRouter()
  if (slot.isEmpty) {
    return (
      <button
        onClick={() => router.push('/profile/persona/new')}
        className="flex flex-col items-center justify-center gap-1.5 shrink-0"
        style={{ width: 64, opacity: 0.4 }}
        aria-label="새 페르소나 추가"
      >
        <div
          className="flex items-center justify-center w-16 h-16 rounded-[20px] border-2 border-dashed border-zinc-300"
          style={{ backgroundColor: '#fafafa' }}
        >
          <Plus size={20} className="text-zinc-400" />
        </div>
        <span className="text-[10px] font-medium text-zinc-400 text-center leading-[14px]">추가</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => onSelect(slot.id)}
      className="flex flex-col items-center gap-1.5 shrink-0 transition-opacity"
      style={{ width: 64, opacity: isActive ? 1 : 0.4 }}
      aria-pressed={isActive}
      aria-label={`${slot.name} 페르소나 ${isActive ? '선택됨' : ''}`}
    >
      <div
        className="flex items-center justify-center w-16 h-16 rounded-[20px]"
        style={{
          backgroundColor: '#f4f4f5',
          border: isActive ? '2px solid #18181b' : '2px solid transparent',
          boxShadow: isActive ? '0px 4px 12px 0px rgba(24,24,27,0.12)' : 'none',
        }}
      >
        <span className="text-2xl">{slot.emoji}</span>
      </div>
      <span
        className="text-[10px] font-bold text-center leading-[14px] truncate w-full"
        style={{ color: isActive ? '#18181b' : '#a1a1aa' }}
      >
        {slot.name.length > 7 ? slot.name.slice(0, 7) + '…' : slot.name}
      </span>
    </button>
  )
}

// ─── 타임라인 아이템 ──────────────────────────────────────────────────────────

interface TimelineCardProps {
  item: TimelineItem
}

function TimelineCard({ item }: TimelineCardProps) {
  return (
    <article
      className="flex gap-4 p-5 rounded-[20px]"
      style={{
        backgroundColor: item.isFeatured ? '#ffffff' : '#fafafa',
        boxShadow: item.isFeatured ? '0px 8px 30px 0px rgba(0,0,0,0.04)' : 'none',
        border: item.isFeatured ? '1px solid #f4f4f5' : 'none',
      }}
      aria-label={`타임라인: ${item.title}`}
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-[14px] shrink-0"
        style={{ backgroundColor: '#f4f4f5' }}
        aria-hidden="true"
      >
        <span className="text-lg">{item.emoji}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-zinc-900">{item.title}</span>
        </div>
        <span className="text-[11px] text-zinc-400">{item.date}</span>
        <p className="text-[12px] text-zinc-600 leading-[18px] mt-0.5">{item.description}</p>
      </div>
    </article>
  )
}

// ─── 세이프존 태그 ────────────────────────────────────────────────────────────

interface SafeZoneTagProps {
  label: string
  onRemove: (label: string) => void
}

function SafeZoneTag({ label, onRemove }: SafeZoneTagProps) {
  return (
    <div
      className="flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px] font-bold"
      style={{ backgroundColor: '#fff1f2', color: '#be123c' }}
    >
      {label}
      <button
        onClick={() => onRemove(label)}
        aria-label={`${label} 태그 제거`}
        className="flex items-center"
      >
        <XIcon size={12} strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const data = await getProfileSettings()
        setProfile(data)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handlePersonaSelect = useCallback((id: string) => {
    setProfile((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        personaSlots: prev.personaSlots.map((s) => ({ ...s, isActive: s.id === id })),
      }
    })
  }, [])

  const handleRemoveSafeZoneTag = useCallback((label: string) => {
    setProfile((prev) => {
      if (!prev) return prev
      return { ...prev, safeZoneTags: prev.safeZoneTags.filter((t) => t !== label) }
    })
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setIsSaving(true)
    try {
      await saveProfileSettings(profile)
      router.back()
    } finally {
      setIsSaving(false)
    }
  }

  const activeSlot = profile?.personaSlots.find((s) => s.isActive)

  return (
    <>
      <TopAppBar showBack onBackClick={() => router.back()} showAvatar />

      <main className="pb-[128px] pt-6 px-5">
        {isLoading || !profile ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-[20px] bg-zinc-100 animate-pulse" aria-hidden="true" />
            ))}
          </div>
        ) : (
          <>
            {/* ── 에디토리얼 헤더 ── */}
            <header className="flex flex-col gap-1 mb-8">
              <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">
                덕질 프로필
              </h1>
              <p className="text-[14px] font-medium text-zinc-500 leading-[20px]">
                나만의 덕질 정체성을 설정하세요.
              </p>
            </header>

            {/* ── 페르소나 슬롯 ── */}
            <section className="mb-8" aria-label="페르소나 슬롯">
              <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
                나의 페르소나
              </p>
              <div
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5"
                role="radiogroup"
                aria-label="페르소나 선택"
              >
                {profile.personaSlots.map((slot) => (
                  <PersonaSlotCard
                    key={slot.id}
                    slot={slot}
                    isActive={slot.isActive}
                    onSelect={handlePersonaSelect}
                  />
                ))}
              </div>
            </section>

            {/* ── 기본 정보 카드 ── */}
            <section className="mb-6" aria-label="기본 정보">
              <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
                기본 정보
              </p>
              <div
                className="flex flex-col bg-white border border-[#f4f4f5] rounded-[20px] divide-y divide-[#fafafa]"
                style={{ boxShadow: '0px 8px 30px 0px rgba(0,0,0,0.04)' }}
              >
                {/* 현재 활성 페르소나 */}
                <div className="flex items-center justify-between p-5">
                  <span className="text-[14px] font-medium text-zinc-500">활성 페르소나</span>
                  <span className="text-[14px] font-bold text-zinc-900">
                    {activeSlot?.name ?? '-'}
                  </span>
                </div>

                {/* 최애멤버 */}
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-[14px] font-medium text-zinc-500 shrink-0">최애멤버</span>
                  <input
                    type="text"
                    value={profile.favoriteIdol}
                    onChange={(e) => setProfile((prev) => prev ? { ...prev, favoriteIdol: e.target.value } : prev)}
                    placeholder="최애멤버 이름"
                    className="text-right text-[14px] font-bold text-zinc-900 bg-transparent outline-none w-full ml-4 placeholder-zinc-300"
                  />
                </div>

                {/* MBTI */}
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-[14px] font-medium text-zinc-500 shrink-0">MBTI</span>
                  <input
                    type="text"
                    value={profile.mbti}
                    onChange={(e) => setProfile((prev) => prev ? { ...prev, mbti: e.target.value.toUpperCase().slice(0, 4) } : prev)}
                    placeholder="MBTI"
                    maxLength={4}
                    className="text-right text-[14px] font-bold text-zinc-900 bg-transparent outline-none w-full ml-4 placeholder-zinc-300"
                  />
                </div>

                {/* 키워드 */}
                <div className="flex items-center justify-between p-5">
                  <span className="text-[14px] font-medium text-zinc-500">키워드</span>
                  <Link href="/profile/keyword-select" aria-label="키워드 설정">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {profile.keywords.slice(0, 2).map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center h-[22px] px-2 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: '#f4f4f5', color: '#52525b' }}
                          >
                            {kw}
                          </span>
                        ))}
                        {profile.keywords.length > 2 && (
                          <span className="text-[12px] text-zinc-400">+{profile.keywords.length - 2}</span>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-zinc-300" />
                    </div>
                  </Link>
                </div>
              </div>
            </section>

            {/* ── 타임라인 ── */}
            <section className="mb-6" aria-label="덕질 타임라인">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">
                  덕질 타임라인
                </p>
                <Link href="/profile/timeline/add">
                  <button
                    className="flex items-center gap-1 text-[12px] font-bold text-zinc-500"
                    aria-label="타임라인 추가"
                  >
                    <Plus size={14} />
                    추가
                  </button>
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {profile.timeline.map((item) => (
                  <TimelineCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* ── 세이프 존 ── */}
            <section className="mb-8" aria-label="세이프 존">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-zinc-500" aria-hidden="true" />
                  <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">
                    세이프 존
                  </p>
                </div>
                <Link href="/profile/keyword-select">
                  <button
                    className="flex items-center gap-1 text-[12px] font-bold text-zinc-500"
                    aria-label="세이프 존 키워드 편집"
                  >
                    <Plus size={14} />
                    편집
                  </button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.safeZoneTags.map((tag) => (
                  <SafeZoneTag key={tag} label={tag} onRemove={handleRemoveSafeZoneTag} />
                ))}
              </div>
            </section>

            {/* ── 저장 버튼 ── */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center py-4 rounded-[20px] text-[16px] font-bold text-white disabled:opacity-50 transition-opacity"
              style={{
                backgroundColor: '#18181b',
                boxShadow: '0px 10px 15px -3px rgba(24,24,27,0.1), 0px 4px 6px -4px rgba(24,24,27,0.1)',
              }}
              aria-label="프로필 저장"
            >
              {isSaving ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                '저장하기'
              )}
            </button>
          </>
        )}
      </main>

      <BottomNavBar />
    </>
  )
}
