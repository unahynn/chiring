import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import StatusBar from '../components/StatusBar'
import { CaretLeftIcon } from '../components/icons'
import { ShaderFill, useWebGPUDevice } from '../lib/custom-effect-runtime'
import {
  setup as setupLightRays,
  render as renderLightRays,
  manifest as lightRaysManifest,
} from '../lib/custom-effects/CodeComponentId_ef36259fe6234eefc467a13193e7fb6ffc6f04e7_8354'
import avatarDayun from '../assets/frequency/avatar-dayun.jpg'
import avatarSsu from '../assets/frequency/avatar-ssu.jpg'
import avatarNahyun from '../assets/frequency/avatar-nahyun.jpg'
import avatarYujin from '../assets/frequency/avatar-yujin.jpg'
import avatarSumin from '../assets/friends/avatar-sumin.jpg'
import { ENERGY_META, energyCard, pickEnergy, suggestKeywords, type EnergyType } from '../data/energy'
import './Frequency.css'

/**
 * 새 디자인 그림들 (assets/frequency/v2)
 * ZEN SERIF 글자는 폰트 파일 대신 글자 이미지로 넣었어요 (폰트 라이선스: 재배포 금지).
 */
const V2 = import.meta.glob<string>('../assets/frequency/v2/*.{png,webp}', { eager: true, import: 'default' })
const v2 = (name: string): string | undefined => V2[`../assets/frequency/v2/${name}.png`] ?? V2[`../assets/frequency/v2/${name}.webp`]

// 기운 선물 완료: 기운별 참(키링)
const CHARM_IMAGES = import.meta.glob<string>('../assets/charm/charm-*.webp', { eager: true, import: 'default' })
const charmSrc = (energy: EnergyType) => CHARM_IMAGES[`../assets/charm/charm-${energy}.webp`]

export type FrequencyStep = 'home' | 'friend' | 'compose' | 'result' | 'loading' | 'cards' | 'message' | 'gifted'

/** 아바타 원 안에 겹쳐 그릴 사진들 (피그마 크롭 그대로, 44px 원 기준) */
type Layer = { src: string; style?: CSSProperties }

type Friend = {
  id: string
  /** 목록·제목에 보이는 이름 (제목에서는 첫 글자를 대문자로: Sumin) */
  name: string
  /** '나현님께'처럼 높여 부를 때 이름 */
  honorName: string
  /** 오늘 필요한 기운 → 점 색과 글자는 ENERGY_META에서 */
  need: EnergyType
  avatarBg: string
  layers: Layer[]
}

// 나중에 서버에서 받아올 친구 목록. 피그마 '주파수 친구 선택' 화면 그대로예요.
const FRIENDS: Friend[] = [
  { id: 'dayun', name: 'dayun', honorName: '다윤', need: 'wood', avatarBg: '#d1d7de', layers: [{ src: avatarDayun }] },
  {
    id: 'sumin',
    name: 'sumin',
    honorName: '수민',
    need: 'water',
    avatarBg: '#d1d7de',
    layers: [{ src: avatarSumin, style: { left: -26, top: -17, width: 92, height: 92 } }],
  },
  { id: 'hyeoni', name: 'hyeoni', honorName: '다현', need: 'fire', avatarBg: '#a40003', layers: [] },
  {
    id: 'nahyun',
    name: 'Nahyun',
    honorName: '나현',
    need: 'metal',
    avatarBg: '#d1d7de',
    layers: [{ src: avatarSsu }, { src: avatarNahyun, style: { left: -1, top: -16, width: 44, height: 59 } }],
  },
  {
    id: 'yujin',
    name: 'yujin',
    honorName: '유진',
    need: 'metal',
    avatarBg: '#d1d7de',
    layers: [{ src: avatarYujin, style: { left: 0, top: '-12.41%', width: '100%', height: '177.78%', objectFit: 'fill' } }],
  },
  { id: 'kwon', name: 'Kwon', honorName: '민재', need: 'earth', avatarBg: '#8ec2ff', layers: [] },
  { id: 'ssu', name: 'SSU', honorName: '수진', need: 'earth', avatarBg: '#d1d7de', layers: [{ src: avatarSsu }] },
]

