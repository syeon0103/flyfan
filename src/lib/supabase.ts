import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * Supabase 클라이언트 (클라이언트 사이드 + 서버 컴포넌트 공용)
 * 환경변수가 설정되지 않으면 mock 데이터로 폴백됩니다.
 *
 * 실제 프로젝트에서는 `supabase gen types typescript` 로 자동 생성된
 * Database 타입을 createClient<Database> 에 전달하세요.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey)

/**
 * Supabase 연결 여부 확인
 * .env.local에 실제 값이 설정된 경우 true
 */
export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !!supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key'
