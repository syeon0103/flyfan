import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 빌드 타임에 실행되지 않도록 dynamic route로 강제
export const dynamic = 'force-dynamic'

const TEST_USERS = [
  { username: 'admin', password: 'admin' },
  { username: 'user1', password: 'user1' },
  { username: 'user2', password: 'user2' },
]

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Supabase 환경변수가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const results: { username: string; status: string; error?: string }[] = []

  for (const { username, password } of TEST_USERS) {
    const email = `${username}@flyfan.test`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { handle: username } },
    })

    if (error) {
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already been registered')
      ) {
        results.push({ username, status: 'already_exists' })
      } else {
        results.push({ username, status: 'error', error: error.message })
      }
    } else {
      results.push({ username, status: 'created', error: data.user?.id })
    }
  }

  return NextResponse.json({ results })
}

export async function GET() {
  return NextResponse.json({ message: 'POST /api/seed 로 테스트 계정을 생성하세요.' })
}
