import { createClient } from '@/utils/supabase/server'
import type { Comment } from '@/types/blog'
import { formatDate } from '@/lib/format'
import CommentForm from './CommentForm'
import DeleteCommentButton from './DeleteCommentButton'

/** 게시글 상세 페이지의 댓글 영역 (서버 컴포넌트) */
export default async function CommentSection({ postId }: { postId: string }) {
  const supabase = await createClient()

  const [{ data: comments }, { data: userData }] = await Promise.all([
    supabase
      .from('comments')
      .select('id, content, created_at, author_id, author:profiles(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true }),
    supabase.auth.getUser(),
  ])

  const list = (comments ?? []).map((row: Record<string, unknown>) => ({
    ...(row as unknown as Comment),
    author: Array.isArray(row.author) ? row.author[0] : row.author,
  })) as Comment[]

  const currentUserId = userData.user?.id ?? null

  return (
    <section className="mt-14 border-t border-border pt-10">
      <h2 className="text-lg font-semibold">댓글 {list.length}</h2>

      <div className="mt-6">
        <CommentForm postId={postId} isLoggedIn={Boolean(currentUserId)} />
      </div>

      <ul className="mt-8 flex flex-col gap-5">
        {list.map((comment) => (
          <li
            key={comment.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                {comment.author?.username ?? '알 수 없음'}
              </span>
              <time className="text-xs text-muted" dateTime={comment.created_at}>
                {formatDate(comment.created_at)}
              </time>
              {currentUserId === comment.author_id && (
                <span className="ml-auto">
                  <DeleteCommentButton commentId={comment.id} />
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </li>
        ))}

        {list.length === 0 && (
          <li className="text-sm text-muted">첫 댓글을 남겨보세요.</li>
        )}
      </ul>
    </section>
  )
}
