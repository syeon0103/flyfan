'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import { addPersonaSlot } from '@/lib/api'

const EMOJI_OPTIONS = ['🐰', '🐱', '🦊', '🐻', '🐼', '🐨', '🐸', '🦋', '🌸', '⭐', '💎', '🎵', '🎀', '🌙', '☁️', '🍀']

export default function PersonaNewPage() {
  const router = useRouter()
  const [emoji, setEmoji] = useState('🐰')
  const [name, setName] = useState('')
  const [fandom, setFandom] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) {
      setError('페르소나 이름을 입력해주세요.')
      return
    }
    setError(null)
    setIsSaving(true)
    try {
      await addPersonaSlot({ emoji, name: name.trim(), fandom: fandom.trim(), isActive: false })
      router.back()
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <TopAppBar showBack onBackClick={() => router.back()} />

      <main className="pt-6 px-5 pb-10">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">
            새 페르소나
          </h1>
          <p className="text-[14px] font-medium text-zinc-500 mt-1">
            나만의 덕질 캐릭터를 만들어보세요.
          </p>
        </header>

        {/* 이모지 미리보기 */}
        <div className="flex justify-center mb-8">
          <div
            className="flex items-center justify-center w-24 h-24 rounded-[28px]"
            style={{ backgroundColor: '#f4f4f5', border: '2px solid #18181b', boxShadow: '0px 4px 12px 0px rgba(24,24,27,0.12)' }}
          >
            <span className="text-4xl">{emoji}</span>
          </div>
        </div>

        {/* 이모지 선택 */}
        <section className="mb-6">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-3">이모지</p>
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className="flex items-center justify-center w-full aspect-square rounded-[14px] text-xl transition-all"
                style={{
                  backgroundColor: emoji === e ? '#18181b' : '#f4f4f5',
                  border: emoji === e ? '2px solid #18181b' : '2px solid transparent',
                }}
                aria-pressed={emoji === e}
              >
                {e}
              </button>
            ))}
          </div>
        </section>

        {/* 페르소나 이름 */}
        <section className="mb-4">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-3">페르소나 이름</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 뉴진스 덕후, 민지 최애"
            maxLength={20}
            className="w-full h-12 px-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
          />
        </section>

        {/* 팬덤 */}
        <section className="mb-8">
          <p className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase mb-3">팬덤 (선택)</p>
          <input
            type="text"
            value={fandom}
            onChange={(e) => setFandom(e.target.value)}
            placeholder="예: 버니즈, 리즈덤"
            maxLength={20}
            className="w-full h-12 px-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
          />
        </section>

        {error && (
          <p className="text-xs text-red-500 mb-4 px-1">{error}</p>
        )}

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          className="w-full flex items-center justify-center py-4 rounded-[20px] text-[16px] font-bold text-white disabled:opacity-40 transition-opacity"
          style={{
            backgroundColor: '#18181b',
            boxShadow: '0px 10px 15px -3px rgba(24,24,27,0.1), 0px 4px 6px -4px rgba(24,24,27,0.1)',
          }}
        >
          {isSaving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            '저장하기'
          )}
        </button>
      </main>
    </>
  )
}
