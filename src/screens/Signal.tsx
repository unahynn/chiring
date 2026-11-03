import { useEffect, useRef, useState } from 'react'
import StatusBar from '../components/StatusBar'
import { CaretLeftIcon, CloverIcon } from '../components/icons'
import chatCard from '../assets/signal/chat-card.webp'
import avatarJiwon from '../assets/signal/avatar-jiwon.png'
import frontCard from '../assets/signal/front-card.webp'
import titleTodays from '../assets/signal/title-todays.png'
import titleTodaysLg from '../assets/signal/title-todays-lg.png'
import listenBlob from '../assets/signal/listen-blob.webp'
import iconHeart from '../assets/signal/icon-heart.png'
import iconShare from '../assets/signal/icon-share.png'
import iconBack5 from '../assets/signal/icon-back5.png'
import iconFwd5 from '../assets/signal/icon-fwd5.png'
import completeHero from '../assets/signal/complete-hero.webp'
import completeTitle from '../assets/signal/complete-title.png'
import gaugeWave from '../assets/signal/gauge-wave.png'
import gaugeBubble from '../assets/signal/gauge-bubble.png'
import '@fontsource/oswald/600.css'
import './Signal.css'

type Screen = 'chat' | 'card' | 'listen' | 'complete'

/** 받은 주파수 (지금은 Jiwon → Sumin 예시 하나) */
const SIGNAL = {
  from: 'Jiwon',
  to: 'Sumin',
  message: '저번처럼\n후회하게 될기니..\n얼른 자!!!!',
}

/** 듣는 동안 가끔 바뀌는 문구 (물 기운 · 연락 말고 그냥 자 주파수) */
const LISTEN_LINES = [
  '연락 충동이 억제되는 중···',
  '새로운 인연의 기운이 들어오는 중···',
  '마음의 온도를 낮추는 중···',
  '생각을 비워내는 중···',
  '차분한 물 기운이 스며드는 중···',
  '미련이 씻겨 내려가는 중···',
]

/** 주파수 길이(초). 끝까지 들으면 100% */
const DURATION = 40

type ChatLine = { id: string; mine: boolean; text: string }

type Props = {
  roomTitle: string
  onExit: () => void
}

