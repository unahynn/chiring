import { useRef, useState } from 'react'
import './WheelPicker.css'

const ROW = 65

type Option<T> = { value: T; label: string }

type Props<T> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}

/** iOS 스타일 휠 한 줄. 위아래로 굴리면 가운데 칸에 멈춘 값이 골라져요. */
export default function WheelPicker<T>({ options, value, onChange, label }: Props<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const initial = Math.max(0, options.findIndex((o) => o.value === value))
  const [index, setIndex] = useState(initial)

  // 처음 그려질 때 지금 값 위치로 굴려 둬요 (시트가 열릴 때마다 새로 그려져요)
  const attach = (el: HTMLDivElement | null) => {
    if (el && !ref.current) el.scrollTop = initial * ROW
    ref.current = el
  }

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const i = Math.min(options.length - 1, Math.max(0, Math.round(el.scrollTop / ROW)))
    if (i !== index) {
      setIndex(i)
      onChange(options[i].value)
    }
  }

  const pick = (i: number) => ref.current?.scrollTo({ top: i * ROW, behavior: 'smooth' })

  return (
    <div
      ref={attach}
      className="wheel"
      onScroll={onScroll}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') pick(Math.min(options.length - 1, index + 1))
        if (e.key === 'ArrowUp') pick(Math.max(0, index - 1))
      }}
    >
      {options.map((o, i) => (
        <div
          key={String(o.value)}
          className={`wheel__item${i === index ? ' is-selected' : ''}`}
          role="option"
          aria-selected={i === index}
          onClick={() => pick(i)}
        >
          {o.label}
        </div>
      ))}
    </div>
  )
}
