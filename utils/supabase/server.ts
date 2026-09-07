import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseEnv } from './env'

/**
 * 서버 컴포넌트 / 서버 액션 / 라우트 핸들러에서 사용하는 수파베이스 클라이언트.
 * 요청이 서버에서 나가기 때문에 브라우저 네트워크 탭에 노출되지 않습니다.
 */
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // 서버 컴포넌트에서 호출된 경우 쿠키를 쓸 수 없습니다.
          // 미들웨어가 세션을 갱신해주므로 무시해도 됩니다.
        }
      },
    },
  })
}
