import { useMemo, useState, type CSSProperties } from 'react'
import StatusBar from '../components/StatusBar'
import BottomSheet from '../components/BottomSheet'
import SettingsSheet from '../components/SettingsSheet'
import { CaretLeftIcon, CaretRightIcon, CloseIcon, SettingsIcon } from '../components/icons'
import type { Me } from '../data/profile'
import { buildReport, type Lucky, type ReportSection, type SectionKey } from '../data/report'
import { BRANCHES, ELEMENTS, ELEMENT_META, STEMS, elementLabel, type Pillar } from '../data/saju'
import type { Settings } from '../data/settings'
import './onboarding.css'
import './CharReport.css'

type Props = {
  me: Me
  onBack: () => void
  /** 온보딩 중이면 아래에 '시작하기' 버튼이 보여요 */
  onStart?: () => void
  /** 설정 → 입력한 정보 모두 지우기 */
  onReset: () => void
  theme: 'light' | 'dark'
  settings: Settings
  onSettingsChange: (next: Settings) => void
}

type SheetKey = SectionKey | 'pillars'

/** 테두리가 두꺼운 스티커 글씨 (피그마: 검은 글자 + 두꺼운 색 테두리) */
function OutlineText({ lines, className = '', style }: { lines: string[]; className?: string; style?: CSSProperties }) {
  return (
    <span className={`outline-text ${className}`} style={style}>
      {lines.map((line) => (
        <span key={line} className="outline-text__line" data-text={line}>
          {line}
        </span>
      ))}
    </span>
  )
}

/** **굵게** 표시를 진한 글씨로 */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((para, i) => (
        <p key={i}>{para.split(/\*\*(.+?)\*\*/g).map((part, j) => (j % 2 ? <strong key={j}>{part}</strong> : part))}</p>
      ))}
    </>
  )
}

const dotted = (ymd: string) => ymd.replace(/-/g, '.')

