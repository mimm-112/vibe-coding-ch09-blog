import type { Metadata } from 'next'
import CategoryFilter from '@/components/CategoryFilter'
import SetupNotice from '@/components/SetupNotice'
import Pagination from '@/components/Pagination'
import PostList from '@/components/PostList'
import { getCategories, getPosts } from '@/lib/posts'
import { POSTS_PER_PAGE } from '@/types/blog'
import { hasSupabaseEnv } from '@/utils/supabase/env'

export const metadata: Metadata = {
  title: 'DevBlog — 개발자 블로그',
  description: 'Next.js와 수파베이스로 만든 개발자 블로그',
}

// 글을 쓰면 바로 반영되도록 매 요청마다 새로 렌더링합니다.
export const dynamic = 'force-dynamic'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>
}) {
  // 키가 없으면 오류를 던지는 대신 무엇을 해야 하는지 보여줍니다.
  if (!hasSupabaseEnv()) return <SetupNotice />

  const { category, q, page } = await searchParams
  const currentPage = Math.max(1, Number(page ?? '1') || 1)

  // 서버 컴포넌트이므로 이 조회는 브라우저 네트워크 탭에 보이지 않습니다.
  const [categories, { posts, totalCount }] = await Promise.all([
    getCategories(),
    getPosts({ category, q, page: currentPage }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE))

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12">
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          기록하는 개발자
        </h1>
        <p className="mt-2 text-muted">
          바이브 코딩으로 배운 것을 정리하는 공간입니다.
        </p>
      </section>

      <div className="mb-8">
        <CategoryFilter categories={categories} selected={category} q={q} />
      </div>

      {q && (
        <p className="mb-6 text-sm text-muted">
          <span className="text-foreground">&ldquo;{q}&rdquo;</span> 검색 결과{' '}
          {totalCount}건
        </p>
      )}

      <PostList posts={posts} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        category={category}
        q={q}
      />
    </main>
  )
}
