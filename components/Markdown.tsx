import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * 마크다운 본문 렌더러.
 * remark-gfm을 붙이면 표, 취소선, 체크박스 같은 GitHub 확장 문법도 사용할 수 있습니다.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
