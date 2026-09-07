/** 2026-09-07 형태로 날짜를 표시합니다. */
export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** 마크다운 본문 기준 예상 읽기 시간(분) */
export function readingTime(content: string) {
  const characters = content.replace(/\s/g, '').length
  return Math.max(1, Math.round(characters / 500))
}
