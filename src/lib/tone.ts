import { useEffect, useRef } from 'react'
import type { EnergyType } from '../data/energy'

/**
 * '재생하기'로 듣는 기운 주파수 (소리 파일 없이 브라우저에서 바로 만들어요)
 * - 기운마다 다른 바탕음 + 한 옥타브 위 화음, 양쪽 귀에 아주 살짝 다른 높이(4Hz 차이)로 '웅웅' 일렁이게
 * - 켤 때 천천히 커지고, 끌 때 부드럽게 작아져요
 */
const BASE_HZ: Record<EnergyType, number> = { fire: 264, water: 216, wood: 160, metal: 185, earth: 198 }

const VOLUME = 0.07

export function useTone(energy: EnergyType, playing: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!playing) return
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = ctxRef.current ?? new AC()
    ctxRef.current = ctx
    void ctx.resume()
    const now = ctx.currentTime
    const master = ctx.createGain()
    master.gain.setValueAtTime(0, now)
    master.gain.linearRampToValueAtTime(VOLUME, now + 1.2)
    master.connect(ctx.destination)

    const hz = BASE_HZ[energy]
    const oscs: OscillatorNode[] = []
    const voice = (freq: number, pan: number, level: number) => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = freq
      const g = ctx.createGain()
      g.gain.value = level
      const p = ctx.createStereoPanner()
      p.pan.value = pan
      o.connect(g).connect(p).connect(master)
      o.start(now)
      oscs.push(o)
    }
    voice(hz, -0.6, 1)
    voice(hz + 4, 0.6, 1)
    voice(hz * 2, 0, 0.25)
    voice(hz * 1.5, 0, 0.18)

    // 천천히 숨 쉬듯 커졌다 작아졌다
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.15
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = VOLUME * 0.35
    lfo.connect(lfoGain).connect(master.gain)
    lfo.start(now)
    oscs.push(lfo)

    const stop = () => {
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(master.gain.value, t)
      master.gain.linearRampToValueAtTime(0, t + 0.4)
      oscs.forEach((o) => o.stop(t + 0.45))
      stopRef.current = null
    }
    stopRef.current = stop
    return stop
  }, [energy, playing])

  // 화면을 떠나면 소리 장치도 닫아요
  useEffect(
    () => () => {
      stopRef.current?.()
      const ctx = ctxRef.current
      ctxRef.current = null
      if (ctx) window.setTimeout(() => void ctx.close(), 500)
    },
    [],
  )
}
