import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import StatusBar from '../components/StatusBar'
import meTitle from '../assets/frequency/title-me.png'
import friendTitle from '../assets/frequency/title-friend.png'
import cardGlow from '../assets/frequency/card-glow.png'
import luckySignalStroke from '../assets/frequency/lucky-signal-stroke.png'
import luckySignalFill from '../assets/frequency/lucky-signal-fill.png'
import avatarDayun from '../assets/frequency/avatar-dayun.jpg'
import avatarSsu from '../assets/frequency/avatar-ssu.jpg'
import avatarNahyun from '../assets/frequency/avatar-nahyun.jpg'
import avatarYujin from '../assets/frequency/avatar-yujin.jpg'
import avatarSumin from '../assets/friends/avatar-sumin.jpg'
import { ENERGY_META, energyCard, pickEnergy, suggestKeywords, type EnergyType } from '../data/energy'
import './Frequency.css'

export type FrequencyStep = 'home' | 'friend' | 'compose' | 'result' | 'loading' | 'cards' | 'message'

/** 아바타 원 안에 겹쳐 그릴 사진들 (피그마 크롭 그대로, 44px 원 기준) */
type Layer = { src: string; style?: CSSProperties }

type Friend = {
  id: string
  name: string
  /** 제목에 들어갈 부르는 이름: "수민이한테 어떤 기운을…" */
  callName: string
  /** 오늘 필요한 기운 → 점 색과 글자는 ENERGY_META에서 */
  need: EnergyType
  avatarBg: string
  layers: Layer[]
}

// 나중에 서버에서 받아올 친구 목록. 피그마 '주파수 친구 선택' 화면 그대로예요.
const FRIENDS: Friend[] = [
  { id: 'dayun', name: 'dayun', callName: '다윤이', need: 'wood', avatarBg: '#d1d7de', layers: [{ src: avatarDayun }] },
  {
    id: 'sumin',
    name: 'sumin',
    callName: '수민이',
    need: 'water',
    avatarBg: '#d1d7de',
    layers: [{ src: avatarSumin, style: { left: -26, top: -17, width: 92, height: 92 } }],
  },
  { id: 'hyeoni', name: 'hyeoni', callName: '다현이', need: 'fire', avatarBg: '#a40003', layers: [] },
  {
    id: 'nahyun',
    name: 'Nahyun',
    callName: '나현이',
    need: 'metal',
    avatarBg: '#d1d7de',
    layers: [{ src: avatarSsu }, { src: avatarNahyun, style: { left: -1, top: -16, width: 44, height: 59 } }],
  },
  {
    id: 'yujin',
    name: 'yujin',
    callName: '유진이',
    need: 'metal',
    avatarBg: '#d1d7de',
    layers: [{ src: avatarYujin, style: { left: 0, top: '-12.41%', width: '100%', height: '177.78%', objectFit: 'fill' } }],
  },
  { id: 'kwon', name: 'Kwon', callName: '권이', need: 'earth', avatarBg: '#8ec2ff', layers: [] },
  { id: 'ssu', name: 'SSU', callName: '수진이', need: 'earth', avatarBg: '#d1d7de', layers: [{ src: avatarSsu }] },
]

/** 주파수 카드 3종 (피그마 '주파수 카드 선택 옵션 1·2·3') */
// 카드 그림: assets/frequency/card-{기운}-{1·2·3}.webp
const CARD_IMAGES = import.meta.glob<string>('../assets/frequency/card-*.webp', { eager: true, import: 'default' })
const cardSrc = (energy: EnergyType, n: number) => CARD_IMAGES[`../assets/frequency/card-${energy}-${n}.webp`]

/** 기운별 주파수 카드 3종 (피그마 '주파수 카드 선택 옵션 1·2·3') */
const CARD_LABELS: Record<EnergyType, [string, string, string]> = {
  water: ['미련 폭파 기운', '연락 말고 그냥 자 주파수', 'BYE BYE EX'],
  wood: ['새출발 풀충전', 'Let It Bloom!', '합격 싹 틔우는 기운'],
  metal: ['적게 일하고 많이 받는 기운', '지갑닫는 주파수', 'Saving mode ON'],
  fire: ['Just Move! Move! Move!', '가만히 있어도 살 10kg 빠지는 주파수', '10000 칼로리 태워주는 기운'],
  earth: ['일단 진정 기운', 'Build It Up!', '차곡차곡 쌓아올리기'],
}

