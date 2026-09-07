'use client'

import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toggleLike } from '@/app/posts/actions'

type Props = {
  postId: string
  initialCount: number
  initialLiked: boolean
  isLoggedIn: boolean
}

/**
 * 좋아요 버튼.
 * 서버 액션(toggleLike)을 호출하기 전에 화면을 먼저 바꾸는 낙관적 업데이트를 씁니다.
 */
export default function LikeButton({
  postId,
  initialCount,
  initialLiked,
  isLoggedIn,
}: Props) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      router.push('/auth')
      return
    }

    const nextLiked = !liked
    setLiked(nextLiked)
    setCount((value) => value + (nextLiked ? 1 : -1))

    startTransition(async () => {
      const result = await toggleLike(postId)
      if (result?.error) {
        // 실패하면 원래 상태로 되돌립니다.
        setLiked(!nextLiked)
        setCount((value) => value + (nextLiked ? -1 : 1))
        alert(result.error)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      className={
        liked
          ? 'flex items-center gap-1.5 rounded-lg border border-accent bg-accent/10 px-3 py-2 text-sm text-accent transition disabled:opacity-60'
          : 'flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground disabled:opacity-60'
      }
    >
      <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
      좋아요 {count}
    </button>
  )
}
