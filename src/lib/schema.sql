-- ============================================================
-- flyfan Database Schema
-- Supabase SQL Editor에 전체 붙여넣기 후 실행하세요.
-- ============================================================

-- UUID 확장
create extension if not exists "uuid-ossp";

-- ── 아이돌 ────────────────────────────────────────────────────
create table if not exists idols (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null unique,
  color       text not null default '#FFA33B',
  created_at  timestamptz default now()
);

-- 기본 아이돌 데이터
insert into idols (name, color) values
  ('NewJeans',    '#60a5fa'),
  ('IVE',         '#f43f5e'),
  ('aespa',       '#8b5cf6'),
  ('BLACKPINK',   '#ec4899'),
  ('BTS',         '#6366f1'),
  ('RIIZE',  '#FFA33B'),
  ('TWICE',       '#fb923c'),
  ('EXO',         '#14b8a6')
on conflict (name) do nothing;

-- ── 프로필 ────────────────────────────────────────────────────
create table if not exists profiles (
  id              uuid references auth.users on delete cascade primary key,
  handle          text unique not null,
  level           integer default 1 check (level >= 1 and level <= 99),
  fandom          text,
  favorite_idol   text,
  mbti            text,
  keywords        text[]  default '{}',
  safe_zone_tags  text[]  default '{}',
  avatar_color    text    default '#c17a3a',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 프로필 자동 생성 트리거
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, handle)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'handle', 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── 페르소나 슬롯 ────────────────────────────────────────────
create table if not exists persona_slots (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references profiles(id) on delete cascade not null,
  emoji       text not null default '💎',
  name        text not null,
  fandom      text,
  is_active   boolean default false,
  sort_order  integer default 0
);

-- ── 타임라인 아이템 ──────────────────────────────────────────
create table if not exists timeline_items (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references profiles(id) on delete cascade not null,
  emoji       text not null default '🎫',
  title       text not null,
  event_date  date not null,
  description text,
  is_featured boolean default false,
  created_at  timestamptz default now()
);

-- ── 키워드 ────────────────────────────────────────────────────
create table if not exists keywords (
  id              uuid default uuid_generate_v4() primary key,
  label           text not null unique,
  bg_color        text not null default '#f4f4f5',
  text_color      text not null default '#3f3f46',
  is_recommended  boolean default false,
  created_at      timestamptz default now()
);

-- 기본 키워드 데이터
insert into keywords (label, bg_color, text_color, is_recommended) values
  ('남성 사절',       '#fff7ed', '#c2410c', true),
  ('사진 촬영 금지',  '#eff6ff', '#1d4ed8', true),
  ('☕️ 카페 투어',   '#fff1f2', '#be123c', true),
  ('콘서트 전용',     '#ecfdf5', '#047857', true),
  ('🎫 오프라인',     '#eef2ff', '#4338ca', true),
  ('🥤 컵홀더',      '#fffbeb', '#b45309', true),
  ('여성 전용',       '#faf5ff', '#7e22ce', true),
  ('안전한 만남',     '#f4f4f5', '#3f3f46', false),
  ('인증된 팬',       '#f4f4f5', '#3f3f46', false)
on conflict (label) do nothing;

