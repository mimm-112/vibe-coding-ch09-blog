import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'DevBlog — 개발자 블로그',
    template: '%s',
  },
  description: 'Next.js와 수파베이스로 만든 개발자 블로그 (교재 챕터 09 실습)',
}

/**
 * 다크 모드가 기본입니다.
 * 라이트 모드를 선택한 사용자에게 흰 화면이 깜빡이지 않도록
 * 렌더링 전에 localStorage 값을 읽어 html 클래스를 붙입니다.
 */
const themeScript = `
(function () {
  try {
    if (localStorage.getItem('theme') === 'light') {
      document.documentElement.classList.add('light');
    }
  } catch (e) {}
})();
`

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
