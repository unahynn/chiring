import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import './WishGlow.css'

/**
 * 문지른 자리에 기운 색 빛이 번지는 효과 (어두운 배경용 '연기' 느낌)
 * - 손가락이 지나간 자리에 부드러운 빛 방울이 생기고, 퍼지면서 천천히 사라져요
 * - 밀어 준 방향으로 잠깐 흘러가다 멈춰요
 * 캔버스 2D로 직접 그려요 (라이브러리 없이). 부모 요소를 꽉 채워요.
 */
export type WishGlowHandle = {
  /** (x, y)에 빛 한 방울. 좌표는 이 캔버스 기준 CSS px, (dx, dy)는 손가락이 움직인 만큼 */
  splat: (x: number, y: number, dx?: number, dy?: number, strength?: number) => void
}

type Props = {
  /** 빛 색 (#rrggbb) */
  color: string
  /** 빛 방울 반지름 (px) */
  size?: number
  /** 빛이 거의 사라지기까지 걸리는 시간 (초) */
  trail?: number
  /** 밀린 빛이 계속 흘러가는 시간 (초) */
  drift?: number
  ref?: Ref<WishGlowHandle>
}

type Drop = { x: number; y: number; vx: number; vy: number; r: number; a: number; age: number; life: number; seed: number }

const MAX_DROPS = 420

const rgbOf = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
/** 기운 색 + 가운데용 밝은 색(기운 색에 하양을 섞은 색). 회색이 끼지 않게 하양을 따로 겹치지 않아요 */
const paletteOf = (hex: string) => {
  const c = rgbOf(hex)
  const tint = c.map((v) => Math.round(v + (255 - v) * 0.55))
  return { c: c.join(', '), tint: tint.join(', ') }
}

export default function WishGlow({ color, size = 48, trail = 2.6, drift = 0.7, ref }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drops = useRef<Drop[]>([])
  const raf = useRef<number | null>(null)
  const last = useRef<number | null>(null)
  const colorRef = useRef(paletteOf(color))
  useEffect(() => {
    colorRef.current = paletteOf(color)
  }, [color])

  // 그리기: 빛 방울이 남아 있는 동안만 돌아요
  const tick = (now: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) {
      raf.current = null
      return
    }
    const dt = last.current == null ? 1 / 60 : Math.min(0.05, (now - last.current) / 1000)
    last.current = now
    const dpr = canvas.width / canvas.clientWidth || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    ctx.globalCompositeOperation = 'lighter'
    const { c, tint } = colorRef.current
    const slow = Math.exp(-dt / drift)
    const alive: Drop[] = []
    for (const d of drops.current) {
      d.age += dt
      const t = d.age / d.life
      if (t >= 1) continue
      // 살짝 굽이치며 흘러가요 (연기처럼)
      d.vx = d.vx * slow + Math.sin(d.age * 2.3 + d.seed) * 6 * dt
      d.vy = d.vy * slow - 10 * dt + Math.cos(d.age * 1.7 + d.seed) * 6 * dt
      d.x += d.vx * dt
      d.y += d.vy * dt
      const r = d.r * (1 + 0.8 * t) // 퍼지면서
      const a = d.a * Math.pow(1 - t, 1.4) // 옅어져요
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r)
      // 가우스 모양으로 가장자리 없이 풀려요. 가운데는 기운 색에 하양을 섞은 밝은 색
      g.addColorStop(0, `rgba(${tint}, ${a})`)
      g.addColorStop(0.2, `rgba(${c}, ${a * 0.78})`)
      g.addColorStop(0.4, `rgba(${c}, ${a * 0.42})`)
      g.addColorStop(0.6, `rgba(${c}, ${a * 0.16})`)
      g.addColorStop(0.8, `rgba(${c}, ${a * 0.04})`)
      g.addColorStop(1, `rgba(${c}, 0)`)
      ctx.fillStyle = g
      ctx.fillRect(d.x - r, d.y - r, r * 2, r * 2)
      alive.push(d)
    }
    drops.current = alive
    if (alive.length) {
      raf.current = requestAnimationFrame(tick)
    } else {
      raf.current = null
      last.current = null
    }
  }

  const wake = () => {
    if (raf.current == null) raf.current = requestAnimationFrame(tick)
  }

  const add = (d: Omit<Drop, 'age' | 'seed'>) => {
    drops.current.push({ ...d, age: 0, seed: Math.random() * 10 })
    if (drops.current.length > MAX_DROPS) drops.current.splice(0, drops.current.length - MAX_DROPS)
  }

  useImperativeHandle(ref, () => ({
    splat(x, y, dx = 0, dy = 0, strength = 0.2) {
      // 빠르게 문지르면 사이사이를 메워서 끊기지 않는 붓자국처럼
      const dist = Math.hypot(dx, dy)
      const steps = Math.max(1, Math.min(10, Math.round(dist / 8)))
      for (let i = 0; i < steps; i++) {
        const k = (i + 1) / steps
        add({
          x: x - dx * (1 - k),
          y: y - dy * (1 - k),
          vx: dx * 2,
          vy: dy * 2,
          r: size * (0.85 + Math.random() * 0.3),
          a: strength / Math.sqrt(steps),
          life: trail * (0.8 + Math.random() * 0.4),
        })
      }
      wake()
    },
  }))

  // 화면 크기에 맞춰 선명하게 (2배까지)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)
    return () => {
      ro.disconnect()
      if (raf.current != null) cancelAnimationFrame(raf.current)
      raf.current = null
    }
  }, [])

  return <canvas ref={canvasRef} className="wish-glow" aria-hidden />
}
