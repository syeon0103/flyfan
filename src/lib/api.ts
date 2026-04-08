/**
 * flyfan API layer
 *
 * Supabase가 .env.local에 설정되면 실제 DB를 사용하고,
 * 설정되지 않으면 mock 데이터로 동작합니다.
 */

import { supabase, isSupabaseConfigured } from './supabase'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TagItem {
  label: string
  bg: string
  color: string
}

export interface Idol {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface RecruitPost {
  id: string
  postType: 'fanmeet' | 'buddy'
  idolId: string | null
  idolName: string
  idolColor: string
  authorHandle: string
  authorPersonaEmoji?: string   // 비계친 글 작성자의 활성 페르소나 이모지
  status: '모집 중' | '매칭 중' | '매칭 완료'
  dday: string
  ddayColor: string
  title: string
  tags: TagItem[]
  timestamp: string
  isActive: boolean
  isReported?: boolean
  isSaved?: boolean
}

export interface SavedPost {
  id: string
  authorHandle: string
  avatarBg: string
  savedAt: string
  categoryTags: TagItem[]
  content: string
  tab: 'fanmeet' | 'buddy'
}

export interface ReportItem {
  id: string
  reporter: string
  reason: string
  reasonCode: 'spam' | 'harassment' | 'privacy' | 'other'
  summary: string
  status: '대기 중' | '검토 완료' | '처리 완료'
  timestamp: string
}

export interface ReportStats {
  pending: number
  pendingDelta: number
  total: number
  processingRate: number
  activeAdmins: number
}

export interface Keyword {
  id: string
  label: string
  bg: string
  color: string
  isSelected: boolean
  isRecommended: boolean
}

export interface Comment {
  id: string
  authorHandle: string
  avatarBg: string
  isAuthor?: boolean
  content: string
  likes: number
  isLiked: boolean
  timestamp: string
  replies?: Comment[]
  showMatchingTool?: boolean
  isSecret?: boolean
  personaEmoji?: string
}

export interface PostDetail {
  id: string
  postType: 'fanmeet' | 'buddy'
  authorHandle: string
  authorColor: string
  authorPersonaEmoji?: string
  timestamp: string
  category: string
  title: string
  content: string
  locationTag: string
  dateTag: string
  fandomTag: string
  commentCount: number
  comments: Comment[]
  status: '모집 중' | '매칭 중' | '매칭 완료'
  matchedCommentId?: string
  matchedCommentAuthorHandle?: string
  boostUsed?: boolean
  idolColor?: string
  isReported?: boolean
  // 편집용 원본 필드
  rawRegion?: string
  rawDate?: string
  rawIdolName?: string
  rawRequirements?: string[]
}

export interface PersonaSlot {
  id: string
  emoji: string
  name: string
  fandom: string
  isActive: boolean
  isEmpty?: boolean
}

export interface TimelineItem {
  id: string
  emoji: string
  title: string
  date: string
  description: string
  isFeatured: boolean
}

export interface ProfileSettings {
  handle: string
  level: number
  fandom: string
  personaSlots: PersonaSlot[]
  favoriteIdol: string
  mbti: string
  keywords: string[]
  timeline: TimelineItem[]
  safeZoneTags: string[]
}

export interface Notification {
  id: string
  type: 'comment' | 'reply'
  postId: string
  postTitle: string
  commenterHandle: string
  commenterPersonaEmoji?: string
  content: string
  timestamp: string
  isRead: boolean
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockIdols: Idol[] = [
  { id: '1', name: 'NewJeans',   color: '#60a5fa', createdAt: '' },
  { id: '2', name: 'IVE',        color: '#f43f5e', createdAt: '' },
  { id: '3', name: 'aespa',      color: '#8b5cf6', createdAt: '' },
  { id: '4', name: 'BLACKPINK',  color: '#ec4899', createdAt: '' },
  { id: '5', name: 'BTS',        color: '#6366f1', createdAt: '' },
  { id: '6', name: 'Stray Kids', color: '#FFA33B', createdAt: '' },
  { id: '7', name: 'TWICE',      color: '#fb923c', createdAt: '' },
  { id: '8', name: 'EXO',        color: '#14b8a6', createdAt: '' },
]

const mockRecruitPosts: RecruitPost[] = [
  {
    id: '1',
    postType: 'fanmeet',
    idolId: '1',
    idolName: 'NewJeans',
    idolColor: '#60a5fa',
    authorHandle: '하니_러브',
    status: '모집 중',
    dday: 'D-3',
    ddayColor: '#f43f5e',
    title: '뉴진스 콘서트 같이 가실 분! 🐰',
    tags: [
      { label: 'NewJeans', bg: '#60a5fa22', color: '#60a5fa' },
      { label: '서울 송파구', bg: '#dbeafe', color: '#1d4ed8' },
      { label: '20대 초반', bg: '#d1fae5', color: '#047857' },
    ],
    timestamp: '방금 전',
    isActive: true,
  },
  {
    id: '2',
    postType: 'fanmeet',
    idolId: '2',
    idolName: 'IVE',
    idolColor: '#f43f5e',
    authorHandle: 'Moonlight_Stay',
    status: '매칭 완료',
    dday: 'D-Day',
    ddayColor: '#a1a1aa',
    title: '아이브 럭키드로우 홍대 투어 🍓',
    tags: [
      { label: 'IVE', bg: '#f43f5e22', color: '#f43f5e' },
      { label: '서울 마포구', bg: '#ffedd5', color: '#c2410c' },
      { label: '20대 후반', bg: '#ccfbf1', color: '#0f766e' },
    ],
    timestamp: '2시간 전',
    isActive: false,
  },
  {
    id: '3',
    postType: 'fanmeet',
    idolId: null,
    idolName: 'NCT DREAM',
    idolColor: '#10b981',
    authorHandle: '드림_러버',
    status: '모집 중',
    dday: 'D-12',
    ddayColor: '#f43f5e',
    title: 'NCT DREAM 앵콜 콘서트 💚',
    tags: [
      { label: 'NCT DREAM', bg: '#10b98122', color: '#10b981' },
      { label: '전국', bg: '#f4f4f5', color: '#3f3f46' },
      { label: '연령무관', bg: '#e0f2fe', color: '#0369a1' },
    ],
    timestamp: '15분 전',
    isActive: true,
  },
  {
    id: '4',
    postType: 'buddy',
    idolId: null,
    idolName: '',
    idolColor: '#a1a1aa',
    authorHandle: 'Moonlight_Stay',
    authorPersonaEmoji: '🌙',
    status: '모집 중',
    dday: 'D-7',
    ddayColor: '#f43f5e',
    title: '직캠 교환 & 앨범 개봉 같이 할 비계친 구해요',
    tags: [
      { label: '서울/경기', bg: '#f4f4f5', color: '#3f3f46' },
      { label: '9n', bg: '#e0f2fe', color: '#0369a1' },
      { label: '직캠교환', bg: '#f4f4f5', color: '#3f3f46' },
    ],
    timestamp: '30분 전',
    isActive: true,
  },
]

const mockSavedPosts: SavedPost[] = [
  {
    id: '1',
    authorHandle: 'Gemstone_07',
    avatarBg: '#eff6ff',
    savedAt: '2시간 전 저장됨',
    categoryTags: [
      { label: '🎫 콘서트', bg: '#eef2ff', color: '#4338ca' },
      { label: '서울', bg: '#eff6ff', color: '#1d4ed8' },
    ],
    content: '이번 월드 투어 같이 갈 덕메 구해요! 플로어 구역 티켓 한 장 여유 있어요.',
    tab: 'fanmeet',
  },
  {
    id: '2',
    authorHandle: 'StarCollector_',
    avatarBg: '#fff1f2',
    savedAt: '어제 저장됨',
    categoryTags: [{ label: '☕️ 카페 투어', bg: '#fff1f2', color: '#be123c' }],
    content: '홍대 근처 생일 카페 이벤트 너무 예뻤어요. 포토카드 세트 퀄리티 대박...',
    tab: 'fanmeet',
  },
  {
    id: '3',
    authorHandle: 'Winter_Breeze',
    avatarBg: '#ecfdf5',
    savedAt: '3일 전 저장됨',
    categoryTags: [{ label: '💿 언박싱', bg: '#f4f4f5', color: '#3f3f46' }],
    content: '드디어 시즌 그리팅 패키지 도착! 컨셉 포토 진짜 미쳤어요...',
    tab: 'buddy',
  },
]

const mockReportStats: ReportStats = {
  pending: 24, pendingDelta: 5, total: 1042, processingRate: 89, activeAdmins: 12,
}

const mockReportItems: ReportItem[] = [
  {
    id: '1', reporter: '@jimin_fan92', reason: '스팸', reasonCode: 'spam',
    summary: '"굿즈 저렴하게 파는 상점 확인해보…', status: '대기 중', timestamp: '2분 전',
  },
  {
    id: '2', reporter: '@kpop_editor', reason: '괴롭힘', reasonCode: 'harassment',
    summary: '"이 멤버는 그룹에 있을 자격이 없…', status: '검토 완료', timestamp: '45분 전',
  },
  {
    id: '3', reporter: '@StarCollector_', reason: '개인정보 침해', reasonCode: 'privacy',
    summary: '"다른 팬 실명이랑 학교를 공개했어요…', status: '대기 중', timestamp: '1시간 전',
  },
  {
    id: '4', reporter: '@Winter_Breeze', reason: '스팸', reasonCode: 'spam',
    summary: '"같은 내용 하루에 10번 올림…', status: '처리 완료', timestamp: '3시간 전',
  },
]

const mockKeywords: Keyword[] = [
  { id: '1', label: '남성 사절',      bg: '#fff7ed', color: '#c2410c', isSelected: true,  isRecommended: true },
  { id: '2', label: '사진 촬영 금지', bg: '#eff6ff', color: '#1d4ed8', isSelected: false, isRecommended: true },
  { id: '3', label: '☕️ 카페 투어',  bg: '#fff1f2', color: '#be123c', isSelected: true,  isRecommended: true },
  { id: '4', label: '콘서트 전용',    bg: '#ecfdf5', color: '#047857', isSelected: false, isRecommended: true },
  { id: '5', label: '🎫 오프라인',    bg: '#eef2ff', color: '#4338ca', isSelected: false, isRecommended: true },
  { id: '6', label: '🥤 컵홀더',     bg: '#fffbeb', color: '#b45309', isSelected: false, isRecommended: true },
  { id: '7', label: '여성 전용',      bg: '#faf5ff', color: '#7e22ce', isSelected: false, isRecommended: true },
  { id: '8', label: '안전한 만남',    bg: '#f4f4f5', color: '#3f3f46', isSelected: false, isRecommended: false },
  { id: '9', label: '인증된 팬',      bg: '#f4f4f5', color: '#3f3f46', isSelected: false, isRecommended: false },
]

const mockPostDetail: PostDetail = {
  id: '1',
  postType: 'fanmeet',
  authorHandle: '하니_러브',
  authorColor: '#c17a3a',
  idolColor: '#60a5fa',
  timestamp: '2시간 전',
  category: '뉴진스 콘서트',
  title: '버니캠프 혼자 가시나요? 같이 가요! 🎫',
  content: '둘째 날 티켓이 한 장 남았어요. 하니를 좋아하고 처음부터 끝까지 콘서트를 온전히 즐기고 싶으신 분을 찾습니다! 공연 전 커피 한 잔은 필수예요. ☕️',
  locationTag: '📍 도쿄돔',
  dateTag: '📅 7월 15일',
  fandomTag: '💎 뉴진스',
  rawRegion: '서울/경기',
  rawDate: '2024-07-15',
  rawIdolName: 'NewJeans',
  rawRequirements: ['여성만', '콘서트광'],
  commentCount: 12,
  status: '모집 중',
  matchedCommentId: undefined,
  matchedCommentAuthorHandle: undefined,
  boostUsed: false,
  comments: [
    {
      id: 'c1', authorHandle: '민지_광팬_98', avatarBg: '#f4f4f5',
      personaEmoji: '🌸',
      content: '저도 둘째 날 가요! 같이 가고 싶어요. 데뷔 때부터 팬이었고 응원봉도 준비 완료! ✨',
      likes: 4, isLiked: true, timestamp: '45분 전',
      replies: [
        {
          id: 'r1', authorHandle: '하니_러브', avatarBg: '#c17a3a', isAuthor: true,
          personaEmoji: '💎',
          content: '정말 좋네요! 혹시 특별 한정판 커버도 챙겨오시나요?',
          likes: 0, isLiked: false, timestamp: '30분 전', showMatchingTool: false,
        },
      ],
    },
    {
      id: 'c2', authorHandle: '하입보이_제이', avatarBg: '#f4f4f5',
      personaEmoji: '⭐',
      content: '혹시 티켓 아직 남아있나요? 이거 보러 한국에서 날아가는 중이에요!',
      likes: 0, isLiked: false, timestamp: '1시간 전',
    },
  ],
}

const mockProfile: ProfileSettings = {
  handle: 'Moonlight_Stay',
  level: 4,
  fandom: 'Stay | Stray Kids 팬',
  personaSlots: [
    { id: '1', emoji: '💎', name: 'Moonlight_Stay', fandom: 'Stray Kids', isActive: true },
    { id: '2', emoji: '🌸', name: 'Cherry_Blossom', fandom: 'aespa',       isActive: false },
    { id: '3', emoji: '⭐', name: 'StarDust_',      fandom: 'NewJeans',    isActive: false },
    { id: '4', emoji: '🔮', name: 'Crystal_Fan',    fandom: 'IVE',         isActive: false },
    { id: '5', emoji: '',  name: '',               fandom: '',            isActive: false, isEmpty: true },
  ],
  favoriteIdol: '방찬',
  mbti: 'INFP',
  keywords: ['덕질24시간', '콘서트광', '사진덕'],
  timeline: [
    {
      id: 't1', emoji: '🎫', title: '뉴진스 버니캠프 도쿄돔', date: '2024.07.15',
      description: '첫 해외 직캠! 하니 직캠 퀄리티 역대급이었음 💎', isFeatured: true,
    },
    {
      id: 't2', emoji: '💿', title: '앨범 언박싱 모임', date: '2024.05.20',
      description: '팬들과 함께한 언박싱 파티', isFeatured: false,
    },
  ],
  safeZoneTags: ['#커플링', '#타팬덤언급', '#유출본'],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return '방금 전'
  if (m < 60)  return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

// ─── Mock Notifications ──────────────────────────────────────────────────────

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'comment',
    postId: '1',
    postTitle: '뉴진스 콘서트 같이 가실 분! 🐰',
    commenterHandle: '민지_광팬_98',
    commenterPersonaEmoji: '🌸',
    content: '저도 둘째 날 가요! 같이 가고 싶어요. 데뷔 때부터 팬이었고 응원봉도 준비 완료! ✨',
    timestamp: '5분 전',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'reply',
    postId: '1',
    postTitle: '뉴진스 콘서트 같이 가실 분! 🐰',
    commenterHandle: '하입보이_제이',
    commenterPersonaEmoji: '⭐',
    content: '저도 관심 있어요! 혹시 티켓 아직 남아있나요?',
    timestamp: '1시간 전',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'comment',
    postId: '3',
    postTitle: 'NCT DREAM 앵콜 콘서트 💚',
    commenterHandle: 'kpop_lover92',
    commenterPersonaEmoji: '💫',
    content: '안녕하세요! 저도 NCT DREAM 팬인데 같이 가고 싶어요 :)',
    timestamp: '3시간 전',
    isRead: true,
  },
  {
    id: 'n4',
    type: 'comment',
    postId: '1',
    postTitle: '뉴진스 콘서트 같이 가실 분! 🐰',
    commenterHandle: 'bunny_love',
    commenterPersonaEmoji: '🐇',
    content: '저 21살인데 혹시 연령 괜찮을까요? 콘서트 너무 기대돼요!!',
    timestamp: '어제',
    isRead: true,
  },
  {
    id: 'n5',
    type: 'reply',
    postId: '3',
    postTitle: 'NCT DREAM 앵콜 콘서트 💚',
    commenterHandle: 'dream_catcher99',
    commenterPersonaEmoji: '🌙',
    content: '혹시 지방에서 오시는 분들 있나요? 같이 KTX 타고 가요!',
    timestamp: '2일 전',
    isRead: true,
  },
]

// ─── 아티스트 추가 요청 ───────────────────────────────────────────────────────

/** 아티스트 추가 요청 제출 */
export async function requestArtist(name: string, reason: string): Promise<{ success: boolean; isDuplicate: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(300)
    // mock: 이미 등록된 아이돌인지 확인
    const exists = mockIdols.some((i) => i.name.toLowerCase() === name.toLowerCase())
    if (exists) return { success: false, isDuplicate: true }
    return { success: true, isDuplicate: false }
  }
  // 이미 등록된 아이돌인지 확인
  const { data: existing } = await supabase
    .from('idols')
    .select('id')
    .ilike('name', name)
    .single()
  if (existing) return { success: false, isDuplicate: true }

  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('artist_requests')
    .insert({
      name,
      reason,
      requested_by: user?.id ?? null,
      status: '대기중',
    })
  return { success: !error, isDuplicate: false }
}

