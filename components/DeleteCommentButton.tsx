'use client'

import { X } from 'lucide-react'
import { useTransition } from 'react'
import { deleteComment } from '@/app/posts/actions'

export default function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      aria-label="댓글 삭제"
      disabled={isPending}
      onClick={() => {
        if (!confirm('댓글을 삭제할까요?')) return
        startTransition(async () => {
          const result = await deleteComment(commentId)
          if (result?.error) alert(result.error)
        })
      }}
      className="text-muted transition hover:text-red-400 disabled:opacity-60"
    >
      <X size={15} />
    </button>
  )
}
