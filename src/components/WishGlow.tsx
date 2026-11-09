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
  /** 한가운데서 빛이 사방으로 터져요 (다 문질렀을 때) */
  burst: (x: number, y: number) => void
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

const MAX_DROPS = 260

const rgb = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(', ')
}

export default function WishGlow({ color, size = 48, trail = 2.6, drift = 0.7, ref }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drops = useRef<Drop[]>([])
  const raf = useRef<number | null>(null)
  const last = useRef<number | null>(null)
  const colorRef = useRef(rgb(color))
  useEffect(() => {
    colorRef.current = rgb(color)
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
    const c = colorRef.current
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
      const r = d.r * (1 + 1.0 * t) // 퍼지면서
      const a = d.a * Math.pow(1 - t, 1.6) // 옅어져요
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r)
      // 가운데는 하얗게 빛나고, 바깥으로 갈수록 기운 색이 번져요
      g.addColorStop(0, `rgba(255, 255, 255, ${a * 0.9})`)
      g.addColorStop(0.16, `rgba(${c}, ${a})`)
      g.addColorStop(0.45, `rgba(${c}, ${a * 0.4})`)
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
      const steps = Math.max(1, Math.min(6, Math.round(dist / 12)))
      for (let i = 0; i < steps; i++) {
        const k = (i + 1) / steps
        add({
          x: x - dx * (1 - k),
          y: y - dy * (1 - k),
          vx: dx * 4,
          vy: dy * 4,
          r: size * (0.75 + Math.random() * 0.5),
          a: strength / Math.sqrt(steps),
          life: trail * (0.8 + Math.random() * 0.4),
        })
      }
      wake()
    },
    burst(x, y) {
      for (let i = 0; i < 36; i++) {
        const ang = (i / 36) * Math.PI * 2 + Math.random() * 0.3
        const sp = 160 + Math.random() * 220
        add({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: size * (1 + Math.random()), a: 0.35, life: trail * 1.3 })
      }
      add({ x, y, vx: 0, vy: 0, r: size * 4, a: 0.7, life: trail * 1.2 })
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
