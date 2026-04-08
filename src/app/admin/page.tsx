'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Music, Flag, Users, Settings } from 'lucide-react'
import FandomIcon from '@/components/ui/FandomIcon'
import { getReportStats } from '@/lib/api'

// ─── 관리 메뉴 항목 ───────────────────────────────────────────────────────────

interface AdminMenuItem {
  href: string
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  badge?: number | null
}

// ─── 메뉴 카드 ────────────────────────────────────────────────────────────────

function AdminMenuCard({ item }: { item: AdminMenuItem }) {
  return (
    <Link
      href={item.href}
      className="flex items-center gap-4 p-5 bg-white border border-[#f4f4f5] rounded-[20px] transition-colors hover:border-zinc-200 active:bg-zinc-50"
      style={{ boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.03)' }}
    >
      <div
        className="flex items-center justify-center w-12 h-12 rounded-[14px] shrink-0"
        style={{ backgroundColor: item.iconBg }}
        aria-hidden="true"
      >
        {item.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-zinc-900">{item.title}</span>
          {!!item.badge && (
            <span
              className="inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: '#f43f5e' }}
            >
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-[12px] text-zinc-400 mt-0.5">{item.description}</p>
      </div>

      <ChevronRight size={16} className="text-zinc-300 shrink-0" />
    </Link>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [pendingReports, setPendingReports] = useState<number | null>(null)

  useEffect(() => {
    getReportStats().then((s) => setPendingReports(s.pending))
  }, [])

  const menu: AdminMenuItem[] = [
    {
      href: '/admin/idols',
      icon: <Music size={20} className="text-violet-500" />,
      iconBg: '#f5f3ff',
      title: '아이돌 관리',
      description: '아이돌 등록, 수정, 색상 설정',
    },
    {
      href: '/admin/reports',
      icon: <Flag size={20} className="text-rose-500" />,
      iconBg: '#fff1f2',
      title: '신고 관리',
      description: '유저 신고 내역 검토 및 처리',
      badge: pendingReports,
    },
    {
      href: '/admin/users',
      icon: <Users size={20} className="text-blue-500" />,
      iconBg: '#eff6ff',
      title: '유저 관리',
      description: '회원 목록, 제재, 레벨 관리',
    },
    {
      href: '/admin/settings',
      icon: <Settings size={20} className="text-zinc-500" />,
      iconBg: '#f4f4f5',
      title: '서비스 설정',
      description: '키워드 프리셋, 안전 구역 태그 관리',
    },
  ]

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-30 bg-white border-b border-[#f4f4f5]"
        style={{ boxShadow: '0px 1px 0px 0px #f4f4f5' }}
      >
        <div
          className="flex items-center justify-between px-5 h-16 mx-auto"
          style={{ maxWidth: '680px' }}
        >
          <div className="flex items-center gap-2">
            <FandomIcon color="#FFA33B" size={18} />
            <span className="text-[15px] font-bold text-zinc-900">flyfan</span>
            <span className="text-zinc-300 mx-1">/</span>
            <span className="text-[13px] font-medium text-zinc-500">관리자</span>
          </div>
        </div>
      </header>

      <main className="px-5 py-8 mx-auto" style={{ maxWidth: '680px' }}>
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">
            관리자 대시보드
          </h1>
          <p className="text-[14px] font-medium text-zinc-500 leading-[20px]">
            flyfan 서비스를 관리하세요.
          </p>
        </div>

        <section className="flex flex-col gap-3" aria-label="관리 메뉴">
          {menu.map((item) => (
            <AdminMenuCard key={item.href} item={item} />
          ))}
        </section>

        <div className="flex justify-center mt-12 opacity-30">
          <div className="flex items-center gap-2">
            <FandomIcon color="#18181b" size={14} />
            <span className="text-[11px] font-bold text-zinc-900 tracking-[1.1px] uppercase">
              flyfan admin
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
