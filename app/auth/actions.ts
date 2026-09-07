'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export type AuthState = { error: string | null }

/** 수파베이스 오류 메시지를 한국어로 바꿔줍니다. */
function toKoreanMessage(message: string) {
  if (message.includes('Invalid login credentials'))
    return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (message.includes('User already registered'))
    return '이미 가입된 이메일입니다. 로그인해주세요.'
  if (message.includes('Password should be at least'))
    return '비밀번호는 6자 이상이어야 합니다.'
  if (message.includes('Email not confirmed'))
    return '이메일 인증이 필요합니다. 수파베이스 [Authentication → Sign In / Providers]에서 Confirm email을 끄면 실습이 편합니다.'
  return message
}

/** 로그인 (useActionState와 함께 사용하는 서버 액션) */
export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: toKoreanMessage(error.message) }

  revalidatePath('/', 'layout')
  redirect(next)
}

/** 회원가입 */
export async function signUp(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const username = String(formData.get('username') ?? '').trim()
  const next = String(formData.get('next') ?? '/')

  if (password.length < 6) {
    return { error: '비밀번호는 6자 이상이어야 합니다.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 트리거(handle_new_user)가 이 값을 읽어 프로필 username을 만듭니다.
      data: { username: username || email.split('@')[0] },
    },
  })

  if (error) return { error: toKoreanMessage(error.message) }

  // Confirm email 옵션이 켜져 있으면 세션 없이 사용자만 생성됩니다.
  if (!data.session) {
    return {
      error:
        '가입은 되었지만 이메일 인증이 필요합니다. 수파베이스 [Authentication → Sign In / Providers]에서 Confirm email을 비활성화하세요.',
    }
  }

  revalidatePath('/', 'layout')
  redirect(next)
}

/** 로그아웃 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