-- ── 모집 게시글 ──────────────────────────────────────────────
create table if not exists recruit_posts (
  id             uuid default uuid_generate_v4() primary key,
  author_id      uuid references profiles(id) on delete cascade not null,
  type           text not null check (type in ('fanmeet', 'buddy')),
  title          text not null,
  content        text not null,
  status         text not null default '모집 중' check (status in ('모집 중', '매칭 완료')),
  idol_id        uuid references idols(id) on delete set null,
  region         text,
  event_date     date,
  requirements   text[]  default '{}',
  tags           jsonb   default '[]',
  comment_count  integer default 0,
  view_count     integer default 0,
  deadline       date,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── 저장된 게시글 ────────────────────────────────────────────
create table if not exists saved_posts (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references profiles(id) on delete cascade not null,
  post_id     uuid references recruit_posts(id) on delete cascade not null,
  created_at  timestamptz default now(),
  unique(user_id, post_id)
);

-- ── 댓글 ─────────────────────────────────────────────────────
create table if not exists comments (
  id                  uuid default uuid_generate_v4() primary key,
  post_id             uuid references recruit_posts(id) on delete cascade not null,
  author_id           uuid references profiles(id) on delete cascade not null,
  content             text not null,
  parent_id           uuid references comments(id) on delete cascade,
  is_public           boolean default true,
  show_matching_tool  boolean default false,
  likes_count         integer default 0,
  created_at          timestamptz default now()
);

-- ── 댓글 좋아요 ──────────────────────────────────────────────
create table if not exists comment_likes (
  id          uuid default uuid_generate_v4() primary key,
  comment_id  uuid references comments(id) on delete cascade not null,
  user_id     uuid references profiles(id) on delete cascade not null,
  created_at  timestamptz default now(),
  unique(comment_id, user_id)
);

-- 좋아요 수 자동 업데이트 트리거
create or replace function update_comment_likes_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update comments set likes_count = likes_count + 1 where id = NEW.comment_id;
  elsif TG_OP = 'DELETE' then
    update comments set likes_count = likes_count - 1 where id = OLD.comment_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_comment_like_change on comment_likes;
create trigger on_comment_like_change
  after insert or delete on comment_likes
  for each row execute function update_comment_likes_count();

-- ── 신고 ─────────────────────────────────────────────────────
create table if not exists reports (
  id               uuid default uuid_generate_v4() primary key,
  reporter_id      uuid references profiles(id) on delete cascade not null,
  target_post_id   uuid references recruit_posts(id) on delete cascade,
  reason           text not null,
  reason_code      text not null check (reason_code in ('spam', 'harassment', 'privacy', 'other')),
  description      text,
  status           text not null default '대기 중' check (status in ('대기 중', '검토 완료', '처리 완료')),
  created_at       timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table idols          enable row level security;
alter table profiles       enable row level security;
alter table persona_slots  enable row level security;
alter table timeline_items enable row level security;
alter table keywords       enable row level security;
alter table recruit_posts  enable row level security;
alter table saved_posts    enable row level security;
alter table comments       enable row level security;
alter table comment_likes  enable row level security;
alter table reports        enable row level security;

-- 아이돌: 누구나 읽기 / 관리자만 쓰기
create policy "idols_read"   on idols for select using (true);
create policy "idols_insert" on idols for insert with check (auth.role() = 'authenticated');
create policy "idols_update" on idols for update using (auth.role() = 'authenticated');
create policy "idols_delete" on idols for delete using (auth.role() = 'authenticated');

-- 키워드: 누구나 읽기
create policy "keywords_read" on keywords for select using (true);

-- 프로필: 누구나 읽기 / 본인만 수정
create policy "profiles_read"   on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- 페르소나: 본인만 CRUD
create policy "persona_read"   on persona_slots for select using (auth.uid() = user_id);
create policy "persona_insert" on persona_slots for insert with check (auth.uid() = user_id);
create policy "persona_update" on persona_slots for update using (auth.uid() = user_id);
create policy "persona_delete" on persona_slots for delete using (auth.uid() = user_id);

-- 타임라인: 본인만 CRUD
create policy "timeline_read"   on timeline_items for select using (true);
create policy "timeline_insert" on timeline_items for insert with check (auth.uid() = user_id);
create policy "timeline_update" on timeline_items for update using (auth.uid() = user_id);
create policy "timeline_delete" on timeline_items for delete using (auth.uid() = user_id);

-- 모집 게시글: 누구나 읽기 / 로그인 사용자 작성 / 본인만 수정·삭제
create policy "posts_read"   on recruit_posts for select using (true);
create policy "posts_insert" on recruit_posts for insert with check (auth.uid() = author_id);
create policy "posts_update" on recruit_posts for update using (auth.uid() = author_id);
create policy "posts_delete" on recruit_posts for delete using (auth.uid() = author_id);

-- 저장: 본인만 CRUD
create policy "saved_read"   on saved_posts for select using (auth.uid() = user_id);
create policy "saved_insert" on saved_posts for insert with check (auth.uid() = user_id);
create policy "saved_delete" on saved_posts for delete using (auth.uid() = user_id);

-- 댓글: 누구나 읽기 / 로그인 사용자 작성 / 본인만 수정
create policy "comments_read"   on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = author_id);
create policy "comments_update" on comments for update using (auth.uid() = author_id);

-- 댓글 좋아요: 로그인 사용자
create policy "likes_read"   on comment_likes for select using (true);
create policy "likes_insert" on comment_likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on comment_likes for delete using (auth.uid() = user_id);

-- 신고: 로그인 사용자 작성 / 관리자만 읽기·수정 (role 기반)
create policy "reports_insert" on reports for insert with check (auth.uid() = reporter_id);
create policy "reports_read"   on reports for select using (auth.role() = 'authenticated');
create policy "reports_update" on reports for update using (auth.role() = 'authenticated');