/** 'sumin' → 'Sumin' (피그마 제목 표기) */
const titleName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)

/** 영어 이름 뒤 을/를: 모음(a e i o u y)으로 끝나면 '를' (hyeoni를, Sumin을) */
const objectParticle = (name: string) => (/[aeiouy]$/i.test(name) ? '를' : '을')

/** 주파수 카드 3종 (피그마 '주파수 카드 선택 옵션 1·2·3') — 그림: assets/frequency/card-{기운}-{1·2·3}.webp */
const CARD_IMAGES = import.meta.glob<string>('../assets/frequency/card-*.webp', { eager: true, import: 'default' })
const cardSrc = (energy: EnergyType, n: number) => CARD_IMAGES[`../assets/frequency/card-${energy}-${n}.webp`]

const CARD_LABELS: Record<EnergyType, [string, string, string]> = {
  water: ['미련 폭파 기운', '연락 말고 그냥 자 주파수', '새로운 인연이 들어오는 기운'],
  wood: ['새출발 풀충전', 'Let It Bloom!', '합격 싹 틔우는 기운'],
  metal: ['적게 일하고 많이 받는 기운', '지갑닫는 주파수', 'Saving mode ON'],
  fire: ['Just Move! Move! Move!', '가만히 있어도 살 10kg 빠지는 주파수', '10000 칼로리 태워주는 기운'],
  earth: ['일단 진정 기운', 'Build It Up!', '차곡차곡 쌓아올리기'],
}

const signalCards = (energy: EnergyType) =>
  CARD_LABELS[energy].map((label, i) => ({ id: `${energy}-${i + 1}`, src: cardSrc(energy, i + 1), label }))

/** '기운 주파수 다시 듣기' 카드 순서 (피그마) — 오늘 부족한 기운이 맨 앞으로 와요 */
const VIBE_ORDER: EnergyType[] = ['fire', 'water', 'wood', 'earth', 'metal']

const VIBE_NAMES: Record<EnergyType, string> = { fire: 'Fire', water: 'Water', wood: 'Wood', earth: 'Earth', metal: 'Metal' }

/** 다시 듣기 카드 그라데이션 (피그마 그대로) */
const VIBE_GRADIENTS: Record<EnergyType, { transform: string; stops: [string, number][]; inset: string }> = {
  fire: {
    transform: 'matrix(-7.7533e-13 11.95 -11.95 1.283e-12 80 80)',
    stops: [['#ffa7c6', 0], ['#ff73b2', 0.24], ['#ff58a8', 0.36], ['#ff3e9e', 0.48], ['#ff5977', 0.607], ['#ff744f', 0.733], ['#ff8f28', 0.859], ['#ff9c14', 0.922], ['#ffa30a', 0.954], ['#ffaa00', 0.986]],
    inset: 'inset 0 0 24px rgba(226, 217, 255, 0.6)',
  },
  water: {
    transform: 'matrix(5.7915e-13 -15.9 11.432 -2.4643e-14 80 121)',
    stops: [['#13e2ff', 0], ['#2bd4ff', 0.077], ['#42c6ff', 0.154], ['#71aaff', 0.308], ['#7f79ff', 0.529], ['#5996ff', 0.75], ['#33b4ff', 0.971]],
    inset: 'inset 0 0 12px rgba(255, 255, 255, 0.25), inset 0 0 28px rgba(188, 198, 255, 0.6)',
  },
  wood: {
    transform: 'matrix(-12.05 -12.05 10.307 -10.307 140.5 144.5)',
    stops: [['#00f4c3', 0.058], ['#00cfd6', 0.577], ['#0ed2d1', 0.603], ['#1bd5cc', 0.63], ['#37dbc3', 0.683], ['#52e1ba', 0.736], ['#6ee7b0', 0.788], ['#a5f39d', 0.894], ['#dcff8a', 1]],
    inset: 'inset 0 0 28px rgba(206, 213, 255, 0.95)',
  },
  earth: {
    transform: 'matrix(5.4107e-14 21.25 -21.25 4.611e-12 80 12)',
    stops: [['#ffe760', 0], ['#ffb259', 0.192], ['#ff8575', 0.418], ['#ff8f51', 0.709], ['#ff9a2d', 1]],
    inset: 'inset 0 0 12px rgba(255, 255, 255, 0.25), inset 0 0 28px rgba(255, 216, 228, 0.95)',
  },
  metal: {
    transform: 'matrix(13.75 8.3711e-13 2.3006e-13 9.8135 80 80)',
    stops: [['#c7f75a', 0], ['#ffe15e', 0.481], ['#f5f08d', 0.712], ['#ecffbc', 0.942]],
    inset: 'inset 0 0 12px rgba(255, 255, 255, 0.25), inset 0 0 20px rgba(233, 255, 204, 0.56)',
  },
}

