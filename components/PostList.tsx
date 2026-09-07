import type { PostCardData } from '@/types/blog'
import PostCard from './PostCard'

export default function PostList({ posts }: { posts: PostCardData[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <p className="font-medium">아직 글이 없습니다.</p>
        <p className="mt-1 text-sm text-muted">
          첫 글을 작성해보세요. 상단의 [글쓰기] 버튼을 누르면 됩니다.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
