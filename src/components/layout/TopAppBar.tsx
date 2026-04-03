'use client'

import React from 'react'
import { Menu, Bell, ArrowLeft, Bookmark } from 'lucide-react'
import Link from 'next/link'

// flyfan 로고 (gem + 텍스트)
function FlyFanLogo() {
  return (
    <Link href="/" className="flex items-center gap-1.5" aria-label="flyfan 홈으로">
      {/* 작은 다이아몬드 gem 아이콘 */}
      <span
        className="inline-flex items-center justify-center w-8 h-8 text-base"
        aria-hidden="true"
      >
        <svg width="21" height="28" viewBox="0 0 21 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 0L21 7.5L10.5 28L0 7.5L10.5 0Z" fill="#18181b"/>
          <path d="M0 7.5L10.5 12L21 7.5" stroke="white" strokeWidth="0.8" fill="none"/>
          <path d="M10.5 0L5.25 7.5L10.5 12L15.75 7.5L10.5 0Z" fill="#3f3f46"/>
        </svg>
      </span>
      <span className="font-black text-[20px] tracking-[-0.5px] text-zinc-900 leading-none">
        flyfan
      </span>
    </Link>
  )
}

interface TopAppBarProps {
  /** 왼쪽에 뒤로가기 버튼 표시 */
  showBack?: boolean
  /** 왼쪽에 햄버거 메뉴 표시 */
  showMenu?: boolean
  /** 오른쪽에 알림 벨 표시 */
  showNotification?: boolean
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
  showNotification = false,
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
        {showNotification && (
          <button
            aria-label="알림"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <Bell size={16} className="text-zinc-900" />
          </button>
        )}
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
