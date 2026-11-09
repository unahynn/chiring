import SajuSetup from './SajuSetup'
import CharReport from './CharReport'
import type { useMe } from '../useMe'

/** 온보딩 화면: 사주 설정 → 캐해 리포트 ('시작하기'를 누르면 onDone) */
export default function Onboarding({ m, onDone }: { m: ReturnType<typeof useMe>; onDone: () => void }) {
  if (m.onboarding === 'report' && m.me) {
    return (
      <div className="phone">
        <CharReport
          me={m.me}
          onBack={() => m.setOnboarding('setup')}
          onStart={() => {
            m.finishOnboarding()
            onDone()
          }}
          onReset={m.resetMe}
          theme={m.theme}
          settings={m.settings}
          onSettingsChange={m.changeSettings}
        />
      </div>
    )
  }
  return (
    <div className="phone">
      <SajuSetup
        key={m.setupKey}
        initial={m.me?.profile}
        onSubmit={m.submitProfile}
        onReset={m.resetMe}
        theme={m.theme}
        settings={m.settings}
        onSettingsChange={m.changeSettings}
      />
    </div>
  )
}
