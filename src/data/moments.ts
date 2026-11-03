// Lucky Moments(친구 스토리) 데이터. 나중에 서버/DB에서 받아오면 이 모양 그대로 쓰면 돼요.
import momentUnahynn from '../assets/friends/moment-1.jpg'
import momentSumin from '../assets/friends/moment-sumin.jpg'
import momentMinhee from '../assets/friends/moment-3.jpg'
import momentSsu from '../assets/friends/moment-ssu.jpg'
import momentKwon from '../assets/friends/moment-kwon.jpg'
import avatarUnahynn from '../assets/friends/avatar-unahynn.jpg'
import avatarSumin from '../assets/friends/avatar-sumin.jpg'
import avatarMinhee from '../assets/friends/avatar-3.jpg'
import avatarSsu from '../assets/friends/avatar-ssu.jpg'
import avatarKwon from '../assets/friends/avatar-kwon.jpg'

export type StickerType = 'fire' | 'water' | 'diamond' | 'leaf' | 'sprout'

/** 스토리 사진 위에 붙은 기운 스티커. x, y는 사진(362×442) 안에서 스티커 가운데 위치예요. */
export type PlacedSticker = {
  id: string
  /** 디자인에 있는 특별한 모양(보석 2개, 잎 2개)은 variant로 구분해요 */
  type: StickerType | 'gem-pair' | 'leaf-pair'
  from: string
  x: number
  y: number
}

/** 아바타 원본 사진이 32px 원 안에서 보이는 위치 (피그마 크롭 그대로, px 단위) */
export type AvatarCrop = { left: number; top: number; width: number; height: number }

export type Moment = {
  id: string
  name: string
  avatar: string
  avatarCrop?: AvatarCrop
  photo: string
  caption?: string
  stickers: PlacedSticker[]
}

/** 지금 앱을 쓰는 나 (스티커를 붙이면 이 이름이 달려요) */
export const ME = 'Unahynn'

export const MOMENTS: Moment[] = [
  {
    id: 'unahynn',
    name: 'Unahynn',
    avatar: avatarUnahynn,
    avatarCrop: { left: -43, top: 0, width: 75, height: 42 },
    photo: momentUnahynn,
    stickers: [],
  },
  {
    id: 'sumin',
    name: 'Sumin',
    avatar: avatarSumin,
    avatarCrop: { left: -12.8, top: -8, width: 56, height: 56 },
    photo: momentSumin,
    caption: '드디어 시험 D-DAY,,',
    stickers: [
      { id: 's1', type: 'fire', from: 'MINJU', x: 295, y: 173.3 },
      { id: 's2', type: 'gem-pair', from: 'Kwon', x: 63.5, y: 274 },
      { id: 's3', type: 'leaf-pair', from: 'Minhee', x: 261.3, y: 357 },
    ],
  },
  {
    id: 'minhee',
    name: 'Minhee',
    avatar: avatarMinhee,
    photo: momentMinhee,
    caption: '하ㅏ 월요일 1교시 에바야 ㅠ',
    stickers: [],
  },
  {
    id: 'ssu',
    name: 'SSU',
    avatar: avatarSsu,
    avatarCrop: { left: -1, top: -3.1, width: 34.3, height: 36 },
    photo: momentSsu,
    stickers: [],
  },
  {
    id: 'kwon',
    name: 'Kwon',
    avatar: avatarKwon,
    avatarCrop: { left: -7.6, top: 0, width: 47, height: 32.2 },
    photo: momentKwon,
    stickers: [],
  },
]
