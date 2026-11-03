// 내 프로필(사진·이름·사주 정보)을 이 기기에 저장해요.
// 온보딩을 끝내면 done=true가 되고, 다음부터는 앱을 열면 바로 홈이 보여요.
import type { Saju } from './saju'

export type Profile = {
  name: string
  /** 사진 (작게 줄인 data URL). 없으면 null */
  photo: string | null
  calendar: 'solar' | 'lunar'
  leap: boolean
  /** 'YYYY-MM-DD' (음력이면 음력 날짜 그대로) */
  birthDate: string
  /** 'HH:mm' 24시간. 모르면 null */
  birthTime: string | null
  gender: 'female' | 'male'
}

export type Me = {
  profile: Profile
  saju: Saju
  /** 캐해 리포트까지 보고 '시작하기'를 눌렀는지 */
  done: boolean
}

const KEY = 'chiring.me.v1'

export function loadMe(): Me | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Me) : null
  } catch {
    return null
  }
}

export function saveMe(me: Me) {
  try {
    localStorage.setItem(KEY, JSON.stringify(me))
  } catch {
    // 저장 공간이 꽉 찼으면 사진만 빼고 다시 저장해요
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...me, profile: { ...me.profile, photo: null } }))
    } catch {
      /* 저장이 안 돼도 이번 실행에서는 그대로 쓸 수 있어요 */
    }
  }
}

/** 갤러리에서 고른 사진을 동그란 프로필용으로 작게 (긴 변 360px, JPEG) */
export function shrinkPhoto(file: File, size = 360): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      // 가운데를 정사각형으로 잘라요
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const sx = (img.naturalWidth - side) / 2
      const sy = (img.naturalHeight - side) / 2
      const out = Math.min(size, side)
      const canvas = document.createElement('canvas')
      canvas.width = out
      canvas.height = out
      canvas.getContext('2d')!.drawImage(img, sx, sy, side, side, 0, 0, out, out)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('사진을 열 수 없어요'))
    }
    img.src = url
  })
}
