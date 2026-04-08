'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Search, ShieldAlert, ShieldOff, ShieldCheck } from 'lucide-react'
import FandomIcon from '@/components/ui/FandomIcon'
import { getAdminUsers, updateUserStatus, type AdminUser } from '@/lib/api'

// ─── 상태 뱃지 ────────────────────────────────────────────────────────────────

function UserStatusBadge({ status }: { status: AdminUser['status'] }) {
  const cfg = {
    '정상': { bg: '#f0fdf4', color: '#15803d' },
    '경고': { bg: '#fff7ed', color: '#c2410c' },
    '정지': { bg: '#fff1f2', color: '#be123c' },
  }[status]
  return (
    <span
      className="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {status}
    </span>
  )
}

// ─── 유저 행 ─────────────────────────────────────────────────────────────────

interface UserRowProps {
  user: AdminUser
  onStatusChange: (id: string, status: AdminUser['status']) => void
}

function UserRow({ user, onStatusChange }: UserRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const actions: { status: AdminUser['status']; label: string; icon: React.ReactNode; bg: string; color: string }[] = [
    { status: '정상',   label: '정상', icon: <ShieldCheck size={13} />, bg: '#f0fdf4', color: '#15803d' },
    { status: '경고',   label: '경고', icon: <ShieldAlert size={13} />, bg: '#fff7ed', color: '#c2410c' },
    { status: '정지',   label: '정지', icon: <ShieldOff  size={13} />, bg: '#fff1f2', color: '#be123c' },
  ]

  return (
    <div
      className="bg-white border border-[#f4f4f5] rounded-[20px] overflow-hidden"
      style={{ boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.03)' }}
    >
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setIsExpanded((v) => !v)}
      >
        {/* 아바타 */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-[12px] shrink-0 text-[16px]"
          style={{ backgroundColor: '#f4f4f5' }}
        >
          💎
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[14px] font-bold text-zinc-900 truncate">{user.handle}</span>
            <UserStatusBadge status={user.status} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span>Lv.{user.level}</span>
            <span>·</span>
            <span className="truncate">{user.fandom}</span>
            <span>·</span>
            <span>가입 {user.joinedAt}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-[11px] text-zinc-400">게시글 {user.postCount}</span>
          {user.reportCount > 0 && (
            <span className="text-[11px] font-bold text-rose-400">신고 {user.reportCount}건</span>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-[#fafafa] pt-3">
          <p className="text-[11px] font-bold text-zinc-400 mb-2 tracking-[0.8px] uppercase">상태 변경</p>
          <div className="flex gap-2">
            {actions.map((a) => (
              <button
                key={a.status}
                onClick={() => onStatusChange(user.id, a.status)}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[12px] text-[12px] font-bold border transition-colors"
                style={
                  user.status === a.status
                    ? { backgroundColor: a.bg, color: a.color, borderColor: 'transparent' }
                    : { backgroundColor: '#fafafa', color: '#71717a', borderColor: '#f4f4f5' }
                }
              >
                {a.icon}
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

type FilterStatus = 'all' | AdminUser['status']

const STATUS_FILTERS: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: '정상', label: '정상' },
  { id: '경고', label: '경고' },
  { id: '정지', label: '정지' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    const data = await getAdminUsers()
    setUsers(data)
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (id: string, status: AdminUser['status']) => {
    await updateUserStatus(id, status)
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u))
  }

  const filtered = users
    .filter((u) => filter === 'all' || u.status === filter)
    .filter((u) => !search || u.handle.toLowerCase().includes(search.toLowerCase()) || u.fandom.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header
        className="sticky top-0 z-30 bg-white border-b border-[#f4f4f5]"
        style={{ boxShadow: '0px 1px 0px 0px #f4f4f5' }}
      >
        <div className="flex items-center gap-3 px-5 h-16 mx-auto" style={{ maxWidth: '680px' }}>
          <Link href="/admin" className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100">
            <ChevronLeft size={18} className="text-zinc-600" />
          </Link>
          <div className="flex items-center gap-2">
            <FandomIcon color="#FFA33B" size={16} />
            <span className="text-[15px] font-bold text-zinc-900">유저 관리</span>
          </div>
        </div>
      </header>

      <main className="px-5 py-8 mx-auto" style={{ maxWidth: '680px' }}>
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">유저 관리</h1>
          <p className="text-[14px] font-medium text-zinc-500">회원 목록을 관리하고 제재를 적용하세요.</p>
        </div>

        {/* 검색 */}
        <div
          className="flex items-center gap-3 h-[48px] px-4 rounded-[16px] mb-4"
          style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
        >
          <Search size={16} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="핸들 또는 팬덤 검색..."
            className="flex-1 bg-transparent text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>

        {/* 필터 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5 mb-4">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="flex-shrink-0 h-[38px] px-5 rounded-full text-[12px] font-bold transition-colors"
              style={
                filter === f.id
                  ? { backgroundColor: '#18181b', color: '#ffffff' }
                  : { backgroundColor: '#ffffff', color: '#52525b', border: '1px solid #f4f4f5' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <section className="flex flex-col gap-3" aria-live="polite" aria-busy={isLoading}>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[72px] rounded-[20px] bg-zinc-100 animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <p className="text-[13px] font-medium">검색 결과가 없습니다</p>
            </div>
          ) : (
            filtered.map((user) => (
              <UserRow key={user.id} user={user} onStatusChange={handleStatusChange} />
            ))
          )}
        </section>

        {!isLoading && (
          <p className="text-[11px] text-zinc-400 text-center mt-6">
            총 {filtered.length}명 / 전체 {users.length}명
          </p>
        )}
      </main>
    </div>
  )
}
