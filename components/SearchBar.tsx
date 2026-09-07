'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

/** 제목/요약/본문을 검색합니다. 검색어는 쿼리스트링(?q=)으로 전달합니다. */
export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [term, setTerm] = useState(searchParams.get('q') ?? '')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (term.trim()) params.set('q', term.trim())
    const category = searchParams.get('category')
    if (category) params.set('category', category)
    router.push(params.size ? `/?${params.toString()}` : '/')
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
      <Search
        size={15}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="글 검색"
        className="w-full rounded-lg border border-border bg-surface py-2 pr-3 pl-9 text-sm outline-none transition placeholder:text-muted focus:border-accent"
      />
    </form>
  )
}