const signalCards = (energy: EnergyType) =>
  CARD_LABELS[energy].map((label, i) => ({ id: `${energy}-${i + 1}`, src: cardSrc(energy, i + 1), label }))

/** 기운 생성중 화면의 움직이는 그라데이션 색 (기운마다 다르게) */
const LOADING_COLORS: Record<EnergyType, [string, string, string]> = {
  water: ['#6a2bd9', '#ff39c7', '#13e2ff'],
  fire: ['#b0127a', '#ff39c7', '#ffa1f7'],
  wood: ['#0f6b52', '#5effc7', '#aaf4ff'],
  metal: ['#4f6410', '#cefb6a', '#f4ffc2'],
  earth: ['#7a3412', '#ff8a3d', '#ffc89a'],
}

type Props = {
  step: FrequencyStep
  onStepChange: (step: FrequencyStep) => void
}

/** 주파수 탭: 누구에게 → 어떤 친구에게 → 내용 입력 */
export default function Frequency({ step, onStepChange }: Props) {
  const [picked, setPicked] = useState<'me' | 'friend' | null>(null)
  const [friendId, setFriendId] = useState<string | null>(null)
  const friend = FRIENDS.find((f) => f.id === friendId)
  /** 누구를 위한 기운인지: 나(Me) 또는 고른 친구(Friend) */
  const [mode, setMode] = useState<'me' | 'friend'>('friend')
  const isMe = mode === 'me'
  /** 화면 문구에 들어갈 대상. 나를 위한 기운이면 '나' */
  const target = isMe ? { callName: '나', need: undefined } : friend

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
  const [sent, setSent] = useState(false)
  const swipeX = useRef<number | null>(null)
  const swiped = useRef(false)
  const energy = pickEnergy(text, picks, target?.need)

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
        <h1 className="freq__title freq__title--friend">
          어떤 친구에게
          <br />
          <em>기운</em>을 보내줄까?
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
    // 따옴표가 없으면 앞뒤로 붙여서 디자인처럼 “ ” 안에 보여줘요
    const t = text.trim()
    const display = `${/^[“"]/.test(t) ? '' : '“'}${t}${/[”"]$/.test(t) ? '' : '”'}`
    return (
      <div className="freq">
        <StatusBar />
        <header className="freq__gnb">
          <CloseButton onClick={() => onStepChange('home')} />
        </header>
        <h1 className="freq__title freq__title--friend">
          {isMe ? (
            <>
              지금 나에게는
              <br />
              어떤 기운이 필요할까?
            </>
          ) : (
            <>
              {target.callName}한테
              <br />
              어떤 기운을 보내줄까?
            </>
          )}
        </h1>
        <img className="compose__glow" src={cardGlow} alt="" />
        <div className="compose__shine" aria-hidden />
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
            <p className="compose__text">{display}</p>
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
    const card = energyCard(energy, target.callName, text)
    const bg = `url("data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg viewBox='0 0 306 401' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%' height='100%' fill='url(#g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(25.2 31.254 -23.85 18.576 54 105.16)'>${card.stops
        .map((c, i) => `<stop stop-color='${c}' offset='${i / 4}'/>`)
        .join('')}</radialGradient></defs></svg>`,
    )}")`
    return (
      <div className="freq">
        <StatusBar />
        <header className="freq__gnb">
          <CloseButton onClick={() => onStepChange('home')} />
        </header>
        <h1 className="freq__title freq__title--friend">
          지금 {isMe ? '나' : target.callName}에게
          <br />
          <em style={{ color: card.color }}>필요한 기운</em>은...
        </h1>
        <div className="energy-card" style={{ backgroundImage: bg, ['--glow' as string]: card.color }}>
          <span className="energy-card__light" aria-hidden />
          <p className="energy-card__sub">{card.subtitle}</p>
          <p className="energy-card__title">{card.title}</p>
          <p className="energy-card__desc">{card.desc}</p>
          {/* 키워드는 2개씩 두 줄 */}
          <div className="energy-card__tags">
            {[card.tags.slice(0, 2), card.tags.slice(2, 4)].map((row, i) => (
              <div key={i} className="energy-card__tag-row">
                {row.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="freq__actions">
          <button className="freq__btn freq__btn--prev" onClick={() => onStepChange('compose')}>
            이전
          </button>
          <button className="freq__btn freq__btn--next" onClick={() => onStepChange('loading')}>
            주파수 만들기
          </button>
        </div>
        <div className="freq__indicator" />
      </div>
    )
  }

  if (step === 'loading' && target) {
    const [c1, c2, c3] = LOADING_COLORS[energy]
    return (
      <div className="freq loading" style={{ ['--c1' as string]: c1, ['--c2' as string]: c2, ['--c3' as string]: c3 }}>
        <div className="loading__blob loading__blob--a" />
        <div className="loading__blob loading__blob--b" />
        <div className="loading__blob loading__blob--c" />
        <StatusBar />
        <h1 className="loading__title">
          {target.callName}를 위한
          <br />
          기운 생성중<span className="loading__dots"><i>·</i><i>·</i><i>·</i></span>
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
        {/* 글자 테두리(검정)는 그림 그대로, 글자 색만 기운 색으로 칠해요 */}
        <div className="signal__title" role="img" aria-label="Lucky signal">
          <img src={luckySignalStroke} alt="" />
          <span
            className="signal__title-fill"
            style={{
              background: ENERGY_META[energy].dot,
              WebkitMaskImage: `url(${luckySignalFill})`,
              maskImage: `url(${luckySignalFill})`,
            }}
          />
        </div>
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
      <div className="freq">
        <StatusBar />
        <header className="freq__gnb">
          <CloseButton onClick={() => onStepChange('cards')} />
          <span className="freq__gnb-title freq__gnb-title--white">{isMe ? '나의 주파수' : '주파수 선물하기'}</span>
        </header>
        <img className="gift__card" src={card.src} alt={card.label} />
        <textarea
          id="gift-message"
          className="gift__message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isMe ? '나에게 해주고 싶은 말을 남겨줘' : `${target.callName}에게 한마디 남겨줘`}
          maxLength={60}
          rows={2}
        />
        <button
          className="freq__btn freq__btn--wide"
          disabled={!message.trim()}
          onClick={() => setSent(true)}
        >
          {isMe ? '기운 채우기' : '기운 보내기'}
        </button>
        {sent && (
          <div className="gift__sent" role="dialog" aria-label="보내기 완료">
            <div className="gift__sent-box">
              <img src={card.src} alt="" />
              <p>
                {isMe ? '나에게' : `${target.callName}에게`}
                <br />
                {isMe ? '기운을 채웠어요!' : '기운을 보냈어요!'}
              </p>
              <button
                className="freq__btn freq__btn--wide gift__sent-btn"
                onClick={() => {
                  setSent(false)
                  setMessage('')
                  setCardIndex(0)
                  resetCompose()
                  setFriendId(null)
                  onStepChange('home')
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}
        <div className="freq__indicator" />
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
    // 박스 색이 바뀌는 걸 잠깐 보여주고 다음 화면으로
    window.setTimeout(() => {
      setPicked(null)
      // 나를 위한 기운은 친구 선택 없이 바로 내용 입력으로
      onStepChange(who === 'me' ? 'compose' : 'friend')
    }, 380)
  }

  return (
    <div className="freq freq--home">
      <StatusBar />
      <header className="freq__gnb">
        <span className="freq__gnb-title">기운 충전</span>
      </header>
      <h1 className="freq__title">
        누구에게
        <br />
        <em>기운</em>을 보내줄까?
      </h1>
      <p className="freq__desc">
        나를 위해 채워도 좋고
        <br />
        친구를 위해 만들어 선물할 수도 있어.
      </p>

      <div className="who">
        <button className={`who__card${picked === 'me' ? ' is-picked' : ''}`} onClick={() => choose('me')}>
          <img className="who__title" src={meTitle} alt="Me" width={50.57} height={33.86} />
          <span className="who__desc">
            나를 위한
            <br />내 기운 채우기
          </span>
          <ArrowCircle />
        </button>
        <button className={`who__card${picked === 'friend' ? ' is-picked' : ''}`} onClick={() => choose('friend')}>
          <img className="who__title" src={friendTitle} alt="Friend" width={96.13} height={33.86} />
          <span className="who__desc">
            친구에게
            <br />
            기운 보내기
          </span>
          <ArrowCircle />
        </button>
      </div>
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

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="freq__close" onClick={onClick} aria-label="닫기">
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
