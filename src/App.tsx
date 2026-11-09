import { useState } from 'react'
import BottomNav, { type TabKey } from './components/BottomNav'
import FriendsRoom from './screens/FriendsRoom'
import Story from './screens/Story'
import Signal from './screens/Signal'
import Frequency, { type FrequencyStep } from './screens/Frequency'
import SajuSetup from './screens/SajuSetup'
import CharReport from './screens/CharReport'
import { MOMENTS } from './data/moments'
import { clearMe, loadMe, saveMe, type Me, type Profile } from './data/profile'
import { loadSettings, saveSettings, useResolvedTheme, type Settings } from './data/settings'
import { neededElement } from './data/saju'

/** 주소 끝에 ?onboarding 을 붙이면 저장된 정보가 있어도 온보딩부터 다시 볼 수 있어요 (테스트용) */
const FORCE_ONBOARDING = new URLSearchParams(window.location.search).has('onboarding')

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ minHeight: 700, display: 'grid', placeItems: 'center', color: '#6e767c' }}>
      {label} 화면은 곧 만들 예정이에요
    </div>
  )
}

export default function App() {
  /** 내 프로필 + 사주. 처음 실행이면 null */
  const [me, setMe] = useState<Me | null>(loadMe)
  /** 온보딩 단계: 사주 설정 → 캐해 리포트. 끝나면 null (홈) */
  const [onboarding, setOnboarding] = useState<'setup' | 'report' | null>(() => (FORCE_ONBOARDING || !me?.done ? 'setup' : null))
  /** 설정 (화면 모드 · 알림 · 사주 계산 기준) */
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const theme = useResolvedTheme(settings.theme)
  const [tab, setTab] = useState<TabKey>('friends')
  /** 주파수 탭 안에서 몇 번째 화면인지. 첫 화면이 아니면 탭바를 숨겨요. */
  const [freqStep, setFreqStep] = useState<FrequencyStep>('home')
  /** 열려 있는 스토리(Lucky Moments 카드). 열려 있으면 탭바 없이 스토리 화면만 보여요. */
  const [storyId, setStoryId] = useState<string | null>(null)
  /** 열려 있는 채팅방 (Lucky Talk 가운데 카드를 누르면 열려요) */
  const [chatRoom, setChatRoom] = useState<string | null>(null)
  const [enterFrom, setEnterFrom] = useState<'left' | 'right' | undefined>()
  const storyIndex = MOMENTS.findIndex((m) => m.id === storyId)
  const story = MOMENTS[storyIndex]

  const openStory = (id: string | null, from?: 'left' | 'right') => {
    setEnterFrom(from)
    setStoryId(id)
  }

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
  const [setupKey, setSetupKey] = useState(0)
  const resetMe = () => {
    clearMe()
    setMe(null)
    setSetupKey((k) => k + 1)
    setOnboarding('setup')
  }

  const finishOnboarding = () => {
    if (!me) return
    const next = { ...me, done: true }
    setMe(next)
    saveMe(next)
    setOnboarding(null)
    setTab('friends')
    if (FORCE_ONBOARDING) window.history.replaceState(null, '', window.location.pathname)
  }

  if (onboarding === 'report' && me) {
    return (
      <div className="phone">
        <CharReport
          me={me}
          onBack={() => setOnboarding('setup')}
          onStart={finishOnboarding}
          onReset={resetMe}
          theme={theme}
          settings={settings}
          onSettingsChange={changeSettings}
        />
      </div>
    )
  }

  if (onboarding) {
    return (
      <div className="phone">
        <SajuSetup
          key={setupKey}
          initial={me?.profile}
          onSubmit={submitProfile}
          onReset={resetMe}
          theme={theme}
          settings={settings}
          onSettingsChange={changeSettings}
        />
      </div>
    )
  }

  if (chatRoom) {
    return (
      <div className="phone">
        <Signal roomTitle={chatRoom} onExit={() => setChatRoom(null)} />
      </div>
    )
  }

  if (story) {
    return (
      <div className="phone">
        <Story
          key={story.id}
          moment={story}
          enterFrom={enterFrom}
          onBack={() => openStory(null)}
          // 왼쪽으로 넘기면 다음 친구, 오른쪽으로 넘기면 이전 친구
          onNext={storyIndex < MOMENTS.length - 1 ? () => openStory(MOMENTS[storyIndex + 1].id, 'right') : undefined}
          onPrev={storyIndex > 0 ? () => openStory(MOMENTS[storyIndex - 1].id, 'left') : undefined}
        />
      </div>
    )
  }

  return (
    <div className="phone">
      {tab === 'friends' && <FriendsRoom onOpenMoment={(id) => openStory(id)} onOpenRoom={setChatRoom} />}
      {tab === 'home' && <ComingSoon label="홈" />}
      {tab === 'myluck' && <ComingSoon label="행운 아카이브" />}
      {tab === 'frequency' && <Frequency step={freqStep} onStepChange={setFreqStep} todayNeed={me ? neededElement(me.saju) : undefined} />}
      {!(tab === 'frequency' && freqStep !== 'home') && (
        <BottomNav
          active={tab}
          onChange={(t) => {
            setTab(t)
            setFreqStep('home')
          }}
        />
      )}
    </div>
  )
}
