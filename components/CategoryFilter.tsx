import Link from 'next/link'
import type { Category } from '@/types/blog'

type Props = {
  categories: Category[]
  selected?: string
  q?: string
}

/** 카테고리별 필터링. 링크만 사용하므로 서버 컴포넌트로 둘 수 있습니다. */
export default function CategoryFilter({ categories, selected, q }: Props) {
  function hrefFor(slug?: string) {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    if (q) params.set('q', q)
    return params.size ? `/?${params.toString()}` : '/'
  }

  const items = [{ id: 'all', name: '전체', slug: undefined as string | undefined }, ...categories]

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.slug === selected || (!item.slug && !selected)
        return (
          <Link
            key={item.id}
            href={hrefFor(item.slug)}
            className={
              active
                ? 'rounded-full border border-accent bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-contrast'
                : 'rounded-full border border-border px-3.5 py-1.5 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground'
            }
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
