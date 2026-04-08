'use client'

import React, { useState, useEffect } from 'react'
import { X, Send, ChevronDown, CheckCircle2, AlertCircle, Lock } from 'lucide-react'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import {
  getReportStats,
  getReportItems,
  submitReport,
  type ReportStats,
  type ReportItem,
} from '@/lib/api'

// ─── 통계 카드 ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  delta?: string
}

function StatCard({ label, value, delta }: StatCardProps) {
  return (
    <div
      className="flex flex-col justify-between bg-zinc-50 border border-zinc-100 rounded-[20px] p-6"
      style={{ minHeight: '118px' }}
    >
      <span className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase leading-[16.5px]">
        {label}
      </span>
      <div className="flex items-baseline gap-2 pt-4">
        <span className="text-[30px] font-bold text-zinc-900 leading-[36px]">{value}</span>
        {delta && (
          <span className="text-[10px] font-bold text-rose-500 leading-[15px]">{delta}</span>
        )}
      </div>
    </div>
  )
}

// ─── 신고 사유 뱃지 ───────────────────────────────────────────────────────────

const REASON_STYLES: Record<string, { bg: string; color: string; short: string }> = {
  spam: { bg: '#fff1f2', color: '#e11d48', short: '스팸' },
  harassment: { bg: '#f4f4f5', color: '#52525b', short: '괴롭힘' },
  privacy: { bg: '#f4f4f5', color: '#52525b', short: '개인정보' },
  other: { bg: '#f4f4f5', color: '#71717a', short: '기타' },
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  '대기 중': { bg: '#f4f4f5', color: '#71717a' },
  '검토 완료': { bg: '#fafafa', color: '#a1a1aa' },
  '처리 완료': { bg: '#dcfce7', color: '#15803d' },
}

// ─── 신고 테이블 행 ───────────────────────────────────────────────────────────

function ReportRow({ item }: { item: ReportItem }) {
  const reasonStyle = REASON_STYLES[item.reasonCode] ?? REASON_STYLES.other
  const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES['대기 중']

  return (
    <tr className="border-t border-zinc-50">
      {/* 신고자 */}
      <td className="py-4 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
            <span className="text-xs">👤</span>
          </div>
          <span className="text-[14px] font-bold text-zinc-900 whitespace-nowrap">
            {item.reporter}
          </span>
        </div>
      </td>
      {/* 사유 */}
      <td className="py-4 px-3">
        <span
          className="inline-flex items-center h-8 px-3 rounded-full text-[10px] font-bold whitespace-nowrap"
          style={{ backgroundColor: reasonStyle.bg, color: reasonStyle.color }}
        >
          {reasonStyle.short}
        </span>
      </td>
      {/* 내용 요약 */}
      <td className="py-4 px-3 max-w-[200px]">
        <p className="text-[14px] text-zinc-500 truncate">{item.summary}</p>
      </td>
      {/* 상태 */}
      <td className="py-4 px-3 text-center">
        <span
          className="inline-flex items-center h-10 px-3 rounded-full text-[10px] font-bold whitespace-nowrap"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
        >
          {item.status}
        </span>
      </td>
      {/* 일시 */}
      <td className="py-4 pl-3 pr-6 text-right">
        <span className="text-[12px] text-zinc-400 whitespace-nowrap">{item.timestamp}</span>
      </td>
    </tr>
  )
}

// ─── 신고하기 모달 ────────────────────────────────────────────────────────────

interface ReportReason {
  id: string
  label: string
  sublabel: string
  Icon: React.FC<{ size?: number; className?: string }>
}

const REPORT_REASONS: ReportReason[] = [
  {
    id: 'spam',
    label: '스팸 (Spam)',
    sublabel: '광고, 홍보, 도배성 게시물',
    Icon: AlertCircle,
  },
  {
    id: 'harassment',
    label: '괴롭힘 및 비하 (Harassment)',
    sublabel: '혐오 표현, 사이버 불링',
    Icon: AlertCircle,
  },
  {
    id: 'privacy',
    label: '개인정보 노출 (Sensitive Info)',
    sublabel: '사생활 침해, 불법 정보',
    Icon: Lock,
  },
]

interface ReportModalProps {
  onClose: () => void
  onSubmit: (reason: string, description: string) => void
  isSubmitting: boolean
}

