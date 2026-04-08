'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import { getNotifications, markNotificationsRead, type Notification } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

// ─── 알림 아이템 ─────────────────────────────────────────────────────────────

function NotificationItem({ noti, onClick }: { noti: Notification; onClick: () => void }) {
  const typeLabel = noti.type === 'reply' ? '답글' : '댓글'

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 px-5 py-4 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
      aria-label={`${noti.commenterHandle}의 ${typeLabel} 알림`}
    >
      {/* 페르소나 이모지 아바타 */}
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 text-[18px]"
        style={{ backgroundColor: noti.isRead ? '#f4f4f5' : '#ede9fe' }}
        aria-hidden="true"
      >
        {noti.commenterPersonaEmoji ?? '💎'}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-bold text-zinc-900 truncate">{noti.commenterHandle}</span>
            <span
              className="inline-flex items-center h-[18px] px-2 rounded-full text-[9px] font-bold shrink-0"
              style={{
                backgroundColor: noti.type === 'reply' ? '#fce7f3' : '#ede9fe',
                color: noti.type === 'reply' ? '#be185d' : '#7c3aed',
              }}
            >
              {typeLabel}
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 shrink-0">{noti.timestamp}</span>
        </div>

        {/* 게시글 제목 */}
        <p className="text-[11px] text-zinc-400 mb-1 truncate">
          {noti.postTitle}
        </p>

        {/* 댓글 내용 */}
        <p
          className="text-[13px] text-zinc-600 leading-[19px]"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {noti.content}
        </p>
      </div>

      {/* 안읽음 dot */}
      {!noti.isRead && (
        <div
          className="w-2 h-2 rounded-full shrink-0 mt-1"
          style={{ backgroundColor: '#7c3aed' }}
          aria-label="읽지 않은 알림"
        />
      )}
    </button>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
      return
    }
    if (authLoading || !user) return

    setIsLoading(true)
    getNotifications().then((data) => {
      setNotifications(data)
      setIsLoading(false)
      // 페이지 진입 시 읽음 처리 (약간 지연)
      setTimeout(() => markNotificationsRead(), 1500)
    })
  }, [authLoading, user, router])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <>
      <TopAppBar title="알림" showBack onBackClick={() => router.back()} />

      <main className="pb-[128px]">
        {/* ── 헤더 ── */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold text-zinc-900 tracking-[-0.5px]">알림</h1>
            {unreadCount > 0 && !isLoading && (
              <p className="text-[12px] text-zinc-400 mt-0.5">읽지 않은 알림 {unreadCount}개</p>
            )}
          </div>
          {unreadCount > 0 && !isLoading && (
            <button
              onClick={() => {
                markNotificationsRead()
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
              }}
              className="text-[12px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              모두 읽음
            </button>
          )}
        </div>

        {/* ── 구분선 ── */}
        <div style={{ height: 1, backgroundColor: '#f4f4f5' }} />

        {/* ── 목록 ── */}
        {isLoading ? (
          <div className="flex flex-col">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 bg-zinc-100 animate-pulse rounded-full w-1/3" />
                  <div className="h-3 bg-zinc-100 animate-pulse rounded-full w-full" />
                  <div className="h-3 bg-zinc-100 animate-pulse rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-8">
            <span className="text-4xl">🔔</span>
            <p className="text-[16px] font-bold text-zinc-900">아직 알림이 없어요</p>
            <p className="text-[13px] text-zinc-500">
              내 게시글에 댓글이 달리면 여기서 확인할 수 있어요
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-50">
            {notifications.map((noti) => (
              <NotificationItem
                key={noti.id}
                noti={noti}
                onClick={() => router.push(`/posts/${noti.postId}`)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNavBar />
    </>
  )
}
