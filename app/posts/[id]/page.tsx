import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, PenLine } from 'lucide-react'
import CommentSection from '@/components/CommentSection'
import DeletePostButton from '@/components/DeletePostButton'
import LikeButton from '@/components/LikeButton'
import Markdown from '@/components/Markdown'
import ShareButton from '@/components/ShareButton'
import { formatDate, readingTime } from '@/lib/format'
import { createClient } from '@/utils/supabase/server'
import type { PostDetail } from '@/types/blog'

export const dynamic = 'force-dynamic'

/** 데이터를 한 번만 조회하도록 분리했습니다. */
async function getPost(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(
      `id, title, content, excerpt, thumbnail_url, created_at, updated_at, author_id,
       category:categories(name, slug),
       author:profiles(username, avatar_url)`,
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null

  const row = data as Record<string, unknown>
  return {
    ...(row as unknown as PostDetail),
    category: Array.isArray(row.category) ? row.category[0] : row.category,
    author: Array.isArray(row.author) ? row.author[0] : row.author,
  } as PostDetail
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)

  if (!post) return { title: '글을 찾을 수 없습니다 · DevBlog' }

  return {
    title: `${post.title} · DevBlog`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.thumbnail_url ? [post.thumbnail_url] : undefined,
      type: 'article',
    },
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) notFound()

  const supabase = await createClient()
  const [{ data: userData }, { count: likeCount }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id),
  ])

  const user = userData.user
  const isAuthor = user?.id === post.author_id

  let liked = false
  if (user) {
    const { data: myLike } = await supabase
      .from('likes')
      .select('post_id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    liked = Boolean(myLike)
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={15} /> 목록으로
      </Link>

      <article className="mt-8">
        <header className="border-b border-border pb-8">
          {post.category && (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-accent">
              {post.category.name}
            </span>
          )}

          <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span className="font-medium text-foreground">
              {post.author?.username ?? '알 수 없음'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />약 {readingTime(post.content)}분
            </span>
          </div>
        </header>

        {post.thumbnail_url && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-surface">
            <Image
              src={post.thumbnail_url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mt-10">
          <Markdown>{post.content}</Markdown>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-2">
          <LikeButton
            postId={post.id}
            initialCount={likeCount ?? 0}
            initialLiked={liked}
            isLoggedIn={Boolean(user)}
          />
          <ShareButton title={post.title} />

          {isAuthor && (
            <div className="ml-auto flex gap-2">
              <Link
                href={`/write?edit=${post.id}`}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground"
              >
                <PenLine size={15} /> 수정
              </Link>
              <DeletePostButton postId={post.id} />
            </div>
          )}
        </div>
      </article>

      <CommentSection postId={post.id} />
    </main>
  )
}
