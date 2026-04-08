'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Pencil, Trash2 } from 'lucide-react'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomNavBar from '@/components/layout/BottomNavBar'
import FandomIcon from '@/components/ui/FandomIcon'
import { getMyPosts, deletePost, type RecruitPost } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

// ─── 상태 배지 ────────────────────────────────────────────────────────────────

function StatusBadge({ status, isReported }: { status: RecruitPost['status']; isReported?: boolean }) {
  if (isReported) return (
    <span className="inline-flex items-center h-[22px] px-2.5 rounded-full text-[10px] font-bold"
      style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>신고 접수 중</span>
  )
  const styles = {
    '모집 중':   { bg: '#dcfce7', color: '#15803d' },
    '매칭 중':   { bg: '#fef3c7', color: '#78350f' },
    '매칭 완료': { bg: '#e4e4e7', color: '#71717a' },
  }[status]
  return (
    <span className="inline-flex items-center h-[22px] px-2.5 rounded-full text-[10px] font-bold"
      style={{ backgroundColor: styles.bg, color: styles.color }}>
      {status === '매칭 완료' ? '마감' : status}
    </span>
  )
}

// ─── 내 글 카드 ──────────────────────────────────────────────────────────────

interface MyPostCardProps {
  post: RecruitPost
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

function MyPostCard({ post, onEdit, onDelete }: MyPostCardProps) {
  const router = useRouter()

  return (
    <article
      className="bg-white border border-zinc-100 rounded-[24px] p-5 flex flex-col gap-3"
      style={{ boxShadow: '0px 4px 16px rgba(0,0,0,0.04)' }}
    >
      {/* 상단: 배지 + 타입 + 상태 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {post.postType === 'buddy' && post.authorPersonaEmoji ? (
            <span className="text-xl">{post.authorPersonaEmoji}</span>
          ) : (
            <div
              className="flex items-center justify-center w-8 h-8 rounded-[10px] shrink-0"
              style={{ backgroundColor: `${post.idolColor}18` }}
            >
              <FandomIcon color={post.idolColor} size={14} />
            </div>
          )}
          <span
            className="inline-flex items-center h-[22px] px-2.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: '#f4f4f5', color: '#71717a' }}
          >
            {post.postType === 'buddy' ? '비계친' : '덕메'}
          </span>
        </div>
        <StatusBadge status={post.status} isReported={post.isReported} />
      </div>

      {/* 제목 */}
      <button
        onClick={() => router.push(`/posts/${post.id}`)}
        className="text-left text-[16px] font-bold text-zinc-900 leading-[24px] hover:opacity-70 transition-opacity"
      >
        {post.title}
      </button>

      {/* 태그 */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.label}
              className="inline-flex items-center h-7 px-3 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: '#f4f4f5', color: '#52525b' }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* 하단: 시간 + 버튼 */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid #fafafa' }}
      >
        <span className="text-[12px] text-zinc-400">{post.timestamp}</span>
        <div className="flex items-center gap-1">
          {post.status !== '매칭 완료' && (
            <button
              onClick={() => onEdit(post.id)}
              className="flex items-center gap-1 h-8 px-3 rounded-full text-[12px] font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
              aria-label="수정"
            >
              <Pencil size={12} />
              수정
            </button>
          )}
          <button
            onClick={() => onDelete(post.id)}
            className="flex items-center gap-1 h-8 px-3 rounded-full text-[12px] font-bold hover:bg-zinc-100 transition-colors"
            style={{ color: '#f43f5e' }}
            aria-label="삭제"
          >
            <Trash2 size={12} />
            삭제
          </button>
          <button
            onClick={() => router.push(`/posts/${post.id}`)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 transition-colors"
            aria-label="보기"
          >
            <ChevronRight size={14} className="text-zinc-400" />
          </button>
        </div>
      </div>
    </article>
  )
}

// ─── 삭제 확인 ───────────────────────────────────────────────────────────────

function DeleteSheet({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full bg-white"
        style={{
          maxWidth: 680, borderTopLeftRadius: 32, borderTopRightRadius: 32,
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        <div className="flex justify-center pt-5 pb-1">
          <div className="w-10 h-1 bg-zinc-200 rounded-full" />
        </div>
        <div className="px-6 pt-4 pb-8">
          <div className="flex flex-col items-center gap-2 mb-6 text-center">
            <span className="text-3xl">🗑️</span>
            <h2 className="text-[18px] font-bold text-zinc-900">게시글을 삭제할까요?</h2>
            <p className="text-[13px] text-zinc-500">삭제하면 되돌릴 수 없어요.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onClose}
              className="h-12 rounded-full text-[14px] font-bold border border-zinc-200 text-zinc-600">
              취소
            </button>
            <button onClick={onConfirm}
              className="h-12 rounded-full text-[14px] font-bold text-white"
              style={{ backgroundColor: '#ef4444' }}>
              삭제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function MyPostsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [posts, setPosts] = useState<RecruitPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'fanmeet' | 'buddy'>('fanmeet')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [authLoading, user, router])

  useEffect(() => {
    if (authLoading || !user) return
    setIsLoading(true)
    getMyPosts().then((data) => {
      setPosts(data)
      setIsLoading(false)
    })
  }, [authLoading, user])

  const handleDelete = async () => {
    if (!deleteTargetId) return
    await deletePost(deleteTargetId)
    setPosts((prev) => prev.filter((p) => p.id !== deleteTargetId))
    setDeleteTargetId(null)
  }

  const filtered = posts.filter((p) => p.postType === activeTab)

  return (
    <>
      <TopAppBar showBack onBackClick={() => router.back()} title="내가 쓴 글" />

      <main className="pb-[128px] pt-6">
        {/* 탭 */}
        <div className="flex gap-6 px-6 mb-6">
          {(['fanmeet', 'buddy'] as const).map((tab) => {
            const label = tab === 'fanmeet' ? '덕메' : '비계친'
            const cnt = posts.filter((p) => p.postType === tab).length
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 pb-2 text-[15px] font-bold transition-colors"
                style={{
                  color: isActive ? '#18181b' : '#a1a1aa',
                  borderBottom: isActive ? '2px solid #18181b' : '2px solid transparent',
                }}
              >
                {label}
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: isActive ? '#18181b' : '#f4f4f5',
                    color: isActive ? '#fff' : '#a1a1aa',
                  }}
                >
                  {cnt}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-4 px-5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 rounded-[24px] bg-zinc-100 animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <span className="text-4xl">✍️</span>
              <p className="text-[16px] font-bold text-zinc-900">아직 쓴 글이 없어요</p>
              <p className="text-[13px] text-zinc-500">
                {activeTab === 'fanmeet' ? '덕메' : '비계친'} 모집글을 작성해보세요!
              </p>
              <button
                onClick={() => router.push(activeTab === 'fanmeet' ? '/posts/create/fan-meet' : '/posts/create/buddy')}
                className="mt-2 h-11 px-6 rounded-full text-[14px] font-bold text-white"
                style={{ backgroundColor: '#18181b' }}
              >
                글 작성하기
              </button>
            </div>
          ) : (
            filtered.map((post) => (
              <MyPostCard
                key={post.id}
                post={post}
                onEdit={(id) => router.push(`/posts/${id}/edit`)}
                onDelete={(id) => setDeleteTargetId(id)}
              />
            ))
          )}
        </div>
      </main>

      <BottomNavBar />

      {deleteTargetId && (
        <DeleteSheet
          onConfirm={handleDelete}
          onClose={() => setDeleteTargetId(null)}
        />
      )}
    </>
  )
}
