import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-3 px-5 py-24 text-center">
      <p className="font-mono text-5xl font-bold text-accent">404</p>
      <h1 className="text-xl font-semibold">글을 찾을 수 없습니다</h1>
      <p className="text-sm text-muted">
        삭제되었거나 주소가 잘못되었을 수 있습니다.
      </p>
      <Link
        href="/"
        className="mt-3 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-contrast transition hover:opacity-90"
      >
        홈으로 가기
      </Link>
    </main>
  )
}