// ─── 페르소나 / 알림 ─────────────────────────────────────────────────────────

/** 현재 활성 페르소나 이모지 조회 */
export async function getActivePersonaEmoji(): Promise<string | null> {
  if (!isSupabaseConfigured) {
    await delay(50)
    const active = mockProfile.personaSlots.find((s) => s.isActive && !s.isEmpty)
    return active?.emoji ?? null
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('persona_slots')
    .select('emoji')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  return data?.emoji ?? null
}

/** 알림 목록 조회 (댓글 최신순) */
export async function getNotifications(): Promise<Notification[]> {
  if (!isSupabaseConfigured) {
    await delay(150)
    return [...mockNotifications]
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // 내가 작성한 게시글에 달린 댓글을 알림으로 조회
  const { data } = await supabase
    .from('comments')
    .select('id, content, created_at, persona_emoji, post_id, profiles(handle), recruit_posts(title)')
    .eq('recruit_posts.author_id', user.id)
    .neq('profiles.id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  if (!data) return []
  return data.map((row: any, i: number) => ({
    id: row.id,
    type: 'comment' as const,
    postId: row.post_id,
    postTitle: row.recruit_posts?.title ?? '게시글',
    commenterHandle: row.profiles?.handle ?? '익명',
    commenterPersonaEmoji: row.persona_emoji ?? undefined,
    content: row.content,
    timestamp: relativeTime(row.created_at),
    isRead: i > 2, // mock: 최근 3개는 안읽음
  }))
}

/** 알림 읽음 처리 */
export async function markNotificationsRead(): Promise<void> {
  if (!isSupabaseConfigured) {
    mockNotifications.forEach((n) => { n.isRead = true })
    return
  }
  // 실제 구현 시 notifications 테이블 업데이트
}

// ─── 아이돌 CRUD ─────────────────────────────────────────────────────────────

/** 아이돌 목록 조회 */
export async function getIdols(): Promise<Idol[]> {
  if (!isSupabaseConfigured) {
    await delay(100)
    return mockIdols
  }
  const { data, error } = await supabase
    .from('idols')
    .select('*')
    .order('name')
  if (error || !data) return mockIdols
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
  }))
}

