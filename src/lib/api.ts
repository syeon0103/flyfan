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
  idolId: string | null
  idolName: string
  idolColor: string
  status: '모집 중' | '매칭 완료'
  dday: string
  ddayColor: string
  title: string
  tags: TagItem[]
  timestamp: string
  isActive: boolean
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
}

export interface PostDetail {
  id: string
  authorHandle: string
  authorColor: string
  timestamp: string
  category: string
  title: string
  content: string
  locationTag: string
  dateTag: string
  fandomTag: string
  commentCount: number
  comments: Comment[]
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
    idolId: '1',
    idolName: 'NewJeans',
    idolColor: '#60a5fa',
    status: '모집 중',
    dday: 'D-3',
    ddayColor: '#f43f5e',
    title: '뉴진스 콘서트 같이 가실 분! 🐰',
    tags: [
      { label: 'NewJeans', bg: '#e0e7ff', color: '#4338ca' },
      { label: '서울 송파구', bg: '#dbeafe', color: '#1d4ed8' },
      { label: '20대 초반', bg: '#d1fae5', color: '#047857' },
    ],
    timestamp: '방금 전',
    isActive: true,
  },
  {
    id: '2',
    idolId: '2',
    idolName: 'IVE',
    idolColor: '#f43f5e',
    status: '매칭 완료',
    dday: 'D-Day',
    ddayColor: '#a1a1aa',
    title: '아이브 럭키드로우 홍대 투어 🍓',
    tags: [
      { label: 'IVE', bg: '#ffe4e6', color: '#be123c' },
      { label: '서울 마포구', bg: '#ffedd5', color: '#c2410c' },
      { label: '20대 후반', bg: '#ccfbf1', color: '#0f766e' },
    ],
    timestamp: '2시간 전',
    isActive: false,
  },
  {
    id: '3',
    idolId: null,
    idolName: 'NCT DREAM',
    idolColor: '#10b981',
    status: '모집 중',
    dday: 'D-12',
    ddayColor: '#f43f5e',
    title: 'NCT DREAM 앵콜 콘서트 💚',
    tags: [
      { label: 'NCT DREAM', bg: '#dcfce7', color: '#15803d' },
      { label: '전국', bg: '#f4f4f5', color: '#3f3f46' },
      { label: '연령무관', bg: '#e0f2fe', color: '#0369a1' },
    ],
    timestamp: '15분 전',
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
  authorHandle: '하니_러브',
  authorColor: '#c17a3a',
  timestamp: '2시간 전',
  category: '뉴진스 콘서트',
  title: '버니캠프 혼자 가시나요? 같이 가요! 🎫',
  content: '둘째 날 티켓이 한 장 남았어요. 하니를 좋아하고 처음부터 끝까지 콘서트를 온전히 즐기고 싶으신 분을 찾습니다! 공연 전 커피 한 잔은 필수예요. ☕️',
  locationTag: '📍 도쿄돔',
  dateTag: '📅 7월 15일',
  fandomTag: '💎 뉴진스',
  commentCount: 12,
  comments: [
    {
      id: 'c1', authorHandle: '민지_광팬_98', avatarBg: '#f4f4f5',
      content: '저도 둘째 날 가요! 같이 가고 싶어요. 데뷔 때부터 팬이었고 응원봉도 준비 완료! ✨',
      likes: 4, isLiked: true, timestamp: '45분 전',
      replies: [
        {
          id: 'r1', authorHandle: '하니_러브', avatarBg: '#c17a3a', isAuthor: true,
          content: '정말 좋네요! 혹시 특별 한정판 커버도 챙겨오시나요?',
          likes: 0, isLiked: false, timestamp: '30분 전', showMatchingTool: true,
        },
      ],
    },
    {
      id: 'c2', authorHandle: '하입보이_제이', avatarBg: '#f4f4f5',
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
    return mockRecruitPosts
  }
  const { data, error } = await supabase
    .from('recruit_posts')
    .select('*, idols(id, name, color), profiles(handle, avatar_color)')
    .eq('type', tab)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) {
    console.error('[getRecruitPosts] Supabase error:', error.message)
    return []
  }
  if (!data || data.length === 0) return []

  return data.map((row: any) => {
    const idol = row.idols as { id: string; name: string; color: string } | null
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
      idolId: idol?.id ?? null,
      idolName: idol?.name ?? '',
      idolColor: idol?.color ?? '#a1a1aa',
      status: row.status as '모집 중' | '매칭 완료',
      dday,
      ddayColor,
      title: row.title,
      tags: Array.isArray(row.tags) ? row.tags : [],
      timestamp: relativeTime(row.created_at),
      isActive: row.status === '모집 중',
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
    return mockPostDetail
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
  })

  const comments: Comment[] = (rawComments ?? []).map((c) => ({
    ...mapComment(c),
    replies: (rawReplies ?? []).filter((r) => r.parent_id === c.id).map(mapComment),
  }))

  const idol = (post as any).idols as { name: string; color: string } | null
  const author = (post as any).profiles as { handle: string; avatar_color: string } | null

  return {
    id: post.id,
    authorHandle: author?.handle ?? '익명',
    authorColor: author?.avatar_color ?? '#c17a3a',
    timestamp: relativeTime(post.created_at),
    category: idol?.name ?? post.type,
    title: post.title,
    content: post.content,
    locationTag: post.region ? `📍 ${post.region}` : '📍 미정',
    dateTag: post.event_date ? `📅 ${post.event_date}` : '📅 미정',
    fandomTag: idol ? `💎 ${idol.name}` : '💎 팬덤',
    commentCount: post.comment_count,
    comments,
  }
}

