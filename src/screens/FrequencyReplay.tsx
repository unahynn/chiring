import { useRef, useState, type CSSProperties } from 'react'
import StatusBar from '../components/StatusBar'
import { BackButton, CloseButton } from '../components/RoundButton'
import { signalCards, type SignalCard } from '../data/cards'
import { ENERGY_META, type EnergyType } from '../data/energy'
import { REPLAY_GIFTS } from '../data/replay'
import { hapticTick } from '../lib/haptic'
import { useTone } from '../lib/tone'
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
        {signalCards(energy).map((c, i) => (
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
}: {
  card: SignalCard
  energy: EnergyType
  toName: string
  onClose: () => void
}) {
  const gift = REPLAY_GIFTS[card.id] ?? { from: '친구', message: '' }
  const [flipped, setFlipped] = useState(false)
  const [playing, setPlaying] = useState(false)
  const liftRef = useRef<HTMLDivElement>(null)
  useTone(energy, playing)

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
        className={`replay-card__lift${playing ? ' is-playing' : ''}`}
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
      <button className="freq__btn freq__btn--center" onClick={() => setPlaying((p) => !p)}>
        {playing ? '일시정지' : '재생하기'}
      </button>
      <div className="freq__indicator" />
    </div>
  )
}
