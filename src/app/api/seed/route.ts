import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const TEST_USERS = [
  { username: 'admin', password: 'admin' },
  { username: 'user1', password: 'user1' },
  { username: 'user2', password: 'user2' },
]

export async function POST() {
  const results: { username: string; status: string; error?: string }[] = []

  for (const { username, password } of TEST_USERS) {
    const email = `${username}@flyfan.test`

    // signUp 시도 (anon key로 가능)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { handle: username } },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already been registered')) {
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
