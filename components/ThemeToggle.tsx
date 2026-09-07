'use client'

import { Moon, Sun } from 'lucide-react'

/**
 * 다크 모드 기본, 라이트 모드 지원.
 *
 * 현재 테마를 리액트 상태로 들고 있으면 서버 렌더링 결과와 달라져
 * 하이드레이션 불일치가 생깁니다. 그래서 테마는 html 클래스(=DOM)에만 두고,
 * 어떤 아이콘을 보여줄지는 CSS(.icon-when-dark / .icon-when-light)로 정합니다.
 */
export default function ThemeToggle() {
  function toggle() {
    const nextIsLight = !document.documentElement.classList.contains('light')
    document.documentElement.classList.toggle('light', nextIsLight)
    localStorage.setItem('theme', nextIsLight ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="라이트/다크 모드 전환"
      className="rounded-lg border border-border p-2 text-muted transition hover:bg-surface-hover hover:text-foreground"
    >
      <Sun size={16} className="icon-when-dark" />
      <Moon size={16} className="icon-when-light" />
    </button>
  )
}
