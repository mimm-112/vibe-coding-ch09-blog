import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Editor from './Editor'

export const metadata: Metadata = {
  title: '글쓰기 · DevBlog',
}

export const dynamic = 'force-dynamic'

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 미들웨어에서도 막지만, 서버 컴포넌트에서 한 번 더 확인합니다.
  if (!user) redirect('/auth?next=/write')

  const { edit } = await searchParams

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  // 수정 모드라면 기존 글을 불러옵니다.
  let post = null
  if (edit) {
    const { data } = await supabase
      .from('posts')
      .select('id, title, content, thumbnail_url, category_id, author_id')
      .eq('id', edit)
      .maybeSingle()

    // 남의 글은 수정할 수 없습니다. (RLS에서도 막힙니다)
    if (data && data.author_id === user.id) post = data
  }

  return <Editor categories={categories ?? []} post={post} />
}
