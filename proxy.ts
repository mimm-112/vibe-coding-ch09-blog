import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/session'

/**
 * Next.js 16부터 middleware.ts 대신 proxy.ts 를 사용합니다.
 * (교재는 Next 16.1 기준으로 middleware.ts 를 쓰지만 동작은 같습니다.)
 * 모든 요청 전에 실행되어 수파베이스 세션 쿠키를 갱신합니다.
 */
export default async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 정적 파일과 이미지 최적화 요청을 제외한 모든 경로에서 세션을 갱신합니다.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