/** 아이돌 등록 */
export async function createIdol(name: string, color: string): Promise<Idol> {
  if (!isSupabaseConfigured) {
    await delay(200)
    const idol: Idol = { id: `mock_${Date.now()}`, name, color, createdAt: new Date().toISOString() }
    mockIdols.push(idol)
    return idol
  }
  const { data, error } = await supabase
    .from('idols')
    .insert({ name, color })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? '아이돌 등록 실패')
  return { id: data.id, name: data.name, color: data.color, createdAt: data.created_at }
}

/** 아이돌 수정 */
export async function updateIdol(id: string, name: string, color: string): Promise<Idol> {
  if (!isSupabaseConfigured) {
    await delay(200)
    const idx = mockIdols.findIndex((i) => i.id === id)
    if (idx !== -1) mockIdols[idx] = { ...mockIdols[idx], name, color }
    return mockIdols[idx]
  }
  const { data, error } = await supabase
    .from('idols')
    .update({ name, color })
    .eq('id', id)
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? '아이돌 수정 실패')
  return { id: data.id, name: data.name, color: data.color, createdAt: data.created_at }
}

/** 아이돌 삭제 */
export async function deleteIdol(id: string): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(150)
    const idx = mockIdols.findIndex((i) => i.id === id)
    if (idx !== -1) mockIdols.splice(idx, 1)
    return { success: true }
  }
  const { error } = await supabase.from('idols').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

