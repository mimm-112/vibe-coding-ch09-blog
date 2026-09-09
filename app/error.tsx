'use client'

import Link from 'next/link'

/**
 * 페이지 렌더링 중 오류가 났을 때 보여주는 화면.
 *
 * 가장 흔한 원인은 수파베이스 환경 변수 미설정이라,
 * 흰 화면이나 500 대신 무엇을 해야 하는지 알려줍니다.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isEnvError = error.message.includes('수파베이스 환경 변수')

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-5 py-24 text-center">
      <p className="font-mono text-4xl font-bold text-accent">!</p>

      <h1 className="text-xl font-semibold">
        {isEnvError ? '아직 설정이 끝나지 않았습니다' : '문제가 발생했습니다'}
      </h1>

      {isEnvError ? (
        <div className="text-sm leading-relaxed text-muted">
          <p>수파베이스 환경 변수가 없어 데이터를 불러오지 못했습니다.</p>
          <p className="mt-3">
            로컬이라면 <code className="rounded bg-surface px-1.5 py-0.5">.env.local</code>,
            배포 환경이라면 Vercel 프로젝트 설정의 Environment Variables에
            아래 두 값을 넣어주세요.
          </p>
          <ul className="mt-3 flex flex-col gap-1 font-mono text-xs">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY</li>
          </ul>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-muted">
          잠시 후 다시 시도해주세요. 문제가 계속되면 아래 메시지를 확인하세요.
        </p>
      )}

      <pre className="mt-2 max-w-full overflow-x-auto rounded-xl border border-border bg-surface p-3 text-left text-xs text-muted">
        {error.message}
      </pre>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-contrast transition hover:opacity-90"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground"
        >
          홈으로
        </Link>
      </div>
    </main>
  )
}
