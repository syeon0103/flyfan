'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Send, Lock, RotateCcw, ArrowUp, Flag, Trash2, Pencil, X as XIcon } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import TopAppBar from '@/components/layout/TopAppBar'
import FandomIcon from '@/components/ui/FandomIcon'
import { useAuth } from '@/contexts/AuthContext'
import {
  getPostDetail,
  addComment,
  confirmMatching,
  cancelMatching,
  boostPost,
  submitReport,
  deletePost,
  updatePostStatus,
  type PostDetail,
  type Comment,
} from '@/lib/api'

// ─── 신고 팝업 ───────────────────────────────────────────────────────────────

const REPORT_REASONS = ['스팸', '괴롭힘', '개인정보 침해', '기타'] as const

interface ReportModalProps {
  postId: string
  onClose: () => void
}

function ReportModal({ postId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<string>('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const handleSubmit = async () => {
    if (!reason) return
    setIsSubmitting(true)
    try {
      await submitReport(postId, reason, description)
      setIsDone(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full bg-white overflow-hidden"
        style={{
          maxWidth: '680px',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        <div className="flex justify-center pt-5 pb-1">
          <div className="w-10 h-1 bg-zinc-200 rounded-full" />
        </div>

        <div className="px-6 pt-3 pb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[18px] font-bold text-zinc-900">신고하기</h2>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100">
              <XIcon size={16} className="text-zinc-500" />
            </button>
          </div>

          {isDone ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <span className="text-3xl">✅</span>
              <p className="text-[15px] font-bold text-zinc-900">신고가 접수되었어요</p>
              <p className="text-[13px] text-zinc-500 text-center">검토 후 적절한 조치를 취하겠습니다.</p>
              <button
                onClick={onClose}
                className="mt-3 h-11 px-8 rounded-full text-[14px] font-bold text-white"
                style={{ backgroundColor: '#18181b' }}
              >
                확인
              </button>
            </div>
          ) : (
            <>
              <p className="text-[13px] font-medium text-zinc-500 mb-4">신고 사유를 선택해주세요</p>
              <div className="flex flex-col gap-2 mb-5">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className="flex items-center gap-3 h-12 px-4 rounded-[14px] text-[14px] font-medium text-left transition-colors"
                    style={
                      reason === r
                        ? { backgroundColor: '#18181b', color: '#ffffff' }
                        : { backgroundColor: '#f4f4f5', color: '#3f3f46' }
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="추가 설명 (선택)"
                rows={3}
                className="w-full px-4 py-3 rounded-[14px] text-[13px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none resize-none mb-4"
                style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
              />

              <button
                onClick={handleSubmit}
                disabled={!reason || isSubmitting}
                className="w-full flex items-center justify-center h-12 rounded-full text-[14px] font-bold text-white disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: '#f43f5e' }}
              >
                {isSubmitting
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : '신고 제출'
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 삭제 확인 팝업 ───────────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  onConfirm: () => void
  onClose: () => void
  isDeleting: boolean
}

function DeleteConfirmModal({ onConfirm, onClose, isDeleting }: DeleteConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full bg-white overflow-hidden"
        style={{
          maxWidth: '680px',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
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
            <button
              onClick={onClose}
              className="h-12 rounded-full text-[14px] font-bold border border-zinc-200 text-zinc-600"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="h-12 rounded-full text-[14px] font-bold text-white disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: '#ef4444' }}
            >
              {isDeleting
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                : '삭제하기'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 마감 경고 모달 ───────────────────────────────────────────────────────────

interface CloseConfirmModalProps {
  onConfirm: () => void
  onClose: () => void
}

function CloseConfirmModal({ onConfirm, onClose }: CloseConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full bg-white overflow-hidden"
        style={{
          maxWidth: '680px',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        <div className="flex justify-center pt-5 pb-1">
          <div className="w-10 h-1 bg-zinc-200 rounded-full" />
        </div>
        <div className="px-6 pt-4 pb-8">
          <div className="flex flex-col items-center gap-2 mb-6 text-center">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-[18px] font-bold text-zinc-900">모집을 마감할까요?</h2>
            <p className="text-[13px] text-zinc-500 leading-[20px]">
              마감 후에는 다시 모집 중으로 변경할 수 없어요.<br />
              계속 진행하시겠어요?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="h-12 rounded-full text-[14px] font-bold border border-zinc-200 text-zinc-600"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="h-12 rounded-full text-[14px] font-bold text-white"
              style={{ backgroundColor: '#18181b' }}
            >
              마감하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 아바타 ──────────────────────────────────────────────────────────────────

interface AvatarProps {
  bg: string
  size?: number
  radius?: number
  emoji?: string        // 페르소나 이모지 (댓글 작성자용)
  idolColor?: string   // 아이돌 색상 (글 작성자용)
}

function Avatar({ bg, size = 40, radius = 12, emoji, idolColor }: AvatarProps) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg }}
      aria-hidden="true"
    >
      {emoji ? (
        <span style={{ fontSize: Math.round(size * 0.45) }}>{emoji}</span>
      ) : (
        <FandomIcon
          color={idolColor ?? 'rgba(255,255,255,0.7)'}
          size={Math.round(size * 0.4)}
        />
      )}
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
  postAuthorHandle: string
  currentUserHandle: string | null
  isPostMatching: boolean
  matchedCommentAuthorHandle?: string
  onMatchConfirm: (commentId: string) => void
  onKeepOpen: (commentId: string) => void
  onReply: (commentId: string, authorHandle: string) => void
  idolColor?: string
}

function CommentItem({
  comment,
  postId: _postId,
  postAuthorHandle,
  currentUserHandle,
  isPostMatching,
  matchedCommentAuthorHandle,
  onMatchConfirm,
  onKeepOpen,
  onReply,
  idolColor,
}: CommentItemProps) {
  const isSecretAndHidden =
    comment.isSecret &&
    currentUserHandle !== comment.authorHandle &&
    currentUserHandle !== postAuthorHandle

  return (
    <div className="flex gap-4 items-start">
      <Avatar bg={comment.avatarBg} size={40} radius={12} emoji={comment.personaEmoji} />

      <div className="flex flex-1 flex-col gap-[10px] items-end min-w-0">
        {/* 댓글 카드 */}
        <div
          className="bg-white border border-[#f4f4f5] rounded-[20px] flex flex-col gap-[3px] p-[21px] w-full"
          style={{ boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-zinc-900 leading-[20px]">
                {comment.authorHandle}
              </span>
              {comment.isSecret && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-zinc-400">
                  <Lock size={10} strokeWidth={2.5} />
                  비밀
                </span>
              )}
            </div>
            <span className="text-[11px] text-zinc-400 leading-[16.5px]">
              {comment.timestamp}
            </span>
          </div>
          <p className="text-[14px] text-zinc-600 leading-[22.75px]">
            {isSecretAndHidden
              ? '🔒 작성자와 글 작성자만 볼 수 있는 비밀 댓글이에요.'
              : comment.content}
          </p>
        </div>

        {/* 답글 달기 버튼 */}
        {!isPostMatching || comment.authorHandle === matchedCommentAuthorHandle || currentUserHandle === postAuthorHandle ? (
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => onReply(comment.id, comment.authorHandle)}
              className="text-[12px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
              aria-label="답글 달기"
            >
              답글 달기
            </button>
          </div>
        ) : null}

        {/* 답글 목록 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="relative flex flex-col gap-4 pl-8 pt-[10px] w-full">
            <div
              className="absolute left-3 bg-[#f4f4f5] w-px"
              style={{ top: '10px', bottom: '16px' }}
              aria-hidden="true"
            />

            {comment.replies.map((reply) => {
              const replySecretHidden =
                reply.isSecret &&
                currentUserHandle !== reply.authorHandle &&
                currentUserHandle !== postAuthorHandle

              return (
                <div key={reply.id} className="flex gap-3 items-start">
                  <Avatar bg={reply.avatarBg} size={32} radius={10} emoji={reply.personaEmoji} />
                  <div className="flex flex-1 flex-col gap-4 min-w-0">
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
                        {reply.isSecret && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-zinc-400">
                            <Lock size={10} strokeWidth={2.5} />
                            비밀
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] text-zinc-700 leading-[22.75px]">
                        {replySecretHidden
                          ? '🔒 작성자와 글 작성자만 볼 수 있는 비밀 댓글이에요.'
                          : reply.content}
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
              )
            })}
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
  const { profile: authProfile, user } = useAuth()

  const [post, setPost] = useState<PostDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSecret, setIsSecret] = useState(false)
  // 답글 대상 { commentId, authorHandle }
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; authorHandle: string } | null>(null)
  const [isBoosting, setIsBoosting] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [isStatusChanging, setIsStatusChanging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentUserHandle = authProfile?.handle ?? null

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

  // 답글 대상 클릭 시 input 포커스
  const handleReply = useCallback((commentId: string, authorHandle: string) => {
    setReplyTarget({ commentId, authorHandle })
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const cancelReply = useCallback(() => {
    setReplyTarget(null)
    setCommentText('')
    setIsSecret(false)
  }, [])

  const handleMatchConfirm = useCallback(async (commentId: string) => {
    if (!post) return
    const result = await confirmMatching(post.id, commentId)
    setPost((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        status: '매칭 중',
        matchedCommentId: commentId,
        matchedCommentAuthorHandle: result.matchedCommentAuthorHandle,
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

  const handleCancelMatching = useCallback(async () => {
    if (!post) return
    await cancelMatching(post.id)
    setPost((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        status: '모집 중',
        matchedCommentId: undefined,
        matchedCommentAuthorHandle: undefined,
        boostUsed: false,
      }
    })
  }, [post])

  const handleBoost = useCallback(async () => {
    if (!post || post.boostUsed) return
    setIsBoosting(true)
    try {
      await boostPost(post.id)
      setPost((prev) => prev ? { ...prev, boostUsed: true } : prev)
    } finally {
      setIsBoosting(false)
    }
  }, [post])

  const handleDelete = async () => {
    if (!post) return
    setIsDeleting(true)
    try {
      const result = await deletePost(post.id)
      if (result.success) {
        router.replace('/')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = useCallback(async (newStatus: '모집 중' | '매칭 중' | '매칭 완료') => {
    if (!post) return
    if (newStatus === '매칭 완료') {
      setShowCloseConfirm(true)
      return
    }
    setIsStatusChanging(true)
    try {
      const result = await updatePostStatus(post.id, newStatus)
      if (result.success) {
        setPost((prev) => prev ? { ...prev, status: newStatus } : prev)
      }
    } finally {
      setIsStatusChanging(false)
    }
  }, [post])

  const handleCloseConfirm = useCallback(async () => {
    if (!post) return
    setShowCloseConfirm(false)
    setIsStatusChanging(true)
    try {
      const result = await updatePostStatus(post.id, '매칭 완료')
      if (result.success) {
        setPost((prev) => prev ? { ...prev, status: '매칭 완료' } : prev)
      }
    } finally {
      setIsStatusChanging(false)
    }
  }, [post])

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !post) return
    setIsSubmitting(true)
    try {
      const isAuthorReplying =
        currentUserHandle === post.authorHandle && replyTarget !== null

      const newComment = await addComment(post.id, commentText, {
        parentId: replyTarget?.commentId,
        isSecret,
      })

      if (replyTarget) {
        // 답글로 추가
        setPost((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            comments: prev.comments.map((c) => {
              if (c.id === replyTarget.commentId) {
                const newReply = {
                  ...newComment,
                  isAuthor: currentUserHandle === post.authorHandle,
                  // 작성자가 답글을 달면 매칭 툴 표시
                  showMatchingTool: isAuthorReplying,
                }
                return {
                  ...c,
                  replies: [...(c.replies ?? []), newReply],
                }
              }
              return c
            }),
          }
        })
        setReplyTarget(null)
      } else {
        // 최상위 댓글로 추가
        setPost((prev) =>
          prev
            ? {
                ...prev,
                comments: [...prev.comments, newComment],
                commentCount: prev.commentCount + 1,
              }
            : prev
        )
      }

      setCommentText('')
      setIsSecret(false)
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

  const isLoggedIn = !!user
  const isPostAuthor = currentUserHandle === post?.authorHandle
  const isMatching = post?.status === '매칭 중'
  const canComment =
    isLoggedIn &&
    !(post?.isReported) &&
    (
      !isMatching ||
      isPostAuthor ||
      currentUserHandle === post?.matchedCommentAuthorHandle
    )

  const placeholder = replyTarget
    ? `@${replyTarget.authorHandle}에게 답글 쓰기...`
    : post
    ? `${post.authorHandle}님에게 댓글 쓰기...`
    : '댓글 쓰기...'

  return (
    <div className="relative min-h-screen bg-white">
      <TopAppBar showBack onBackClick={() => router.back()} showAvatar />

      <main className="pt-16 pb-[120px]">
        {isLoading || !post ? (
          <div className="flex flex-col gap-4 px-5 pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-[20px] bg-zinc-100 animate-pulse" aria-hidden="true" />
            ))}
          </div>
        ) : (
          <>
            {/* ── 포스트 헤더 ── */}
            <section className="px-5 pt-6 pb-0" aria-label="게시글 헤더">
              {/* 작성자 + 상태 뱃지 */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Avatar
                    bg={
                      post.postType === 'buddy'
                        ? '#f4f4f5'
                        : post.idolColor ? `${post.idolColor}18` : post.authorColor
                    }
                    idolColor={post.postType === 'buddy' ? undefined : post.idolColor}
                    emoji={post.authorPersonaEmoji}
                    size={48}
                    radius={14}
                  />
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

                {/* 상태 뱃지 + 신고 버튼 */}
                <div className="flex items-center gap-2 mt-1">
                  {post.isReported && (
                    <span
                      className="inline-flex items-center h-[28px] px-3 rounded-full text-[12px] font-bold"
                      style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
                    >
                      신고 접수 중
                    </span>
                  )}
                  {post.status === '매칭 중' && !post.isReported && (
                    <span
                      className="inline-flex items-center h-[28px] px-3 rounded-full text-[12px] font-bold"
                      style={{ backgroundColor: '#fef3c7', color: '#78350f' }}
                    >
                      매칭 중
                    </span>
                  )}
                  {isPostAuthor ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => router.push(`/posts/${post.id}/edit`)}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 transition-colors"
                        aria-label="게시글 수정"
                      >
                        <Pencil size={14} className="text-zinc-400" />
                      </button>
                      <button
                        onClick={() => setShowDelete(true)}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 transition-colors"
                        aria-label="게시글 삭제"
                      >
                        <Trash2 size={14} className="text-zinc-400" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReport(true)}
                      className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 transition-colors"
                      aria-label="신고하기"
                    >
                      <Flag size={15} className="text-zinc-400" />
                    </button>
                  )}
                </div>
              </div>

              <h1 className="text-[24px] font-bold text-zinc-900 leading-[30px] tracking-[-0.6px] mb-4">
                {post.title}
              </h1>

              <p className="text-[15px] text-zinc-500 leading-[24.4px] mb-6">{post.content}</p>

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

              {/* 작성자 상태 변경 바 */}
              {isPostAuthor && post.status !== '매칭 완료' && (
                <div
                  className="flex gap-2 mb-6 p-3 rounded-[18px]"
                  style={{ backgroundColor: '#fafafa', border: '1px solid #f4f4f5' }}
                >
                  <span className="text-[11px] font-bold text-zinc-400 self-center mr-1 shrink-0">상태</span>
                  {(['모집 중', '매칭 중', '매칭 완료'] as const).map((s) => {
                    const isActive = post.status === s
                    const label = s === '매칭 완료' ? '마감' : s
                    const activeStyle =
                      s === '모집 중'
                        ? { backgroundColor: '#dcfce7', color: '#15803d' }
                        : s === '매칭 중'
                        ? { backgroundColor: '#fef3c7', color: '#78350f' }
                        : { backgroundColor: '#18181b', color: '#ffffff' }
                    return (
                      <button
                        key={s}
                        onClick={() => !isStatusChanging && handleStatusChange(s)}
                        disabled={isStatusChanging}
                        aria-pressed={isActive}
                        className="flex-1 h-9 rounded-[12px] text-[12px] font-bold transition-all disabled:opacity-50"
                        style={
                          isActive
                            ? activeStyle
                            : { backgroundColor: 'transparent', color: '#a1a1aa' }
                        }
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* 매칭 중: 작성자에게 매칭 취소 + 끌어올리기 버튼 */}
              {post.status === '매칭 중' && isPostAuthor && (
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleCancelMatching}
                    className="flex items-center gap-2 h-[44px] px-5 rounded-full text-[13px] font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
                    aria-label="매칭 취소"
                  >
                    <RotateCcw size={14} strokeWidth={2.5} />
                    매칭 취소
                  </button>
                  {!post.boostUsed && (
                    <button
                      onClick={handleBoost}
                      disabled={isBoosting}
                      className="flex items-center gap-2 h-[44px] px-5 rounded-full text-[13px] font-bold text-white disabled:opacity-50 transition-opacity"
                      style={{ backgroundColor: '#18181b' }}
                      aria-label="끌어올리기"
                    >
                      <ArrowUp size={14} strokeWidth={2.5} />
                      {isBoosting ? '처리 중...' : '끌어올리기'}
                    </button>
                  )}
                </div>
              )}

              {/* 매칭 중: 다른 유저에게 안내 */}
              {post.status === '매칭 중' && !isPostAuthor && !canComment && (
                <div
                  className="flex items-center gap-2 mb-6 p-4 rounded-[16px] text-[13px] font-medium"
                  style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}
                >
                  <span>💬</span>
                  <span>현재 매칭 중이에요. 새 댓글을 달 수 없어요.</span>
                </div>
              )}
            </section>

            {/* ── 댓글 섹션 ── */}
            <section className="px-5" aria-label="댓글">
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

              <div className="flex flex-col gap-8" aria-live="polite">
                {post.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    postAuthorHandle={post.authorHandle}
                    currentUserHandle={currentUserHandle}
                    isPostMatching={isMatching}
                    matchedCommentAuthorHandle={post.matchedCommentAuthorHandle}
                    onMatchConfirm={handleMatchConfirm}
                    onKeepOpen={handleKeepOpen}
                    onReply={handleReply}
                    idolColor={post.idolColor}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* ── 하단 댓글 입력 바 ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-30 flex flex-col px-5 border-t border-[#fafafa]"
        style={{
          maxWidth: '680px',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.9)',
          paddingBottom: 'calc(17px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* 답글 대상 표시 */}
        {replyTarget && (
          <div className="flex items-center justify-between pt-3 pb-1">
            <span className="text-[12px] font-medium text-zinc-500">
              @{replyTarget.authorHandle}에게 답글 중
            </span>
            <button
              onClick={cancelReply}
              className="text-[12px] font-bold text-zinc-400 hover:text-zinc-700 transition-colors"
              aria-label="답글 취소"
            >
              취소
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 pt-[17px]">
          {!isLoggedIn ? (
            <button
              onClick={() => router.push('/login')}
              className="flex-1 flex items-center justify-center h-11 px-5 rounded-full text-[14px] font-bold text-white"
              style={{ backgroundColor: '#18181b' }}
            >
              로그인하고 댓글 달기
            </button>
          ) : canComment ? (
            <>
              <div
                className="flex-1 flex items-center gap-2 px-4 py-3 rounded-full"
                style={{ backgroundColor: '#f4f4f5' }}
              >
                {/* 비밀 댓글 토글 */}
                <button
                  onClick={() => setIsSecret((v) => !v)}
                  aria-label={isSecret ? '공개 댓글로 전환' : '비밀 댓글로 전환'}
                  aria-pressed={isSecret}
                  className="shrink-0"
                >
                  <Lock
                    size={15}
                    strokeWidth={2.5}
                    style={{ color: isSecret ? '#18181b' : '#a1a1aa' }}
                  />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  aria-label="댓글 입력"
                  className="flex-1 bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none leading-normal"
                />
              </div>

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
            </>
          ) : (
            <div
              className="flex-1 flex items-center gap-2 px-5 py-3 rounded-full text-[14px] text-zinc-400"
              style={{ backgroundColor: '#f4f4f5' }}
            >
              <Lock size={15} strokeWidth={2} className="text-zinc-300" />
              {post?.isReported ? '신고 접수 중인 게시글이에요.' : '매칭 중에는 댓글을 달 수 없어요.'}
            </div>
          )}
        </div>
      </div>

      {/* ── 신고 모달 ── */}
      {showReport && post && (
        <ReportModal postId={post.id} onClose={() => setShowReport(false)} />
      )}

      {/* ── 삭제 확인 모달 ── */}
      {showDelete && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onClose={() => setShowDelete(false)}
          isDeleting={isDeleting}
        />
      )}

      {/* ── 마감 확인 모달 ── */}
      {showCloseConfirm && (
        <CloseConfirmModal
          onConfirm={handleCloseConfirm}
          onClose={() => setShowCloseConfirm(false)}
        />
      )}
    </div>
  )
}