// ─── 모집 게시글 ─────────────────────────────────────────────────────────────

/** 홈 모집글 목록 */
export async function getRecruitPosts(
  tab: 'fanmeet' | 'buddy' = 'fanmeet',
  _filters: string[] = []
): Promise<RecruitPost[]> {
  if (!isSupabaseConfigured) {
    await delay(100)
    return mockRecruitPosts.filter((p) => p.postType === tab)
  }

  const { data: { user } } = await supabase.auth.getUser()
  const [postsResult, savedResult] = await Promise.all([
    supabase
      .from('recruit_posts')
      .select('*, idols(id, name, color), profiles(handle, avatar_color)')
      .eq('type', tab)
      .order('created_at', { ascending: false })
      .limit(20),
    user
      ? supabase.from('saved_posts').select('post_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])
  const { data, error } = postsResult
  const savedIds = new Set((savedResult.data ?? []).map((s: any) => s.post_id))
  if (error) {
    console.error('[getRecruitPosts] Supabase error:', error.message)
    return []
  }
  if (!data || data.length === 0) return []

  return data.map((row: any) => {
    const idol = row.idols as { id: string; name: string; color: string } | null
    const profile = row.profiles as { handle: string; avatar_color: string } | null
    const deadline = row.deadline ? new Date(row.deadline) : null
    const now = new Date()
    let dday = '모집 중'
    let ddayColor = '#3f3f46'
    if (deadline) {
      const diff = Math.ceil((deadline.getTime() - now.getTime()) / 86400000)
      if (diff > 0) { dday = `D-${diff}`; ddayColor = '#f43f5e' }
      else if (diff === 0) { dday = 'D-Day'; ddayColor = '#f43f5e' }
      else { dday = '마감'; ddayColor = '#a1a1aa' }
    }
    return {
      id: row.id,
      postType: (row.type as 'fanmeet' | 'buddy') ?? 'fanmeet',
      idolId: idol?.id ?? null,
      idolName: idol?.name ?? '',
      idolColor: idol?.color ?? '#a1a1aa',
      authorHandle: profile?.handle ?? '익명',
      authorPersonaEmoji: tab === 'buddy' ? (row.author_persona_emoji ?? undefined) : undefined,
      status: row.status as '모집 중' | '매칭 중' | '매칭 완료',
      dday,
      ddayColor,
      title: row.title,
      tags: Array.isArray(row.tags) ? row.tags : [],
      timestamp: relativeTime(row.created_at),
      isActive: row.status === '모집 중',
      isReported: row.is_reported ?? false,
      isSaved: savedIds.has(row.id),
    }
  })
}

/** 모집글 삭제 (작성자 본인만) */
export async function deletePost(postId: string): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(200)
    const idx = mockRecruitPosts.findIndex((p) => p.id === postId)
    if (idx !== -1) mockRecruitPosts.splice(idx, 1)
    return { success: true }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const { error } = await supabase
    .from('recruit_posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id)
  return { success: !error }
}

/** 모집글 수정 (작성자 본인만) */
export async function updatePost(
  postId: string,
  data: {
    title: string
    content: string
    region?: string
    date?: string
    requirements?: string[]
    idolName?: string
  }
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(200)
    // mock 업데이트
    const idx = mockRecruitPosts.findIndex((p) => p.id === postId)
    if (idx !== -1) mockRecruitPosts[idx].title = data.title
    if (mockPostDetail.id === postId) {
      mockPostDetail.title = data.title
      mockPostDetail.content = data.content
      if (data.region) mockPostDetail.locationTag = `📍 ${data.region}`
      if (data.date) mockPostDetail.dateTag = `📅 ${data.date}`
      mockPostDetail.rawRegion = data.region
      mockPostDetail.rawDate = data.date
      mockPostDetail.rawRequirements = data.requirements
    }
    return { success: true }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  let idolId: string | null | undefined
  if (data.idolName) {
    const { data: idolRow } = await supabase
      .from('idols').select('id').eq('name', data.idolName).single()
    idolId = idolRow?.id ?? null
  }

  const updatePayload: Record<string, unknown> = {
    title: data.title,
    content: data.content,
    updated_at: new Date().toISOString(),
  }
  if (data.region !== undefined) updatePayload.region = data.region
  if (data.date !== undefined) updatePayload.event_date = data.date || null
  if (data.requirements !== undefined) updatePayload.requirements = data.requirements
  if (idolId !== undefined) updatePayload.idol_id = idolId

  const { error } = await supabase
    .from('recruit_posts')
    .update(updatePayload)
    .eq('id', postId)
    .eq('author_id', user.id)
  return { success: !error }
}

/** 내가 쓴 모집글 목록 */
export async function getMyPosts(): Promise<RecruitPost[]> {
  if (!isSupabaseConfigured) {
    await delay(100)
    return mockRecruitPosts.filter((p) => p.authorHandle === mockProfile.handle)
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('recruit_posts')
    .select('*, idols(id, name, color)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
  if (error || !data) return []

  return data.map((row: any) => {
    const idol = row.idols as { id: string; name: string; color: string } | null
    return {
      id: row.id,
      postType: (row.type as 'fanmeet' | 'buddy') ?? 'fanmeet',
      idolId: idol?.id ?? null,
      idolName: idol?.name ?? '',
      idolColor: idol?.color ?? '#a1a1aa',
      authorHandle: '',
      authorPersonaEmoji: row.type === 'buddy' ? (row.author_persona_emoji ?? undefined) : undefined,
      status: row.status as '모집 중' | '매칭 중' | '매칭 완료',
      dday: '',
      ddayColor: '#3f3f46',
      title: row.title,
      tags: Array.isArray(row.tags) ? row.tags : [],
      timestamp: relativeTime(row.created_at),
      isActive: row.status === '모집 중',
      isReported: row.is_reported ?? false,
    }
  })
}

/** 모집글 신청 */
export async function applyToPost(postId: string): Promise<{ success: boolean }> {
  await delay(200)
  console.log('[API] applyToPost', postId)
  return { success: true }
}

/** 게시글 상세 */
export async function getPostDetail(postId: string): Promise<PostDetail> {
  if (!isSupabaseConfigured) {
    await delay(100)
    const matchedPost = mockRecruitPosts.find((p) => p.id === postId)
    const isBuddy = matchedPost?.postType === 'buddy'
    return {
      ...mockPostDetail,
      id: postId,
      postType: matchedPost?.postType ?? 'fanmeet',
      idolColor: isBuddy ? undefined : (matchedPost?.idolColor ?? mockPostDetail.idolColor),
      authorPersonaEmoji: isBuddy ? (matchedPost?.authorPersonaEmoji ?? '🌙') : undefined,
      fandomTag: matchedPost && !isBuddy ? `💎 ${matchedPost.idolName}` : mockPostDetail.fandomTag,
      category: matchedPost?.idolName ?? mockPostDetail.category,
    }
  }
  const { data: post, error } = await supabase
    .from('recruit_posts')
    .select('*, idols(name, color), profiles(handle, avatar_color)')
    .eq('id', postId)
    .single()
  if (error || !post) {
    console.error('[getPostDetail] error:', error?.message, 'postId:', postId)
    return mockPostDetail
  }

  const { data: rawComments } = await supabase
    .from('comments')
    .select('*, profiles(handle, avatar_color)')
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at')

  const { data: rawReplies } = await supabase
    .from('comments')
    .select('*, profiles(handle, avatar_color)')
    .eq('post_id', postId)
    .not('parent_id', 'is', null)
    .order('created_at')

  const mapComment = (c: any): Comment => ({
    id: c.id,
    authorHandle: (c.profiles as any)?.handle ?? '익명',
    avatarBg: (c.profiles as any)?.avatar_color ?? '#f4f4f5',
    content: c.content,
    likes: c.likes_count,
    isLiked: false,
    timestamp: relativeTime(c.created_at),
    showMatchingTool: c.show_matching_tool,
    personaEmoji: c.persona_emoji ?? undefined,
    isSecret: !(c.is_public ?? true),
  })

  const comments: Comment[] = (rawComments ?? []).map((c) => ({
    ...mapComment(c),
    replies: (rawReplies ?? []).filter((r) => r.parent_id === c.id).map(mapComment),
  }))

  const idol = (post as any).idols as { name: string; color: string } | null
  const author = (post as any).profiles as { handle: string; avatar_color: string } | null

  // 매칭된 댓글 작성자 핸들 조회
  let matchedCommentAuthorHandle: string | undefined
  if (post.matched_comment_id) {
    const { data: matchedComment } = await supabase
      .from('comments')
      .select('profiles(handle)')
      .eq('id', post.matched_comment_id)
      .single()
    matchedCommentAuthorHandle = (matchedComment as any)?.profiles?.handle
  }

  return {
    id: post.id,
    postType: (post.type as 'fanmeet' | 'buddy') ?? 'fanmeet',
    authorHandle: author?.handle ?? '익명',
    authorColor: author?.avatar_color ?? '#c17a3a',
    authorPersonaEmoji: post.type === 'buddy' ? ((post as any).author_persona_emoji ?? undefined) : undefined,
    timestamp: relativeTime(post.created_at),
    category: idol?.name ?? post.type,
    title: post.title,
    content: post.content,
    locationTag: post.region ? `📍 ${post.region}` : '📍 미정',
    dateTag: post.event_date ? `📅 ${post.event_date}` : '📅 미정',
    fandomTag: idol ? `💎 ${idol.name}` : '💎 팬덤',
    commentCount: post.comment_count,
    comments,
    status: (post.status as '모집 중' | '매칭 중' | '매칭 완료') ?? '모집 중',
    matchedCommentId: post.matched_comment_id ?? undefined,
    matchedCommentAuthorHandle,
    boostUsed: post.boost_used ?? false,
    idolColor: idol?.color,
    isReported: post.is_reported ?? false,
    rawRegion: post.region ?? undefined,
    rawDate: post.event_date ?? undefined,
    rawIdolName: idol?.name ?? undefined,
    rawRequirements: Array.isArray(post.requirements) ? post.requirements : [],
  }
}

/** 덕메 모집글 작성 */
export async function createFanMeetPost(data: {
  title: string
  artists: string[]
  region: string
  date: string
  requirements: string[]
  description: string
}): Promise<{ success: boolean; id: string }> {
  if (!isSupabaseConfigured) {
    await delay(300)
    return { success: true, id: `post_${Date.now()}` }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  // 아티스트 이름으로 idol 조회 → id + color 확보
  let idolId: string | null = null
  let idolColor = '#a1a1aa'
  if (data.artists.length > 0) {
    const { data: idolRow } = await supabase
      .from('idols')
      .select('id, color')
      .eq('name', data.artists[0])
      .single()
    if (idolRow) {
      idolId = idolRow.id
      idolColor = idolRow.color
    }
  }

  // 카드에 표시할 태그 빌드 (아이돌 실제 색상 사용)
  const artistBg = `${idolColor}22`
  const tags: TagItem[] = [
    ...(data.artists.length > 0
      ? [{ label: data.artists[0], bg: artistBg, color: idolColor }]
      : []),
    ...(data.region ? [{ label: data.region, bg: '#dbeafe', color: '#1d4ed8' }] : []),
    ...(data.requirements.length > 0
      ? [{ label: data.requirements[0], bg: '#d1fae5', color: '#047857' }]
      : []),
  ]

  const { data: result, error } = await supabase
    .from('recruit_posts')
    .insert({
      author_id: user.id,
      type: 'fanmeet',
      idol_id: idolId,
      title: data.title || (data.artists.length > 0 ? `${data.artists[0]} 덕메 구해요` : '덕메 구해요'),
      content: data.description,
      region: data.region,
      event_date: data.date || null,
      requirements: data.requirements,
      tags,
    })
    .select('id')
    .single()
  if (error || !result) throw new Error(error?.message ?? '게시글 등록 실패')
  return { success: true, id: result.id }
}

/** 비계친 모집글 작성 */
export async function createBuddyPost(data: {
  title: string
  age: string
  region: string
  intro: string
  keywords: string[]
  excludeKeywords: string[]
}): Promise<{ success: boolean; id: string }> {
  if (!isSupabaseConfigured) {
    await delay(300)
    const activeSlot = mockProfile.personaSlots.find((s) => s.isActive && !s.isEmpty)
    const newId = `post_${Date.now()}`
    const tags: TagItem[] = [
      ...(data.region ? [{ label: data.region, bg: '#f4f4f5', color: '#3f3f46' }] : []),
      ...(data.age && data.age !== '연령무관' ? [{ label: data.age, bg: '#e0f2fe', color: '#0369a1' }] : []),
      ...data.keywords.slice(0, 2).map((kw) => ({ label: kw, bg: '#f4f4f5', color: '#3f3f46' })),
    ]
    mockRecruitPosts.unshift({
      id: newId,
      postType: 'buddy',
      idolId: null,
      idolName: '',
      idolColor: '#a1a1aa',
      authorHandle: mockProfile.handle,
      authorPersonaEmoji: activeSlot?.emoji,
      status: '모집 중',
      dday: '모집 중',
      ddayColor: '#3f3f46',
      title: data.title || '비계친 구해요',
      tags,
      timestamp: '방금 전',
      isActive: true,
      isSaved: false,
    })
    return { success: true, id: newId }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  // 활성 페르소나 이모지 조회
  const { data: activeSlot } = await supabase
    .from('persona_slots')
    .select('emoji')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  // 카드에 표시할 태그 빌드
  const tags: TagItem[] = [
    ...(data.region ? [{ label: data.region, bg: '#f4f4f5', color: '#3f3f46' }] : []),
    ...(data.age && data.age !== '연령무관' ? [{ label: data.age, bg: '#e0f2fe', color: '#0369a1' }] : []),
    ...data.keywords.slice(0, 2).map((kw) => ({ label: kw, bg: '#f4f4f5', color: '#3f3f46' })),
  ]

  const { data: result, error } = await supabase
    .from('recruit_posts')
    .insert({
      author_id: user.id,
      type: 'buddy',
      idol_id: null,
      title: data.title || '비계친 구해요',
      content: data.intro,
      region: data.region,
      requirements: [data.age, ...data.keywords, ...data.excludeKeywords.map((k) => `제한:${k}`)],
      tags,
      author_persona_emoji: activeSlot?.emoji ?? null,
    })
    .select('id')
    .single()
  if (error || !result) throw new Error(error?.message ?? '게시글 등록 실패')
  return { success: true, id: result.id }
}

// ─── 저장된 게시글 ────────────────────────────────────────────────────────────

/** 저장된 게시글 목록 */
export async function getSavedPosts(tab: 'fanmeet' | 'buddy' = 'fanmeet'): Promise<SavedPost[]> {
  if (!isSupabaseConfigured) {
    await delay(100)
    return mockSavedPosts.filter((p) => p.tab === tab)
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('saved_posts')
    .select('*, recruit_posts(*, profiles(handle, avatar_color))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error || !data) return mockSavedPosts.filter((p) => p.tab === tab)

  return data
    .filter((row: any) => row.recruit_posts?.type === tab)
    .map((row: any) => {
      const post = row.recruit_posts as any
      const author = post?.profiles as any
      return {
        id: row.id,
        authorHandle: author?.handle ?? '익명',
        avatarBg: author?.avatar_color ?? '#f4f4f5',
        savedAt: relativeTime(row.created_at) + ' 저장됨',
        categoryTags: Array.isArray(post?.tags) ? post.tags.slice(0, 2) : [],
        content: post?.content ?? '',
        tab,
      }
    })
}

/** 저장된 게시글 전체 조회 (채팅 탭용 - 덕메+비계친 모두) */
export async function getAllSavedPosts(): Promise<SavedPost[]> {
  if (!isSupabaseConfigured) {
    await delay(100)
    return [...mockSavedPosts]
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('saved_posts')
    .select('*, recruit_posts(*, profiles(handle, avatar_color))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error || !data) return []

  return data.map((row: any) => {
    const post = row.recruit_posts as any
    const author = post?.profiles as any
    return {
      id: row.id,
      authorHandle: author?.handle ?? '익명',
      avatarBg: author?.avatar_color ?? '#f4f4f5',
      savedAt: relativeTime(row.created_at) + ' 저장됨',
      categoryTags: Array.isArray(post?.tags) ? post.tags.slice(0, 2) : [],
      content: post?.content ?? '',
      tab: (post?.type as 'fanmeet' | 'buddy') ?? 'fanmeet',
    }
  })
}

/** 게시글 저장 */
export async function savePost(postId: string): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(150)
    const post = mockRecruitPosts.find((p) => p.id === postId)
    if (post) post.isSaved = true
    return { success: true }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const { error } = await supabase
    .from('saved_posts')
    .upsert({ user_id: user.id, post_id: postId }, { onConflict: 'user_id,post_id' })
  return { success: !error }
}

/** 게시글 저장 해제 */
export async function unsavePost(postId: string): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(150)
    return { success: true }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const { error } = await supabase
    .from('saved_posts')
    .delete()
    .eq('user_id', user.id)
    .eq('post_id', postId)
  return { success: !error }
}

// ─── 신고 ─────────────────────────────────────────────────────────────────────

/** 신고 통계 (어드민) */
export async function getReportStats(): Promise<ReportStats> {
  if (!isSupabaseConfigured) {
    await delay(100)
    return mockReportStats
  }
  const { count: total } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
  const { count: pending } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', '대기 중')
  const { count: done } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', '처리 완료')
  return {
    pending: pending ?? 0,
    pendingDelta: 0,
    total: total ?? 0,
    processingRate: total ? Math.round(((done ?? 0) / total) * 100) : 0,
    activeAdmins: 1,
  }
}

/** 신고 항목 목록 (어드민) */
export async function getReportItems(_category?: string): Promise<ReportItem[]> {
  if (!isSupabaseConfigured) {
    await delay(100)
    return mockReportItems
  }
  const { data, error } = await supabase
    .from('reports')
    .select('*, profiles(handle)')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error || !data) return mockReportItems
  return data.map((row: any) => ({
    id: row.id,
    reporter: `@${(row.profiles as any)?.handle ?? '알 수 없음'}`,
    reason: row.reason,
    reasonCode: row.reason_code as ReportItem['reasonCode'],
    summary: (row.description ?? '').slice(0, 20) + '…',
    status: row.status as ReportItem['status'],
    timestamp: relativeTime(row.created_at),
  }))
}

/** 신고 제출 */
export async function submitReport(
  postId: string,
  reason: string,
  description: string
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(300)
    mockPostDetail.isReported = true
    return { success: true }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')
  const reasonCode = reason === '스팸' ? 'spam' : reason === '괴롭힘' ? 'harassment' : reason === '개인정보 침해' ? 'privacy' : 'other'
  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_post_id: postId,
    reason,
    reason_code: reasonCode,
    description,
  })
  if (!error && postId) {
    await supabase.from('recruit_posts').update({ is_reported: true }).eq('id', postId)
  }
  return { success: !error }
}

// ─── 키워드 ───────────────────────────────────────────────────────────────────

/** 세이프존 키워드 목록 (유저가 저장한 것은 isSelected:true로 반환) */
export async function getKeywords(): Promise<Keyword[]> {
  if (!isSupabaseConfigured) {
    await delay(100)
    const saved = mockProfile.keywords ?? []
    return mockKeywords.map((kw) => ({ ...kw, isSelected: saved.includes(kw.label) }))
  }
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: kwData, error }, { data: profile }] = await Promise.all([
    supabase.from('keywords').select('*').order('is_recommended', { ascending: false }),
    user ? supabase.from('profiles').select('keywords').eq('id', user.id).single() : Promise.resolve({ data: null }),
  ])
  if (error || !kwData) return mockKeywords
  const saved: string[] = (profile as { keywords?: string[] } | null)?.keywords ?? []
  return kwData.map((row) => ({
    id: row.id,
    label: row.label,
    bg: row.bg_color,
    color: row.text_color,
    isSelected: saved.includes(row.label),
    isRecommended: row.is_recommended,
  }))
}

/** 세이프존 키워드 저장 */
export async function saveKeywords(keywords: string[]): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(200)
    mockProfile.keywords = [...keywords]
    return { success: true }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const { error } = await supabase
    .from('profiles')
    .update({ keywords, updated_at: new Date().toISOString() })
    .eq('id', user.id)
  return { success: !error }
}

// ─── 댓글 ─────────────────────────────────────────────────────────────────────

/** 댓글 등록 */
export async function addComment(
  postId: string,
  text: string,
  options?: { parentId?: string; isSecret?: boolean }
): Promise<Comment> {
  if (!isSupabaseConfigured) {
    await delay(200)
    const activeSlot = mockProfile.personaSlots.find((s) => s.isActive && !s.isEmpty)
    return {
      id: `c${Date.now()}`,
      authorHandle: mockProfile.handle,
      avatarBg: '#c17a3a',
      personaEmoji: activeSlot?.emoji ?? '💎',
      content: text, likes: 0, isLiked: false, timestamp: '방금 전',
      isSecret: options?.isSecret ?? false,
    }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  // 활성 페르소나 슬롯 이모지 조회
  const { data: activeSlot } = await supabase
    .from('persona_slots')
    .select('emoji')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  const personaEmoji: string | null = activeSlot?.emoji ?? null

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content: text,
      parent_id: options?.parentId ?? null,
      is_public: !(options?.isSecret ?? false),
      persona_emoji: personaEmoji,
    })
    .select('*, profiles(handle, avatar_color)')
    .single()
  if (error || !data) throw new Error('댓글 등록 실패')
  return {
    id: data.id,
    authorHandle: (data as any).profiles?.handle ?? '나',
    avatarBg: (data as any).profiles?.avatar_color ?? '#f4f4f5',
    content: data.content,
    likes: 0, isLiked: false, timestamp: '방금 전',
    isSecret: !(data.is_public ?? true),
    personaEmoji: personaEmoji ?? undefined,
  }
}

/** 댓글 좋아요 토글 */
export async function toggleCommentLike(
  commentId: string
): Promise<{ likes: number; isLiked: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(100)
    return { likes: 1, isLiked: true }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { likes: 0, isLiked: false }

  const { data: existing } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('comment_likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id })
  }

  const { data: updated } = await supabase
    .from('comments')
    .select('likes_count')
    .eq('id', commentId)
    .single()

  return { likes: updated?.likes_count ?? 0, isLiked: !existing }
}

/** 매칭 확정 → '매칭 중' 상태로 변경 */
export async function confirmMatching(
  postId: string,
  commentId: string
): Promise<{ success: boolean; matchedCommentAuthorHandle?: string }> {
  if (!isSupabaseConfigured) {
    await delay(300)
    // mock 상태 영속
    const matchedComment = mockPostDetail.comments.find((c) => c.id === commentId)
    const matchedHandle = matchedComment?.authorHandle ?? '민지_광팬_98'
    mockPostDetail.status = '매칭 중'
    mockPostDetail.matchedCommentId = commentId
    mockPostDetail.matchedCommentAuthorHandle = matchedHandle
    // 홈 목록도 동기화 (id '1')
    const homePost = mockRecruitPosts.find((p) => p.id === postId)
    if (homePost) homePost.status = '매칭 중'
    return { success: true, matchedCommentAuthorHandle: matchedHandle }
  }
  const { error } = await supabase
    .from('recruit_posts')
    .update({
      status: '매칭 중',
      matched_comment_id: commentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
  const { error: e2 } = await supabase
    .from('comments')
    .update({ show_matching_tool: false })
    .eq('id', commentId)
  // 매칭 상대 핸들 조회
  const { data: commentData } = await supabase
    .from('comments')
    .select('profiles(handle)')
    .eq('id', commentId)
    .single()
  const handle = (commentData as any)?.profiles?.handle
  return { success: !error && !e2, matchedCommentAuthorHandle: handle }
}

/** 매칭 취소 → '모집 중'으로 복귀 */
export async function cancelMatching(
  postId: string
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(300)
    mockPostDetail.status = '모집 중'
    mockPostDetail.matchedCommentId = undefined
    mockPostDetail.matchedCommentAuthorHandle = undefined
    mockPostDetail.boostUsed = false
    const homePost = mockRecruitPosts.find((p) => p.id === postId)
    if (homePost) homePost.status = '모집 중'
    return { success: true }
  }
  const { error } = await supabase
    .from('recruit_posts')
    .update({
      status: '모집 중',
      matched_comment_id: null,
      boost_used: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
  return { success: !error }
}

/** 작성자 직접 상태 변경 */
export async function updatePostStatus(
  postId: string,
  status: '모집 중' | '매칭 중' | '매칭 완료'
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(200)
    const homePost = mockRecruitPosts.find((p) => p.id === postId)
    if (homePost) homePost.status = status
    mockPostDetail.status = status
    return { success: true }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const { error } = await supabase
    .from('recruit_posts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('author_id', user.id)
  return { success: !error }
}

/** 끌어올리기 (매칭 취소 후 1회 가능) */
export async function boostPost(
  postId: string
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(200)
    mockPostDetail.boostUsed = true
    return { success: true }
  }
  const { error } = await supabase
    .from('recruit_posts')
    .update({
      boost_used: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
  return { success: !error }
}

// ─── 프로필 ───────────────────────────────────────────────────────────────────

/** 프로필 설정 조회 */
export async function getProfileSettings(): Promise<ProfileSettings> {
  if (!isSupabaseConfigured) {
    await delay(100)
    return mockProfile
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return mockProfile

  const [{ data: profile }, { data: slots }, { data: timeline }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('persona_slots').select('*').eq('user_id', user.id).order('sort_order'),
    supabase.from('timeline_items').select('*').eq('user_id', user.id).order('event_date', { ascending: false }),
  ])

  if (!profile) return mockProfile

  const rawSlots = (slots ?? []).map((s, i) => ({
    id: s.id, emoji: s.emoji, name: s.name,
    fandom: s.fandom ?? '', isActive: s.is_active,
    _index: i,
  }))
  const hasActive = rawSlots.some((s) => s.isActive)
  const personaSlots: PersonaSlot[] = [
    ...rawSlots.map((s) => ({
      id: s.id, emoji: s.emoji, name: s.name,
      fandom: s.fandom, isActive: hasActive ? s.isActive : s._index === 0,
    })),
    { id: 'empty', emoji: '', name: '', fandom: '', isActive: false, isEmpty: true },
  ].slice(0, 5)

  return {
    handle: profile.handle,
    level: profile.level,
    fandom: profile.fandom ?? '',
    personaSlots,
    favoriteIdol: profile.favorite_idol ?? '',
    mbti: profile.mbti ?? '',
    keywords: profile.keywords ?? [],
    timeline: (timeline ?? []).map((t) => ({
      id: t.id, emoji: t.emoji, title: t.title,
      date: t.event_date, description: t.description ?? '',
      isFeatured: t.is_featured,
    })),
    safeZoneTags: profile.safe_zone_tags ?? [],
  }
}

/** 프로필 설정 저장 */
export async function saveProfileSettings(
  data: Partial<ProfileSettings>
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(200)
    // mock: 실제 데이터 반영
    if (data.favoriteIdol !== undefined) mockProfile.favoriteIdol = data.favoriteIdol
    if (data.mbti !== undefined) mockProfile.mbti = data.mbti
    if (data.keywords !== undefined) mockProfile.keywords = [...data.keywords]
    if (data.safeZoneTags !== undefined) mockProfile.safeZoneTags = [...data.safeZoneTags]
    if (data.personaSlots !== undefined) {
      mockProfile.personaSlots = data.personaSlots.map((s) => ({ ...s }))
    }
    return { success: true }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { error } = await supabase.from('profiles').update({
    favorite_idol: data.favoriteIdol,
    mbti: data.mbti,
    keywords: data.keywords,
    safe_zone_tags: data.safeZoneTags,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)

  return { success: !error }
}

/** 타임라인 아이템 추가 */
export async function addTimelineItem(
  item: Omit<TimelineItem, 'id'>
): Promise<TimelineItem> {
  if (!isSupabaseConfigured) {
    await delay(200)
    return { id: `t${Date.now()}`, ...item }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { data, error } = await supabase
    .from('timeline_items')
    .insert({
      user_id: user.id,
      emoji: item.emoji,
      title: item.title,
      event_date: item.date,
      description: item.description,
      is_featured: item.isFeatured,
    })
    .select()
    .single()

  if (error || !data) throw new Error('타임라인 저장 실패')
  return {
    id: data.id,
    emoji: data.emoji,
    title: data.title,
    date: data.event_date,
    description: data.description ?? '',
    isFeatured: data.is_featured,
  }
}

/** 페르소나 슬롯 추가 */
export async function addPersonaSlot(
  slot: Omit<PersonaSlot, 'id' | 'isEmpty'>
): Promise<PersonaSlot> {
  if (!isSupabaseConfigured) {
    await delay(200)
    return { id: `p${Date.now()}`, ...slot }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { data, error } = await supabase
    .from('persona_slots')
    .insert({
      user_id: user.id,
      emoji: slot.emoji,
      name: slot.name,
      fandom: slot.fandom,
      is_active: slot.isActive,
      sort_order: 0,
    })
    .select()
    .single()

  if (error || !data) throw new Error('페르소나 저장 실패')
  return {
    id: data.id,
    emoji: data.emoji,
    name: data.name,
    fandom: data.fandom ?? '',
    isActive: data.is_active,
  }
}

/** 현재 유저의 '매칭 중' 덕메 모집글 날짜 목록 (중복 등록 방지용) */
export async function getMyMatchingFanmeetDates(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    await delay(50)
    return []
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('recruit_posts')
    .select('event_date')
    .eq('author_id', user.id)
    .eq('type', 'fanmeet')
    .eq('status', '매칭 중')
  return (data ?? []).map((r: any) => r.event_date).filter(Boolean)
}

// ─── 어드민: 유저 관리 ────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  handle: string
  level: number
  fandom: string
  status: '정상' | '경고' | '정지'
  joinedAt: string
  postCount: number
  reportCount: number
}

const mockAdminUsers: AdminUser[] = [
  { id: 'u1', handle: 'Moonlight_Stay',   level: 4, fandom: 'Stray Kids', status: '정상', joinedAt: '2024.01.15', postCount: 12, reportCount: 0 },
  { id: 'u2', handle: '하니_러브',          level: 3, fandom: 'NewJeans',   status: '정상', joinedAt: '2024.02.03', postCount: 8,  reportCount: 1 },
  { id: 'u3', handle: 'jimin_fan92',       level: 2, fandom: 'BTS',        status: '경고', joinedAt: '2023.11.20', postCount: 3,  reportCount: 4 },
  { id: 'u4', handle: 'kpop_editor',       level: 1, fandom: 'IVE',        status: '정지', joinedAt: '2023.09.05', postCount: 0,  reportCount: 8 },
  { id: 'u5', handle: 'StarCollector_',    level: 5, fandom: 'aespa',      status: '정상', joinedAt: '2024.03.11', postCount: 27, reportCount: 0 },
  { id: 'u6', handle: 'Winter_Breeze',     level: 3, fandom: 'BLACKPINK',  status: '정상', joinedAt: '2024.01.28', postCount: 6,  reportCount: 0 },
]

/** 유저 목록 조회 (어드민) */
export async function getAdminUsers(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured) {
    await delay(150)
    return mockAdminUsers
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, handle, level, fandom, status, created_at, post_count, report_count')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error || !data) return mockAdminUsers
  return data.map((row: any) => ({
    id: row.id,
    handle: row.handle ?? '익명',
    level: row.level ?? 1,
    fandom: row.fandom ?? '-',
    status: (row.status as AdminUser['status']) ?? '정상',
    joinedAt: new Date(row.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace('.', ''),
    postCount: row.post_count ?? 0,
    reportCount: row.report_count ?? 0,
  }))
}

/** 유저 상태 변경 (어드민) */
export async function updateUserStatus(
  userId: string,
  status: AdminUser['status']
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(200)
    const u = mockAdminUsers.find((u) => u.id === userId)
    if (u) u.status = status
    return { success: true }
  }
  const { error } = await supabase
    .from('profiles')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', userId)
  return { success: !error }
}

// ─── 어드민: 신고 처리 ────────────────────────────────────────────────────────

/** 신고 상태 변경 (어드민) */
export async function updateReportStatus(
  reportId: string,
  status: ReportItem['status']
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(150)
    const r = mockReportItems.find((r) => r.id === reportId)
    if (r) r.status = status
    return { success: true }
  }
  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', reportId)
  return { success: !error }
}

// ─── 어드민: 키워드 관리 ──────────────────────────────────────────────────────

/** 키워드 추가 (어드민) */
export async function createKeyword(
  label: string,
  bg: string,
  color: string,
  isRecommended: boolean
): Promise<Keyword> {
  if (!isSupabaseConfigured) {
    await delay(200)
    const kw: Keyword = {
      id: `kw_${Date.now()}`, label, bg, color,
      isSelected: false, isRecommended,
    }
    mockKeywords.push(kw)
    return kw
  }
  const { data, error } = await supabase
    .from('keywords')
    .insert({ label, bg_color: bg, text_color: color, is_recommended: isRecommended })
    .select()
    .single()
  if (error || !data) throw new Error('키워드 등록 실패')
  return { id: data.id, label: data.label, bg: data.bg_color, color: data.text_color, isSelected: false, isRecommended: data.is_recommended }
}

/** 키워드 삭제 (어드민) */
export async function deleteKeyword(id: string): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(150)
    const idx = mockKeywords.findIndex((k) => k.id === id)
    if (idx !== -1) mockKeywords.splice(idx, 1)
    return { success: true }
  }
  const { error } = await supabase.from('keywords').delete().eq('id', id)
  return { success: !error }
}

/** 키워드 추천 여부 토글 (어드민) */
export async function toggleKeywordRecommended(
  id: string,
  isRecommended: boolean
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(100)
    const kw = mockKeywords.find((k) => k.id === id)
    if (kw) kw.isRecommended = isRecommended
    return { success: true }
  }
  const { error } = await supabase
    .from('keywords')
    .update({ is_recommended: isRecommended })
    .eq('id', id)
  return { success: !error }
}
