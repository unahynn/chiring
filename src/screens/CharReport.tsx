import { useMemo, useState, type CSSProperties } from 'react'
import StatusBar from '../components/StatusBar'
import BottomSheet from '../components/BottomSheet'
import SettingsSheet from '../components/SettingsSheet'
import { CaretLeftIcon, CaretRightIcon, CloseIcon, SettingsIcon } from '../components/icons'
import type { Me } from '../data/profile'
import { buildReport, type Lucky, type ReportSection, type SectionKey } from '../data/report'
import { BRANCHES, ELEMENTS, ELEMENT_META, STEMS, elementLabel, type Pillar } from '../data/saju'
import type { Settings } from '../data/settings'
import charmFire from '../assets/report/charm-fire.webp'
import charmWater from '../assets/report/charm-water.webp'
import charmDrop from '../assets/report/charm-drop.webp'
import charmWood from '../assets/report/charm-wood.webp'
import charmEarth from '../assets/report/charm-earth.webp'
import charmMetal from '../assets/report/charm-metal.webp'
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

// 타입 이름 글자 이미지 (scripts/render-zen-text.py 로 만들어요)
const TYPE_IMAGES = import.meta.glob<string>('../assets/report/type-*.png', { eager: true, import: 'default' })
const typeImage = (name: string) => TYPE_IMAGES[`../assets/report/type-${name.toLowerCase().replace(/ /g, '-')}.png`]

/** 피그마 그라데이션(radialGradient)을 배경 그림으로 */
const radial = (transform: string, stops: [string, number][], opacity = 1) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg viewBox='0 0 177 177' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%' height='100%' fill='url(#g)' opacity='${opacity}'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='${transform}'>${stops
      .map(([c, o]) => `<stop stop-color='${c}' offset='${o}'/>`)
      .join('')}</radialGradient></defs></svg>`,
  )}")`

/**
 * 6개 박스 모양 (피그마 '나의 캐해 리포트' 그대로): 그라데이션 · 안쪽 빛 · 하얀 아크릴 참
 * 참 위치는 177 × 177 박스 기준. blend: 피그마처럼 박스 색이 비치게 (hard-light)
 */
const BOX_LOOKS: Record<SectionKey, { bg: string; inset: string; charm: string; blend: boolean; style: CSSProperties }> = {
  elements: {
    bg: radial('matrix(-0.0000012985 12.25 -8.8 -9.3262e-7 88 82.5)', [['#d7009a', 0.048], ['#e10ea5', 0.167], ['#eb1cb1', 0.286], ['#ff39c7', 0.524], ['#ff64ab', 0.762], ['#ff9090', 1]]),
    inset: 'inset 0 0 12px rgba(255, 255, 255, 0.25), inset 0 0 28px rgba(255, 188, 189, 0.95)',
    charm: charmFire,
    blend: true,
    style: { left: 47, top: 43, width: 83.975, height: 92.7 },
  },
  personality: {
    bg: [
      radial('matrix(12.2 -15.25 15.25 12.2 -54 259)', [['#ff9cf7', 0], ['#fc75f9', 0.153], ['#f94efb', 0.305], ['#f527fd', 0.458], ['#f414fe', 0.534], ['#f30afe', 0.572], ['#f200ff', 0.611], ['rgba(242,0,255,0)', 0.971]], 0.7),
      radial('matrix(-15.4 15.95 -15.95 -15.4 177 -0.0000095069)', [['#fc4fff', 0.255], ['#d250f5', 0.373], ['#a851ea', 0.49], ['#6f30e3', 0.704], ['#5220e0', 0.811], ['#3610dc', 0.918]]),
    ].join(', '),
    inset: 'inset 0 0 24px rgba(226, 217, 255, 0.5)',
    charm: charmWater,
    blend: true,
    style: { left: 48, top: 48, width: 81.9, height: 81.9, opacity: 0.9 },
  },
  guide: {
    bg: [
      'linear-gradient(rgba(0, 21, 255, 0.2), rgba(0, 21, 255, 0.2))',
      radial('matrix(9.5654e-14 17.7 -17.7 7.0515e-13 88.5 -3.5372e-12)', [['#c0f4ff', 0.014], ['#94f0ff', 0.075], ['#69ebff', 0.135], ['#3ee7ff', 0.195], ['#29e4ff', 0.225], ['#13e2ff', 0.255], ['#22b8ff', 0.359], ['#318dff', 0.464], ['#4163ff', 0.569], ['#5039ff', 0.673], ['#5355ff', 0.755], ['#5771ff', 0.837], ['#5da9ff', 1]]),
    ].join(', '),
    inset: 'inset 0 0 28px rgba(56, 248, 255, 0.6)',
    // 물방울 참은 피그마 화면에서 박스 색이 비친 채로 잘라 왔어요
    charm: charmDrop,
    blend: false,
    style: { left: 42, top: 43, width: 92.7, height: 92.7 },
  },
  caution: {
    bg: `url("data:image/svg+xml;utf8,${encodeURIComponent(
      "<svg viewBox='0 0 177 177' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><g transform='matrix(1.9512e-16 15.65 -15.65 9.7733e-14 88 89)'><rect height='107.48' width='107.41' fill='url(#g)' id='q'/><use href='#q' transform='scale(1 -1)'/><use href='#q' transform='scale(-1 1)'/><use href='#q' transform='scale(-1 -1)'/></g><rect width='100%' height='100%' fill='rgb(0,22,71)' opacity='0.2' style='mix-blend-mode:multiply'/><defs><linearGradient id='g' gradientUnits='userSpaceOnUse' x2='5' y2='5'><stop stop-color='#3bffbb' offset='0'/><stop stop-color='#1dd3ac' offset='0.089'/><stop stop-color='#0fbea4' offset='0.133'/><stop stop-color='#00a89d' offset='0.178'/><stop stop-color='#0cb39c' offset='0.276'/><stop stop-color='#18be9c' offset='0.374'/><stop stop-color='#2fd39b' offset='0.57'/><stop stop-color='#47e99b' offset='0.766'/><stop stop-color='#5eff9a' offset='0.962'/></linearGradient></defs></svg>",
    )}")`,
    inset: 'inset 0 0 1px rgba(255, 255, 255, 0.25), inset 0 0 28px rgba(206, 213, 255, 0.95)',
    charm: charmWood,
    blend: true,
    style: { left: 47, top: 47, width: 83.7, height: 83.7 },
  },
  relationships: {
    bg: radial('matrix(7.5805e-14 -12.2 12.2 2.9862e-13 88 110)', [['#ffa02b', 0.149], ['#f87829', 0.344], ['#f05027', 0.538], ['#e92824', 0.733], ['#e51423', 0.831], ['#e30a22', 0.879], ['#e10022', 0.928]]),
    inset: 'inset 0 0 28px rgba(255, 237, 189, 0.68)',
    charm: charmEarth,
    blend: true,
    style: { left: 45, top: 33, width: 87.3, height: 87.3, opacity: 0.9 },
  },
  lucky: {
    bg: radial('matrix(7.6891e-14 9 -9 2.8677e-13 88.5 72.5)', [['#aae911', 0.058], ['#7aeb16', 0.313], ['#4bed1a', 0.568], ['#74f11f', 0.676], ['#9df624', 0.784], ['#c6fa2a', 0.892], ['#efff2f', 1]]),
    inset: 'inset 0 0 12px rgba(255, 255, 255, 0.25), inset 0 0 28px rgba(204, 255, 241, 0.95)',
    charm: charmMetal,
    blend: true,
    style: { left: 46.7, top: 37.7, width: 84.2, height: 84.2, rotate: '-11.71deg' },
  },
}

