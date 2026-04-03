'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FandomIcon from '@/components/ui/FandomIcon'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }
    setError(null)
    setIsLoading(true)
    const result = await signIn(username.trim(), password)
    setIsLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      router.replace('/')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center px-5 pt-8 pb-10">
        <div
          className="flex items-center justify-center w-16 h-16 rounded-[20px] mb-5"
          style={{ background: 'linear-gradient(135deg, #FFA33B 0%, #c17a3a 100%)' }}
        >
          <FandomIcon color="#ffffff" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">flyfan</h1>
        <p className="text-sm text-zinc-500 mt-1">K-pop 덕질 커뮤니티</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 px-1">아이디</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="아이디를 입력하세요"
            autoComplete="username"
            className="w-full h-12 px-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 px-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
            className="w-full h-12 px-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 px-1 mt-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-2 rounded-2xl bg-zinc-900 text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {/* Test accounts hint */}
      <div className="mx-5 mt-5 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
        <p className="text-xs font-medium text-zinc-500 mb-2">테스트 계정</p>
        <div className="flex flex-col gap-1">
          {[['admin', 'admin'], ['user1', 'user1'], ['user2', 'user2']].map(([id, pw]) => (
            <button
              key={id}
              type="button"
              onClick={() => { setUsername(id); setPassword(pw); setError(null) }}
              className="flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-800 transition-colors py-0.5"
            >
              <span className="font-mono">{id} / {pw}</span>
              <span className="text-zinc-300">입력</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-zinc-400 mt-8 px-5">
        계정이 없으신가요? 테스트 계정으로 이용해주세요.
      </p>
    </div>
  )
}
