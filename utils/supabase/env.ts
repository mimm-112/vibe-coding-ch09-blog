/**
 * 수파베이스 환경 변수 읽기.
 *
 * 수파베이스가 Anon Key -> Publishable Key로 이름을 바꾸는 중이라
 * 두 이름 중 존재하는 값을 사용합니다. (교재 챕터 09 '바이브 UP!' 참고)
 *
 * Next.js는 NEXT_PUBLIC_ 접두사가 붙은 변수를 빌드 시점에 문자열로 치환하므로
 * process.env.NEXT_PUBLIC_XXX 형태로 "직접" 읽어야 합니다.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      '수파베이스 환경 변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL과 ' +
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY(또는 NEXT_PUBLIC_SUPABASE_ANON_KEY)를 설정하세요.',
    )
  }

  return { url, anonKey }
}
