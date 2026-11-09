import { useEffect, useRef, useState, type CSSProperties } from 'react'
import StatusBar from '../components/StatusBar'
import { BackButton, CloseButton } from '../components/RoundButton'
import { replayCards, type SignalCard } from '../data/cards'
import { ENERGY_META, type EnergyType } from '../data/energy'
import { REPLAY_GIFTS } from '../data/replay'
import { hapticTick } from '../lib/haptic'
import { useTone } from '../lib/tone'
import listenBg from '../assets/frequency/v2/listen-bg.webp'
import listenTitle from '../assets/frequency/v2/todays-lucky-signal.png'
import iconBack5 from '../assets/signal/icon-back5.png'
import iconFwd5 from '../assets/signal/icon-fwd5.png'
import './FrequencyReplay.css'

/** 위쪽 기운 고르기 순서 (피그마: 불 · 물 · 나무 · 흙 · 금) */
const ORDER: EnergyType[] = ['fire', 'water', 'wood', 'earth', 'metal']
const shortName = (e: EnergyType) => ENERGY_META[e].label.split(' ')[0]

/** 카드 뒷면 빛 색 (밝은 가운데 · 가장자리 · 바깥 · 아래 어두운 띠) — 물 기운은 피그마 그대로 */
const BACK_COLORS: Record<EnergyType, { hi: string; edge: string; mid: string; deep: string }> = {
  water: { hi: '#00ffff', edge: '#00c6ff', mid: '#0a6bff', deep: '#001b5e' },
  fire: { hi: '#ffc2f0', edge: '#ff6fd0', mid: '#e0148a', deep: '#4a0032' },
  wood: { hi: '#a6ffe4', edge: '#33e8b4', mid: '#00a37c', deep: '#00382c' },
  metal: { hi: '#f6ffaa', edge: '#d6f540', mid: '#86ad00', deep: '#253200' },
  earth: { hi: '#ffe39a', edge: '#ffb04a', mid: '#ff6a0a', deep: '#481500' },
}

/** 기운 주파수 듣기: 기운별 지난 주파수 카드 목록 */
export function ReplayList({
  energy,
  onEnergy,
  onBack,
  onPick,
}: {
  energy: EnergyType
  onEnergy: (e: EnergyType) => void
  onBack: () => void
  onPick: (card: SignalCard) => void
}) {
  return (
    <div className="freq replay">
      <StatusBar />
      <header className="freq__gnb">
        <BackButton onClick={onBack} />
        <span className="freq__gnb-title">기운 주파수 듣기</span>
      </header>

      <div className="replay__chips" role="tablist">
        {ORDER.map((e) => (
          <button
            key={e}
            role="tab"
            aria-selected={e === energy}
            className={`replay__chip${e === energy ? ' is-on' : ''}`}
            onClick={() => onEnergy(e)}
          >
            {shortName(e)}
          </button>
        ))}
      </div>

      <ul className="replay__grid" key={energy}>
        {replayCards(energy).map((c, i) => (
          <li key={c.id} style={{ animationDelay: `${i * 40}ms` }}>
            <button className="replay__item" onClick={() => onPick(c)} aria-label={c.label}>
              <img src={c.src} alt="" draggable={false} />
            </button>
          </li>
        ))}
      </ul>
      <div className="freq__indicator" />
    </div>
  )
}