/** 온보딩 2단계 & 내 캐해 보기: 나의 캐해 리포트 (피그마 '캐해 리포트', '리포트 세부') */
export default function CharReport({ me, onBack, onStart, onReset, theme, settings, onSettingsChange }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const report = useMemo(() => buildReport(me.saju), [me.saju])
  const { profile, saju } = me
  const core = ELEMENT_META[report.core]
  const [active, setActive] = useState<SheetKey | null>(null)
  // 닫히는 동안에도 내용이 보이도록 마지막으로 연 시트를 기억해요
  const [shown, setShown] = useState<SheetKey>('personality')
  const open = (key: SheetKey) => {
    setShown(key)
    setActive(key)
  }
  const section = report.sections.find((s) => s.key === shown)

  const chips = [
    `${profile.calendar === 'lunar' ? `음력${profile.leap ? '(윤)' : ''} ` : ''}${dotted(profile.birthDate)}`,
    profile.gender === 'female' ? '여성' : '남성',
    profile.birthTime ?? '시간 모름',
  ]

  const coreVars = {
    '--core': core.strong,
    '--core-soft': core.soft,
    '--core-tint': core.tint,
    '--core-ink': core.ink,
  } as CSSProperties

  return (
    <div className={`report onb${onStart ? ' report--onboarding' : ''}`} data-theme={theme} style={coreVars}>
      <div className="report__scroll">
        <StatusBar tone={theme === 'dark' ? 'light' : 'dark'} />
        <header className="report__header">
          <button className="report__back" onClick={onBack} aria-label="뒤로">
            <CaretLeftIcon size={32} />
          </button>
          <h1>나의 캐해 리포트</h1>
          <button className="report__gear" onClick={() => setSettingsOpen(true)} aria-label="설정">
            <SettingsIcon />
          </button>
        </header>

        <button className="report__manse" onClick={() => open('pillars')}>
          만세력 보기
          <CaretRightIcon size={22} />
        </button>

        <h2 className="report__type">
          <OutlineText lines={[report.typeName]} className="outline-text--type" />
        </h2>
        <p className="report__sub">
          <em>{elementLabel(report.core)}의 기운</em>을 중심에 가진 타입
        </p>
        <ul className="report__chips">
          {chips.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <div className="report__grid">
          {report.sections.map((s, i) => (
            <button
              key={s.key}
              className="report-box"
              style={{ background: s.color, animationDelay: `${0.05 * i}s` }}
              onClick={() => open(s.key)}
            >
              <span className="report-box__title">
                {s.title.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
              <span className="report-box__ko">{s.ko}</span>
            </button>
          ))}
        </div>
      </div>

      {onStart && (
        <div className="report__footer">
          <button className="cta" onClick={onStart}>
            치링 시작하기
          </button>
          <div className="home-indicator" />
        </div>
      )}

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        tone={theme}
        settings={settings}
        onChange={onSettingsChange}
        onEdit={onBack}
        onReset={onReset}
      />

      <BottomSheet
        open={active !== null}
        onClose={() => setActive(null)}
        tone="light"
        label={shown === 'pillars' ? '만세력' : (section?.ko ?? '')}
        className="detail-sheet"
        overhang={
          <>
            <h2 className="detail__title">
              <OutlineText lines={shown === 'pillars' ? ['Four', 'Pillars'] : (section?.title ?? [])} className="outline-text--sheet" />
            </h2>
            <button className="detail__close" onClick={() => setActive(null)} aria-label="닫기">
              <CloseIcon size={18} />
            </button>
          </>
        }
      >
        <div className="detail" key={shown}>
          {shown === 'pillars' ? <PillarsDetail me={me} settings={settings} /> : section && <SectionDetail section={section} report={report} saju={saju} />}
        </div>
      </BottomSheet>
    </div>
  )
}

function SectionDetail({ section, report, saju }: { section: ReportSection; report: ReturnType<typeof buildReport>; saju: Me['saju'] }) {
  const total = ELEMENTS.reduce((n, e) => n + saju.counts[e], 0)
  const dayStem = STEMS[saju.dayStem]
  return (
    <>
      <ul className="detail__tags">
        {section.tags.map((t) => (
          <li key={t}># {t}</li>
        ))}
      </ul>

      {section.key === 'elements' && (
        <div className="elements">
          <p className="elements__me">
            나를 뜻하는 글자(일간) <strong>{dayStem.hanja}</strong> {dayStem.ko}
            {STEM_SOUND[dayStem.element]} · {elementLabel(dayStem.element)}
          </p>
          <ul className="elements__bars">
            {ELEMENTS.map((e) => (
              <li key={e} className={e === report.core ? 'is-core' : undefined}>
                <span className="elements__name">{elementLabel(e)}</span>
                <span className="elements__track">
                  <span
                    className="elements__fill"
                    style={{ width: `${(saju.counts[e] / total) * 100}%`, background: ELEMENT_META[e].strong }}
                  />
                </span>
                <span className="elements__count">{saju.counts[e]}</span>
              </li>
            ))}
          </ul>
          {!saju.hour && <p className="elements__note">태어난 시간을 몰라서 여섯 글자로 봤어요</p>}
        </div>
      )}

      {section.key === 'lucky' && <LuckyCards lucky={report.lucky} />}

      {section.blocks.map((b) => (
        <article key={b.heading} className="detail__block">
          <h3>
            {b.heading.split('\n').map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h3>
          <div className="detail__body">
            <Rich text={b.body} />
          </div>
        </article>
      ))}
    </>
  )
}

/** 행운 포인트: 행운 색 카드 + 숫자·방향 카드 + 행운 루틴 한 줄 */
function LuckyCards({ lucky }: { lucky: Lucky }) {
  return (
    <div className="lucky" style={{ '--lucky': lucky.color } as CSSProperties}>
      <div className="lucky__color" style={{ background: lucky.color }}>
        <span className="lucky__eyebrow">Lucky Color</span>
        <strong className="lucky__big">{lucky.colorEn}</strong>
        <span className="lucky__ko">{lucky.colorName}</span>
      </div>
      <div className="lucky__row">
        <div className="lucky__card">
          <span className="lucky__eyebrow">Lucky No.</span>
          <strong className="lucky__num" style={{ color: lucky.color }}>
            {lucky.number}
          </strong>
        </div>
        <div className="lucky__card">
          <span className="lucky__eyebrow">Direction</span>
          <span className="lucky__dir">
            <svg className="lucky__compass" viewBox="0 0 40 40" aria-hidden>
              <circle cx="20" cy="20" r="18.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              {lucky.angle === null ? (
                <circle cx="20" cy="20" r="6" fill={lucky.color} />
              ) : (
                <g transform={`rotate(${lucky.angle} 20 20)`}>
                  <path d="M20 5 25 20H15Z" fill={lucky.color} />
                  <path d="M20 35 25 20H15Z" fill="rgba(255,255,255,0.3)" />
                </g>
              )}
            </svg>
            <span>
              <strong>{lucky.directionEn}</strong>
              <small>{lucky.direction}</small>
            </span>
          </span>
        </div>
      </div>
      <div className="lucky__routine">
        <span className="lucky__eyebrow">Lucky Routine</span>
        <Rich text={lucky.routine} />
      </div>
    </div>
  )
}

const STEM_SOUND: Record<string, string> = { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' }

/** 만세력: 시주·일주·월주·년주 네 기둥 */
function PillarsDetail({ me, settings }: { me: Me; settings: Settings }) {
  const { saju, profile } = me
  const cols: { label: string; p: Pillar | null }[] = [
    { label: '생시', p: saju.hour },
    { label: '생일', p: saju.day },
    { label: '생월', p: saju.month },
    { label: '생년', p: saju.year },
  ]
  const cell = (g: { hanja: string; ko: string; element: keyof typeof ELEMENT_META }) => (
    <span className="pillars__cell" style={{ background: ELEMENT_META[g.element].strong }}>
      <b>{g.hanja}</b>
      <small>
        {g.ko}
        {STEM_SOUND[g.element]}
      </small>
    </span>
  )
  return (
    <>
      <ul className="detail__tags">
        <li># 양력 {dotted(saju.solarDate)}</li>
        <li># {profile.birthTime ?? '시간 모름'}</li>
      </ul>
      <div className="pillars">
        {cols.map(({ label, p }) => (
          <div key={label} className={`pillars__col${label === '생일' ? ' is-me' : ''}`}>
            <span className="pillars__head">{label}</span>
            {p ? (
              <>
                <span className="pillars__god">{p.stemGod}</span>
                {cell(STEMS[p.stem])}
                {cell(BRANCHES[p.branch])}
                <span className="pillars__god">{p.branchGod}</span>
              </>
            ) : (
              <>
                <span className="pillars__god">&nbsp;</span>
                <span className="pillars__cell is-empty">?</span>
                <span className="pillars__cell is-empty">?</span>
                <span className="pillars__god">&nbsp;</span>
              </>
            )}
          </div>
        ))}
      </div>
      <ul className="pillars__counts">
        {ELEMENTS.map((e) => (
          <li key={e}>
            <i style={{ background: ELEMENT_META[e].strong }} />
            {ELEMENT_META[e].ko} {saju.counts[e]}
          </li>
        ))}
      </ul>
      <p className="pillars__note">
        {settings.seoulTime ? '서울 기준으로 태어난 시간에서 30분을 빼서 계산했고, ' : '시간 보정 없이 계산했고, '}
        {settings.lateRat ? '밤 11시~12시 출생은 일주를 그날로 보는 야자시 기준이에요.' : '밤 11시~12시 출생은 일주를 다음 날로 보는 조자시 기준이에요.'}
        <br />
        설정에서 바꿀 수 있어요.
      </p>
    </>
  )
}
