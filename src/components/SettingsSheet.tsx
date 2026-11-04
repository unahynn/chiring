import { useState } from 'react'
import BottomSheet from './BottomSheet'
import { CaretRightIcon, CloseIcon } from './icons'
import type { Settings, ThemeMode } from '../data/settings'
import './SettingsSheet.css'

type Props = {
  open: boolean
  onClose: () => void
  /** 시트 색 (지금 화면 모드) */
  tone: 'light' | 'dark'
  settings: Settings
  onChange: (next: Settings) => void
  /** 리포트에서만: 사주 정보 수정하기 */
  onEdit?: () => void
  onReset: () => void
}

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: '시스템' },
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
]

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className={`toggle${on ? ' is-on' : ''}`} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}>
      <span className="toggle__knob" />
    </button>
  )
}

export const APP_VERSION = '0.1.0'

/** 톱니바퀴(설정): 화면 모드 · 알림 · 사주 계산 기준 · 내 정보 */
export default function SettingsSheet({ open, onClose, tone, settings, onChange, onEdit, onReset }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch })

  const close = () => {
    setConfirmReset(false)
    onClose()
  }

  const toggleNotify = (v: boolean) => {
    set({ notify: v })
    // 브라우저가 알림을 지원하면 켤 때 권한을 물어봐요
    if (v && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      tone={tone}
      label="설정"
      className="settings-sheet"
      header={
        <div className="settings-sheet__head">
          <h2>설정</h2>
          <button className="settings-sheet__close" onClick={close} aria-label="닫기">
            <CloseIcon />
          </button>
        </div>
      }
    >
      <section className="settings-group">
        <h3>화면 모드</h3>
        <div className="segmented" role="radiogroup" aria-label="화면 모드">
          {THEMES.map((t) => (
            <button
              key={t.value}
              role="radio"
              aria-checked={settings.theme === t.value}
              className={settings.theme === t.value ? 'is-on' : undefined}
              onClick={() => set({ theme: t.value })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-group">
        <h3>알림</h3>
        <div className="settings-row">
          <div>
            <p>오늘의 기운 알림</p>
            <small>매일 아침 오늘 필요한 기운을 알려 드려요</small>
          </div>
          <Toggle label="오늘의 기운 알림" on={settings.notify} onChange={toggleNotify} />
        </div>
      </section>

      <section className="settings-group">
        <h3>사주 계산</h3>
        <div className="settings-row">
          <div>
            <p>서울 시간 보정</p>
            <small>태어난 시간에서 30분을 빼서 계산해요</small>
          </div>
          <Toggle label="서울 시간 보정" on={settings.seoulTime} onChange={(v) => set({ seoulTime: v })} />
        </div>
        <div className="settings-row">
          <div>
            <p>야자시 적용</p>
            <small>밤 11~12시 출생은 일주를 그날로 봐요</small>
          </div>
          <Toggle label="야자시 적용" on={settings.lateRat} onChange={(v) => set({ lateRat: v })} />
        </div>
      </section>

      <section className="settings-group">
        <h3>내 정보</h3>
        {onEdit && (
          <button
            className="settings-row settings-row--link"
            onClick={() => {
              close()
              onEdit()
            }}
          >
            <p>사주 정보 수정하기</p>
            <CaretRightIcon />
          </button>
        )}
        <button
          className="settings-row settings-row--link is-danger"
          onClick={() => {
            if (!confirmReset) return setConfirmReset(true)
            close()
            onReset()
          }}
        >
          <p>{confirmReset ? '한 번 더 누르면 모두 지워져요' : '입력한 정보 모두 지우기'}</p>
        </button>
      </section>

      <p className="settings-sheet__version">치링 v{APP_VERSION}</p>
      <div className="settings-sheet__bottom">
        <div className="home-indicator" />
      </div>
    </BottomSheet>
  )
}