/** 온보딩 2단계 & 내 캐해 보기: 나의 캐해 리포트 (피그마 '캐해 리포트', '리포트 세부') */
export default function CharReport({ me, onBack, onStart, onReset, theme, settings, onSettingsChange }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const report = useMemo(() => buildReport(me.saju), [me.saju])
  const { profile, saju } = me
  const core = ELEMENT_META[report.core]
  const typeImg = typeImage(report.typeName)
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
          {/* 온보딩 중엔 피그마처럼 뒤로 버튼 없이 (정보 수정은 설정 → 사주 정보 수정) */}
          {!onStart && (
            <button className="report__back" onClick={onBack} aria-label="뒤로">
              <CaretLeftIcon size={32} />
            </button>
          )}
          <h1>나의 캐해 리포트</h1>
          <button className="report__gear" onClick={() => setSettingsOpen(true)} aria-label="설정">
            <SettingsIcon />
          </button>
        </header>

        {/* 'Lemon Yellow Fire' (ZEN SERIF 글자 이미지를 글자 모양으로만 써서 색은 CSS로 칠해요) */}
        {typeImg ? (
          <p className="report__en" role="img" aria-label={report.typeName} style={{ WebkitMaskImage: `url(${typeImg})`, maskImage: `url(${typeImg})` }} />
        ) : (
          <p className="report__en report__en--text">{report.typeName}</p>
        )}
        <h2 className="report__type">{ELEMENT_META[report.core].ko}의 기운을 가진 타입</h2>
        <ul className="report__chips">
          {chips.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <div className="report__grid">
          {report.sections.map((s, i) => {
            const look = BOX_LOOKS[s.key]
            return (
              <button key={s.key} className={`report-box report-box--${s.key}`} style={{ animationDelay: `${0.05 * i}s` }} onClick={() => open(s.key)}>
                <span className="report-box__card" style={{ backgroundImage: look.bg, boxShadow: `1.749px 1.749px 23.696px rgba(187, 187, 187, 0.25), ${look.inset}` }}>
                  <img className={`report-box__charm${look.blend ? ' is-blend' : ''}`} src={look.charm} alt="" draggable={false} style={look.style} />
                </span>
                <span className="report-box__ko">{s.ko}</span>
              </button>
            )
          })}
        </div>

        {onStart && (
          <div className="report__footer">
            <button className="cta" onClick={onStart}>
              확인
            </button>
          </div>
        )}
      </div>
      <div className="home-indicator report__indicator" />

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
          {shown === 'pillars' ? <PillarsDetail me={me} settings={settings} /> : section && <SectionDetail section={section} report={report} saju={saju} onPillars={() => open('pillars')} />}
        </div>
      </BottomSheet>
    </div>
  )
}

function SectionDetail({
  section,
  report,
  saju,
  onPillars,
}: {
  section: ReportSection
  report: ReturnType<typeof buildReport>
  saju: Me['saju']
  onPillars: () => void
}) {
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
          {/* 만세력은 이제 나의 오행 안에서 열어요 */}
          <button className="elements__manse" onClick={onPillars}>
            만세력 보기
            <CaretRightIcon size={20} />
          </button>
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
