'use client'

import { Bold, Code, Eye, Heading2, Link2, List, PenSquare } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useRef, useState, useTransition } from 'react'
import { createPost, updatePost } from '@/app/posts/actions'
import type { Category } from '@/types/blog'

/** 마크다운 툴바. 컴포넌트 바깥 상수라 렌더링마다 새로 만들어지지 않습니다. */
const TOOLBAR = [
  { icon: Bold, label: '굵게', before: '**', after: '**' },
  { icon: Heading2, label: '제목', before: '## ', after: '' },
  { icon: List, label: '목록', before: '- ', after: '' },
  { icon: Code, label: '코드', before: '\n```ts\n', after: '\n```\n' },
  { icon: Link2, label: '링크', before: '[', after: '](https://)' },
] as const

type EditablePost = {
  id: string
  title: string
  content: string
  thumbnail_url: string | null
  category_id: string | null
}

/**
 * 마크다운 에디터.
 * 왼쪽은 입력, 오른쪽은 실시간 미리보기입니다. (교재 write.png 목업 기준)
 */
export default function Editor({
  categories,
  post,
}: {
  categories: Category[]
  post: EditablePost | null
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState(post?.title ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [error, setError] = useState<string | null>(null)
  const [mobilePreview, setMobilePreview] = useState(false)
  const [isPending, startTransition] = useTransition()

  /** 툴바 버튼: 선택 영역을 마크다운 문법으로 감쌉니다. */
  function wrapSelection(before: string, after = '') {
    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd } = textarea
    const selected = content.slice(selectionStart, selectionEnd)
    const next =
      content.slice(0, selectionStart) +
      before +
      selected +
      after +
      content.slice(selectionEnd)

    setContent(next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(
        selectionStart + before.length,
        selectionStart + before.length + selected.length,
      )
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // 두 번째 인자로 submitter를 넘겨야 [발행]/[임시저장] 버튼의 value가 담깁니다.
    const submitter = (event.nativeEvent as SubmitEvent).submitter as
      | HTMLButtonElement
      | undefined
    const formData = new FormData(event.currentTarget, submitter)

    startTransition(async () => {
      const result = post
        ? await updatePost(post.id, formData)
        : await createPost(formData)
      // 성공하면 서버 액션이 redirect 하므로 아래는 실패했을 때만 실행됩니다.
      if (result?.error) setError(result.error)
    })
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <form onSubmit={handleSubmit} className="flex h-full flex-col gap-5">
        {/* 제목 */}
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="제목을 입력하세요"
          required
          maxLength={120}
          className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted"
        />

        {/* 메타 정보 */}
        <div className="flex flex-wrap gap-3">
          <select
            name="category_id"
            defaultValue={post?.category_id ?? ''}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">카테고리 선택</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            name="thumbnail_url"
            type="url"
            defaultValue={post?.thumbnail_url ?? ''}
            placeholder="섬네일 이미지 URL (선택)"
            className="min-w-56 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
          />
        </div>

        {/* 툴바 */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1.5">
          {TOOLBAR.map(({ icon: Icon, label, before, after }) => (
            <button
              key={label}
              type="button"
              onClick={() => wrapSelection(before, after)}
              title={label}
              aria-label={label}
              className="rounded-lg p-2 text-muted transition hover:bg-surface-hover hover:text-foreground"
            >
              <Icon size={16} />
            </button>
          ))}

          <button
            type="button"
            onClick={() => setMobilePreview((value) => !value)}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-muted transition hover:text-foreground lg:hidden"
          >
            <Eye size={16} />
            {mobilePreview ? '편집' : '미리보기'}
          </button>
        </div>

        {/* 에디터 + 미리보기 */}
        <div className="grid min-h-[55vh] gap-4 lg:grid-cols-2">
          <textarea
            ref={textareaRef}
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={'마크다운으로 작성하세요.\n\n## 제목\n- 목록\n**굵게**'}
            required
            className={`w-full resize-none rounded-2xl border border-border bg-surface p-5 font-mono text-sm leading-relaxed outline-none transition placeholder:text-muted focus:border-accent ${
              mobilePreview ? 'hidden lg:block' : ''
            }`}
          />

          <div
            className={`overflow-auto rounded-2xl border border-border bg-surface p-6 ${
              mobilePreview ? '' : 'hidden lg:block'
            }`}
          >
            {content ? (
              <div className="prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted">
                여기에 미리보기가 표시됩니다.
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* 발행 / 임시저장 */}
        <div className="flex justify-end gap-2">
          {!post && (
            <button
              type="submit"
              name="published"
              value="draft"
              disabled={isPending}
              className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground disabled:opacity-60"
            >
              임시저장
            </button>
          )}

          <button
            type="submit"
            name="published"
            value="publish"
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition hover:opacity-90 disabled:opacity-60"
          >
            <PenSquare size={15} />
            {isPending ? '저장 중…' : post ? '수정 완료' : '발행'}
          </button>
        </div>
      </form>
    </main>
  )
}
