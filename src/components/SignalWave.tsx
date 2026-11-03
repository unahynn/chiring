import { useEffect, useRef } from 'react'

type Props = {
  /** 재생 중일 때만 움직여요. 멈추면 그 모양 그대로 정지 */
  playing: boolean
  /** 기운 색 (기본: 물 기운 하늘색) */
  color?: string
  /** 그래픽 가운데 위치 (화면 좌표) */
  cx?: number
  cy?: number
}

/**
 * 주파수 듣기 배경 그래픽 — 이미지가 아니라 매 프레임 직접 그려요.
 * - 가운데 덩어리: 네 잎 모양이 젤리처럼 출렁이며 작아졌다 커졌다 (숨쉬기)
 * - 파동: 같은 모양의 빛 테두리가 작게 생겨나 바깥으로 퍼지며 사라져요
 */
export default function SignalWave({ playing, color = '#13e2ff', cx = 201, cy = 455 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playingRef = useRef(playing)
  playingRef.current = playing

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const W = 402
    const H = 874
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let t = 0 // 재생된 시간(초) — 멈추면 안 늘어나요
    let last = performance.now()
    let nextRipple = 0
    const ripples: { born: number }[] = []
    const RIPPLE_LIFE = 3.6
    let raf = 0

    /** 시간 t에서 각도 a 방향의 반지름 (네 잎 + 잔물결) */
    const radius = (a: number, time: number, base: number) => {
      // 네 잎: 대각선 방향으로 통통한 잎, 위·아래·양옆은 살짝 들어가게
      const c = Math.cos(4 * (a - Math.PI / 4) + 0.35 * Math.sin(time * 0.6))
      const petal = c > 0 ? Math.pow(c, 0.45) : -Math.pow(-c, 1.8)
      return (
        base *
        (1 +
          0.17 * petal +
          0.05 * Math.sin(3 * a + time * 1.3) +
          0.035 * Math.sin(5 * a - time * 1.1) +
          0.03 * Math.sin(2 * a + time * 0.9) +
          0.015 * Math.sin(7 * a + time * 2.1))
      )
    }

    const blobPath = (time: number, base: number, rot: number) => {
      ctx.beginPath()
      const N = 160
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * Math.PI * 2
        const r = radius(a, time, base)
        const x = cx + Math.cos(a + rot) * r
        const y = cy + Math.sin(a + rot) * r * 1.02
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
    }

    const draw = () => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)

      // 숨쉬기: 작아졌다(0.86) 커졌다(1.04)
      const breath = 0.95 + 0.09 * Math.sin((t * Math.PI * 2) / 4.2)
      const base = 140 * breath
      const rot = 0.12 * Math.sin(t * 0.5)

      // 1) 퍼지는 파동 (뒤쪽)
      ctx.globalCompositeOperation = 'lighter'
      for (const rp of ripples) {
        const age = (t - rp.born) / RIPPLE_LIFE
        if (age < 0 || age > 1) continue
        const scale = 0.75 + age * 1.0
        const alpha = Math.pow(1 - age, 1.8) * 0.5
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.lineWidth = 1.5 + 10 * (1 - age)
        ctx.strokeStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 40
        blobPath(rp.born + age * 1.5, base * scale, rot + age * 0.25)
        ctx.stroke()
        ctx.restore()
      }

      // 2) 바깥 빛 번짐
      ctx.globalCompositeOperation = 'source-over'
      ctx.save()
      ctx.shadowColor = color
      ctx.shadowBlur = 90
      ctx.fillStyle = color
      ctx.globalAlpha = 0.85
      blobPath(t, base, rot)
      ctx.fill()
      ctx.restore()

      // 3) 몸통: 가장자리는 밝고 안쪽으로 갈수록 어두워지는 빛
      const g = ctx.createRadialGradient(cx, cy, base * 0.15, cx, cy, base * 1.2)
      g.addColorStop(0, '#000')
      g.addColorStop(0.35, '#001418')
      g.addColorStop(0.6, hexA(color, 0.32))
      g.addColorStop(0.82, hexA(color, 0.8))
      g.addColorStop(0.95, '#bff7ff')
      g.addColorStop(1, '#e8fdff')
      ctx.fillStyle = g
      blobPath(t, base, rot)
      ctx.fill()

      // 4) 안쪽 그림자 (가운데를 깊게)
      ctx.save()
      ctx.globalAlpha = 0.6
      ctx.fillStyle = '#000'
      ctx.shadowColor = '#000'
      ctx.shadowBlur = 70
      blobPath(t + 0.6, base * 0.58, rot - 0.08)
      ctx.fill()
      ctx.restore()

      // 4-1) 왼쪽 위에서 비치는 은은한 광택 (입체감)
      ctx.save()
      blobPath(t, base, rot)
      ctx.clip()
      const shine = ctx.createRadialGradient(cx - base * 0.55, cy - base * 0.6, 0, cx - base * 0.55, cy - base * 0.6, base * 0.9)
      shine.addColorStop(0, 'rgba(255,255,255,0.35)')
      shine.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = shine
      ctx.fillRect(cx - base * 2, cy - base * 2, base * 4, base * 4)
      ctx.restore()

      // 5) 테두리 하이라이트
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = 0.55
      ctx.lineWidth = 2.5
      ctx.strokeStyle = '#eafdff'
      ctx.shadowColor = color
      ctx.shadowBlur = 18
      blobPath(t, base * 0.985, rot)
      ctx.stroke()
      ctx.restore()
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (playingRef.current && !reduceMotion) {
        t += dt
        if (t >= nextRipple) {
          ripples.push({ born: t })
          nextRipple = t + 1.4
        }
        while (ripples.length && t - ripples[0].born > RIPPLE_LIFE) ripples.shift()
      }
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [color, cx, cy])

  return <canvas ref={canvasRef} className="signal-wave" aria-hidden />
}

/** '#13e2ff' + 투명도 → 'rgba(...)' */
function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
