import { useEffect, useRef, useState } from 'react'
import StatusBar from '../components/StatusBar'
import Avatar from '../components/Avatar'
import { CaretLeftIcon } from '../components/icons'
import { ME, type Moment, type PlacedSticker, type StickerType } from '../data/moments'
import fireImg from '../assets/stickers/fire.png'
import waterImg from '../assets/stickers/water.png'
import diamondImg from '../assets/stickers/diamond.png'
import leafImg from '../assets/stickers/leaf.png'
import sproutImg from '../assets/stickers/sprout.png'
import gemA from '../assets/stickers/gem-a.png'
import gemB from '../assets/stickers/gem-b.png'
import leafSmallA from '../assets/stickers/leaf-small-a.png'
import leafSmallB from '../assets/stickers/leaf-small-b.png'
import './Story.css'

/** 피그마에서 4배로 내보낸 픽셀 아이콘 → 화면에서는 1/4 크기로 써요 */
const STICKER_ART: Record<StickerType, { src: string; w: number; h: number }> = {
  fire: { src: fireImg, w: 57, h: 66 },
  water: { src: waterImg, w: 39.5, h: 39.5 },
  diamond: { src: diamondImg, w: 48.5, h: 41.75 },
  leaf: { src: leafImg, w: 35, h: 48.25 },
  sprout: { src: sproutImg, w: 43.75, h: 30.75 },
}

/** 하단 기운 버튼 5개: 피그마 위치 그대로 (화면 402×874 기준, cx·cy는 원의 가운데) */
const BUTTONS: { type: StickerType; label: string; cx: number; cy: number; size: number; iconScale: number }[] = [
  { type: 'fire', label: '불의 기운', cx: 31, cy: 715, size: 72, iconScale: 0.66 },
  { type: 'water', label: '물의 기운', cx: 108.8, cy: 678.5, size: 81.6, iconScale: 1 },
  { type: 'diamond', label: '금의 기운', cx: 200.5, cy: 667.2, size: 88, iconScale: 1 },
  { type: 'leaf', label: '나무의 기운', cx: 293.8, cy: 678.9, size: 81.6, iconScale: 1 },
  { type: 'sprout', label: '흙의 기운', cx: 371, cy: 715.2, size: 72, iconScale: 1 },
]

/** 사진 영역 크기 */
const PHOTO_W = 362
const PHOTO_H = 442

/** 붙인 스티커를 기억해 둬서, 뒤로 갔다가 다시 들어와도 그대로 있어요 (새로고침하면 초기화) */
const savedStickers = new Map<string, PlacedSticker[]>()

type Props = {
  moment: Moment
  onBack: () => void
}

