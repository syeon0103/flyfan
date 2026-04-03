'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Heart, Send } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import FandomIcon from '@/components/ui/FandomIcon'
import {
  getPostDetail,
  addComment,
  toggleCommentLike,
  confirmMatching,
  type PostDetail,
  type Comment,
} from '@/lib/api'

// ─── 아바타 ──────────────────────────────────────────────────────────────────

interface AvatarProps {
  bg: string
  size?: number
  radius?: number
}

function Avatar({ bg, size = 40, radius = 12 }: AvatarProps) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg }}
      aria-hidden="true"
    >
      <FandomIcon color="rgba(255,255,255,0.7)" size={Math.round(size * 0.4)} />
    </div>
  )
}

// ─── 매칭 툴 카드 ─────────────────────────────────────────────────────────────

interface MatchingToolProps {
  commentId: string
  onConfirm: (commentId: string) => void
  onKeepOpen: (commentId: string) => void
  idolColor?: string
}

function MatchingTool({ commentId, onConfirm, onKeepOpen, idolColor = '#FFA33B' }: MatchingToolProps) {
  return (
    <div
      className="bg-white border border-[#f4f4f5] rounded-[20px] flex flex-col gap-5 p-[25px]"
      style={{ boxShadow: '0px 8px 30px 0px rgba(0,0,0,0.04)' }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full border border-[#f4f4f5] shrink-0"
          style={{ backgroundColor: '#fafafa' }}
          aria-hidden="true"
        >
          <FandomIcon color={idolColor} size={16} />
        </div>
        <span className="text-[15px] font-bold text-zinc-900 leading-[22.5px]">
          매칭을 진행하시겠습니까?
        </span>
      </div>

      {/* 버튼 2열 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onConfirm(commentId)}
          className="flex items-center justify-center h-[50px] rounded-full text-[14px] font-bold text-white"
          style={{ backgroundColor: '#18181b' }}
          aria-label="매칭 확정"
        >
          매칭 확정
        </button>
        <button
          onClick={() => onKeepOpen(commentId)}
          className="flex items-center justify-center h-[50px] rounded-full text-[14px] font-bold border border-[#18181b] bg-white text-zinc-900"
          aria-label="추가 모집"
        >
          추가 모집
        </button>
      </div>
    </div>
  )
}

// ─── 댓글 아이템 ──────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment
  postId: string
  onLike: (id: string) => void
  onMatchConfirm: (commentId: string) => void
  onKeepOpen: (commentId: string) => void
  idolColor?: string
}

function CommentItem({
  comment,
  postId: _postId,
  onLike,
  onMatchConfirm,
  onKeepOpen,
  idolColor,
}: CommentItemProps) {
  return (
    <div className="flex gap-4 items-start">
      <Avatar bg={comment.avatarBg} size={40} radius={12} />

      <div className="flex flex-1 flex-col gap-[10px] items-end min-w-0">
        {/* 댓글 카드 */}
        <div
          className="bg-white border border-[#f4f4f5] rounded-[20px] flex flex-col gap-[3px] p-[21px] w-full"
          style={{ boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)' }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-zinc-900 leading-[20px]">
              {comment.authorHandle}
            </span>
            <span className="text-[11px] text-zinc-400 leading-[16.5px]">
              {comment.timestamp}
            </span>
          </div>
          {/* 본문 */}
          <p className="text-[14px] text-zinc-600 leading-[22.75px]">{comment.content}</p>
        </div>

        {/* 좋아요 + 답글 달기 */}
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => onLike(comment.id)}
            className="flex items-center gap-1"
            aria-label={`좋아요 ${comment.likes}개`}
            aria-pressed={comment.isLiked}
          >
            <Heart
              size={12}
              strokeWidth={2.5}
              style={{
                color: comment.isLiked ? '#c17a3a' : '#a1a1aa',
                fill: comment.isLiked ? '#c17a3a' : 'none',
              }}
            />
            <span
              className="text-[12px] font-bold"
              style={{ color: comment.isLiked ? '#c17a3a' : '#a1a1aa' }}
            >
              {comment.likes}
            </span>
          </button>
          <button
            className="text-[12px] font-bold text-zinc-400"
            aria-label="답글 달기"
          >
            답글 달기
          </button>
        </div>

        {/* 작성자 답글 + 매칭 툴 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="relative flex flex-col gap-4 pl-8 pt-[10px] w-full">
            {/* 세로 구분선 */}
            <div
              className="absolute left-3 bg-[#f4f4f5] w-px"
              style={{ top: '10px', bottom: '16px' }}
              aria-hidden="true"
            />

            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-3 items-start">
                <Avatar bg={reply.avatarBg} size={32} radius={10} />
                <div className="flex flex-1 flex-col gap-4 min-w-0">
                  {/* 답글 카드 */}
                  <div
                    className="flex flex-col gap-1 p-[17px] rounded-[20px] border border-[#f4f4f5] w-full"
                    style={{ backgroundColor: '#fafafa' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-zinc-900 leading-[20px]">
                        {reply.authorHandle}
                      </span>
                      {reply.isAuthor && (
                        <span
                          className="text-[10px] font-bold leading-[15px]"
                          style={{ color: '#c17a3a' }}
                        >
                          작성자
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] text-zinc-700 leading-[22.75px]">
                      {reply.content}
                    </p>
                  </div>

                  {/* 매칭 툴 */}
                  {reply.showMatchingTool && (
                    <MatchingTool
                      commentId={comment.id}
                      onConfirm={onMatchConfirm}
                      onKeepOpen={onKeepOpen}
                      idolColor={idolColor}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 페이지 ──────────────────────────────────────────────────────────────────

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params?.id as string
  const [post, setPost] = useState<PostDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!postId) return
    async function load() {
      setIsLoading(true)
      try {
        const data = await getPostDetail(postId)
        setPost(data)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [postId])

  const handleLike = useCallback(async (commentId: string) => {
    setPost((prev) => {
      if (!prev) return prev
      const updateComments = (comments: Comment[]): Comment[] =>
        comments.map((c) => {
          if (c.id === commentId) {
            return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
          }
          if (c.replies) return { ...c, replies: updateComments(c.replies) }
          return c
        })
      return { ...prev, comments: updateComments(prev.comments) }
    })
    await toggleCommentLike(commentId)
  }, [])

  const handleMatchConfirm = useCallback(async (commentId: string) => {
    if (!post) return
    await confirmMatching(post.id, commentId)
    setPost((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === commentId
            ? { ...c, replies: c.replies?.map((r) => ({ ...r, showMatchingTool: false })) }
            : c
        ),
      }
    })
  }, [post])

  const handleKeepOpen = useCallback((commentId: string) => {
    setPost((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === commentId
            ? { ...c, replies: c.replies?.map((r) => ({ ...r, showMatchingTool: false })) }
            : c
        ),
      }
    })
  }, [])

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !post) return
    setIsSubmitting(true)
    try {
      const newComment = await addComment(post.id, commentText)
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, newComment],
              commentCount: prev.commentCount + 1,
            }
          : prev
      )
      setCommentText('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCommentSubmit()
    }
  }

  // 아이돌 색상 (mock: 뉴진스 = 파랑)
  const idolColor = '#60a5fa'

  return (
    <div className="relative min-h-screen bg-white">
      <TopAppBar showBack onBackClick={() => router.back()} showAvatar />

      <main className="pt-16 pb-[96px]">
        {isLoading || !post ? (
          /* ── 스켈레톤 ── */
          <div className="flex flex-col gap-4 px-5 pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-[20px] bg-zinc-100 animate-pulse" aria-hidden="true" />
            ))}
          </div>
        ) : (
          <>
            {/* ── 포스트 헤더 ── */}
            <section className="px-5 pt-6 pb-0" aria-label="게시글 헤더">
              {/* 작성자 */}
              <div className="flex items-center gap-3 mb-5">
                <Avatar bg={post.authorColor} size={48} radius={14} />
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px] font-bold text-zinc-900 leading-[28px]">
                      {post.authorHandle}
                    </span>
                    <span
                      className="inline-flex items-center h-[21px] px-2 rounded-full text-[11px] font-bold"
                      style={{ backgroundColor: '#f4f4f5', color: '#52525b' }}
                    >
                      작성자
                    </span>
                  </div>
                  <span className="text-[12px] text-zinc-500 leading-[16px]">
                    {post.timestamp} • {post.category}
                  </span>
                </div>
              </div>

              {/* 제목 */}
              <h1 className="text-[24px] font-bold text-zinc-900 leading-[30px] tracking-[-0.6px] mb-4">
                {post.title}
              </h1>

              {/* 본문 */}
              <p className="text-[15px] text-zinc-500 leading-[24.4px] mb-6">{post.content}</p>

              {/* 위치/날짜/팬덤 태그 */}
              <div className="flex flex-wrap gap-2 pb-6">
                {[post.locationTag, post.dateTag, post.fandomTag].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center h-[38px] px-[17px] rounded-full text-[14px] font-semibold border border-[#f4f4f5]"
                    style={{ backgroundColor: '#fafafa', color: '#3f3f46' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* ── 댓글 섹션 ── */}
            <section className="px-5" aria-label="댓글">
              {/* 헤더 */}
              <div
                className="flex items-center justify-between pt-[25px] mb-8"
                style={{ borderTop: '1px solid #f4f4f5' }}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[18px] font-bold text-zinc-900 leading-[28px]">댓글</span>
                  <span className="text-[18px] font-bold leading-[28px]" style={{ color: '#a1a1aa' }}>
                    {post.commentCount}
                  </span>
                </div>
                <button
                  className="flex items-center gap-1 text-[14px] font-medium text-zinc-500"
                  aria-label="정렬 기준 변경"
                >
                  최신순
                  <svg width="7" height="5" viewBox="0 0 7 5" fill="none" aria-hidden="true">
                    <path d="M3.5 4.5L0.5 0.5H6.5L3.5 4.5Z" fill="#71717a" />
                  </svg>
                </button>
              </div>

              {/* 댓글 목록 */}
              <div className="flex flex-col gap-8" aria-live="polite">
                {post.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    onLike={handleLike}
                    onMatchConfirm={handleMatchConfirm}
                    onKeepOpen={handleKeepOpen}
                    idolColor={idolColor}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* ── 하단 댓글 입력 바 ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-30 flex items-center gap-3 px-5 py-[17px] border-t border-[#fafafa]"
        style={{
          maxWidth: '680px',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.9)',
          paddingBottom: 'calc(17px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* 댓글 입력 */}
        <div
          className="flex-1 flex items-center gap-3 px-5 py-3 rounded-full"
          style={{ backgroundColor: '#f4f4f5' }}
        >
          <FandomIcon color="#a1a1aa" size={17} />
          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={post ? `${post.authorHandle}님에게 댓글 쓰기...` : '댓글 쓰기...'}
            aria-label="댓글 입력"
            className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none leading-normal"
          />
        </div>

        {/* 전송 버튼 */}
        <button
          onClick={handleCommentSubmit}
          disabled={!commentText.trim() || isSubmitting}
          className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 disabled:opacity-40 transition-opacity"
          style={{
            backgroundColor: '#18181b',
            boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
          }}
          aria-label="댓글 등록"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={14} className="text-white" strokeWidth={2.5} style={{ marginLeft: 1 }} />
          )}
        </button>
      </div>
    </div>
  )
}
