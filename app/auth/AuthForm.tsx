'use client'

import { useActionState, useState } from 'react'
import { signIn, signUp, type AuthState } from './actions'

const initialState: AuthState = { error: null }

/**
 * 로그인 / 회원가입 토글 폼.
 * 실제 인증 처리는 서버 액션(signIn, signUp)에서 하기 때문에
 * 비밀번호가 클라이언트 자바스크립트에 남지 않습니다.
 */
export default function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const action = mode === 'signin' ? signIn : signUp
  const [state, formAction, isPending] = useActionState(action, initialState)

  return (
    <div className="rounded-2xl border border-border bg-surface p-7">
      {/* 탭 */}
      <div className="mb-7 grid grid-cols-2 gap-1 rounded-xl border border-border p-1">
        {(['signin', 'signup'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={
              mode === value
                ? 'rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-contrast'
                : 'rounded-lg px-3 py-2 text-sm text-muted transition hover:text-foreground'
            }
          >
            {value === 'signin' ? '로그인' : '회원가입'}
          </button>
        ))}
      </div>

      <h1 className="text-xl font-bold">
        {mode === 'signin' ? '환영합니다' : '계정 만들기'}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === 'signin'
          ? '계정에 로그인하여 계속하세요'
          : '이메일과 비밀번호로 새 계정을 만들어보세요'}
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        {mode === 'signup' && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted">닉네임</span>
            <input
              name="username"
              type="text"
              maxLength={20}
              placeholder="devkim"
              className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-accent"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">이메일</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">비밀번호</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            placeholder="6자 이상"
            className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-accent"
          />
        </label>

        {state.error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-contrast transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending
            ? '처리 중…'
            : mode === 'signin'
              ? '로그인'
              : '회원가입'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-muted">
        소셜 로그인 없이 이메일 인증만 사용합니다 (교재 챕터 09 실습 기준)
      </p>
    </div>
  )
}
