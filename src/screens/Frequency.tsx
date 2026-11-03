import { useState, type CSSProperties } from 'react'
import StatusBar from '../components/StatusBar'
import meTitle from '../assets/frequency/title-me.png'
import friendTitle from '../assets/frequency/title-friend.png'
import cardGlow from '../assets/frequency/card-glow.png'
import avatarDayun from '../assets/frequency/avatar-dayun.jpg'
import avatarSsu from '../assets/frequency/avatar-ssu.jpg'
import avatarNahyun from '../assets/frequency/avatar-nahyun.jpg'
import avatarYujin from '../assets/frequency/avatar-yujin.jpg'
import avatarSumin from '../assets/friends/avatar-sumin.jpg'
import './Frequency.css'

export type FrequencyStep = 'home' | 'friend' | 'compose'

/** 아바타 원 안에 겹쳐 그릴 사진들 (피그마 크롭 그대로, 44px 원 기준) */
type Layer = { src: string; style?: CSSProperties }

type Friend = {
  id: string
  name: string
  /** 제목에 들어갈 부르는 이름: "수민이한테 어떤 기운을…" */
  callName: string
  need: string
  dot: string
  avatarBg: string
  layers: Layer[]
}

// 나중에 서버에서 받아올 친구 목록. 피그마 '주파수 친구 선택' 화면 그대로예요.
const FRIENDS: Friend[] = [
  { id: 'dayun', name: 'dayun', callName: '다윤이', need: '나무 (木)', dot: '#5effc7', avatarBg: '#d1d7de', layers: [{ src: avatarDayun }] },
  {
    id: 'sumin',
    name: 'sumin',
    callName: '수민이',
    need: '물 (水)',
    dot: '#13e2ff',
    avatarBg: '#d1d7de',
    layers: [{ src: avatarSumin, style: { left: -26, top: -17, width: 92, height: 92 } }],
  },
  { id: 'ssu', name: 'SSU', callName: 'SSU', need: '물 (水)', dot: '#13e2ff', avatarBg: '#d1d7de', layers: [{ src: avatarSsu }] },
  {
    id: 'nahyun',
    name: 'Nahyun',
    callName: '나현이',
    need: '금 (金)',
    dot: '#cefb6a',
    avatarBg: '#d1d7de',
    layers: [{ src: avatarSsu }, { src: avatarNahyun, style: { left: -1, top: -16, width: 44, height: 59 } }],
  },
  {
    id: 'yujin',
    name: 'yujin',
    callName: '유진이',
    need: '금 (金)',
    dot: '#cefb6a',
    avatarBg: '#d1d7de',
    layers: [{ src: avatarYujin, style: { left: 0, top: '-12.41%', width: '100%', height: '177.78%', objectFit: 'fill' } }],
  },
  { id: 'kwon', name: 'Kwon', callName: '권이', need: '화 (火)', dot: '#ffa1f7', avatarBg: '#8ec2ff', layers: [] },
]

type Props = {
  step: FrequencyStep
  onStepChange: (step: FrequencyStep) => void
}

/** 주파수 탭: 누구에게 → 어떤 친구에게 → 내용 입력 */
export default function Frequency({ step, onStepChange }: Props) {
  const [picked, setPicked] = useState<'me' | 'friend' | null>(null)
  const [friendId, setFriendId] = useState<string | null>(null)
  const friend = FRIENDS.find((f) => f.id === friendId)

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
                onClick={() => setFriendId(f.id)}
                aria-pressed={f.id === friendId}
              >
                <span className="friend-row__avatar" style={{ background: f.avatarBg }}>
                  {f.layers.map((l, i) => (
                    <img key={i} src={l.src} alt="" style={l.style} />
                  ))}
                </span>
                <span className="friend-row__name">{f.name}</span>
                <span className="friend-row__need">오늘 필요한 기운: {f.need}</span>
                <span className="friend-row__dot" style={{ background: f.dot }} />
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

  if (step === 'compose' && friend) {
    return (
      <div className="freq">
        <StatusBar />
        <header className="freq__gnb">
          <CloseButton onClick={() => onStepChange('friend')} />
        </header>
        <h1 className="freq__title freq__title--friend">
          {friend.callName}한테
          <br />
          어떤 기운을 보내줄까?
        </h1>
        <img className="compose__glow" src={cardGlow} alt="" />
        <button className="compose__card">
          <span>탭하여 내용을 입력해주세요</span>
        </button>
        <div className="freq__indicator" />
      </div>
    )
  }

  // step === 'home'
  const choose = (who: 'me' | 'friend') => {
    setPicked(who)
    // 박스 색이 바뀌는 걸 잠깐 보여주고 다음 화면으로
    window.setTimeout(() => {
      setPicked(null)
      onStepChange('friend')
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
