-- ============================================================
-- 챕터 09 : 시드(더미) 데이터
--
-- 사용법 : 수파베이스 대시보드 [SQL Editor]에 이 파일 내용을 붙여넣고 [Run]
--          또는 npx supabase db reset (로컬 전용! 프로덕션에서 절대 금지)
--
-- 주의 : posts.author_id 는 auth.users 를 참조하므로
--        회원가입을 최소 1명 해둔 뒤 실행해야 게시글이 들어갑니다.
--        가입한 사용자가 없으면 카테고리만 생성되고 안내 메시지가 출력됩니다.
-- ============================================================

-- 1) 카테고리
insert into public.categories (name, slug) values
  ('Next.js',    'nextjs'),
  ('TypeScript', 'typescript'),
  ('Database',   'database'),
  ('회고',        'retrospective')
on conflict (name) do nothing;

-- 2) 샘플 게시글 (가장 먼저 가입한 사용자를 작성자로 사용)
do $$
declare
  v_author uuid;
  v_nextjs uuid;
  v_ts     uuid;
  v_db     uuid;
  v_retro  uuid;
  v_post   uuid;
begin
  select id into v_author from public.profiles order by created_at limit 1;

  if v_author is null then
    raise notice '가입한 사용자가 없어 게시글 시드를 건너뜁니다. /auth 에서 회원가입 후 다시 실행하세요.';
    return;
  end if;

  select id into v_nextjs from public.categories where slug = 'nextjs';
  select id into v_ts     from public.categories where slug = 'typescript';
  select id into v_db     from public.categories where slug = 'database';
  select id into v_retro  from public.categories where slug = 'retrospective';

  insert into public.posts (title, content, excerpt, thumbnail_url, category_id, author_id)
  values (
    'Next.js App Router에서 서버 컴포넌트 제대로 쓰기',
    E'## 서버 컴포넌트가 기본값입니다\n\nApp Router에서는 모든 컴포넌트가 기본적으로 **서버 컴포넌트**입니다.\n`use client` 지시어를 붙인 파일만 클라이언트 컴포넌트가 됩니다.\n\n```tsx\n// 서버 컴포넌트 (기본값)\nexport default async function Page() {\n  const supabase = await createClient()\n  const { data } = await supabase.from(''posts'').select()\n  return <PostList posts={data} />\n}\n```\n\n### 왜 서버에서 데이터를 가져와야 할까요?\n\n- 데이터베이스 응답이 브라우저 네트워크 탭에 노출되지 않습니다.\n- TTFB가 빨라지고 SEO에 유리합니다.\n- 번들 크기가 줄어듭니다.',
    'App Router에서 서버 컴포넌트가 기본값인 이유와, 데이터 조회를 서버에서 해야 하는 이유를 정리했습니다.',
    'https://picsum.photos/seed/nextjs/800/500',
    v_nextjs, v_author
  ) returning id into v_post;

  insert into public.comments (post_id, author_id, content)
  values (v_post, v_author, '서버 컴포넌트 예제가 이해하기 쉽네요!');

  insert into public.likes (post_id, user_id) values (v_post, v_author)
  on conflict do nothing;

  insert into public.posts (title, content, excerpt, thumbnail_url, category_id, author_id)
  values (
    'RLS 정책 없이 배포하면 생기는 일',
    E'## 클라이언트에서 수파베이스를 직접 부르면\n\n브라우저 개발자 도구 [Network] 탭을 열면 응답 JSON이 **전부** 보입니다.\n화면에서 일부만 렌더링해도 소용없습니다.\n\n> RLS는 클라이언트 접근의 마지막 방어선입니다.\n\n### 최소한 이 정도는 만들어 두세요\n\n```sql\nalter table posts enable row level security;\n\ncreate policy "Published posts are viewable by everyone"\n  on posts for select using (published = true);\n\ncreate policy "Authenticated users can create posts"\n  on posts for insert with check (auth.uid() = author_id);\n```',
    'RLS를 켜지 않고 클라이언트에서 수파베이스를 호출하면 어떤 데이터가 노출되는지 네트워크 탭으로 확인해봤습니다.',
    'https://picsum.photos/seed/security/800/500',
    v_db, v_author
  );

  insert into public.posts (title, content, excerpt, thumbnail_url, category_id, author_id)
  values (
    'TypeScript 타입을 수파베이스 스키마에서 자동 생성하기',
    E'## supabase gen types\n\n```bash\nnpx supabase gen types typescript --linked > types/database.types.ts\n```\n\n이 명령 한 줄이면 테이블 구조가 그대로 타입이 됩니다.\n마이그레이션을 추가할 때마다 다시 실행해주세요.',
    '테이블을 바꿀 때마다 손으로 타입을 고치고 있다면, 이 명령 한 줄로 끝낼 수 있습니다.',
    'https://picsum.photos/seed/typescript/800/500',
    v_ts, v_author
  );

  insert into public.posts (title, content, excerpt, thumbnail_url, category_id, author_id)
  values (
    '바이브 코딩으로 블로그를 만들며 배운 것',
    E'## 프롬프트를 잘게 쪼갤수록 결과가 좋아진다\n\n한 번에 "블로그 만들어줘"라고 하면 원하는 결과가 나오지 않습니다.\n\n1. 인증\n2. 홈 + 데이터베이스\n3. 상세 페이지\n4. 글쓰기\n\n이렇게 의미 있는 단위로 나눠서 요청했습니다.\n\n## 오류 메시지는 그대로 복사해서 준다\n\n`new row violates row-level security policy` 한 줄이면\nAI가 RLS 정책 문제라는 걸 바로 알아냅니다.',
    '챕터 09 실습을 진행하면서 느낀 프롬프팅 요령과, 오류를 해결하는 흐름을 정리했습니다.',
    'https://picsum.photos/seed/retro/800/500',
    v_retro, v_author
  );

  raise notice '시드 데이터 생성 완료 (작성자 id = %)', v_author;
end $$;
