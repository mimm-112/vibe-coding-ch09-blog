'use client'

import Link from 'next/link'
import { useRef, useState, useTransition } from 'react'
import { createComment } from '@/app/posts/actions'

export default function CommentForm({
  postId,
  isLoggedIn,
}: {
  postId: string
  isLoggedIn: boolean
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!isLoggedIn) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted">
        댓글을 쓰려면{' '}
        <Link href="/auth" className="text-accent underline underline-offset-4">
          로그인
        </Link>
        이 필요합니다.
      </p>
    )
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await createComment(postId, formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      setError(null)
      formRef.current?.reset()
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        name="content"
        required
        rows={3}
        maxLength={1000}
        placeholder="댓글을 입력하세요"
        className="w-full resize-y rounded-xl border border-border bg-surface p-3 text-sm outline-none transition placeholder:text-muted focus:border-accent"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="ml-auto rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? '등록 중…' : '댓글 등록'}
      </button>
    </form>
  )
}
