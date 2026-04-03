/**
 * Supabase 테이블 타입 정의
 * supabase gen types typescript --project-id <id> 로 자동 생성 가능
 */
export type Database = {
  public: {
    Tables: {
      idols: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          handle: string
          level: number
          fandom: string | null
          favorite_idol: string | null
          mbti: string | null
          keywords: string[]
          safe_zone_tags: string[]
          avatar_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          handle: string
          level?: number
          fandom?: string | null
          favorite_idol?: string | null
          mbti?: string | null
          keywords?: string[]
          safe_zone_tags?: string[]
          avatar_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          handle?: string
          level?: number
          fandom?: string | null
          favorite_idol?: string | null
          mbti?: string | null
          keywords?: string[]
          safe_zone_tags?: string[]
          avatar_color?: string
          updated_at?: string
        }
      }
      persona_slots: {
        Row: {
          id: string
          user_id: string
          emoji: string
          name: string
          fandom: string | null
          is_active: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          user_id: string
          emoji: string
          name: string
          fandom?: string | null
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          emoji?: string
          name?: string
          fandom?: string | null
          is_active?: boolean
          sort_order?: number
        }
      }
      timeline_items: {
        Row: {
          id: string
          user_id: string
          emoji: string
          title: string
          event_date: string
          description: string | null
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          emoji: string
          title: string
          event_date: string
          description?: string | null
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          emoji?: string
          title?: string
          event_date?: string
          description?: string | null
          is_featured?: boolean
        }
      }
      keywords: {
        Row: {
          id: string
          label: string
          bg_color: string
          text_color: string
          is_recommended: boolean
          created_at: string
        }
        Insert: {
          id?: string
          label: string
          bg_color: string
          text_color: string
          is_recommended?: boolean
          created_at?: string
        }
        Update: {
          label?: string
          bg_color?: string
          text_color?: string
          is_recommended?: boolean
        }
      }
      recruit_posts: {
        Row: {
          id: string
          author_id: string
          type: 'fanmeet' | 'buddy'
          title: string
          content: string
          status: '모집 중' | '매칭 완료'
          idol_id: string | null
          region: string | null
          event_date: string | null
          requirements: string[]
          tags: { label: string; bg: string; color: string }[]
          comment_count: number
          view_count: number
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          type: 'fanmeet' | 'buddy'
          title: string
          content: string
          status?: '모집 중' | '매칭 완료'
          idol_id?: string | null
          region?: string | null
          event_date?: string | null
          requirements?: string[]
          tags?: { label: string; bg: string; color: string }[]
          comment_count?: number
          view_count?: number
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          status?: '모집 중' | '매칭 완료'
          idol_id?: string | null
          region?: string | null
          event_date?: string | null
          requirements?: string[]
          tags?: { label: string; bg: string; color: string }[]
          comment_count?: number
          view_count?: number
          deadline?: string | null
          updated_at?: string
        }
      }
      saved_posts: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: never
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          parent_id: string | null
          is_public: boolean
          show_matching_tool: boolean
          likes_count: number
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          parent_id?: string | null
          is_public?: boolean
          show_matching_tool?: boolean
          likes_count?: number
          created_at?: string
        }
        Update: {
          content?: string
          is_public?: boolean
          show_matching_tool?: boolean
          likes_count?: number
        }
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          created_at?: string
        }
        Update: never
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          target_post_id: string | null
          reason: string
          reason_code: 'spam' | 'harassment' | 'privacy' | 'other'
          description: string | null
          status: '대기 중' | '검토 완료' | '처리 완료'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          target_post_id?: string | null
          reason: string
          reason_code: 'spam' | 'harassment' | 'privacy' | 'other'
          description?: string | null
          status?: '대기 중' | '검토 완료' | '처리 완료'
          created_at?: string
        }
        Update: {
          status?: '대기 중' | '검토 완료' | '처리 완료'
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
