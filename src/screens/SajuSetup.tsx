import { useRef, useState } from 'react'
import StatusBar from '../components/StatusBar'
import BottomSheet from '../components/BottomSheet'
import WheelPicker from '../components/WheelPicker'
import { CameraIcon, CloseIcon, PencilIcon } from '../components/icons'
import { shrinkPhoto, type Profile } from '../data/profile'
import { toSolar } from '../data/saju'
import './SajuSetup.css'

type Props = {
  /** 전에 입력해 둔 값 (리포트에서 뒤로 왔을 때) */
  initial?: Profile
  onSubmit: (profile: Profile) => Promise<void> | void
}

const digitsOf = (s: string) => s.replace(/\D/g, '').slice(0, 8)

/** '20070621' → '2007 - 06 - 21' (입력하는 만큼만) */
function formatDate(d: string) {
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)} - ${d.slice(4)}`
  return `${d.slice(0, 4)} - ${d.slice(4, 6)} - ${d.slice(6)}`
}

/** 날짜 숫자 8자리가 실제로 있는 날짜인지 (음력은 윤달까지 확인) */
function checkDate(d: string, calendar: Profile['calendar'], leap: boolean): 'ok' | 'incomplete' | 'invalid' {
  if (d.length < 8) return 'incomplete'
  const year = +d.slice(0, 4)
  const month = +d.slice(4, 6)
  const day = +d.slice(6, 8)
  const now = new Date()
  if (year < 1900 || year > now.getFullYear()) return 'invalid'
  const solar = toSolar({ calendar, leap, year, month, day })
  if (!solar) return 'invalid'
  if (new Date(solar.year, solar.month - 1, solar.day) > now) return 'invalid'
  return 'ok'
}

type Clock = { ampm: 'am' | 'pm'; hour: number; minute: number }

const toClock = (hhmm: string): Clock => {
  const [h, m] = hhmm.split(':').map(Number)
  return { ampm: h < 12 ? 'am' : 'pm', hour: h % 12 === 0 ? 12 : h % 12, minute: m }
}
const fromClock = ({ ampm, hour, minute }: Clock) =>
  `${String((hour % 12) + (ampm === 'pm' ? 12 : 0)).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
const clockLabel = (hhmm: string) => {
  const c = toClock(hhmm)
  return `${c.ampm === 'am' ? '오전' : '오후'} ${c.hour}:${String(c.minute).padStart(2, '0')}`
}

const AMPM = [
  { value: 'am' as const, label: '오전' },
  { value: 'pm' as const, label: '오후' },
]
const HOURS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))
const MINUTES = Array.from({ length: 60 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }))

