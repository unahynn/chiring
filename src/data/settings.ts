// 앱 설정 (화면 모드 · 알림 · 사주 계산 기준). 이 기기에 저장돼요.
import { useEffect, useState } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'

export type Settings = {
  theme: ThemeMode
  /** 오늘의 기운 알림 (아직 서버가 없어서 설정값만 저장해요) */
  notify: boolean
  /** 서울 기준 시간 보정: 태어난 시간에서 30분 빼기 */
  seoulTime: boolean
  /** 야자시: 밤 11~12시 출생은 일주를 그날로 보기 (끄면 다음 날로) */
  lateRat: boolean
}

export const DEFAULT_SETTINGS: Settings = { theme: 'dark', notify: true, seoulTime: true, lateRat: true }

const KEY = 'chiring.settings.v1'

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* 저장이 안 돼도 이번 실행에서는 그대로 써요 */
  }
}

/** '시스템'이면 휴대폰 설정(다크 모드 여부)을 따라가요 */
export function useResolvedTheme(mode: ThemeMode): 'light' | 'dark' {
  const query = '(prefers-color-scheme: dark)'
  const [systemDark, setSystemDark] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(query).matches)
  useEffect(() => {
    const mq = window.matchMedia?.(query)
    if (!mq) return
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  if (mode === 'system') return systemDark ? 'dark' : 'light'
  return mode
}
