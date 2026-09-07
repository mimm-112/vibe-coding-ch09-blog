'use client'

import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import { deletePost } from '@/app/posts/actions'

/** 본인 글만 보이는 삭제 버튼. RLS 정책에서도 한 번 더 막습니다. */
export default function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('이 글을 삭제할까요? 되돌릴 수 없습니다.')) return

    startTransition(async () => {
      const result = await deletePost(postId)
      if (result?.error) alert(result.error)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition hover:border-red-500/60 hover:text-red-400 disabled:opacity-60"
    >
      <Trash2 size={15} />
      삭제
    </button>
  )
}
