/** 화면에서 사용하는 도메인 타입 모음 */

export type Category = {
  id: string
  name: string
  slug: string
}

export type Author = {
  id: string
  username: string
  avatar_url: string | null
}

/** 목록(카드)에서 사용하는 게시글 */
export type PostCardData = {
  id: string
  title: string
  excerpt: string | null
  thumbnail_url: string | null
  created_at: string
  category: Pick<Category, 'name' | 'slug'> | null
  author: Pick<Author, 'username' | 'avatar_url'> | null
  likeCount: number
  commentCount: number
}

/** 상세 페이지에서 사용하는 게시글 */
export type PostDetail = {
  id: string
  title: string
  content: string
  excerpt: string | null
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  author_id: string
  category: Pick<Category, 'name' | 'slug'> | null
  author: Pick<Author, 'username' | 'avatar_url'> | null
}

export type Comment = {
  id: string
  content: string
  created_at: string
  author_id: string
  author: Pick<Author, 'username' | 'avatar_url'> | null
}

export const POSTS_PER_PAGE = 6