/** 고른 주파수 카드: 누르면 뒤집혀서 친구가 남긴 메세지가 보여요 */
export function ReplayCard({
  card,
  energy,
  toName,
  onClose,
  onPlay,
}: {
  card: SignalCard
  energy: EnergyType
  toName: string
  onClose: () => void
  /** 재생하기 → 주파수 듣는 화면 */
  onPlay: () => void
}) {
  const gift = REPLAY_GIFTS[card.id] ?? { from: '친구', message: '' }
  const [flipped, setFlipped] = useState(false)
  const liftRef = useRef<HTMLDivElement>(null)

  const flip = () => {
    setFlipped((f) => !f)
    hapticTick()
    // 뒤집는 동안 살짝 들렸다 내려앉아요
    liftRef.current?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.045)', offset: 0.45 }, { transform: 'scale(1)' }],
      { duration: 700, easing: 'cubic-bezier(0.33, 0, 0.2, 1)' },
    )
  }

  const c = BACK_COLORS[energy]
  return (
    <div className="freq replay-card">
      <StatusBar />
      <header className="freq__gnb">
        <CloseButton onClick={onClose} />
      </header>
      <h1 className="replay-card__title">
        {gift.from}님께서
        <br />
        선물한 기운
      </h1>

      <div
        className="replay-card__lift"
        ref={liftRef}
        style={
          {
            '--b-hi': c.hi,
            '--b-edge': c.edge,
            '--b-mid': c.mid,
            '--b-deep': c.deep,
          } as CSSProperties
        }
      >
        <button
          className={`replay-card__flip${flipped ? ' is-flipped' : ''}`}
          onClick={flip}
          aria-label={flipped ? '카드 앞면 보기' : '메세지 보기'}
        >
          <span className="replay-card__face replay-card__front">
            <img src={card.src} alt={card.label} draggable={false} />
          </span>
          <span className="replay-card__face replay-card__back" aria-hidden={!flipped}>
            <span className="replay-card__to">To. {toName}</span>
            <span className="replay-card__message">{gift.message}</span>
          </span>
        </button>
      </div>

      <button className="replay-card__hint" onClick={flip}>
        {flipped ? '눌러서 카드 확인하기' : '눌러서 메세지 확인하기'}
      </button>
      <button className="freq__btn freq__btn--center" onClick={onPlay}>
        재생하기
      </button>
      <div className="freq__indicator" />
    </div>
  )
}

/** 듣는 동안 바뀌는 문구 (기운별) */
const LISTEN_LINES: Record<EnergyType, string[]> = {
  water: ['연락 충동이 억제되는 중···', '마음의 온도를 낮추는 중···', '생각을 비워내는 중···', '차분한 물 기운이 스며드는 중···'],
  fire: ['몸에 열정이 차오르는 중···', '움직일 힘이 생기는 중···', '불의 기운이 타오르는 중···', '지친 마음에 불을 붙이는 중···'],
  wood: ['새로운 시작을 준비하는 중···', '합격의 싹이 자라는 중···', '나무 기운이 뻗어 나가는 중···', '마음에 새싹이 돋는 중···'],
  metal: ['지갑이 단단해지는 중···', '흩어진 마음을 정리하는 중···', '금 기운이 모이는 중···', '통장 잔고를 지키는 중···'],
  earth: ['마음이 차분히 가라앉는 중···', '기초를 단단히 다지는 중···', '흙 기운이 쌓이는 중···', '하나씩 쌓아 올리는 중···'],
}

/** 듣는 화면 그림은 물 기운(파랑)이라, 다른 기운은 색을 돌려서 써요 */
const LISTEN_HUE: Record<EnergyType, number> = { water: 0, fire: 125, wood: -40, metal: -115, earth: 170 }

/** 부처 몸의 빛 자리 (위에서부터 정수리 → 아래) — 그림 속 빛 위에 겹쳐서 웅웅 빛나게 */
const CHAKRAS: { y: number; size: number; color: string }[] = [
  { y: 354, size: 48, color: '#9ffcff' },
  { y: 396.5, size: 32, color: '#5ff3ff' },
  { y: 429, size: 32, color: '#5ff3ff' },
  { y: 470, size: 36, color: '#6dff9c' },
  { y: 509, size: 32, color: '#9ffff0' },
  { y: 542, size: 32, color: '#9ffcff' },
]

/** 주파수 길이(초). 끝까지 들으면 충전 완료 */
const DURATION = 40

