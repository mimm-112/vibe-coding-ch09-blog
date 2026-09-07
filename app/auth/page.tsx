import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AuthForm from './AuthForm'

export const metadata: Metadata = {
  title: '로그인 · DevBlog',
  description: 'DevBlog 로그인 및 회원가입',
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 이미 로그인했다면 홈으로 보냅니다.
  if (user) redirect('/')

  const { next } = await searchParams

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <div className="mb-8 text-center">
        <p className="font-mono text-xl font-bold">
          {'{ '}
          <span className="text-accent">DevBlog</span>
          {' }'}
        </p>
      </div>
      <AuthForm next={next ?? '/'} />
    </main>
  )
}
