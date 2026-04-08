'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Menu, ArrowLeft, Bookmark, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getActivePersonaEmoji } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

// flyfan 로고 (날개 + 텍스트)
function FlyFanLogo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="flyfan 홈으로">
      {/* 날개 로고 - 선 위주 심플 스타일 */}
      <svg width="26" height="20" viewBox="0 0 52 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* 왼쪽 날개 외곽 타원형 스윕 */}
        <path d="M26 28 C20 23 10 15 3 8 C1 5 3 2 7 3 C15 4 23 13 25 26" stroke="#18181b" strokeWidth="2.3" strokeLinecap="round" fill="none"/>
        {/* 왼쪽 깃털 안쪽선 */}
        <path d="M26 28 C22 23 17 17 13 13" stroke="#18181b" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* 왼쪽 깃털 노치 1 */}
        <path d="M7 4 C5 7 6 11 10 11" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        {/* 왼쪽 깃털 노치 2 */}
        <path d="M13 6 C11 9 12 12 15 12" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
        {/* 중앙 소용돌이 */}
        <path d="M26 29 C25 27 23 26 24 24 C25 23 28 24 27 27 C26 30 23 31 26 29" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        {/* 오른쪽 날개 외곽 타원형 스윕 */}
        <path d="M26 28 C32 23 42 15 49 8 C51 5 49 2 45 3 C37 4 29 13 27 26" stroke="#18181b" strokeWidth="2.3" strokeLinecap="round" fill="none"/>
        {/* 오른쪽 깃털 안쪽선 */}
        <path d="M26 28 C30 23 35 17 39 13" stroke="#18181b" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* 오른쪽 깃털 노치 1 */}
        <path d="M45 4 C47 7 46 11 42 11" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        {/* 오른쪽 깃털 노치 2 */}
        <path d="M39 6 C41 9 40 12 37 12" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      </svg>
      <span
        className="text-[20px] text-zinc-900 leading-none"
        style={{ fontStyle: 'italic', fontWeight: 800, letterSpacing: '-0.03em' }}
      >
        flyfan
      </span>
    </Link>
  )
}

// ─── 페르소나 메뉴 버튼 ──────────────────────────────────────────────────────

function PersonaMenuButton() {
  const router = useRouter()
  const { signOut, user } = useAuth()
  const [emoji, setEmoji] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      getActivePersonaEmoji().then(setEmoji)
    }
  }, [user])

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleProfile = () => {
    setOpen(false)
    router.push('/profile/settings')
  }

  const handleLogout = async () => {
    setOpen(false)
    await signOut()
    router.push('/login')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="프로필 메뉴"
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors text-[18px] select-none"
      >
        {emoji ?? '💎'}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 w-[160px] bg-white rounded-[16px] overflow-hidden z-50"
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid #f4f4f5' }}
        >
          <button
            onClick={handleProfile}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors"
          >
            <User size={14} className="text-zinc-500 shrink-0" />
            내 프로필
          </button>
          <div style={{ height: 1, backgroundColor: '#f4f4f5' }} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold hover:bg-zinc-50 transition-colors"
            style={{ color: '#f43f5e' }}
          >
            <LogOut size={14} className="shrink-0" style={{ color: '#f43f5e' }} />
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}

// ─── TopAppBar ───────────────────────────────────────────────────────────────

interface TopAppBarProps {
  /** 왼쪽에 뒤로가기 버튼 표시 */
  showBack?: boolean
  /** 왼쪽에 햄버거 메뉴 표시 */
  showMenu?: boolean
  /** 오른쪽에 페르소나 메뉴 표시 (홈 등 메인 화면) */
  showPersonaMenu?: boolean
  /** 오른쪽에 아바타(프로필 원형) 표시 */
  showAvatar?: boolean
  /** 오른쪽에 북마크 아이콘 표시 */
  showBookmark?: boolean
  /** 뒤로가기 핸들러 */
  onBackClick?: () => void
  /** 햄버거 메뉴 핸들러 */
  onMenuClick?: () => void
  /** 북마크 핸들러 */
  onBookmarkClick?: () => void
  /** 오른쪽 커스텀 영역 */
  rightActions?: React.ReactNode
  /** 중앙에 로고 대신 표시할 제목 (없으면 flyfan 로고 표시) */
  title?: string
}

export default function TopAppBar({
  showBack = false,
  showMenu = false,
  showPersonaMenu = false,
  showAvatar = false,
  showBookmark = false,
  onBackClick,
  onMenuClick,
  onBookmarkClick,
  rightActions,
  title,
}: TopAppBarProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 border-b border-zinc-50"
      style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.8)' }}
      role="banner"
    >
      {/* 왼쪽 */}
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={onBackClick}
            aria-label="뒤로 가기"
            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-zinc-900" />
          </button>
        )}
        {showMenu && (
          <button
            onClick={onMenuClick}
            aria-label="메뉴 열기"
            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <Menu size={18} className="text-zinc-900" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* 중앙 */}
      <div className="absolute left-1/2 -translate-x-1/2">
        {title ? (
          <h1 className="font-bold text-lg text-zinc-900">{title}</h1>
        ) : (
          <FlyFanLogo />
        )}
      </div>

      {/* 오른쪽 */}
      <div className="flex items-center gap-3">
        {showPersonaMenu && <PersonaMenuButton />}
        {showBookmark && (
          <button
            onClick={onBookmarkClick}
            aria-label="북마크"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <Bookmark size={16} className="text-zinc-900" />
          </button>
        )}
        {showAvatar && (
          <div
            className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden"
            aria-label="프로필"
            role="img"
          >
            <span className="text-sm">💎</span>
          </div>
        )}
        {rightActions}
      </div>
    </header>
  )
}