/** 주파수 듣는 화면: 배경 빛이 일렁이고, 부처 몸의 빛이 웅웅 울려요 */
export function ReplayPlayer({ energy, onClose }: { energy: EnergyType; onClose: () => void }) {
  const [playing, setPlaying] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const done = elapsed >= DURATION
  const lines = LISTEN_LINES[energy]
  useTone(energy, playing)

  // 재생 중이면 0.1초마다 진행, 끝나면 멈춰요
  useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => {
      setElapsed((e) => {
        const next = Math.min(DURATION, e + 0.1)
        if (next >= DURATION) setPlaying(false)
        return next
      })
    }, 100)
    return () => window.clearInterval(t)
  }, [playing])

  // 문구는 4초마다 바꿔요
  useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => setLineIndex((i) => (i + 1) % lines.length), 4000)
    return () => window.clearInterval(t)
  }, [playing, lines.length])

  const skip = (sec: number) => setElapsed((e) => Math.max(0, Math.min(DURATION, e + sec)))
  const hue = LISTEN_HUE[energy]

  return (
    <div className={`freq lp${playing ? ' is-playing' : ''}`}>
      {/* 움직이는 그림 (기운 색으로 돌려요) */}
      <div className="lp__scene" aria-hidden style={hue ? { filter: `hue-rotate(${hue}deg)` } : undefined}>
        <img className="lp__bg" src={listenBg} alt="" />
        {/* 배경 빛 덩어리들이 천천히 풀리며 흘러가요 */}
        <div className="lp__flow">
          <i className="lp__blob lp__blob--a" />
          <i className="lp__blob lp__blob--b" />
          <i className="lp__blob lp__blob--c" />
          <i className="lp__blob lp__blob--d" />
        </div>
        {/* 부처 가운데서 빛 물결이 울리며 퍼져요 */}
        <div className="lp__ripples">
          <i />
          <i />
          <i />
        </div>
        <i className="lp__aura" />
        {CHAKRAS.map((c, i) => (
          <i
            key={c.y}
            className="lp__chakra"
            style={
              {
                top: c.y,
                width: c.size,
                height: c.size,
                '--c': c.color,
                animationDelay: `${-i * 0.22}s`,
              } as CSSProperties
            }
          />
        ))}
        {/* 아래에서 정수리로 빛이 올라가요 */}
        <i className="lp__rise" />
      </div>

      <StatusBar />
      <header className="freq__gnb">
        <button className="lp__round lp__round--close" onClick={onClose} aria-label="닫기">
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
        <button
          className={`lp__round lp__round--heart${liked ? ' is-on' : ''}`}
          onClick={() => {
            setLiked((l) => !l)
            hapticTick()
          }}
          aria-label="좋아요"
          aria-pressed={liked}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 20.7s-8.5-4.9-8.5-11.1A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 8.5 2.7c0 6.2-8.5 11.1-8.5 11.1Z" />
          </svg>
        </button>
      </header>
      <img className="lp__title" src={listenTitle} alt="Today's Lucky signal" />

      <p key={done ? 'done' : lineIndex} className="lp__status">
        {done ? '주파수 기운 충전 완료!' : lines[lineIndex]}
      </p>

      <button className="lp__skip lp__skip--back" onClick={() => skip(-5)} aria-label="5초 뒤로">
        <img src={iconBack5} alt="" />
      </button>
      <button
        className="lp__play"
        onClick={() => {
          if (done) setElapsed(0)
          setPlaying((p) => !p || done)
        }}
        aria-label={playing ? '일시정지' : '재생'}
      >
        {playing ? (
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
            <rect x="8" y="6" width="5" height="20" rx="1.5" fill="#000" />
            <rect x="19" y="6" width="5" height="20" rx="1.5" fill="#000" />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
            <path d="M10 6.5v19a1 1 0 0 0 1.5.86l15-9.5a1 1 0 0 0 0-1.72l-15-9.5A1 1 0 0 0 10 6.5Z" fill="#000" />
          </svg>
        )}
      </button>
      <button className="lp__skip lp__skip--fwd" onClick={() => skip(5)} aria-label="5초 앞으로">
        <img src={iconFwd5} alt="" />
      </button>
      <div className="freq__indicator lp__indicator" />
    </div>
  )
}
