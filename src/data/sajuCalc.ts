// 생년월일시 → 네 기둥(년주·월주·일주·시주) 계산.
// 절기·간지 계산 라이브러리(lunar-javascript)가 커서, 사주 설정에서 '확인'을 누를 때만 불러와요.
import { Solar } from 'lunar-javascript'
import { BRANCHES, STEMS, tenGod, toSolar, type Birth, type Element, type Pillar, type Saju } from './saju'

function pillarOf(ganzhi: string, dayStem: number): Pillar {
  const stem = STEMS.findIndex((s) => s.hanja === ganzhi[0])
  const branch = BRANCHES.findIndex((b) => b.hanja === ganzhi[1])
  return { stem, branch, stemGod: tenGod(dayStem, STEMS[stem]), branchGod: tenGod(dayStem, BRANCHES[branch]) }
}

const pad = (n: number) => String(n).padStart(2, '0')

export type CalcOptions = {
  /** 한국 표준시(동경 135°)와 서울 실제 태양 시간(약 127°)의 차이만큼 30분 빼기 */
  seoulTime: boolean
  /** 야자시: 밤 11~12시 출생은 일주를 그날로 (끄면 다음 날로) */
  lateRat: boolean
}

/** 네 기둥 계산 (기본: 서울 보정 + 야자시) */
export function computeSaju(birth: Birth, opts: CalcOptions = { seoulTime: true, lateRat: true }): Saju | null {
  const solar = toSolar(birth)
  if (!solar) return null

  let { year, month, day } = solar
  let hour = 12
  let minute = 0
  if (birth.time) {
    const t = new Date(Date.UTC(year, month - 1, day, birth.time.hour, birth.time.minute - (opts.seoulTime ? 30 : 0)))
    year = t.getUTCFullYear()
    month = t.getUTCMonth() + 1
    day = t.getUTCDate()
    hour = t.getUTCHours()
    minute = t.getUTCMinutes()
  }

  const ec = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar().getEightChar()
  ec.setSect(opts.lateRat ? 2 : 1)
  const dayStem = STEMS.findIndex((s) => s.hanja === ec.getDay()[0])
  const pillars = {
    year: pillarOf(ec.getYear(), dayStem),
    month: pillarOf(ec.getMonth(), dayStem),
    day: { ...pillarOf(ec.getDay(), dayStem), stemGod: '나' },
    hour: birth.time ? pillarOf(ec.getTime(), dayStem) : null,
  }

  const counts: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  for (const p of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    if (!p) continue
    counts[STEMS[p.stem].element]++
    counts[BRANCHES[p.branch].element]++
  }

  return {
    solarDate: `${solar.year}-${pad(solar.month)}-${pad(solar.day)}`,
    ...pillars,
    dayStem,
    counts,
  }
}