/** 덕메 모집글 작성 */
export async function createFanMeetPost(data: {
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

  // 카드에 표시할 태그 빌드
  const tags: TagItem[] = [
    ...(data.artists.length > 0
      ? [{ label: data.artists[0], bg: '#e0e7ff', color: '#4338ca' }]
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
      title: data.artists.length > 0
        ? `${data.artists.join(', ')} 덕메 구해요`
        : '덕메 구해요',
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
  idols: string[]
  search: string
  age: string
  region: string
  intro: string
  safeZoneTags: string[]
}): Promise<{ success: boolean; id: string }> {
  if (!isSupabaseConfigured) {
    await delay(300)
    return { success: true, id: `post_${Date.now()}` }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  // 카드에 표시할 태그 빌드
  const tags: TagItem[] = [
    ...(data.idols.length > 0
      ? [{ label: data.idols[0], bg: '#dcfce7', color: '#15803d' }]
      : []),
    ...(data.region ? [{ label: data.region, bg: '#f4f4f5', color: '#3f3f46' }] : []),
    ...(data.age ? [{ label: data.age, bg: '#e0f2fe', color: '#0369a1' }] : []),
  ]

  const { data: result, error } = await supabase
    .from('recruit_posts')
    .insert({
      author_id: user.id,
      type: 'buddy',
      title: data.idols.length > 0
        ? `${data.idols.join(', ')} 비계친 구해요`
        : '비계친 구해요',
      content: data.intro,
      region: data.region,
      requirements: [data.age, ...data.safeZoneTags],
      tags,
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
  reason: string,
  description: string
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(300)
    return { success: true }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')
  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reason,
    reason_code: reason === '스팸' ? 'spam' : reason === '괴롭힘' ? 'harassment' : 'other',
    description,
  })
  return { success: !error }
}

// ─── 키워드 ───────────────────────────────────────────────────────────────────

/** 세이프존 키워드 목록 */
export async function getKeywords(): Promise<Keyword[]> {
  if (!isSupabaseConfigured) {
    await delay(100)
    return mockKeywords
  }
  const { data, error } = await supabase
    .from('keywords')
    .select('*')
    .order('is_recommended', { ascending: false })
  if (error || !data) return mockKeywords
  return data.map((row) => ({
    id: row.id,
    label: row.label,
    bg: row.bg_color,
    color: row.text_color,
    isSelected: false,
    isRecommended: row.is_recommended,
  }))
}

/** 세이프존 키워드 저장 */
export async function saveKeywords(keywords: string[]): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(200)
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
export async function addComment(postId: string, text: string): Promise<Comment> {
  if (!isSupabaseConfigured) {
    await delay(200)
    return {
      id: `c${Date.now()}`, authorHandle: '나', avatarBg: '#f4f4f5',
      content: text, likes: 0, isLiked: false, timestamp: '방금 전',
    }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: user.id, content: text })
    .select('*, profiles(handle, avatar_color)')
    .single()
  if (error || !data) throw new Error('댓글 등록 실패')
  return {
    id: data.id,
    authorHandle: (data as any).profiles?.handle ?? '나',
    avatarBg: (data as any).profiles?.avatar_color ?? '#f4f4f5',
    content: data.content,
    likes: 0, isLiked: false, timestamp: '방금 전',
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

/** 매칭 확정 */
export async function confirmMatching(
  postId: string,
  commentId: string
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured) {
    await delay(300)
    return { success: true }
  }
  const { error } = await supabase
    .from('recruit_posts')
    .update({ status: '매칭 완료', updated_at: new Date().toISOString() })
    .eq('id', postId)
  const { error: e2 } = await supabase
    .from('comments')
    .update({ show_matching_tool: false })
    .eq('id', commentId)
  return { success: !error && !e2 }
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

  const personaSlots: PersonaSlot[] = [
    ...(slots ?? []).map((s) => ({
      id: s.id, emoji: s.emoji, name: s.name,
      fandom: s.fandom ?? '', isActive: s.is_active,
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
