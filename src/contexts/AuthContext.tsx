'use client'

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthProfile {
  handle: string
  level: number
  avatarColor: string
}

interface AuthContextType {
  user: User | null
  profile: AuthProfile | null
  isLoading: boolean
  signIn: (username: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return
    const { data } = await supabase
      .from('profiles')
      .select('handle, level, avatar_color')
      .eq('id', userId)
      .single()
    if (data) {
      setProfile({
        handle: data.handle,
        level: data.level,
        avatarColor: data.avatar_color,
      })
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setIsLoading(false)
    })

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (username: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      // 개발용 mock 로그인
      const MOCK_USERS = ['admin', 'user1', 'user2']
      if (MOCK_USERS.includes(username) && username === password) {
        setUser({ id: `mock_${username}`, email: `${username}@flyfan.test` } as User)
        setProfile({ handle: username, level: 1, avatarColor: '#c17a3a' })
        return { error: null }
      }
      return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' }
    }

    const email = `${username}@flyfan.test`
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' }
    }
    return { error: null }
  }

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