function ReportModal({ onClose, onSubmit, isSubmitting }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('spam')
  const [description, setDescription] = useState('')

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        aria-label="신고하기"
      >
        {/* 배경 블러 */}
        <div
          className="absolute inset-0"
          style={{ backdropFilter: 'blur(2px)', backgroundColor: 'rgba(24,24,27,0.4)' }}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* 모달 카드 */}
        <div
          className="relative w-full max-w-[448px] bg-white border border-zinc-100 rounded-[24px] overflow-hidden z-10"
          style={{ boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)' }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 pt-7 pb-2">
            <h2 className="text-[24px] font-bold text-zinc-900 tracking-[-0.6px] leading-[32px]">
              신고하기
            </h2>
            <button
              onClick={onClose}
              aria-label="모달 닫기"
              className="flex items-center justify-center w-[30px] h-[30px] rounded-full hover:bg-zinc-100 transition-colors"
            >
              <X size={18} className="text-zinc-600" />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex flex-col gap-8 px-6 pt-6 pb-8">
            {/* 설명 */}
            <p className="text-[14px] font-medium text-zinc-500 leading-[22.75px]">
              본 게시물이나 댓글을 신고하는 이유를 선택해주세요. 정확한 검토를 위해 추가 세부
              정보를 작성해주시면 큰 도움이 됩니다.
            </p>

            {/* 사유 선택 */}
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">신고 사유 선택</legend>
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReason === reason.id
                const { Icon } = reason
                return (
                  <label
                    key={reason.id}
                    className="flex items-center gap-4 p-[17px] rounded-[20px] cursor-pointer transition-colors"
                    style={{
                      backgroundColor: '#fafafa',
                      border: isSelected ? '1px solid #f4f4f5' : '1px solid #f4f4f5',
                    }}
                  >
                    {/* 라디오 버튼 */}
                    <div
                      className="flex items-center justify-center w-[22px] h-[22px] rounded-[20px] shrink-0 transition-colors"
                      style={{
                        backgroundColor: isSelected ? '#18181b' : '#ffffff',
                        border: isSelected ? '1px solid transparent' : '1px solid #d4d4d8',
                      }}
                    >
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason.id)}
                      className="sr-only"
                    />
                    {/* 텍스트 */}
                    <div className="flex-1">
                      <p className="text-[15px] font-bold text-zinc-900 leading-[22.5px]">
                        {reason.label}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-400 tracking-[0.5px] uppercase leading-[15px]">
                        {reason.sublabel}
                      </p>
                    </div>
                    {/* 아이콘 */}
                    <Icon size={20} className="text-zinc-400 shrink-0" />
                  </label>
                )
              })}
            </fieldset>

            {/* 상세 내용 */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="report-description"
                className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase leading-[16.5px]"
              >
                상세 내용 작성
              </label>
              <textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="신고 이유에 대해 더 자세히 설명해주세요..."
                rows={4}
                className="w-full h-[128px] px-[17px] py-[17px] bg-zinc-50 border border-zinc-100 rounded-[20px] text-[14px] font-medium text-zinc-900 placeholder:text-zinc-300 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/20 leading-[24px]"
              />
            </div>

            {/* 제출 버튼 */}
            <button
              onClick={() => onSubmit(selectedReason, description)}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-[16px] text-[16px] font-bold text-white transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: '#18181b',
                boxShadow: '0px 10px 15px -3px rgba(24,24,27,0.1), 0px 4px 6px -4px rgba(24,24,27,0.1)',
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  신고 완료하기
                  <Send size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [reportItems, setReportItems] = useState<ReportItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const [s, items] = await Promise.all([getReportStats(), getReportItems()])
        setStats(s)
        setReportItems(items)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleSubmit = async (reason: string, description: string) => {
    setIsSubmitting(true)
    try {
      await submitReport('', reason, description)
      setSubmitted(true)
      setShowModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <TopAppBar showMenu showAvatar />

      <main className="pb-[158px] pt-20 px-6">
        {/* ── 통계 그리드 ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[118px] rounded-[20px] bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4 mb-6" aria-label="신고 통계">
            <StatCard
              label="검토 대기"
              value={String(stats.pending)}
              delta={`+${stats.pendingDelta} 오늘`}
            />
            <StatCard label="전체 신고 건수" value={stats.total.toLocaleString()} />
            <StatCard label="처리율" value={`${stats.processingRate}%`} />
            <StatCard label="활동 운영진" value={String(stats.activeAdmins)} />
          </div>
        ) : null}

        {/* ── 신고 항목 테이블 ── */}
        <div
          className="bg-white border border-zinc-100 rounded-[20px] overflow-hidden"
          style={{ boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)' }}
          aria-label="신고 항목 내역"
        >
          {/* 테이블 헤더 */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-zinc-50"
          >
            <h2 className="text-[18px] font-bold text-zinc-900 leading-[28px]">
              신고 항목 내역
            </h2>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center h-9 px-[17px] rounded-full text-[11px] font-bold text-zinc-900 bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-colors gap-1"
              >
                전체 카테고리
                <ChevronDown size={12} />
              </button>
              <button
                className="flex items-center h-9 px-[17px] rounded-full text-[11px] font-bold text-zinc-900 bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-colors gap-1"
              >
                우선순위
                <ChevronDown size={12} />
              </button>
            </div>
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="text-left py-[22.5px] px-6 text-[11px] font-bold text-zinc-400 tracking-[0.55px] uppercase">
                    신고자
                  </th>
                  <th className="text-left py-[22.5px] px-6 text-[11px] font-bold text-zinc-400 tracking-[0.55px] uppercase">
                    사유
                  </th>
                  <th className="text-left py-[22.5px] px-6 text-[11px] font-bold text-zinc-400 tracking-[0.55px] uppercase">
                    내용 요약
                  </th>
                  <th className="text-center py-[22.5px] px-6 text-[11px] font-bold text-zinc-400 tracking-[0.55px] uppercase">
                    상태
                  </th>
                  <th className="text-right py-4 px-6 text-[11px] font-bold text-zinc-400 tracking-[0.55px] uppercase">
                    일시
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-t border-zinc-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-4 bg-zinc-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : (
                  reportItems.map((item) => <ReportRow key={item.id} item={item} />)
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 제출 완료 메시지 */}
        {submitted && (
          <div
            className="flex items-center gap-3 mt-6 p-4 bg-zinc-50 border border-zinc-100 rounded-[16px]"
            role="alert"
          >
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
            <p className="text-[14px] font-medium text-zinc-700">
              신고가 성공적으로 접수되었습니다. 검토 후 조치하겠습니다.
            </p>
          </div>
        )}
      </main>

      {/* ── 신고 모달 ── */}
      {showModal && (
        <ReportModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* 모달이 닫힌 후 다시 열기 버튼 */}
      {!showModal && !submitted && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full text-[14px] font-bold"
            style={{ boxShadow: '0px 10px 15px -3px rgba(24,24,27,0.15)' }}
          >
            <AlertCircle size={16} />
            신고하기
          </button>
        </div>
      )}

      <BottomNavBar variant="admin" />
    </>
  )
}