const vibeStyle = (energy: EnergyType): CSSProperties => {
  const g = VIBE_GRADIENTS[energy]
  const svg = `<svg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%' height='100%' fill='url(#g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='${g.transform}'>${g.stops
    .map(([c, o]) => `<stop stop-color='${c}' offset='${o}'/>`)
    .join('')}</radialGradient></defs></svg>`
  return {
    backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
    boxShadow: `1.749px 1.749px 23.696px rgba(187, 187, 187, 0.25), ${g.inset}`,
  }
}

/**
 * 기운 생성중: 피그마 'Light rays' 셰이더. 물 기운은 피그마 값 그대로, 나머지는 기운 색으로 바꿔요.
 * (색은 0~1 RGB)
 */
const RAY_COLORS: Record<EnergyType, [[number, number, number], [number, number, number]]> = {
  water: [
    [0.22306941449642181, 0.766920804977417, 1],
    [0.6352941393852234, 0.3490196168422699, 1],
  ],
  fire: [
    [1, 0.36, 0.78],
    [1, 0.63, 0.97],
  ],
  wood: [
    [0.37, 1, 0.78],
    [0.08, 0.72, 0.85],
  ],
  metal: [
    [0.81, 0.98, 0.42],
    [1, 0.88, 0.37],
  ],
  earth: [
    [1, 0.54, 0.24],
    [1, 0.33, 0.12],
  ],
}

const lightRays = (energy: EnergyType) => {
  const [c1, c2] = RAY_COLORS[energy]
  return {
    setup: setupLightRays,
    render: renderLightRays,
    manifest: lightRaysManifest,
    params: {
      speed: 0.5,
      lightSource: { x: 50, y: -30, radius: 85, angle: 90 },
      inputMode: 0,
      intensity: 0.20000000298023224,
      threshold: 0.5,
      beamSoftness: 0.5,
      color1: { r: c1[0], g: c1[1], b: c1[2], a: 1 },
      colorBlend: 0,
      spread: 0.5,
      glow: 0.5,
      color2: { r: c2[0], g: c2[1], b: c2[2], a: 1 },
      density: 0.5,
    },
  }
}

/** 기운별 셰이더 (한 번만 만들어서 화면이 다시 그려져도 같은 셰이더를 써요) */
const LIGHT_RAYS = Object.fromEntries(VIBE_ORDER.map((e) => [e, lightRays(e)])) as Record<EnergyType, ReturnType<typeof lightRays>>

/** 필요한 기운 확인 빛: 물 기운 그림을 기운 색 쪽으로 돌려 써요 */
const GLOW_HUE: Record<EnergyType, number> = { water: 0, fire: 125, wood: -40, metal: -115, earth: 170 }

