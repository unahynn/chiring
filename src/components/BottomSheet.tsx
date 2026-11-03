import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import './BottomSheet.css'

type Props = {
  open: boolean
  onClose: () => void
  /** dark: 사주 설정의 시간 선택 / light: 캐해 리포트 상세 */
  tone?: 'dark' | 'light'
  /** 시트 위쪽(잡고 끌어내릴 수 있는 부분) */
  header?: ReactNode
  children: ReactNode
  /** 시트 바깥 위로 튀어나오는 것 (리포트 상세의 큰 영문 제목, 닫기 버튼) */
  overhang?: ReactNode
  className?: string
  label: string
}

/**
 * 아래에서 올라오는 시트. 배경을 누르거나, 위쪽을 잡고 아래로 끌거나, ESC로 닫혀요.
 * 화면(.phone) 안에 position:absolute로 깔려서 PC 미리보기에서도 폰 프레임 안에만 보여요.
 */
export default function BottomSheet({ open, onClose, tone = 'dark', header, children, overhang, className = '', label }: Props) {
  // 닫힐 때 내려가는 애니메이션이 끝날 때까지는 그려 둬요
  const [rendered, setRendered] = useState(open)
  if (open && !rendered) setRendered(true)

  const [drag, setDrag] = useState(0)
  const dragStart = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!rendered) return null

  const onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return
    dragStart.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    if (dragStart.current === null) return
    setDrag(Math.max(0, e.clientY - dragStart.current))
  }
  const onUp = () => {
    if (dragStart.current === null) return
    dragStart.current = null
    // 충분히 끌어내렸으면 그 자리에서 그대로 내려가며 닫혀요
    if (drag > 90) onClose()
    else setDrag(0)
  }

  return (
    <div className={`sheet-layer sheet-layer--${tone}${open ? '' : ' is-closing'}`} role="dialog" aria-modal="true" aria-label={label}>
      <div className="sheet-layer__dim" onClick={onClose} />
      <div
        className={`sheet sheet--${tone} ${className}`}
        style={drag ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined}
        onAnimationEnd={(e) => {
          if (!open && e.target === e.currentTarget) {
            setRendered(false)
            setDrag(0)
          }
        }}
      >
        {overhang && (
          <div className="sheet__overhang" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            {overhang}
          </div>
        )}
        {header && (
          <div className="sheet__header" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            {header}
          </div>
        )}
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  )
}
