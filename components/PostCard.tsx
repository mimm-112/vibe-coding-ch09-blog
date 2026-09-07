import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageSquare } from 'lucide-react'
import type { PostCardData } from '@/types/blog'
import { formatDate } from '@/lib/format'

export default function PostCard({ post }: { post: PostCardData }) {
  return (
    <article className="animate-fade-in-up overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/60">
      <Link href={`/posts/${post.id}`} className="block">
        {post.thumbnail_url && (
          <div className="relative aspect-[16/9] w-full bg-surface-hover">
            <Image
              src={post.thumbnail_url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-2.5 p-5">
          {post.category && (
            <span className="w-fit rounded-full border border-border px-2.5 py-0.5 text-xs text-accent">
              {post.category.name}
            </span>
          )}

          <h2 className="line-clamp-2 text-lg leading-snug font-semibold">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted">
              {post.excerpt}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-muted">
            <span>{post.author?.username ?? '알 수 없음'}</span>
            <span>·</span>
            <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
            <span className="ml-auto flex items-center gap-1">
              <Heart size={13} /> {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={13} /> {post.commentCount}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
