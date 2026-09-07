import Link from 'next/link'
import { PenSquare } from 'lucide-react'
import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/auth/actions'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'

/**
 * 서버 컴포넌트입니다. 로그인 여부를 서버에서 확인해 메뉴를 다르게 보여줍니다.
 */
export default async function Navbar() {
  // 헤더는 모든 페이지에 들어가므로, 수파베이스 연결이 실패해도
  // 페이지 전체가 죽지 않도록 로그아웃 상태로 보여줍니다.
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    user = null
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-5">
        <Link href="/" className="font-mono text-lg font-bold tracking-tight">
          {'{ '}
          <span className="text-accent">DevBlog</span>
          {' }'}
        </Link>

        <div className="ml-auto hidden sm:block">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        <ThemeToggle />

        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/write"
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-contrast transition hover:opacity-90"
            >
              <PenSquare size={15} />
              <span className="hidden sm:inline">글쓰기</span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground"
              >
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/auth"
            className="rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-surface-hover"
          >
            로그인
          </Link>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-3 sm:hidden">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  )
}
