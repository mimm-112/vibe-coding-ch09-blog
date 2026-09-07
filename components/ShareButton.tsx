'use client'

import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'

/** 현재 글 주소를 복사합니다. navigator API를 쓰므로 클라이언트 컴포넌트입니다. */
export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // 사용자가 공유를 취소한 경우 아래 복사로 넘어갑니다.
      }
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground"
    >
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      {copied ? '주소 복사됨' : '공유'}
    </button>
  )
}
