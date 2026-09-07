import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    /**
     * next/image는 허용된 호스트의 이미지만 최적화합니다.
     * 등록하지 않은 호스트를 쓰면 다음 오류가 납니다.
     *   Invalid src prop ... hostname "xxx" is not configured under images
     * 다른 이미지 호스트를 쓰려면 여기에 추가하세요.
     */
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
}

export default nextConfig
