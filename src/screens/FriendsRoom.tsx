import { useRef, useState } from 'react'
import StatusBar from '../components/StatusBar'
import { CaretLeftIcon, CloverIcon } from '../components/icons'
import luckyTalkTitle from '../assets/svg/lucky-talk.svg'
import luckyMomentsTitle from '../assets/svg/lucky-moments.svg'
import roomLeft from '../assets/friends/room-left.jpg'
import roomCenter from '../assets/friends/room-center.jpg'
import roomRight from '../assets/friends/room-right.jpg'
import room4 from '../assets/friends/room-4.jpg'
import room5 from '../assets/friends/room-5.jpg'
import moment1 from '../assets/friends/moment-1.jpg'
import moment2 from '../assets/friends/moment-2.jpg'
import moment3 from '../assets/friends/moment-3.jpg'
import avatarUnahynn from '../assets/friends/avatar-unahynn.jpg'
import avatarSsu from '../assets/friends/avatar-ssu.jpg'
import avatar3 from '../assets/friends/avatar-3.jpg'
import './FriendsRoom.css'

type Room = {
  id: string
  title: string
  /** 제목 옆 클로버 아이콘 */
  clover?: boolean
  members: string
  unread: number
  image: string
  /** 이미지에 이미 아래쪽 검정 그라데이션이 들어있으면 true */
  gradientBaked?: boolean
}

// 나중에 서버/DB에서 받아올 데이터. 지금은 더미 데이터예요.
// 방이 몇 개든 가운데 기준으로 양옆 2개씩(총 5장)만 보이고, 나머지는 뒤에 숨어 있다가 돌아와요.
// r4의 방 이름, r4·r5의 인원은 디자인에 없어서 임시로 넣은 값이에요.
const ROOMS: Room[] = [
  { id: 'r1', title: '액운 반사단', members: '민지님 외 3명', unread: 3, image: roomLeft },
  { id: 'r2', title: '행운 공구방', clover: true, members: '수민님 외 2명', unread: 8, image: roomCenter, gradientBaked: true },
  { id: 'r3', title: 'LuckyClub', members: '권님 외 4명', unread: 2, image: roomRight },
  { id: 'r4', title: '마음 수련방', members: '지수님 외 5명', unread: 1, image: room5 },
  { id: 'r5', title: '공주모임', members: '하늘님 외 1명', unread: 4, image: room4 },
]

/** 가운데(active) 기준으로 몇 칸 떨어져 있는지: -2, -1, 0, 1, 2 … (빙글빙글 순환) */
function getOffset(i: number, active: number, n: number) {
  let d = (((i - active) % n) + n) % n
  if (d > n / 2) d -= n
  return d
}

function positionClass(offset: number) {
  if (offset === 0) return 'center'
  if (Math.abs(offset) === 1) return offset < 0 ? 'left' : 'right'
  if (Math.abs(offset) === 2) return offset < 0 ? 'far-left' : 'far-right'
  return 'hidden'
}

type Moment = {
  id: string
  name: string
  avatar: string
  /** 아바타 원본 이미지가 원 안에서 어디에 보일지 (피그마 크롭 그대로) */
  avatarStyle?: React.CSSProperties
  image: string
}

const MOMENTS: Moment[] = [
  {
    id: 'm1',
    name: 'Unahynn',
    avatar: avatarUnahynn,
    avatarStyle: { width: 75, height: 42, left: -44, top: -1, maxWidth: 'none' },
    image: moment1,
  },
  {
    id: 'm2',
    name: 'SSU',
    avatar: avatarSsu,
    avatarStyle: { width: '107.03%', height: '112.5%', left: '-3.05%', top: '-9.66%', maxWidth: 'none' },
    image: moment2,
  },
  { id: 'm3', name: 'Minhee', avatar: avatar3, image: moment3 },
]

/** 행운방(친구방) 화면: Lucky Talk 캐러셀 + Lucky Moments */
export default function FriendsRoom() {
  return (
    <div className="friends">
      <StatusBar />

      <header className="gnb">
        <button className="gnb__back" aria-label="뒤로가기">
          <CaretLeftIcon />
        </button>
        <h1 className="gnb__title">행운방</h1>
      </header>

      <section className="lucky-talk">
        <h2 className="title-img">
          <img src={luckyTalkTitle} alt="Lucky Talk" width={135.35} height={36.16} />
        </h2>
        <p className="lucky-talk__desc">친구들과 운세를 보며 이야기를 나눠봐요</p>
        <RoomCarousel rooms={ROOMS} />
      </section>

      <section className="lucky-moments">
        <h2 className="title-img">
          <img src={luckyMomentsTitle} alt="Lucky Moments" width={190.1} height={32.54} />
        </h2>
        <ul className="moments">
          {MOMENTS.map((m) => (
            <li key={m.id} className="moment">
              <img className="moment__photo" src={m.image} alt={`${m.name}의 행운 순간`} />
              <div className="moment__shade" />
              <div className="moment__user">
                <span className="moment__avatar">
                  <img src={m.avatar} alt="" style={m.avatarStyle} />
                </span>
                <span className="moment__name">{m.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function RoomCarousel({ rooms }: { rooms: Room[] }) {
  const [active, setActive] = useState(1)
  const startX = useRef<number | null>(null)
  const n = rooms.length

  const go = (step: number) => setActive((a) => (((a + step) % n) + n) % n)

  return (
    <div className="carousel">
      <div
        className="carousel__stage"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return
          const dx = e.clientX - startX.current
          startX.current = null
          if (dx > 40) go(-1)
          else if (dx < -40) go(1)
        }}
      >
        {rooms.map((room, i) => {
          const offset = getOffset(i, active, n)
          const pos = positionClass(offset)
          return (
            <button
              key={room.id}
              className={`room-card room-card--${pos}`}
              onClick={() => offset !== 0 && go(offset)}
              tabIndex={pos === 'hidden' ? -1 : 0}
              aria-hidden={pos === 'hidden' ? true : undefined}
              aria-label={offset === 0 ? `${room.title} 입장하기` : `${room.title} 보기`}
            >
              <img className="room-card__img" src={room.image} alt="" draggable={false} />
              {!room.gradientBaked && <div className="room-card__gradient" />}
              <div className="room-card__dim" />
              <span className="room-card__badge">{room.unread}</span>
              <div className="room-card__info">
                <span className="room-card__members">{room.members}</span>
                <span className="room-card__title">
                  {room.title}
                  {room.clover && <CloverIcon />}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
