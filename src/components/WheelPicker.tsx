import { useEffect, useRef, useState, type PointerEvent } from 'react'
import './WheelPicker.css'

/** 한 칸 높이. 3칸(위·가운데·아래)이 보여요 */
const ROW = 65

type Option<T> = { value: T; label: string }

type Props<T> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * iOS 스타일 휠 한 줄.
 * 브라우저 스크롤 대신 손가락 움직임을 직접 따라가고, 놓으면 관성으로 미끄러지다
 * 항상 가운데 칸에 딱 맞춰 멈춰요 (칸마다 어긋나지 않게).
 */
export default function WheelPicker<T>({ options, value, onChange, label }: Props<T>) {
  const initial = Math.max(0, options.findIndex((o) => o.value === value))
  const [index, setIndex] = useState(initial)
  const viewRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  // 화면을 그릴 때마다 바뀌는 값들 (React 다시 그리기 없이 직접 움직여요)
  const s = useRef({
    offset: -initial * ROW,
    nearest: initial,
    committed: initial,
    raf: 0,
    wheelTimer: 0,
    drag: null as null | { startY: number; startOffset: number; moved: boolean; samples: { t: number; y: number }[] },
  })
  const latest = useRef({ options, onChange })
  useEffect(() => {
    latest.current = { options, onChange }
  })

  const maxIndex = options.length - 1
  const clampIndex = (i: number) => Math.min(maxIndex, Math.max(0, i))

  const paint = (offset: number) => {
    const st = s.current
    st.offset = offset
    if (listRef.current) listRef.current.style.transform = `translate3d(0, ${ROW + offset}px, 0)`
    const n = clampIndex(Math.round(-offset / ROW))
    if (n !== st.nearest) {
      st.nearest = n
      setIndex(n)
    }
  }

  const settle = (i: number) => {
    const st = s.current
    if (i !== st.committed) {
      st.committed = i
      latest.current.onChange(latest.current.options[i].value)
    }
  }

  const stop = () => {
    cancelAnimationFrame(s.current.raf)
    clearTimeout(s.current.wheelTimer)
  }

  const animateTo = (i: number, duration = 280) => {
    stop()
    const target = -clampIndex(i) * ROW
    const from = s.current.offset
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      paint(from + (target - from) * easeOut(t))
      if (t < 1) s.current.raf = requestAnimationFrame(step)
      else settle(clampIndex(i))
    }
    s.current.raf = requestAnimationFrame(step)
  }

  // 처음 그려질 때 지금 값 위치로
  const attachList = (el: HTMLDivElement | null) => {
    if (el && !listRef.current) el.style.transform = `translate3d(0, ${ROW + s.current.offset}px, 0)`
    listRef.current = el
  }

  // 마우스 휠·트랙패드 (페이지가 같이 움직이지 않게 passive: false)
  useEffect(() => {
    const el = viewRef.current
    if (!el) return
    const st = s.current
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      cancelAnimationFrame(st.raf)
      const dy = e.deltaMode === 1 ? e.deltaY * ROW : e.deltaY
      const min = -(latest.current.options.length - 1) * ROW
      paint(Math.min(0, Math.max(min, st.offset - dy)))
      clearTimeout(st.wheelTimer)
      st.wheelTimer = window.setTimeout(() => animateTo(st.nearest, 220), 90)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      cancelAnimationFrame(st.raf)
      clearTimeout(st.wheelTimer)
    }
    // paint/animateTo는 ref만 쓰기 때문에 처음 한 번만 연결해도 돼요
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    stop()
    e.currentTarget.setPointerCapture(e.pointerId)
    s.current.drag = { startY: e.clientY, startOffset: s.current.offset, moved: false, samples: [{ t: e.timeStamp, y: e.clientY }] }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = s.current.drag
    if (!d) return
    const dy = e.clientY - d.startY
    if (Math.abs(dy) > 4) d.moved = true
    d.samples.push({ t: e.timeStamp, y: e.clientY })
    if (d.samples.length > 6) d.samples.shift()
    // 처음·끝을 넘으면 고무줄처럼 덜 따라와요
    let next = d.startOffset + dy
    const min = -maxIndex * ROW
    if (next > 0) next *= 0.35
    else if (next < min) next = min + (next - min) * 0.35
    paint(next)
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = s.current.drag
    if (!d) return
    s.current.drag = null
    if (!d.moved) {
      // 탭: 누른 칸으로 이동 (위 칸 / 가운데 / 아래 칸)
      const rect = e.currentTarget.getBoundingClientRect()
      const slot = Math.floor((e.clientY - rect.top) / ROW) - 1
      animateTo(s.current.nearest + slot, 260)
      return
    }
    // 마지막 100ms 동안의 속도로 관성 거리 계산
    const recent = d.samples.filter((p) => e.timeStamp - p.t < 100)
    const first = recent[0] ?? d.samples[0]
    const dt = Math.max(1, e.timeStamp - first.t)
    const v = (e.clientY - first.y) / dt // px/ms
    const projected = s.current.offset + v * 220
    const target = clampIndex(Math.round(-projected / ROW))
    const distance = Math.abs(-target * ROW - s.current.offset)
    animateTo(target, Math.min(650, 260 + distance * 0.9))
  }

  return (
    <div
      ref={viewRef}
      className="wheel"
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') animateTo(s.current.nearest + 1)
        if (e.key === 'ArrowUp') animateTo(s.current.nearest - 1)
      }}
    >
      <div ref={attachList} className="wheel__list">
        {options.map((o, i) => (
          <div key={String(o.value)} className={`wheel__item${i === index ? ' is-selected' : ''}`} role="option" aria-selected={i === index}>
            {o.label}
          </div>
        ))}
      </div>
    </div>
  )
}