/** 온보딩 1단계: 사진·이름·생년월일·태어난 시간·성별 (피그마 '사주 정보 입력') */
export default function SajuSetup({ initial, onSubmit }: Props) {
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null)
  const [name, setName] = useState(initial?.name ?? '')
  const [editingName, setEditingName] = useState(!initial?.name)
  const [calendar, setCalendar] = useState<Profile['calendar']>(initial?.calendar ?? 'solar')
  const [leap, setLeap] = useState(initial?.leap ?? false)
  const [date, setDate] = useState(initial ? initial.birthDate.replace(/-/g, '') : '')
  const [time, setTime] = useState<string | null>(initial?.birthTime ?? null)
  const [gender, setGender] = useState<Profile['gender'] | null>(initial?.gender ?? null)
  const [timeOpen, setTimeOpen] = useState(false)
  const [draft, setDraft] = useState<Clock>(toClock('12:00'))
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const dateState = checkDate(date, calendar, leap)
  const ready = dateState === 'ok' && gender !== null && !busy

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return
    try {
      setPhoto(await shrinkPhoto(file))
    } catch {
      /* 열 수 없는 파일이면 그대로 둬요 */
    }
  }

  const openTime = () => {
    setDraft(toClock(time ?? '12:00'))
    setTimeOpen(true)
  }

  const submit = async () => {
    if (!ready || !gender) return
    setBusy(true)
    try {
      await onSubmit({
        name: name.trim(),
        photo,
        calendar,
        leap: calendar === 'lunar' && leap,
        birthDate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
        birthTime: time,
        gender,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="setup">
      <StatusBar />
      <header className="setup__header">
        <h1>사주 설정</h1>
      </header>

      <div className="setup__scroll">
        <button className="setup__avatar" onClick={() => fileRef.current?.click()} aria-label="프로필 사진 고르기">
          {photo ? (
            <img src={photo} alt="" />
          ) : (
            <span className="setup__avatar-empty">
              <CameraIcon />
            </span>
          )}
          {!photo && (
            <span className="setup__avatar-badge" aria-hidden>
              +
            </span>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickPhoto(e.target.files?.[0])} />

        <div className="setup__name">
          {editingName ? (
            <input
              className="setup__name-input"
              value={name}
              placeholder="이름"
              maxLength={10}
              autoComplete="nickname"
              enterKeyHint="done"
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name.trim() && setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            />
          ) : (
            <button className="setup__name-text" onClick={() => setEditingName(true)}>
              {name}
            </button>
          )}
          <button className="setup__name-edit" onClick={() => setEditingName(true)} aria-label="이름 고치기">
            <PencilIcon />
          </button>
        </div>

        <section className="setup__field">
          <h2 className="setup__label is-required">생년월일</h2>
          <div className="setup__chips">
            <button className={`chip${calendar === 'solar' ? ' is-on' : ''}`} onClick={() => setCalendar('solar')}>
              양력
            </button>
            <button className={`chip${calendar === 'lunar' ? ' is-on' : ''}`} onClick={() => setCalendar('lunar')}>
              음력
            </button>
            {calendar === 'lunar' && (
              <button className={`chip chip--small${leap ? ' is-on' : ''}`} onClick={() => setLeap((v) => !v)} aria-pressed={leap}>
                윤달
              </button>
            )}
          </div>
          <input
            className={`setup__input${dateState === 'invalid' ? ' is-error' : ''}`}
            inputMode="numeric"
            placeholder="YYYY - MM - DD"
            value={formatDate(date)}
            onChange={(e) => setDate(digitsOf(e.target.value))}
            aria-label="생년월일 8자리"
          />
          {dateState === 'invalid' && (
            <p className="setup__error">{calendar === 'lunar' && leap ? `${date.slice(0, 4)}년 음력 ${+date.slice(4, 6)}월에는 윤달이 없어요` : '날짜를 다시 확인해 주세요'}</p>
          )}
        </section>

        <section className="setup__field">
          <h2 className="setup__label">태어난 시간</h2>
          <div className="setup__time">
            <button className={`setup__input setup__input--button${time ? '' : ' is-empty'}`} onClick={openTime}>
              {time ? clockLabel(time) : '모르면 비워 둬도 괜찮아요'}
            </button>
            {time && (
              <button className="setup__clear" onClick={() => setTime(null)} aria-label="태어난 시간 지우기">
                <CloseIcon size={12} />
              </button>
            )}
          </div>
        </section>

        <section className="setup__field">
          <h2 className="setup__label is-required">성별</h2>
          <div className="setup__chips">
            <button className={`chip${gender === 'male' ? ' is-on' : ''}`} onClick={() => setGender('male')}>
              남자
            </button>
            <button className={`chip${gender === 'female' ? ' is-on' : ''}`} onClick={() => setGender('female')}>
              여자
            </button>
          </div>
        </section>
      </div>

      <div className="setup__footer">
        <button className="cta" disabled={!ready} onClick={submit}>
          {busy ? '캐해 분석 중…' : '나의 캐해 확인하기'}
        </button>
        <div className="home-indicator" />
      </div>

      <BottomSheet
        open={timeOpen}
        onClose={() => setTimeOpen(false)}
        tone="dark"
        label="태어난 시간"
        className="time-sheet"
        header={
          <div className="time-sheet__head">
            <h2>태어난 시간</h2>
            <button className="time-sheet__close" onClick={() => setTimeOpen(false)} aria-label="닫기">
              <CloseIcon />
            </button>
          </div>
        }
      >
        <div className="time-sheet__wheels">
          <div className="time-sheet__band" aria-hidden />
          <WheelPicker label="오전 오후" options={AMPM} value={draft.ampm} onChange={(ampm) => setDraft((d) => ({ ...d, ampm }))} />
          <WheelPicker label="시" options={HOURS} value={draft.hour} onChange={(hour) => setDraft((d) => ({ ...d, hour }))} />
          <WheelPicker label="분" options={MINUTES} value={draft.minute} onChange={(minute) => setDraft((d) => ({ ...d, minute }))} />
        </div>
        <div className="time-sheet__footer">
          <button
            className="cta"
            onClick={() => {
              setTime(fromClock(draft))
              setTimeOpen(false)
            }}
          >
            완료
          </button>
          <div className="home-indicator" />
        </div>
      </BottomSheet>
    </div>
  )
}