/** 친구 스토리 화면: 사진 + 기운 스티커 붙이기 + 메시지 남기기 */
export default function Story({ moment, onBack }: Props) {
  const [stickers, setStickers] = useState<PlacedSticker[]>(() => savedStickers.get(moment.id) ?? moment.stickers)
  useEffect(() => {
    savedStickers.set(moment.id, stickers)
  }, [moment.id, stickers])
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const showToast = (text: string) => {
    setToast(text)
    window.setTimeout(() => setToast(null), 1800)
  }

  const addSticker = (type: StickerType) => {
    // 캡션과 겹치지 않는 사진 안쪽 아무 곳에 붙여요. 붙인 뒤에는 끌어서 옮길 수 있어요.
    const x = 60 + Math.random() * (PHOTO_W - 120)
    const y = 130 + Math.random() * (PHOTO_H - 230)
    const id = `me-${Date.now()}`
    setStickers((prev) => [...prev, { id, type, from: ME, x, y }])
    setJustAdded(id)
  }

  const toPhotoXY = (clientX: number, clientY: number) => {
    const r = photoRef.current!.getBoundingClientRect()
    return { x: clientX - r.left, y: clientY - r.top }
  }

  const sendMessage = () => {
    if (!message.trim()) return
    setMessage('')
    showToast(`${moment.name}님에게 메시지를 남겼어요`)
  }

  return (
    <div className="story">
      <StatusBar />
      <button className="story__back" aria-label="뒤로가기" onClick={onBack}>
        <CaretLeftIcon />
      </button>

      <div
        className="story__photo"
        ref={photoRef}
        onPointerMove={(e) => {
          if (!drag.current) return
          const { x, y } = toPhotoXY(e.clientX, e.clientY)
          const nx = Math.min(PHOTO_W - 20, Math.max(20, x - drag.current.dx))
          const ny = Math.min(PHOTO_H - 20, Math.max(20, y - drag.current.dy))
          const id = drag.current.id
          setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, x: nx, y: ny } : s)))
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <img className="story__img" src={moment.photo} alt={`${moment.name}의 스토리`} draggable={false} />

        {moment.caption && <div className="story__caption">{moment.caption}</div>}

        {stickers.map((s) => (
          <div
            key={s.id}
            className={`sticker${s.id === justAdded ? ' is-new' : ''}${s.from === ME ? ' is-mine' : ''}`}
            style={{ left: s.x, top: s.y, ['--label-offset' as string]: `${artHeight(s.type) / 2 + 8}px` }}
            onPointerDown={(e) => {
              if (s.from !== ME) return // 내가 붙인 스티커만 옮길 수 있어요
              e.preventDefault()
              ;(e.currentTarget.parentElement as HTMLElement).setPointerCapture(e.pointerId)
              const { x, y } = toPhotoXY(e.clientX, e.clientY)
              drag.current = { id: s.id, dx: x - s.x, dy: y - s.y }
            }}
          >
            <StickerArt type={s.type} />
            <span className="sticker__label">{s.from}</span>
          </div>
        ))}
      </div>

      <div className="story__author">
        <Avatar src={moment.avatar} crop={moment.avatarCrop} size={35} className="story__avatar" />
        <span className="story__name">{moment.name}</span>
      </div>

      {BUTTONS.map((b) => {
        const art = STICKER_ART[b.type]
        return (
          <button
            key={b.type}
            className="energy-btn"
            style={{ left: b.cx - b.size / 2, top: b.cy - b.size / 2, width: b.size, height: b.size }}
            onClick={() => addSticker(b.type)}
            aria-label={`${b.label} 보내기`}
          >
            <img src={art.src} alt="" width={art.w * b.iconScale} height={art.h * b.iconScale} draggable={false} />
          </button>
        )
      })}
      <p className="story__hint">눌러서 기운 보내기</p>

      <form
        className="story__message"
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage()
        }}
      >
        <input
          id="story-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메세지 남기기"
          autoComplete="off"
        />
        <button type="submit" className="story__send" aria-label="보내기">
          <svg width="30" height="31" viewBox="0 0 30 31" fill="none" aria-hidden>
            <path
              d="M23.9478 14.1808C23.8616 14.2671 23.7592 14.3356 23.6466 14.3823C23.5339 14.429 23.4131 14.453 23.2911 14.453C23.1692 14.453 23.0484 14.429 22.9357 14.3823C22.823 14.3356 22.7207 14.2671 22.6345 14.1808L15.8661 7.4113L15.8661 25.5898C15.8661 25.8359 15.7684 26.072 15.5943 26.2461C15.4202 26.4201 15.1842 26.5179 14.938 26.5179C14.6919 26.5179 14.4558 26.4201 14.2817 26.2461C14.1077 26.072 14.0099 25.8359 14.0099 25.5898L14.0099 7.4113L7.24154 14.1808C7.06739 14.355 6.83118 14.4528 6.58489 14.4528C6.3386 14.4528 6.1024 14.355 5.92824 14.1808C5.75409 14.0067 5.65625 13.7705 5.65625 13.5242C5.65625 13.2779 5.75409 13.0417 5.92824 12.8675L14.2814 4.51439C14.3676 4.4281 14.4699 4.35964 14.5826 4.31294C14.6953 4.26623 14.816 4.24219 14.938 4.24219C15.06 4.24219 15.1808 4.26623 15.2934 4.31294C15.4061 4.35964 15.5085 4.4281 15.5947 4.51439L23.9478 12.8675C24.0341 12.9537 24.1025 13.0561 24.1492 13.1688C24.196 13.2814 24.22 13.4022 24.22 13.5242C24.22 13.6461 24.196 13.7669 24.1492 13.8796C24.1025 13.9923 24.0341 14.0946 23.9478 14.1808Z"
              fill="white"
            />
          </svg>
        </button>
      </form>

      <div className="home-indicator" />
      {toast && <div className="story__toast">{toast}</div>}
    </div>
  )
}

function artHeight(type: PlacedSticker['type']) {
  if (type === 'gem-pair') return 52
  if (type === 'leaf-pair') return 42.5
  return STICKER_ART[type].h
}

/** 스티커 그림. 보석 2개 / 잎 2개 묶음은 디자인 그대로 두 장을 겹쳐 그려요. */
function StickerArt({ type }: { type: PlacedSticker['type'] }) {
  if (type === 'gem-pair') {
    return (
      <span className="sticker__art" style={{ width: 73, height: artHeight(type) }}>
        <img src={gemA} alt="" style={{ left: 0, top: 0, width: 54.5, height: 49.75 }} />
        <img src={gemB} alt="" style={{ left: 29, top: 5, width: 44, height: 41.5 }} />
      </span>
    )
  }
  if (type === 'leaf-pair') {
    return (
      <span className="sticker__art" style={{ width: 45, height: 42.5 }}>
        <img src={leafSmallA} alt="" style={{ left: 16.1, top: 3.9, width: 28.75, height: 38.5 }} />
        <img src={leafSmallB} alt="" style={{ left: 0, top: 0, width: 24.25, height: 31.25 }} />
      </span>
    )
  }
  const art = STICKER_ART[type]
  return (
    <span className="sticker__art" style={{ width: art.w, height: art.h }}>
      <img src={art.src} alt="" style={{ inset: 0, width: '100%', height: '100%' }} />
    </span>
  )
}
