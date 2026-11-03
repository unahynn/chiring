import { useRef, useState } from 'react'
import StatusBar from '../components/StatusBar'
import roomLeft from '../assets/friends/room-left.png'
import roomCenter from '../assets/friends/room-center.png'
import roomRight from '../assets/friends/room-right.png'
import moment1 from '../assets/friends/moment-1.png'
import moment2 from '../assets/friends/moment-2.png'
import moment3 from '../assets/friends/moment-3.png'
import avatarUnahynn from '../assets/friends/avatar-unahynn.png'
import avatarSsu from '../assets/friends/avatar-ssu.png'
import avatar3 from '../assets/friends/avatar-3.png'
import './FriendsRoom.css'

type Room = {
  id: string
  title: string
  members: string
  unread: number
  image: string
  /** 이미지에 이미 아래쪽 검정 그라데이션이 들어있으면 true */
  gradientBaked?: boolean
}

// 나중에 서버/DB에서 받아올 데이터. 지금은 더미 데이터예요.
const ROOMS: Room[] = [
  { id: 'r1', title: '액운 반사단', members: '민지님 외 3명', unread: 3, image: roomLeft },
  { id: 'r2', title: '행운 공구방 ✾', members: '수민님 외 2명', unread: 8, image: roomCenter, gradientBaked: true },
  { id: 'r3', title: 'LuckyClub', members: '권님 외 4명', unread: 2, image: roomRight },
]

type Moment = { id: string; name: string; avatar: string; image: string }

const MOMENTS: Moment[] = [
  { id: 'm1', name: 'Unahynn', avatar: avatarUnahynn, image: moment1 },
  { id: 'm2', name: 'SSU', avatar: avatarSsu, image: moment2 },
  { id: 'm3', name: 'Minhee', avatar: avatar3, image: moment3 },
]

/** 행운방(친구방) 화면: Lucky Talk 캐러셀 + Lucky Moments */
export default function FriendsRoom() {
  return (
    <div className="friends">
      <StatusBar />

      <header className="gnb">
        <button className="gnb__back" aria-label="뒤로가기">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M17.5 5.25 8.75 14l8.75 8.75" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="gnb__title">행운방</h1>
      </header>

      <section className="lucky-talk">
        <h2 className="display-title display-title--lg">Lucky Talk</h2>
        <p className="lucky-talk__desc">친구들과 운세를 보며 이야기를 나눠봐요</p>
        <RoomCarousel rooms={ROOMS} />
      </section>

      <section className="lucky-moments">
        <h2 className="display-title display-title--md">Lucky Moments</h2>
        <ul className="moments">
          {MOMENTS.map((m) => (
            <li key={m.id} className="moment">
              <img className="moment__photo" src={m.image} alt={`${m.name}의 행운 순간`} />
              <div className="moment__user">
                <img className="moment__avatar" src={m.avatar} alt="" />
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

  const go = (dir: 1 | -1) => setActive((a) => (a + dir + n) % n)

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
        {/* 뒤에 깔린 회색 카드 (장식) */}
        <div className="carousel__ghost carousel__ghost--left" />
        <div className="carousel__ghost carousel__ghost--right" />

        {rooms.map((room, i) => {
          // -1: 왼쪽, 0: 가운데, 1: 오른쪽
          const offset = ((i - active + n + 1) % n) - 1
          const pos = offset === 0 ? 'center' : offset < 0 ? 'left' : 'right'
          return (
            <button
              key={room.id}
              className={`room-card room-card--${pos}`}
              onClick={() => offset !== 0 && go(offset as 1 | -1)}
              aria-label={offset === 0 ? `${room.title} 입장하기` : `${room.title} 보기`}
            >
              <img className="room-card__img" src={room.image} alt="" draggable={false} />
              {!room.gradientBaked && <div className="room-card__gradient" />}
              <div className="room-card__dim" />
              <span className="room-card__badge">{room.unread}</span>
              <div className="room-card__info">
                <span className="room-card__members">{room.members}</span>
                <span className="room-card__title">{room.title}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="carousel__dots">
        {rooms.map((room, i) => (
          <button
            key={room.id}
            className={`dot${i === active ? ' is-active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`${i + 1}번째 방`}
          />
        ))}
      </div>
    </div>
  )
}
