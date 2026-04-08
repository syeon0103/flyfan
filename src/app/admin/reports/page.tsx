'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Flag, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import FandomIcon from '@/components/ui/FandomIcon'
import {
  getReportStats,
  getReportItems,
  updateReportStatus,
  type ReportStats,
  type ReportItem,
} from '@/lib/api'

// ─── 상태 뱃지 ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReportItem['status'] }) {
  const cfg = {
    '대기 중':   { bg: '#fff7ed', color: '#c2410c', icon: <Clock size={10} /> },
    '검토 완료': { bg: '#eff6ff', color: '#1d4ed8', icon: <CheckCircle size={10} /> },
    '처리 완료': { bg: '#f0fdf4', color: '#15803d', icon: <CheckCircle size={10} /> },
  }[status]
  return (
    <span
      className="inline-flex items-center gap-1 h-[20px] px-2 rounded-full text-[10px] font-bold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.icon}
      {status}
    </span>
  )
}

// ─── 신고 유형 뱃지 ───────────────────────────────────────────────────────────

function ReasonBadge({ code }: { code: ReportItem['reasonCode'] }) {
  const cfg = {
    spam:       { label: '스팸',         bg: '#fef3c7', color: '#b45309' },
    harassment: { label: '괴롭힘',       bg: '#fff1f2', color: '#be123c' },
    privacy:    { label: '개인정보 침해', bg: '#f5f3ff', color: '#7e22ce' },
    other:      { label: '기타',          bg: '#f4f4f5', color: '#52525b' },
  }[code]
  return (
    <span
      className="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

// ─── 통계 카드 ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      className="flex-1 flex flex-col gap-1 p-4 bg-white border border-[#f4f4f5] rounded-[16px]"
      style={{ boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.03)' }}
    >
      <span className="text-[11px] font-medium text-zinc-400">{label}</span>
      <span className="text-[22px] font-bold text-zinc-900 leading-none">{value}</span>
      {sub && <span className="text-[10px] text-zinc-400">{sub}</span>}
    </div>
  )
}

// ─── 신고 카드 ────────────────────────────────────────────────────────────────

interface ReportCardProps {
  item: ReportItem
  onStatusChange: (id: string, status: ReportItem['status']) => void
}

function ReportCard({ item, onStatusChange }: ReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className="bg-white border border-[#f4f4f5] rounded-[20px] overflow-hidden"
      style={{ boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.03)' }}
    >
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-[12px] shrink-0 mt-0.5"
          style={{ backgroundColor: '#fff1f2' }}
        >
          <Flag size={15} className="text-rose-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[13px] font-bold text-zinc-900">{item.reporter}</span>
            <ReasonBadge code={item.reasonCode} />
            <StatusBadge status={item.status} />
          </div>
          <p className="text-[12px] text-zinc-500 truncate">{item.summary}</p>
          <span className="text-[11px] text-zinc-400">{item.timestamp}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-[#fafafa] pt-3">
          <p className="text-[13px] text-zinc-600">{item.summary}</p>
          <div className="flex gap-2">
            {(['대기 중', '검토 완료', '처리 완료'] as ReportItem['status'][]).map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(item.id, s)}
                className="flex-1 h-9 rounded-[12px] text-[12px] font-bold transition-colors"
                style={
                  item.status === s
                    ? { backgroundColor: '#18181b', color: '#ffffff' }
                    : { backgroundColor: '#f4f4f5', color: '#52525b' }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

type FilterStatus = 'all' | ReportItem['status']

const STATUS_FILTERS: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: '대기 중', label: '대기 중' },
  { id: '검토 완료', label: '검토 완료' },
  { id: '처리 완료', label: '처리 완료' },
]

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [items, setItems] = useState<ReportItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')

  const load = useCallback(async () => {
    setIsLoading(true)
    const [s, i] = await Promise.all([getReportStats(), getReportItems()])
    setStats(s)
    setItems(i)
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (id: string, status: ReportItem['status']) => {
    await updateReportStatus(id, status)
    setItems((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
  }

  const filtered = filter === 'all' ? items : items.filter((r) => r.status === filter)

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
            <span className="text-[15px] font-bold text-zinc-900">신고 관리</span>
          </div>
        </div>
      </header>

      <main className="px-5 py-8 mx-auto" style={{ maxWidth: '680px' }}>
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">신고 관리</h1>
          <p className="text-[14px] font-medium text-zinc-500">유저 신고 내역을 검토하고 처리하세요.</p>
        </div>

        {/* 통계 */}
        {stats && (
          <div className="flex gap-3 mb-6">
            <StatCard label="대기 중" value={stats.pending} sub={`+${stats.pendingDelta} 오늘`} />
            <StatCard label="처리율" value={`${stats.processingRate}%`} />
            <StatCard label="전체" value={stats.total.toLocaleString()} />
          </div>
        )}

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
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[88px] rounded-[20px] bg-zinc-100 animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <CheckCircle size={36} className="mb-3 text-zinc-200" />
              <p className="text-[13px] font-medium">해당 신고가 없습니다</p>
            </div>
          ) : (
            filtered.map((item) => (
              <ReportCard key={item.id} item={item} onStatusChange={handleStatusChange} />
            ))
          )}
        </section>
      </main>
    </div>
  )
}
