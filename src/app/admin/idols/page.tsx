'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X as XIcon, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import FandomIcon from '@/components/ui/FandomIcon'
import { getIdols, createIdol, updateIdol, deleteIdol, type Idol } from '@/lib/api'

// ─── 프리셋 색상 팔레트 ────────────────────────────────────────────────────────

const PRESET_COLORS = [
  { color: '#FFA33B', label: '오렌지' },
  { color: '#f43f5e', label: '로즈' },
  { color: '#ec4899', label: '핑크' },
  { color: '#a855f7', label: '퍼플' },
  { color: '#8b5cf6', label: '바이올렛' },
  { color: '#6366f1', label: '인디고' },
  { color: '#3b82f6', label: '블루' },
  { color: '#06b6d4', label: '사이언' },
  { color: '#14b8a6', label: '틸' },
  { color: '#10b981', label: '에메랄드' },
  { color: '#84cc16', label: '라임' },
  { color: '#eab308', label: '옐로우' },
  { color: '#f97316', label: '오렌지2' },
  { color: '#ef4444', label: '레드' },
  { color: '#64748b', label: '슬레이트' },
  { color: '#18181b', label: '블랙' },
]

// ─── 색상 선택기 ──────────────────────────────────────────────────────────────

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value)

  const handleHexChange = (raw: string) => {
    setHexInput(raw)
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      onChange(raw)
    }
  }

  const handlePreset = (color: string) => {
    onChange(color)
    setHexInput(color)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 라이브 미리보기 */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-[18px]"
          style={{ backgroundColor: `${value}18` }}
        >
          <FandomIcon color={value} size={26} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-bold text-zinc-900">미리보기</span>
          <span className="text-[11px] text-zinc-400 font-mono">{value}</span>
        </div>
      </div>

      {/* 프리셋 팔레트 */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="색상 프리셋">
        {PRESET_COLORS.map(({ color, label }) => (
          <button
            key={color}
            onClick={() => handlePreset(color)}
            role="radio"
            aria-checked={value === color}
            aria-label={label}
            className="relative w-8 h-8 rounded-full transition-transform hover:scale-110"
            style={{ backgroundColor: color }}
          >
            {value === color && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check size={14} className="text-white drop-shadow" strokeWidth={3} />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 직접 입력 */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-[10px] border border-[#f4f4f5] shrink-0"
          style={{ backgroundColor: hexInput }}
        />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#000000"
          aria-label="HEX 색상 코드 직접 입력"
          maxLength={7}
          className="flex-1 h-10 px-4 rounded-[12px] text-[13px] font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => { onChange(e.target.value); setHexInput(e.target.value) }}
          aria-label="컬러 피커"
          className="w-10 h-10 rounded-[10px] cursor-pointer border-0 p-0.5"
          style={{ backgroundColor: '#fafafa' }}
        />
      </div>
    </div>
  )
}

// ─── 아이돌 폼 ────────────────────────────────────────────────────────────────

interface IdolFormProps {
  initial?: Idol
  onSave: (name: string, color: string) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

function IdolForm({ initial, onSave, onCancel, isLoading }: IdolFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? '#FFA33B')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await onSave(name.trim(), color)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 아티스트명 */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">
          아티스트명
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: NewJeans"
          aria-label="아티스트명"
          required
          className="w-full h-[56px] px-5 rounded-[16px] text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
        />
      </div>

      {/* 대표 색상 */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] font-bold text-zinc-400 tracking-[1.1px] uppercase">
          대표 색상
        </label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 flex items-center justify-center h-12 rounded-[16px] text-[14px] font-bold text-zinc-600 border border-[#f4f4f5]"
          style={{ backgroundColor: '#fafafa' }}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!name.trim() || isLoading}
          className="flex-1 flex items-center justify-center h-12 rounded-[16px] text-[14px] font-bold text-white disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: '#18181b' }}
          aria-label={initial ? '수정 저장' : '아이돌 등록'}
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : initial ? (
            '수정 저장'
          ) : (
            '등록하기'
          )}
        </button>
      </div>
    </form>
  )
}

// ─── 삭제 확인 모달 ───────────────────────────────────────────────────────────

interface DeleteConfirmProps {
  idol: Idol
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

function DeleteConfirm({ idol, onConfirm, onCancel, isLoading }: DeleteConfirmProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="아이돌 삭제 확인"
    >
      <div
        className="w-full bg-white p-6 flex flex-col gap-5"
        style={{
          maxWidth: '680px',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-11 h-11 rounded-[14px]"
            style={{ backgroundColor: '#fff1f2' }}
          >
            <AlertCircle size={20} className="text-rose-500" />
          </div>
          <div>
            <p className="text-[16px] font-bold text-zinc-900">아이돌 삭제</p>
            <p className="text-[12px] text-zinc-500">
              <strong>{idol.name}</strong>을(를) 삭제합니다. 연결된 게시글에서 아이돌 정보가 제거됩니다.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-[16px] text-[14px] font-bold text-zinc-600 border border-[#f4f4f5]"
            style={{ backgroundColor: '#fafafa' }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center h-12 rounded-[16px] text-[14px] font-bold text-white disabled:opacity-40"
            style={{ backgroundColor: '#f43f5e' }}
            aria-label="삭제 확인"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              '삭제하기'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 아이돌 행 ────────────────────────────────────────────────────────────────

interface IdolRowProps {
  idol: Idol
  onEdit: (idol: Idol) => void
  onDelete: (idol: Idol) => void
}

function IdolRow({ idol, onEdit, onDelete }: IdolRowProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 bg-white border border-[#f4f4f5] rounded-[20px]"
      style={{ boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.03)' }}
    >
      {/* 아이콘 */}
      <div
        className="flex items-center justify-center w-12 h-12 rounded-[14px] shrink-0"
        style={{ backgroundColor: `${idol.color}18` }}
        aria-hidden="true"
      >
        <FandomIcon color={idol.color} size={22} />
      </div>

      {/* 이름 + 색상 */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[14px] font-bold text-zinc-900 truncate">{idol.name}</span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: idol.color }}
            aria-hidden="true"
          />
          <span className="text-[11px] font-mono text-zinc-400">{idol.color}</span>
        </div>
      </div>

      {/* 액션 */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(idol)}
          className="flex items-center justify-center w-9 h-9 rounded-[12px] transition-colors hover:bg-zinc-100"
          aria-label={`${idol.name} 수정`}
        >
          <Pencil size={15} className="text-zinc-500" />
        </button>
        <button
          onClick={() => onDelete(idol)}
          className="flex items-center justify-center w-9 h-9 rounded-[12px] transition-colors hover:bg-red-50"
          aria-label={`${idol.name} 삭제`}
        >
          <Trash2 size={15} className="text-rose-400" />
        </button>
      </div>
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

type FormMode = 'add' | 'edit' | null

export default function AdminIdolsPage() {
  const [idols, setIdols] = useState<Idol[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editTarget, setEditTarget] = useState<Idol | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Idol | null>(null)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadIdols = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getIdols()
      setIdols(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadIdols() }, [loadIdols])

  const handleAdd = async (name: string, color: string) => {
    setIsMutating(true)
    setError(null)
    try {
      const idol = await createIdol(name, color)
      setIdols((prev) => [...prev, idol].sort((a, b) => a.name.localeCompare(b.name)))
      setFormMode(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleEdit = async (name: string, color: string) => {
    if (!editTarget) return
    setIsMutating(true)
    setError(null)
    try {
      const updated = await updateIdol(editTarget.id, name, color)
      setIdols((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      setFormMode(null)
      setEditTarget(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsMutating(true)
    try {
      await deleteIdol(deleteTarget.id)
      setIdols((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsMutating(false)
    }
  }

  const openEdit = useCallback((idol: Idol) => {
    setEditTarget(idol)
    setFormMode('edit')
    setError(null)
  }, [])

  const openDelete = useCallback((idol: Idol) => {
    setDeleteTarget(idol)
  }, [])

  const closeForm = () => {
    setFormMode(null)
    setEditTarget(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-30 bg-white border-b border-[#fafafa]"
        style={{ boxShadow: '0px 1px 0px 0px #f4f4f5' }}
      >
        <div
          className="flex items-center justify-between px-5 h-16 mx-auto"
          style={{ maxWidth: '680px' }}
        >
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5">
              <FandomIcon color="#FFA33B" size={18} />
              <span className="text-[15px] font-bold text-zinc-900">flyfan</span>
            </Link>
            <span className="text-zinc-300">/</span>
            <span className="text-[13px] font-medium text-zinc-500">아이돌 관리</span>
          </div>
          <button
            onClick={() => { setFormMode('add'); setEditTarget(null); setError(null) }}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[12px] text-[12px] font-bold text-white"
            style={{ backgroundColor: '#18181b' }}
            aria-label="아이돌 추가"
          >
            <Plus size={14} strokeWidth={2.5} />
            추가
          </button>
        </div>
      </header>

      <main className="px-5 py-8 mx-auto" style={{ maxWidth: '680px' }}>
        {/* ── 타이틀 ── */}
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-[24px] font-bold text-zinc-900 leading-[32px] tracking-[-0.6px]">
            아이돌 관리
          </h1>
          <p className="text-[14px] font-medium text-zinc-500 leading-[20px]">
            아이돌을 등록하고 팬덤 아이콘 색상을 설정하세요.
          </p>
        </div>

        {/* ── 에러 배너 ── */}
        {error && (
          <div
            className="flex items-center gap-3 p-4 mb-6 rounded-[16px]"
            style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}
            role="alert"
          >
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span className="text-[13px] font-medium text-rose-700">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto" aria-label="닫기">
              <XIcon size={14} className="text-rose-400" />
            </button>
          </div>
        )}

        {/* ── 아이돌 목록 ── */}
        <section aria-label="아이돌 목록" aria-live="polite" aria-busy={isLoading}>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[72px] rounded-[20px] bg-zinc-100 animate-pulse" aria-hidden="true" />
              ))}
            </div>
          ) : idols.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <FandomIcon color="#d4d4d8" size={40} />
              <p className="text-[13px] font-medium mt-4">등록된 아이돌이 없습니다</p>
              <button
                onClick={() => setFormMode('add')}
                className="mt-4 text-[13px] font-bold text-zinc-900 underline underline-offset-2"
              >
                첫 아이돌 등록하기
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {idols.map((idol) => (
                <IdolRow
                  key={idol.id}
                  idol={idol}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── 총 개수 ── */}
        {!isLoading && idols.length > 0 && (
          <p className="text-[11px] text-zinc-400 text-center mt-6">
            총 {idols.length}개 아이돌 등록됨
          </p>
        )}
      </main>

      {/* ── 폼 슬라이드업 패널 ── */}
      {formMode && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
          role="dialog"
          aria-modal="true"
          aria-label={formMode === 'add' ? '아이돌 추가' : '아이돌 수정'}
        >
          <div
            className="w-full bg-white overflow-y-auto"
            style={{
              maxWidth: '680px',
              maxHeight: '90vh',
              borderTopLeftRadius: '32px',
              borderTopRightRadius: '32px',
              boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            {/* 드래그 핸들 */}
            <div className="flex justify-center pt-6 pb-1">
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full" aria-hidden="true" />
            </div>

            <div className="px-6 pt-4 pb-8">
              {/* 패널 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[20px] font-bold text-zinc-900">
                  {formMode === 'add' ? '아이돌 추가' : `"${editTarget?.name}" 수정`}
                </h2>
                <button
                  onClick={closeForm}
                  className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-zinc-100"
                  aria-label="닫기"
                >
                  <XIcon size={18} className="text-zinc-500" />
                </button>
              </div>

              <IdolForm
                initial={editTarget ?? undefined}
                onSave={formMode === 'add' ? handleAdd : handleEdit}
                onCancel={closeForm}
                isLoading={isMutating}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 삭제 확인 ── */}
      {deleteTarget && (
        <DeleteConfirm
          idol={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isMutating}
        />
      )}
    </div>
  )
}
