'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

/**
 * 서버 액션 모음.
 * 모든 쓰기 작업은 서버에서 실행되고, 수파베이스 RLS 정책이 한 번 더 검증합니다.
 */

/** RLS 위반 오류를 사람이 읽을 수 있는 문장으로 바꿉니다. */
function toKoreanMessage(message: string) {
  if (message.includes('row-level security'))
    return 'RLS 정책에 막혔습니다. supabase/migrations의 쓰기 정책을 적용했는지(npx supabase db push) 확인하세요.'
  return message
}

/** 게시글 작성 */
export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요합니다.' }

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const categoryId = String(formData.get('category_id') ?? '')
  const thumbnailUrl = String(formData.get('thumbnail_url') ?? '').trim()
  const published = formData.get('published') !== 'draft'

  if (!title) return { error: '제목을 입력해주세요.' }
  if (!content) return { error: '내용을 입력해주세요.' }

  // 본문 앞부분을 잘라 카드용 요약으로 사용합니다.
  const excerpt = content
    .replace(/[#>*`\-_[\]()!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140)

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title,
      content,
      excerpt,
      thumbnail_url: thumbnailUrl || null,
      category_id: categoryId || null,
      author_id: user.id,
      published,
    })
    .select('id')
    .single()

  if (error) return { error: toKoreanMessage(error.message) }

  revalidatePath('/')
  redirect(`/posts/${data.id}`)
}

/** 게시글 수정 */
export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient()

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const categoryId = String(formData.get('category_id') ?? '')
  const thumbnailUrl = String(formData.get('thumbnail_url') ?? '').trim()

  if (!title) return { error: '제목을 입력해주세요.' }
  if (!content) return { error: '내용을 입력해주세요.' }

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      content,
      thumbnail_url: thumbnailUrl || null,
      category_id: categoryId || null,
    })
    .eq('id', postId)

  if (error) return { error: toKoreanMessage(error.message) }

  revalidatePath('/')
  revalidatePath(`/posts/${postId}`)
  redirect(`/posts/${postId}`)
}

/** 게시글 삭제 */
export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('posts').delete().eq('id', postId)

  if (error) return { error: toKoreanMessage(error.message) }

  revalidatePath('/')
  redirect('/')
}

/** 좋아요 추가 / 취소 (N:N 관계 테이블에 행을 넣고 빼는 작업) */
export async function toggleLike(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: existing } = await supabase
    .from('likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  const { error } = existing
    ? await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
    : await supabase.from('likes').insert({ post_id: postId, user_id: user.id })

  if (error) return { error: toKoreanMessage(error.message) }

  revalidatePath(`/posts/${postId}`)
  revalidatePath('/')
  return { error: null }
}

/** 댓글 작성 */
export async function createComment(postId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요합니다.' }

  const content = String(formData.get('content') ?? '').trim()
  if (!content) return { error: '댓글 내용을 입력해주세요.' }

  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: user.id, content })

  if (error) return { error: toKoreanMessage(error.message) }

  revalidatePath(`/posts/${postId}`)
  return { error: null }
}

/** 댓글 삭제 */
export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  const { data: comment } = await supabase
    .from('comments')
    .select('post_id')
    .eq('id', commentId)
    .single()

  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) return { error: toKoreanMessage(error.message) }

  if (comment) revalidatePath(`/posts/${comment.post_id}`)
  return { error: null }
}
