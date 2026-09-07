export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-8 text-sm text-muted">
        <p className="font-mono text-foreground">{'{ DevBlog }'}</p>
        <p>Next.js · Supabase · 바이브 코딩으로 만든 개발자 블로그</p>
        <p className="text-xs">
          © {new Date().getFullYear()} DevBlog — 교재 챕터 09 실습 프로젝트
        </p>
      </div>
    </footer>
  )
}
