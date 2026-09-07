import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from './env'

/**
 * 브라우저(클라이언트 컴포넌트)에서 사용하는 수파베이스 클라이언트.
 * 'use client' 파일에서만 사용하세요. 여기서 조회한 데이터는
 * 브라우저 네트워크 탭에 그대로 노출되므로 RLS 정책이 반드시 필요합니다.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv()
  return createBrowserClient(url, anonKey)
}
