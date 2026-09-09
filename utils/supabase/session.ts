import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseEnv } from './env'

/** 매 요청마다 만료된 인증 토큰을 갱신해 로그인 상태를 유지합니다. */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // proxy는 페이지 렌더링보다 먼저 실행됩니다.
  // 여기서 예외를 던지면 앱이 통째로 500을 내면서 원인도 보이지 않으므로,
  // 환경 변수가 없으면 세션 갱신을 건너뛰고 페이지가 뜨게 둡니다.
  // (그러면 app/error.tsx 가 무엇을 설정해야 하는지 알려줍니다.)
  let supabaseUrl: string
  let anonKey: string
  try {
    ;({ url: supabaseUrl, anonKey } = getSupabaseEnv())
  } catch {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  // getUser()를 호출해야 토큰이 갱신됩니다. 이 줄을 지우지 마세요.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 로그인이 필요한 경로 보호
  const needsAuth = request.nextUrl.pathname.startsWith('/write')

  if (!user && needsAuth) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
