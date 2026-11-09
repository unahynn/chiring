import { useState } from 'react'
import { clearMe, loadMe, saveMe, type Me, type Profile } from './data/profile'
import { loadSettings, saveSettings, useResolvedTheme, type Settings } from './data/settings'

/**
 * 내 프로필·사주 + 설정 + 온보딩(사주 설정 → 캐해 리포트) 단계
 * 전체 앱(App)과 팀 프로토타입용 앱(TeamApp)이 같이 써요.
 */
export function useMe(startOnboarding: (me: Me | null) => boolean) {
  /** 내 프로필 + 사주. 처음 실행이면 null */
  const [me, setMe] = useState<Me | null>(loadMe)
  /** 온보딩 단계: 사주 설정 → 캐해 리포트. 끝나면 null */
  const [onboarding, setOnboarding] = useState<'setup' | 'report' | null>(() => (startOnboarding(me) ? 'setup' : null))
  /** 설정 (화면 모드 · 알림 · 사주 계산 기준) */
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const theme = useResolvedTheme(settings.theme)
  /** 사주 설정 화면을 빈 상태로 새로 그릴 때 바꿔요 */
  const [setupKey, setSetupKey] = useState(0)

  /** 프로필 → 사주 계산 (만세력 계산 라이브러리는 커서 이때만 불러와요) */
  const calcSaju = async (profile: Profile, s: Settings) => {
    const { computeSaju } = await import('./data/sajuCalc')
    const [y, m, d] = profile.birthDate.split('-').map(Number)
    const [hh, mm] = profile.birthTime?.split(':').map(Number) ?? []
    return computeSaju(
      {
        calendar: profile.calendar,
        leap: profile.leap,
        year: y,
        month: m,
        day: d,
        time: profile.birthTime ? { hour: hh, minute: mm } : null,
      },
      { seoulTime: s.seoulTime, lateRat: s.lateRat },
    )
  }

  const changeSettings = async (next: Settings) => {
    const prev = settings
    setSettings(next)
    saveSettings(next)
    // 사주 계산 기준이 바뀌면 이미 본 사주도 다시 계산해요
    if (me && (prev.seoulTime !== next.seoulTime || prev.lateRat !== next.lateRat)) {
      const saju = await calcSaju(me.profile, next)
      if (saju) {
        const updated = { ...me, saju }
        setMe(updated)
        saveMe(updated)
      }
    }
  }

  const submitProfile = async (profile: Profile) => {
    const saju = await calcSaju(profile, settings)
    if (!saju) return
    const next: Me = { profile, saju, done: false }
    setMe(next)
    saveMe(next)
    setOnboarding('report')
  }

  /** 설정 → 입력한 정보 모두 지우기: 빈 사주 설정 화면부터 다시 */
  const resetMe = () => {
    clearMe()
    setMe(null)
    setSetupKey((k) => k + 1)
    setOnboarding('setup')
  }

  /** 캐해 리포트에서 '시작하기' */
  const finishOnboarding = () => {
    if (!me) return
    const next = { ...me, done: true }
    setMe(next)
    saveMe(next)
    setOnboarding(null)
  }

  /** 온보딩을 처음(사주 설정)부터 다시 보여줘요. 이미 입력한 정보는 채워져 있어요 */
  const startOnboardingAgain = () => {
    setSetupKey((k) => k + 1)
    setOnboarding('setup')
  }

  return {
    me,
    onboarding,
    setOnboarding,
    settings,
    theme,
    setupKey,
    changeSettings,
    submitProfile,
    resetMe,
    finishOnboarding,
    startOnboardingAgain,
  }
}
