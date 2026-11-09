import { CaretLeftIcon } from './icons'

// 스타일: screens/Frequency.css 의 .freq__round

/** 상단 왼쪽 동그란 닫기(X) 버튼 */
export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="freq__round" onClick={onClick} aria-label="닫기">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M0.922852 0.923828L14.9229 14.9238M14.9229 0.923828L0.922852 14.9238"
          stroke="white"
          strokeWidth="1.84593"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

/** 상단 왼쪽 동그란 뒤로(<) 버튼 */
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="freq__round" onClick={onClick} aria-label="뒤로">
      <CaretLeftIcon size={22} />
    </button>
  )
}
