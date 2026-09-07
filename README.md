# 챕터 09 — 블로그 만들기 (DevBlog)

《요즘 바이브 코딩》 **챕터 09 블로그 만들기** 실습 결과물입니다.
Next.js(App Router) + 수파베이스로 만든 풀스택 개발자 블로그입니다.

## 구현한 기능

| 기능 | 설명 | 관련 기술 |
| --- | --- | --- |
| 사용자 인증 | 이메일 회원가입 / 로그인 / 로그아웃 | Supabase Auth, Server Actions |
| 게시글 CRUD | 작성 · 조회 · 수정 · 삭제 | Supabase Database |
| 댓글 시스템 | 게시글별 댓글 작성 / 삭제 | 관계형 데이터 모델링 (1:N) |
| 좋아요 | 게시글 좋아요 추가 / 취소 | 다대다(N:N) 관계 |
| 검색 | 제목 · 요약 · 본문 검색 | PostgREST `ilike` 필터 |
| 카테고리 필터 · 페이지네이션 | 카테고리별 목록, 6개씩 페이지 분할 | `!inner` 조인, `range()` |
| 마크다운 에디터 | 좌: 편집 / 우: 실시간 미리보기 | react-markdown, remark-gfm |
| 다크/라이트 모드 | 다크 모드 기본, 토글 지원 | CSS 변수 |

## 데이터 모델

```
auth.users ──1:1── profiles ──1:N── posts ──1:N── comments
                       │                │
                       └──── N:N ───────┘
                            likes
```

- `profiles` : 회원가입 시 트리거(`handle_new_user`)가 자동 생성
- `posts.author_id` → `profiles.id` (외래키)
- `likes` : `(post_id, user_id)` 복합 기본키 → 같은 글에 두 번 좋아요 불가

## 실행 방법

### 1. 수파베이스 프로젝트 만들기

1. [supabase.com](https://supabase.com) → **New project** → 이름 `blog`, Region `Northeast Asia (Seoul)`
2. 데이터베이스 비밀번호를 안전한 곳에 복사해둡니다.
3. **Authentication → Sign In / Providers → Confirm email 비활성화** (실습 편의)

### 2. 환경 변수 설정

대시보드 상단 **[Connect]** 버튼에서 값을 복사합니다.

```bash
cp .env.local.example .env.local
# .env.local 을 열어 실제 값으로 채우기
```

> 수파베이스가 `Anon Key` → `Publishable Key`로 이름을 바꾸는 중입니다.
> 두 이름 중 대시보드에 보이는 것 하나만 채우면 됩니다. 코드가 알아서 둘 다 인식합니다.

### 3. 마이그레이션 적용

```bash
npx supabase login     # 브라우저 인증 코드를 터미널에 붙여넣기
npx supabase link      # 위에서 만든 blog 프로젝트 선택
npx supabase db push   # supabase/migrations/*.sql 적용
```

> `npx supabase db reset` 은 **로컬 전용**입니다. 프로덕션에서 실행하면 데이터가 전부 사라집니다.

적용되는 마이그레이션은 두 개입니다.

| 파일 | 내용 |
| --- | --- |
| `20241228000000_init_schema.sql` | 테이블 5개 + 트리거 + **조회(SELECT) RLS** |
| `20241229100000_add_write_policies.sql` | **생성/수정/삭제 RLS** (교재에서 글쓰기 때 만난 `row-level security policy` 오류 해결) |

### 4. 실행 & 시드 데이터

```bash
npm install
npm run dev          # http://localhost:3000
```

1. `/auth` 에서 회원가입을 먼저 합니다. (시드 게시글의 작성자로 사용됩니다)
2. 수파베이스 대시보드 **[SQL Editor]** 에 `supabase/seed.sql` 내용을 붙여넣고 **Run**
3. 홈으로 돌아오면 카테고리와 샘플 게시글이 보입니다.

## 프로젝트 구조

```
app/
├─ page.tsx                홈 (카테고리 필터 · 검색 · 페이지네이션)
├─ auth/                   로그인 / 회원가입 (Server Actions)
│  ├─ actions.ts           signIn · signUp · signOut
│  └─ AuthForm.tsx         'use client' — 토글 폼
├─ posts/
│  ├─ actions.ts           게시글 · 댓글 · 좋아요 서버 액션
│  └─ [id]/page.tsx        상세 페이지
├─ write/
│  ├─ page.tsx             인증 확인 후 에디터 렌더링
│  └─ Editor.tsx           'use client' — 마크다운 에디터 + 미리보기
components/                Navbar · PostCard · LikeButton · CommentSection …
lib/posts.ts               서버 전용 게시글 조회 로직
utils/supabase/
├─ client.ts               브라우저용 클라이언트
├─ server.ts               서버 컴포넌트 · 서버 액션용 클라이언트
└─ session.ts              proxy에서 세션 갱신
supabase/migrations/       SQL 마이그레이션
supabase/seed.sql          더미 데이터
proxy.ts                   Next 16의 미들웨어 (구 middleware.ts)
```

## 클라이언트 vs 서버 — 보안 실험 (교재 p.208~212)

이 프로젝트는 **모든 수파베이스 조회를 서버에서** 합니다.
교재의 실험을 그대로 재현하려면:

1. 브라우저에서 홈페이지를 열고 **[검사] → Network** 탭을 확인합니다.
   → 서버 렌더링이므로 `posts?select=...` 같은 수파베이스 요청이 **보이지 않습니다.**
2. `app/page.tsx` 상단에 `'use client'`를 붙이고 `utils/supabase/client.ts`로 바꾸면
   → Network 탭에 응답 JSON이 **전부** 노출됩니다. 화면에 안 보이는 컬럼까지 다 보입니다.

그래서 클라이언트에서 접근할 때는 RLS 정책으로 조회 범위를 반드시 제한해야 합니다.
RLS도 완전한 보안은 아니므로, 민감한 로직은 서버에 두는 편이 안전합니다.

## 자주 만나는 오류

| 오류 메시지 | 원인과 해결 |
| --- | --- |
| `Your project's URL and Key are required...` | `.env.local` 변수 이름 확인 후 개발 서버 재시작 |
| `new row violates row-level security policy` | 쓰기 RLS 미적용 → `npx supabase db push` |
| `Invalid src prop ... is not configured under images` | `next.config.ts`의 `images.remotePatterns`에 호스트 추가 |
| 회원가입 후 로그인이 안 됨 | 수파베이스 **Confirm email** 옵션이 켜져 있는지 확인 |
| 새 글이 홈에 안 보임 | `published`가 `false`(임시저장)인지 확인 |

## 남은 과제 (교재 p.212 언급)

- [ ] 섬네일 이미지 **업로드** (현재는 URL 입력) — Supabase Storage
- [ ] 배포 (Vercel)
- [ ] 조회수, 태그, 무한 스크롤