type Props = {
  step: FrequencyStep
  onStepChange: (step: FrequencyStep) => void
  /** 내 사주에서 오늘 부족한 기운 ('오늘 부족한 불의 기운, …') */
  todayNeed?: EnergyType
}

/** 기운 충전 탭: 누구에게 → 친구 → 내용 → 필요한 기운 → 생성중 → 카드 → 메세지 → 선물 완료 */
export default function Frequency({ step, onStepChange, todayNeed = 'fire' }: Props) {
  const [picked, setPicked] = useState<'me' | 'friend' | null>(null)
  const [friendId, setFriendId] = useState<string | null>(null)
  const friend = FRIENDS.find((f) => f.id === friendId)
  /** 누구를 위한 기운인지: 나(Me) 또는 고른 친구(Friend) */
  const [mode, setMode] = useState<'me' | 'friend'>('friend')
  const isMe = mode === 'me'
  /** 화면 문구에 들어갈 대상. 나를 위한 기운이면 '나' */
  const target = isMe ? { name: '나', honorName: '나', need: undefined } : friend && { ...friend, name: titleName(friend.name) }

  // 내용 입력 → 키워드 선택
  const [text, setText] = useState('')
  const [editing, setEditing] = useState(false)
  const [customKeywords, setCustomKeywords] = useState<string[]>([])
  const [picks, setPicks] = useState<string[]>([])
  const [writingKeyword, setWritingKeyword] = useState(false)
  const [keywordDraft, setKeywordDraft] = useState('')
  const textRef = useRef<HTMLTextAreaElement>(null)
  const suggested = useMemo(() => suggestKeywords(text), [text])
  const keywordOptions = [...suggested, ...customKeywords.filter((k) => !suggested.includes(k))]
  const hasText = text.trim().length > 0

  const togglePick = (k: string) => setPicks((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))

  const addCustomKeyword = () => {
    const k = keywordDraft.trim()
    if (k) {
      if (!keywordOptions.includes(k)) setCustomKeywords((prev) => [...prev, k])
      if (!picks.includes(k)) setPicks((prev) => [...prev, k])
    }
    setKeywordDraft('')
    setWritingKeyword(false)
  }

  // 카드 선택 · 메세지
  const [cardIndex, setCardIndex] = useState(0)
  const [message, setMessage] = useState('')
  const swipeX = useRef<number | null>(null)
  const swiped = useRef(false)
  const energy = pickEnergy(text, picks, target?.need)
  // WebGPU가 없는 브라우저에선 셰이더 대신 같은 색의 정적인 빛을 보여줘요
  const { error: gpuError } = useWebGPUDevice()

  // 선물 완료: 안내(어둡게) → 문지르기 → 참 등장
  const [rub, setRub] = useState<'guide' | 'rub' | 'done'>('guide')
  const [rubProgress, setRubProgress] = useState(0)
  const rubLast = useRef<{ x: number; y: number } | null>(null)
  const rubAcc = useRef(0)

  // 기운 생성중 → 잠시 뒤 카드 선택 화면으로
  useEffect(() => {
    if (step !== 'loading') return
    const t = window.setTimeout(() => onStepChange('cards'), 3200)
    return () => window.clearTimeout(t)
  }, [step, onStepChange])

  const resetCompose = () => {
    setCardIndex(0)
    setText('')
    setPicks([])
    setCustomKeywords([])
  }

  if (step === 'friend') {
    return (
      <div className="freq">
        <StatusBar />
        <header className="freq__gnb">
          <CloseButton onClick={() => onStepChange('home')} />
          <span className="freq__gnb-title">Friend</span>
        </header>
        <h1 className="freq__title">
          어떤 친구에게
          <br />
          기운을 보내줄까?
        </h1>

        <ul className={`friend-list${friendId ? ' has-pick' : ''}`}>
          {FRIENDS.map((f) => (
            <li key={f.id}>
              <button
                className={`friend-row${f.id === friendId ? ' is-picked' : ''}`}
                onClick={() => {
                  if (f.id !== friendId) resetCompose()
                  setFriendId(f.id)
                }}
                aria-pressed={f.id === friendId}
              >
                <span className="friend-row__avatar" style={{ background: f.avatarBg }}>
                  {f.layers.map((l, i) => (
                    <img key={i} src={l.src} alt="" style={l.style} />
                  ))}
                </span>
                <span className="friend-row__name">{f.name}</span>
                <span className="friend-row__need">오늘 필요한 기운: {ENERGY_META[f.need].label}</span>
                <span className="friend-row__dot" style={{ background: ENERGY_META[f.need].dot }} />
              </button>
            </li>
          ))}
        </ul>

        <div className="freq__actions">
          <button className="freq__btn freq__btn--prev" onClick={() => onStepChange('home')}>
            이전
          </button>
          <button className="freq__btn freq__btn--next" disabled={!friendId} onClick={() => onStepChange('compose')}>
            다음
          </button>
        </div>
        <div className="freq__indicator" />
      </div>
    )
  }

  if (step === 'compose' && target) {
    return (
      <div className="freq">
        <StatusBar />
        <header className="freq__gnb">
          <CloseButton onClick={() => onStepChange('home')} />
        </header>
        <h1 className="freq__title freq__title--compose">
          {isMe ? (
            <>
              지금 나에게는
              <br />
              어떤 기운이 필요할까?
            </>
          ) : (
            <>
              <em className="freq__name">{target.name}</em>한테
              <br />
              어떤 기운을 보내줄까?
            </>
          )}
        </h1>
        <div
          className={`compose__card${editing ? ' is-editing' : ''}`}
          onClick={() => {
            setEditing(true)
            window.setTimeout(() => textRef.current?.focus(), 0)
          }}
        >
          {editing ? (
            <textarea
              ref={textRef}
              autoFocus
              id="frequency-text"
              className="compose__input"
              value={text}
              rows={Math.min(4, Math.max(1, text.split('\n').length))}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => setEditing(false)}
              placeholder={isMe ? '요즘 나는 어떤 상태인지 적어주세요' : '친구에게 필요한 상황을 적어주세요'}
              maxLength={80}
            />
          ) : hasText ? (
            <p className="compose__text">{text.trim()}</p>
          ) : (
            <span className="compose__placeholder">{isMe ? '탭하여 요즘 내 상황을 적어주세요' : '탭하여 내용을 입력해주세요'}</span>
          )}
        </div>

        {hasText && !editing && (
          <section className="keywords">
            <h2 className="keywords__q">{isMe ? '어떤 마음을 채우고 싶어?' : '어떤 마음을 전해주고 싶어?'}</h2>
            <div className="keywords__chips">
              {keywordOptions.map((k) => (
                <button key={k} className={`chip${picks.includes(k) ? ' is-on' : ''}`} onClick={() => togglePick(k)} aria-pressed={picks.includes(k)}>
                  {k}
                </button>
              ))}
              {writingKeyword ? (
                <form
                  className="chip chip--input"
                  onSubmit={(e) => {
                    e.preventDefault()
                    addCustomKeyword()
                  }}
                >
                  <input
                    id="custom-keyword"
                    autoFocus
                    value={keywordDraft}
                    maxLength={10}
                    onChange={(e) => setKeywordDraft(e.target.value)}
                    onBlur={addCustomKeyword}
                    placeholder="키워드 입력"
                  />
                </form>
              ) : (
                <button className="chip chip--add" onClick={() => setWritingKeyword(true)}>
                  <span className="chip__plus">+</span>직접 작성하기
                </button>
              )}
            </div>
          </section>
        )}

        <div className="freq__actions">
          <button className="freq__btn freq__btn--prev" onClick={() => onStepChange(isMe ? 'home' : 'friend')}>
            이전
          </button>
          <button
            className="freq__btn freq__btn--next"
            disabled={!hasText || picks.length === 0}
            onClick={() => onStepChange('result')}
          >
            다음
          </button>
        </div>
        <div className="freq__indicator" />
      </div>
    )
  }

  if (step === 'result' && target) {
    const card = energyCard(energy, text)
    const withBuddha = card.key === 'water-contact'
    const titleImg = v2(`need-title-${card.key}`)
    return (
      <div className="freq need">
        <StatusBar />
        <img
          className="need__glow"
          src={v2(withBuddha ? 'need-glow-buddha' : 'need-glow')}
          alt=""
          style={{ filter: GLOW_HUE[energy] ? `hue-rotate(${GLOW_HUE[energy]}deg)` : undefined }}
        />
        <header className="freq__gnb">
          <BackButton onClick={() => onStepChange('compose')} />
        </header>
        <h1 className="freq__title need__title">
          지금 {isMe ? '나' : <em style={{ color: card.color }}>{target.name}</em>}에게
          <br />
          필요한 기운은
        </h1>
        <p className="need__sub">{card.subtitle}</p>
        {titleImg ? <img className="need__name" src={titleImg} alt={card.title} /> : <p className="need__name need__name--text">{card.title}</p>}
        {/* 물부처 그림은 빛 배경에 함께 들어 있어요. 다른 기운은 그 기운의 참을 보여줘요 */}
        {!withBuddha && <img className="need__charm" src={charmSrc(energy)} alt="" />}
        <div className="need__tags">
          <p>
            <span>{card.tags[0]}</span>
            <span>{card.tags[1]}</span>
          </p>
          <p>
            <span>{card.tags[2]}</span>
          </p>
        </div>
        <button className="freq__btn freq__btn--center" onClick={() => onStepChange('loading')}>
          주파수 만들기
        </button>
        <div className="freq__indicator" />
      </div>
    )
  }

  if (step === 'loading' && target) {
    const [c1, c2] = RAY_COLORS[energy]
    const rgb = (c: number[]) => `rgb(${c.map((v) => Math.round(v * 255)).join(' ')})`
    return (
      <div className="freq loading" style={{ ['--c1' as string]: rgb(c1), ['--c2' as string]: rgb(c2) }}>
        {gpuError ? <div className="loading__fallback" /> : <ShaderFill shader={LIGHT_RAYS[energy]} className="loading__rays" />}
        <StatusBar tone="dark" />
        <h1 className="loading__title">
          {isMe ? '나를' : `${target.name}${objectParticle(target.name)}`} 위한
          <br />
          기운 생성중
          <span className="loading__dots">
            <i>·</i>
            <i>·</i>
            <i>·</i>
          </span>
        </h1>
        <div className="freq__indicator loading__indicator" />
      </div>
    )
  }

  if (step === 'cards' && target) {
    const go = (i: number) => setCardIndex(Math.max(0, Math.min(2, i)))
    return (
      <div className="freq">
        <StatusBar />
        <header className="freq__gnb">
          <CloseButton onClick={() => onStepChange('home')} />
          <span className="freq__gnb-title freq__gnb-title--white">{isMe ? '나의 주파수' : '주파수 선물하기'}</span>
        </header>
        <img className="signal__title" src={v2('lucky-signal')} alt="Lucky signal" />
        <div
          className="signal__stage"
          onPointerDown={(e) => {
            swipeX.current = e.clientX
            swiped.current = false
          }}
          onPointerUp={(e) => {
            if (swipeX.current === null) return
            const dx = e.clientX - swipeX.current
            swipeX.current = null
            if (Math.abs(dx) > 40) swiped.current = true // 넘긴 직후의 '클릭'은 무시
            if (dx < -40) go(cardIndex + 1)
            else if (dx > 40) go(cardIndex - 1)
          }}
        >
          {signalCards(energy).map((c, i) => {
            const off = i - cardIndex
            const pos = off === 0 ? 'center' : off === -1 ? 'left' : off === 1 ? 'right' : off < 0 ? 'gone-left' : 'gone-right'
            return (
              <button key={c.id} className={`signal-card signal-card--${pos}`} onClick={() => !swiped.current && go(i)} aria-label={c.label}>
                <img src={c.src} alt="" draggable={false} />
              </button>
            )
          })}
        </div>
        <div className="signal__dots">
          {signalCards(energy).map((c, i) => (
            <button key={c.id} className={i === cardIndex ? 'is-on' : ''} onClick={() => go(i)} aria-label={`${i + 1}번째 카드`} />
          ))}
        </div>
        <div className="freq__actions">
          <button className="freq__btn freq__btn--prev" onClick={() => onStepChange('result')}>
            이전
          </button>
          <button className="freq__btn freq__btn--next" onClick={() => onStepChange('message')}>
            선택
          </button>
        </div>
        <div className="freq__indicator" />
      </div>
    )
  }

  if (step === 'message' && target) {
    const card = signalCards(energy)[cardIndex]
    return (
      <div className="freq freq--gift">
        <StatusBar />
        <header className="freq__gnb">
          <CloseButton onClick={() => onStepChange('cards')} />
          <span className="freq__gnb-title freq__gnb-title--white">{isMe ? '나의 주파수' : '주파수 선물하기'}</span>
        </header>
        <img className="gift__card" src={card.src} alt={card.label} />
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!message.trim()) return
            // 선물 완료 화면은 늘 문지르기 안내부터
            setRub('guide')
            setRubProgress(0)
            rubAcc.current = 0
            onStepChange('gifted')
          }}
        >
          <textarea
            id="gift-message"
            className="gift__message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isMe ? '나에게 해주고 싶은 말을 남겨줘' : `${target.name}에게 한마디 남겨줘`}
            maxLength={60}
            rows={2}
          />
          <button className="freq__btn freq__btn--wide" disabled={!message.trim()}>
            {isMe ? '기운 채우기' : '기운 보내기'}
          </button>
        </form>
        <div className="freq__indicator" />
      </div>
    )
  }

  if (step === 'gifted' && target) {
    const card = signalCards(energy)[cardIndex]
    // 카드 위를 문지른 거리만큼 차올라요. 다 차면 참으로 바뀌어요.
    const RUB_GOAL = 900
    const onRubDown = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (rub === 'done') return
      setRub('rub')
      e.currentTarget.setPointerCapture(e.pointerId)
      rubLast.current = { x: e.clientX, y: e.clientY }
    }
    const onRubMove = (e: ReactPointerEvent<HTMLDivElement>) => {
      const last = rubLast.current
      if (!last || rub === 'done') return
      const d = Math.hypot(e.clientX - last.x, e.clientY - last.y)
      rubLast.current = { x: e.clientX, y: e.clientY }
      const next = Math.min(1, rubAcc.current + d / RUB_GOAL)
      rubAcc.current = next
      setRubProgress(next)
      if (next >= 1) {
        rubLast.current = null
        setRub('done')
      }
    }
    const onRubUp = () => {
      rubLast.current = null
    }
    return (
      <div className={`freq gifted is-${rub}`}>
        <img className="gifted__glow" src={v2('gift-glow')} alt="" />
        <StatusBar />
        <h1 className="gifted__title">
          {isMe ? (
            '나에게'
          ) : (
            <>
              <em style={{ color: energyCard(energy, text).color }}>{target.name}</em>님께
            </>
          )}
          <br />
          {isMe ? '기운 충전 완료!' : '기운 선물 완료!'}
        </h1>

        {rub !== 'done' ? (
          <div
            className="gifted__card"
            style={{ ['--rub' as string]: rubProgress }}
            onPointerDown={onRubDown}
            onPointerMove={onRubMove}
            onPointerUp={onRubUp}
            onPointerCancel={onRubUp}
          >
            <img src={card.src} alt={card.label} draggable={false} />
          </div>
        ) : (
          <div className={`gifted__charm gifted__charm--${energy}`}>
            <img src={charmSrc(energy)} alt={`${ENERGY_META[energy].label} 참`} />
          </div>
        )}

        {/* 처음 들어오면 화면을 어둡게 하고 문지르는 손을 보여줘요. 아무 데나 누르면 사라져요 */}
        {rub === 'guide' && <div className="gifted__dim" onPointerDown={() => setRub('rub')} />}
        {rub === 'guide' && <img className="gifted__hand" src={v2('hand-rub')} alt="" />}
        {rub !== 'done' && <p className="gifted__hint">마음을 담아 카드를 문질러주세요</p>}

        {rub === 'done' && (
          <button
            className="freq__btn freq__btn--wide gifted__btn"
            onClick={() => {
              setMessage('')
              resetCompose()
              setFriendId(null)
              onStepChange('home')
            }}
          >
            확인
          </button>
        )}
        <div className="freq__indicator gifted__indicator" />
      </div>
    )
  }

  // step === 'home'
  const choose = (who: 'me' | 'friend') => {
    setPicked(who)
    if (who !== mode) {
      resetCompose()
      setMode(who)
    }
    // 눌린 카드를 잠깐 보여주고 다음 화면으로
    window.setTimeout(() => {
      setPicked(null)
      // 나를 위한 기운은 친구 선택 없이 바로 내용 입력으로
      onStepChange(who === 'me' ? 'compose' : 'friend')
    }, 380)
  }
  const vibes = [todayNeed, ...VIBE_ORDER.filter((e) => e !== todayNeed)]

  return (
    <div className="freq freq--home">
      <StatusBar />
      <header className="freq__gnb">
        <span className="freq__gnb-title">기운 충전</span>
      </header>
      <h1 className="home__h">오늘의 기운 충전</h1>
      <p className="home__desc">필요한 기운을 나를 위해 채우거나 친구에게 보내보세요.</p>

      <div className="who">
        <button className={`who__card${picked === 'me' ? ' is-picked' : ''}`} onClick={() => choose('me')}>
          <img className="who__title" src={v2('text-me')} alt="Me" width={61} height={42} />
          <span className="who__desc">
            나를 위한
            <br />내 기운 채우기
          </span>
          <ArrowCircle />
        </button>
        <button className={`who__card${picked === 'friend' ? ' is-picked' : ''}`} onClick={() => choose('friend')}>
          <img className="who__title" src={v2('text-friend')} alt="Friend" width={131} height={42} />
          <span className="who__desc">
            친구에게
            <br />
            기운 보내기
          </span>
          <ArrowCircle />
        </button>
      </div>

      <h2 className="home__h home__h--replay">기운 주파수 다시 듣기</h2>
      <p className="home__desc home__desc--replay">오늘 부족한 {ENERGY_META[todayNeed].label.split(' ')[0]}의 기운, 지난 주파수로 채워봐요.</p>
      <ul className="vibes">
        {vibes.map((e) => (
          <li key={e} className="vibe" style={vibeStyle(e)}>
            <img src={v2(`vibe-${e}`)} alt={`${VIBE_NAMES[e]} Vibe`} width={129} height={29} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ArrowCircle() {
  return (
    <span className="who__arrow" aria-hidden>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M23.5518 18L12.4483 18" stroke="white" strokeWidth="1.58621" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 23.5508L23.5518 17.9991L18 12.4473" stroke="white" strokeWidth="1.58621" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

/** 상단 왼쪽 동그란 닫기(X) 버튼 */
function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="freq__round" onClick={onClick} aria-label="닫기">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M0.922852 0.923828L14.9229 14.9238M14.9229 0.923828L0.922852 14.9238"
          stroke="white"
          strokeWidth="1.84593"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

/** 상단 왼쪽 동그란 뒤로(<) 버튼 */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="freq__round" onClick={onClick} aria-label="뒤로">
      <CaretLeftIcon size={22} />
    </button>
  )
}
