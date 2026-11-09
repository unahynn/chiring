import { useEffect, useState } from 'react'
import BottomNav, { type TabKey } from './components/BottomNav'
import ComingSoon from './components/ComingSoon'
import Frequency, { type FrequencyStep } from './screens/Frequency'
import Onboarding from './screens/Onboarding'
import { neededElement } from './data/saju'
import { useMe } from './useMe'

/**
 * 팀 프로토타입(naver-1020-luck)에 붙이는 앱 — 주파수 + 온보딩만 들어 있어요 (`npm run build:team`)
 * 홈·친구방은 팀 프로토타입 화면을 써요.
 *
 * 시작 화면 (주소 끝)
 * - `#onboarding` → 온보딩(사주 설정 → 캐해 리포트)
 * - 그 밖(`#frequency` 등) → 주파수 첫 화면
 *
 * 팀 프로토타입 → 이 앱 (postMessage)
 * - `chiring:onboarding` → 온보딩 처음부터
 * - `chiring:reset` 또는 `chiring:frequency` → 주파수 첫 화면
 *
 * 이 앱 → 팀 프로토타입 (iframe 안이면 postMessage, 따로 열었으면 ../index.html#…)
 * - `chiring:home` → 온보딩을 마쳤을 때 · 하단 내비 '홈'
 * - `chiring:friends` → 하단 내비 '친구방'
 */
const FORCE_ONBOARDING = new URLSearchParams(window.location.search).has('onboarding')
const START_ONBOARDING = FORCE_ONBOARDING || window.location.hash === '#onboarding'

function toTeam(where: 'home' | 'friends') {
  if (window.parent !== window) window.parent.postMessage(`chiring:${where}`, '*')
  else window.location.href = `../index.html#${where}`
}

export default function TeamApp() {
  const m = useMe(() => START_ONBOARDING)
  const { me, setOnboarding, startOnboardingAgain } = m
  const [tab, setTab] = useState<TabKey>('frequency')
  const [freqStep, setFreqStep] = useState<FrequencyStep>('home')
  /** 주파수 화면을 처음 상태로 되돌릴 때 바꿔요 (다시 그려져요) */
  const [freqKey, setFreqKey] = useState(0)

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data
      if (typeof data !== 'string') return
      if (data === 'chiring:onboarding') {
        startOnboardingAgain()
      } else if (data === 'chiring:reset' || data === 'chiring:frequency') {
        setOnboarding(null)
        setFreqStep('home')
        setFreqKey((k) => k + 1)
        setTab('frequency')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [setOnboarding, startOnboardingAgain])

  if (m.onboarding) {
    return (
      <Onboarding
        m={m}
        onDone={() => {
          setTab('frequency')
          setFreqStep('home')
          toTeam('home')
        }}
      />
    )
  }

  return (
    <div className="phone">
      {tab === 'frequency' && (
        <Frequency
          key={freqKey}
          step={freqStep}
          onStepChange={setFreqStep}
          todayNeed={me ? neededElement(me.saju) : undefined}
          myName={me?.profile.name}
        />
      )}
      {tab === 'myluck' && <ComingSoon label="아카이브" />}
      {!(tab === 'frequency' && freqStep !== 'home') && (
        <BottomNav
          active={tab}
          onChange={(t) => {
            if (t === 'home' || t === 'friends') {
              toTeam(t)
              return
            }
            setTab(t)
            setFreqStep('home')
          }}
        />
      )}
    </div>
  )
}
