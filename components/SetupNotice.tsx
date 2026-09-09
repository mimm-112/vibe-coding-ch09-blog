/**
 * 수파베이스 환경 변수가 없을 때 홈에 보여주는 안내 화면.
 *
 * 이 경우를 오류로 던지면 500이 뜨고 무엇이 문제인지 알 수 없습니다.
 * 정상 페이지로 렌더링해서 다음에 할 일을 알려줍니다.
 */
export default function SetupNotice() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16">
      <span className="rounded-full border border-border px-2.5 py-1 text-xs text-accent">
        설정 필요
      </span>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        수파베이스 연결이 아직 설정되지 않았습니다
      </h1>
      <p className="mt-2 leading-relaxed text-muted">
        블로그 자체는 정상적으로 배포되었습니다. 데이터베이스 키만 넣으면 바로 동작합니다.
      </p>

      <ol className="mt-8 flex flex-col gap-5">
        <li className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-semibold">1. 수파베이스 프로젝트 만들기</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            supabase.com → New project → 대시보드 상단 [Connect] 에서 URL과 키를 복사합니다.
            [Authentication → Sign In / Providers] 에서 Confirm email 은 꺼두면 실습이 편합니다.
          </p>
        </li>

        <li className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-semibold">2. 환경 변수 넣기</p>
          <ul className="mt-2 flex flex-col gap-1 font-mono text-xs text-muted">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY</li>
          </ul>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            로컬은 <code className="rounded bg-surface-hover px-1.5 py-0.5">.env.local</code>,
            배포 환경은 Vercel 프로젝트 설정의 Environment Variables 에 넣고 재배포하세요.
          </p>
        </li>

        <li className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-semibold">3. 데이터베이스 만들기</p>
          <pre className="mt-2 overflow-x-auto rounded-xl border border-border bg-background p-3 text-xs text-muted">
{`npx supabase login
npx supabase link
npx supabase db push`}
          </pre>
        </li>
      </ol>

      <p className="mt-8 text-sm text-muted">
        자세한 순서는 저장소의 README 를 참고하세요.
      </p>
    </main>
  )
}
