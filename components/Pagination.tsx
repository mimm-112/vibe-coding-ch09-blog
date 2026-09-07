import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  currentPage: number
  totalPages: number
  category?: string
  q?: string
}

export default function Pagination({ currentPage, totalPages, category, q }: Props) {
  if (totalPages <= 1) return null

  function hrefFor(page: number) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (page > 1) params.set('page', String(page))
    return params.size ? `/?${params.toString()}` : '/'
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-4">
      {currentPage > 1 && (
        <Link
          href={hrefFor(currentPage - 1)}
          aria-label="이전 페이지"
          className="rounded-lg border border-border p-2 text-muted transition hover:bg-surface-hover hover:text-foreground"
        >
          <ChevronLeft size={16} />
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={hrefFor(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={
            page === currentPage
              ? 'min-w-9 rounded-lg bg-accent px-3 py-2 text-center text-sm font-semibold text-accent-contrast'
              : 'min-w-9 rounded-lg border border-border px-3 py-2 text-center text-sm text-muted transition hover:bg-surface-hover hover:text-foreground'
          }
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={hrefFor(currentPage + 1)}
          aria-label="다음 페이지"
          className="rounded-lg border border-border p-2 text-muted transition hover:bg-surface-hover hover:text-foreground"
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  )
}
