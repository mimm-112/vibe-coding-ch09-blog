import 'server-only'
import { createClient } from '@/utils/supabase/server'
import { POSTS_PER_PAGE, type Category, type PostCardData } from '@/types/blog'

/**
 * PostgREST의 .or() 필터는 콤마와 괄호로 조건을 구분합니다.
 * 사용자가 입력한 검색어에 이런 문자가 들어가면 필터 문법이 깨지므로 제거합니다.
 */
function sanitizeSearchTerm(term: string) {
  return term.replace(/[,()\\%*]/g, ' ').trim().slice(0, 60)
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  if (error) throw new Error(`카테고리 조회 실패: ${error.message}`)
  return data ?? []
}

type FetchPostsOptions = {
  category?: string
  q?: string
  page?: number
}

/**
 * 홈페이지 게시글 목록 조회.
 * - 카테고리 필터 : categories!inner + eq('categories.slug', ...)
 * - 검색          : 제목 / 요약 / 본문 ILIKE (한글은 tsvector 토크나이징이 잘 안 되므로 ILIKE 사용)
 * - 페이지네이션  : range() + count: 'exact'
 * - 좋아요/댓글 수 : PostgREST 집계 임베딩 likes(count)
 */
export async function getPosts({
  category,
  q,
  page = 1,
}: FetchPostsOptions): Promise<{ posts: PostCardData[]; totalCount: number }> {
  const supabase = await createClient()
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  // 카테고리로 걸러낼 때는 !inner 조인이 필요합니다.
  // 임베딩에 별칭(category:)을 붙이면 필터 이름도 별칭을 따라가야 해서
  // 헷갈리기 쉬우므로 여기서는 테이블 이름을 그대로 사용합니다.
  const categoryRelation = category ? 'categories!inner' : 'categories'

  let query = supabase
    .from('posts')
    .select(
      `id, title, excerpt, thumbnail_url, created_at,
       ${categoryRelation}(name, slug),
       profiles(username, avatar_url),
       likes(count),
       comments(count)`,
      { count: 'exact' },
    )
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (category) {
    query = query.eq('categories.slug', category)
  }

  if (q) {
    const term = sanitizeSearchTerm(q)
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`,
      )
    }
  }

  const { data, error, count } = await query
  if (error) throw new Error(`게시글 조회 실패: ${error.message}`)

  const posts: PostCardData[] = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    excerpt: (row.excerpt as string | null) ?? null,
    thumbnail_url: (row.thumbnail_url as string | null) ?? null,
    created_at: row.created_at as string,
    category: normalizeOne(row.categories) as PostCardData['category'],
    author: normalizeOne(row.profiles) as PostCardData['author'],
    likeCount: readCount(row.likes),
    commentCount: readCount(row.comments),
  }))

  return { posts, totalCount: count ?? 0 }
}

/** 임베딩 결과가 배열/객체 어느 쪽으로 와도 하나의 객체로 정규화합니다. */
function normalizeOne(value: unknown) {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

/** likes(count) 임베딩 결과 [{ count: 3 }] 에서 숫자만 꺼냅니다. */
function readCount(value: unknown): number {
  if (Array.isArray(value)) {
    const first = value[0] as { count?: number } | undefined
    return first?.count ?? 0
  }
  if (value && typeof value === 'object' && 'count' in value) {
    return (value as { count: number }).count ?? 0
  }
  return 0
}
