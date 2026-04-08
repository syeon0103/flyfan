'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import { getIdols, requestArtist, type Idol } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function RequestArtistPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [idols, setIdols] = useState<Idol[]>([])
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle')

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [authLoading, user, router])

  useEffect(() => {
    getIdols().then(setIdols)
  }, [])

  // 입력한 이름이 기존 아이돌과 겹치는지 실시간 확인
  const isDuplicate = name.trim().length > 0 &&
    idols.some((i) => i.name.toLowerCase() === name.trim().toLowerCase())

  const canSubmit = name.trim().length > 1 && !isDuplicate && !isSubmitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      const res = await requestArtist(name.trim(), reason.trim())
      if (res.isDuplicate) {
        setResult('duplicate')
      } else if (res.success) {
        setResult('success')
      } else {
        setResult('error')
      }
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
            아티스트 추가 요청
          </h1>
          <p className="text-[14px] font-medium text-zinc-500 leading-[20px]">
            등록되지 않은 아티스트를 요청하면 관리자가 검토 후 추가해요.
          </p>
        </header>

        {result === 'success' ? (
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <span className="text-5xl">🎉</span>
            <h2 className="text-[20px] font-bold text-zinc-900">요청이 접수됐어요!</h2>
            <p className="text-[14px] font-medium text-zinc-500 max-w-[280px] leading-[22px]">
              관리자가 검토 후 아티스트를 등록해드릴게요.
              보통 1~3일 내로 처리돼요.
            </p>
            <button
              onClick={() => router.replace('/')}
              className="mt-4 h-12 px-8 rounded-full text-[14px] font-bold text-white"
              style={{ backgroundColor: '#18181b' }}
            >
              홈으로 돌아가기
            </button>
          </div>
        ) : (
          <>
            {/* ── 기존 아티스트 목록 ── */}
            <section className="mb-8" aria-label="등록된 아티스트">
              <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
                현재 등록된 아티스트
              </p>
              <div className="flex flex-wrap gap-2">
                {idols.map((idol) => (
                  <span
                    key={idol.id}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-bold"
                    style={{ backgroundColor: `${idol.color}18`, color: idol.color }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: idol.color }}
                    />
                    {idol.name}
                  </span>
                ))}
              </div>
            </section>

            {/* ── 아티스트 이름 입력 ── */}
            <section className="mb-8" aria-label="아티스트 이름">
              <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-4">
                아티스트 이름
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setResult('idle') }}
                placeholder="아티스트 이름을 정확하게 입력하세요"
                className="w-full h-[56px] px-5 rounded-[16px] text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                style={{
                  backgroundColor: '#fafafa',
                  border: isDuplicate ? '1.5px solid #f43f5e' : '1px solid #f4f4f5',
                }}
                maxLength={30}
              />
              {isDuplicate && (
                <p className="text-[12px] font-medium mt-1.5 px-1" style={{ color: '#f43f5e' }}>
                  이미 등록된 아티스트예요. 위 목록에서 확인해주세요.
                </p>
              )}
              {result === 'duplicate' && !isDuplicate && (
                <p className="text-[12px] font-medium mt-1.5 px-1" style={{ color: '#f43f5e' }}>
                  이미 등록된 아티스트예요.
                </p>
              )}
            </section>

            {/* ── 추가 이유 ── */}
            <section className="mb-8" aria-label="추가 이유">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">추가 이유</p>
                <span className="text-[10px] text-zinc-400">(선택)</span>
              </div>
              <div
                className="rounded-[20px] p-5"
                style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
              >
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value.slice(0, 200))}
                  placeholder="팬덤명, 활동 중인 그룹명 등 추가 정보를 적어주세요..."
                  rows={4}
                  className="w-full bg-transparent text-[14px] text-zinc-900 placeholder:text-zinc-400 resize-none focus:outline-none leading-[24px]"
                />
              </div>
              <div className="flex justify-end mt-1.5">
                <span className="text-[11px] text-zinc-400">{reason.length} / 200</span>
              </div>
            </section>

            {result === 'error' && (
              <div
                className="flex items-center gap-2 mb-6 p-4 rounded-[16px] text-[13px] font-medium"
                style={{ backgroundColor: '#fff1f2', color: '#be123c' }}
              >
                요청 중 오류가 발생했어요. 다시 시도해주세요.
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full flex items-center justify-center py-4 rounded-[20px] text-[16px] font-bold text-white disabled:opacity-40 transition-opacity"
              style={{
                backgroundColor: '#18181b',
                boxShadow: '0px 10px 15px -3px rgba(24,24,27,0.1), 0px 4px 6px -4px rgba(24,24,27,0.1)',
              }}
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                '요청하기'
              )}
            </button>
          </>
        )}
      </main>

      <BottomNavBar />
    </>
  )
}