/** 채팅방 → 받은 주파수 카드(앞/뒤) → 주파수 듣기 → 듣기 완료 */
export default function Signal({ roomTitle, onExit }: Props) {
  const [screen, setScreen] = useState<Screen>('chat')
  const [flipped, setFlipped] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [lineIndex, setLineIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [chat, setChat] = useState<ChatLine[]>([
    { id: 'a', mine: true, text: '헐 뭐야 ㅠㅠㅠㅠㅠㅠ??? 감동...' },
    { id: 'b', mine: true, text: '당장 듣고온다' },
  ])
  const [draft, setDraft] = useState('')
  const chatEnd = useRef<HTMLDivElement>(null)
  const percent = Math.min(100, Math.round((elapsed / DURATION) * 100))
  const done = percent >= 100

  const showToast = (t: string) => {
    setToast(t)
    window.setTimeout(() => setToast(null), 1600)
  }

  // 재생 중이면 0.1초마다 진행
  useEffect(() => {
    if (screen !== 'listen' || !playing) return
    const t = window.setInterval(() => {
      setElapsed((e) => {
        const next = Math.min(DURATION, e + 0.1)
        if (next >= DURATION) setPlaying(false)
        return next
      })
    }, 100)
    return () => window.clearInterval(t)
  }, [screen, playing])

  // 문구는 4초마다 바꿔요
  useEffect(() => {
    if (screen !== 'listen' || !playing) return
    const t = window.setInterval(() => setLineIndex((i) => (i + 1) % LISTEN_LINES.length), 4000)
    return () => window.clearInterval(t)
  }, [screen, playing])

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: 'end' })
  }, [chat.length])

  if (screen === 'chat') {
    return (
      <div className="chat">
        <StatusBar tone="dark" />
        <header className="chat__gnb">
          <button className="chat__back" aria-label="뒤로가기" onClick={onExit}>
            <CaretLeftIcon />
          </button>
          <h1 className="chat__title">
            {roomTitle}
            {roomTitle === '행운 공구방' && <CloverIcon size={20} />}
            <span className="chat__count">3</span>
          </h1>
        </header>

        <div className="chat__scroll">
          <div className="chat__date">Oct. 20 (화)</div>
          <div className="chat__from">
            <img className="chat__avatar" src={avatarJiwon} alt="" />
            <div className="chat__from-body">
              <span className="chat__name">{SIGNAL.from}</span>
              <p className="bubble bubble--dark">주파수와 메세지를 보냈어요 💌</p>
              <button className="chat__signal" onClick={() => setScreen('card')} aria-label="받은 주파수 봉인해제">
                <img src={chatCard} alt="" />
              </button>
              <p className="bubble bubble--dark">이거 들으면서 오늘은 그냥 자!!!!!!!!!!!</p>
            </div>
          </div>
          {chat.map((c) => (
            <p key={c.id} className={`bubble ${c.mine ? 'bubble--mine' : 'bubble--dark'}`}>
              {c.text}
            </p>
          ))}
          <div ref={chatEnd} />
        </div>

        <form
          className="chat__input"
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            setChat((prev) => [...prev, { id: String(Date.now()), mine: true, text: draft.trim() }])
            setDraft('')
          }}
        >
          <button type="button" className="chat__plus" aria-label="더하기">
            +
          </button>
          <div className="chat__field">
            <input id="chat-message" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="메시지를 남겨보세요" autoComplete="off" />
            <button type="submit" className="chat__send" aria-label="보내기">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden>
                <path d="M8 16.5V1.5M8 1.5 1.5 8M8 1.5 14.5 8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </form>
        <div className="chat__indicator" />
      </div>
    )
  }

  if (screen === 'card') {
    return (
      <div className={`sig sig--card${flipped ? ' is-flipped' : ''}`}>
        <div className="sig__bottom-glow" aria-hidden />
        <StatusBar />
        <header className="sig__gnb">
          <CloseBtn onClick={() => setScreen('chat')} />
        </header>
        <img className="sig__title" src={titleTodays} alt="Today's Lucky signal" />

        <button className="flip" onClick={() => setFlipped((f) => !f)} aria-label={flipped ? '카드 앞면 보기' : '메시지 보기'}>
          <span className="flip__inner">
            <span className="flip__face flip__front">
              <img className="flip__front-img" src={frontCard} alt="연락 말고 그냥 자 주파수" />
              <span className="flip__sheen" aria-hidden />
            </span>
            <span className="flip__face flip__back">
              <span className="flip__sheen flip__sheen--back" aria-hidden />
              <span className="flip__to">To. {SIGNAL.to}</span>
              <span className="flip__msg">{SIGNAL.message}</span>
              <span className="flip__from">From. {SIGNAL.from}</span>
            </span>
          </span>
        </button>
        <p className="sig__hint">{flipped ? '눌러서 카드 다시 보기' : '눌러서 메시지 확인하기'}</p>

        <button
          className="sig__btn"
          onClick={() => {
            setScreen('listen')
            setPlaying(true)
          }}
        >
          재생하기
        </button>
        <div className="sig__indicator" />
      </div>
    )
  }

  if (screen === 'listen') {
    const skip = (sec: number) => setElapsed((e) => Math.max(0, Math.min(DURATION, e + sec)))
    return (
      <div className={`sig sig--listen${playing ? ' is-playing' : ''}`}>
        <div className="wave" aria-hidden>
          <img className="wave__ring wave__ring--1" src={listenBlob} alt="" />
          <img className="wave__ring wave__ring--2" src={listenBlob} alt="" />
          <img className="wave__ring wave__ring--3" src={listenBlob} alt="" />
          <img className="wave__core" src={listenBlob} alt="" />
        </div>
        <StatusBar />
        <header className="sig__gnb">
          <CloseBtn
            onClick={() => {
              setPlaying(false)
              setScreen('complete')
            }}
          />
          <button className={`sig__icon sig__icon--heart${liked ? ' is-on' : ''}`} onClick={() => setLiked((l) => !l)} aria-label="좋아요">
            <img src={iconHeart} alt="" />
          </button>
          <button
            className="sig__icon sig__icon--share"
            aria-label="공유하기"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href)
                showToast('링크를 복사했어요')
              } catch {
                showToast('공유는 곧 준비할게요')
              }
            }}
          >
            <img src={iconShare} alt="" />
          </button>
        </header>
        <img className="sig__title sig__title--lg" src={titleTodaysLg} alt="Today's Lucky signal" />

        <p className="listen__percent">
          {percent}
          <small> %</small>
        </p>
        <p key={done ? 'done' : lineIndex} className="listen__line">
          {done ? '주파수 기운 충전 완료!' : LISTEN_LINES[lineIndex]}
        </p>

        <button className="listen__skip listen__skip--back" onClick={() => skip(-5)} aria-label="5초 뒤로">
          <img src={iconBack5} alt="" />
        </button>
        <button
          className="listen__play"
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
        <button className="listen__skip listen__skip--fwd" onClick={() => skip(5)} aria-label="5초 앞으로">
          <img src={iconFwd5} alt="" />
        </button>
        <div className="sig__indicator" />
        {toast && <div className="sig__toast">{toast}</div>}
      </div>
    )
  }

  // 듣기 완료
  const calm = Math.round(percent * 0.97)
  const newLove = Math.round(percent * 0.8)
  return (
    <div className="done">
      <img className="done__hero" src={completeHero} alt="" />
      <div className="done__sheet" aria-hidden />
      <StatusBar tone="dark" />
      <img className="done__title" src={completeTitle} alt="연락 말고 그냥 자 주파수" />

      <div className="gauge">
        <p className="gauge__label">주파수 기운 충전</p>
        <p className="gauge__value">
          {percent}
          <small> %</small>
        </p>
        <img className="gauge__wave" src={gaugeWave} alt="" />
        <img className="gauge__bubble" src={gaugeBubble} alt="" />
      </div>

      <div className="stat stat--left">
        <p className="stat__label">연락충동 억제</p>
        <p className="stat__value">
          <span className="stat__plus">+</span>
          {calm}%
        </p>
      </div>
      <div className="stat stat--right">
        <p className="stat__label">새로운 인연의 기운</p>
        <p className="stat__value">
          <span className="stat__plus">+</span>
          {newLove}%
        </p>
      </div>

      <button
        className="done__btn"
        onClick={() => {
          showToast('행운 Charm에 추가했어요')
          window.setTimeout(() => {
            setScreen('chat')
            setFlipped(false)
          }, 1100)
        }}
      >
        행운 Charm에 추가하기
      </button>
      <div className="chat__indicator" />
      {toast && <div className="sig__toast sig__toast--light">{toast}</div>}
    </div>
  )
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="sig__close" onClick={onClick} aria-label="닫기">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M0.922852 0.923828L14.9229 14.9238M14.9229 0.923828L0.922852 14.9238" stroke="white" strokeWidth="1.84593" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
