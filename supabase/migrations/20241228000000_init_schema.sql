-- ============================================================
-- 챕터 09 블로그 만들기 : 초기 스키마
--   profiles   : 사용자 프로필 (auth.users 와 1:1)
--   categories : 카테고리
--   posts      : 게시글 (users 1:N posts)
--   comments   : 댓글   (posts 1:N comments)
--   likes      : 좋아요 (users N:N posts)
-- ============================================================

-- ------------------------------------------------------------
-- 1) profiles : 사용자 1명당 프로필 1개 (1:1 관계)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null,
  avatar_url text,
  bio        text,
  created_at timestamptz not null default now()
);

-- 회원가입하면 프로필을 자동으로 만들어주는 트리거
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 2) categories
-- ------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3) posts : 한 사용자가 여러 글을 씁니다 (1:N)
-- ------------------------------------------------------------
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  content       text not null,           -- 마크다운 원문
  excerpt       text,                    -- 카드에 보여줄 요약
  thumbnail_url text,
  category_id   uuid references public.categories (id) on delete set null,
  author_id     uuid not null references public.profiles (id) on delete cascade,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_category_id_idx on public.posts (category_id);
create index if not exists posts_author_id_idx on public.posts (author_id);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 4) comments : 한 게시글에 여러 댓글 (1:N)
-- ------------------------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id, created_at);

-- ------------------------------------------------------------
-- 5) likes : 사용자 N : N 게시글
--    (user_id, post_id) 복합 기본키라 같은 글에 두 번 좋아요를 누를 수 없습니다.
-- ------------------------------------------------------------
create table if not exists public.likes (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists likes_post_id_idx on public.likes (post_id);

-- ============================================================
-- Row Level Security (RLS)
--   RLS를 켜면 기본적으로 모든 접근이 차단되고,
--   아래 policy 로 허용한 범위만 열립니다.
-- ============================================================
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.posts      enable row level security;
alter table public.comments   enable row level security;
alter table public.likes      enable row level security;

-- 조회(SELECT) 정책 : 공개 데이터는 누구나 읽을 수 있습니다.
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Categories are viewable by everyone"
  on public.categories for select using (true);

create policy "Published posts are viewable by everyone"
  on public.posts for select
  using (published = true or auth.uid() = author_id);

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

-- 프로필 : 본인 것만 생성/수정
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
