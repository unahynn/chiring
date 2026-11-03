// 사주(네 기둥) 계산: 생년월일시 → 년주·월주·일주·시주 → 오행 개수
// 여기에는 표·규칙만 있고, 실제 기둥 계산(용량이 큰 만세력 라이브러리)은 sajuCalc.ts에서 필요할 때만 불러와요.
// 음력 → 양력 변환은 한국천문연구원 기준의 korean-lunar-calendar를 써요.
import KoreanLunarCalendar from 'korean-lunar-calendar'
import type { EnergyType } from './energy'

/** 오행 = 기운 (앱 전체에서 쓰는 EnergyType과 같은 이름) */
export type Element = EnergyType

export const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water']

export const ELEMENT_META: Record<
  Element,
  {
    ko: string
    hanja: string
    en: string
    /** 진한 색 (타입 제목 테두리, 오행 막대) */
    strong: string
    /** 연한 색 (강조 글자, 해시태그) */
    soft: string
    /** 아주 연한 색 (상세 시트 소제목 형광펜) */
    tint: string
  }
> = {
  wood: { ko: '나무', hanja: '木', en: 'Wood', strong: '#5effc7', soft: '#8fffd9', tint: '#c4ffeb' },
  fire: { ko: '불', hanja: '火', en: 'Fire', strong: '#ff39c7', soft: '#ffa1f7', tint: '#ffc7fa' },
  earth: { ko: '흙', hanja: '土', en: 'Earth', strong: '#ff5500', soft: '#ffaa80', tint: '#ffd3bd' },
  metal: { ko: '금', hanja: '金', en: 'Metal', strong: '#c7f957', soft: '#dcfc8f', tint: '#ecfdc2' },
  water: { ko: '물', hanja: '水', en: 'Water', strong: '#13e2ff', soft: '#8ef0ff', tint: '#c2f7ff' },
}

/** '불(火)' */
export const elementLabel = (e: Element) => `${ELEMENT_META[e].ko}(${ELEMENT_META[e].hanja})`

/** 상생: key가 value를 만들어 줘요 (나무 → 불 → 흙 → 금 → 물 → 나무) */
export const GENERATES: Record<Element, Element> = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' }
/** 상극: key가 value를 눌러요 (나무 → 흙 → 물 → 불 → 금 → 나무) */
export const CONTROLS: Record<Element, Element> = { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' }

export type Glyph = { hanja: string; ko: string; element: Element; yang: boolean }

export const STEMS: Glyph[] = [
  { hanja: '甲', ko: '갑', element: 'wood', yang: true },
  { hanja: '乙', ko: '을', element: 'wood', yang: false },
  { hanja: '丙', ko: '병', element: 'fire', yang: true },
  { hanja: '丁', ko: '정', element: 'fire', yang: false },
  { hanja: '戊', ko: '무', element: 'earth', yang: true },
  { hanja: '己', ko: '기', element: 'earth', yang: false },
  { hanja: '庚', ko: '경', element: 'metal', yang: true },
  { hanja: '辛', ko: '신', element: 'metal', yang: false },
  { hanja: '壬', ko: '임', element: 'water', yang: true },
  { hanja: '癸', ko: '계', element: 'water', yang: false },
]

/** 지지. 십성은 지지 속 본기(가장 큰 기운)의 음양으로 봐요 (子는 癸, 午는 丁 …) */
export const BRANCHES: Glyph[] = [
  { hanja: '子', ko: '자', element: 'water', yang: false },
  { hanja: '丑', ko: '축', element: 'earth', yang: false },
  { hanja: '寅', ko: '인', element: 'wood', yang: true },
  { hanja: '卯', ko: '묘', element: 'wood', yang: false },
  { hanja: '辰', ko: '진', element: 'earth', yang: true },
  { hanja: '巳', ko: '사', element: 'fire', yang: true },
  { hanja: '午', ko: '오', element: 'fire', yang: false },
  { hanja: '未', ko: '미', element: 'earth', yang: false },
  { hanja: '申', ko: '신', element: 'metal', yang: true },
  { hanja: '酉', ko: '유', element: 'metal', yang: false },
  { hanja: '戌', ko: '술', element: 'earth', yang: true },
  { hanja: '亥', ko: '해', element: 'water', yang: true },
]

export type Birth = {
  calendar: 'solar' | 'lunar'
  /** 음력 윤달 */
  leap: boolean
  year: number
  month: number
  day: number
  /** 0~23시, 0~59분. 모르면 null */
  time: { hour: number; minute: number } | null
}

export type Pillar = {
  stem: number
  branch: number
  /** 천간·지지의 십성 (일간 자리는 '나') */
  stemGod: string
  branchGod: string
}

export type Saju = {
  /** 실제 계산에 쓴 양력 날짜 'YYYY-MM-DD' */
  solarDate: string
  year: Pillar
  month: Pillar
  day: Pillar
  /** 태어난 시간을 모르면 없어요 */
  hour: Pillar | null
  /** 일간(나를 뜻하는 글자) */
  dayStem: number
  /** 여덟(또는 여섯) 글자의 오행 개수 */
  counts: Record<Element, number>
}

/** 음력이면 양력으로 바꿔요. 날짜가 없으면 null */
export function toSolar(b: Pick<Birth, 'calendar' | 'leap' | 'year' | 'month' | 'day'>) {
  if (b.calendar === 'lunar') {
    const cal = new KoreanLunarCalendar()
    if (!cal.setLunarDate(b.year, b.month, b.day, b.leap)) return null
    const s = cal.getSolarCalendar()
    // 라이브러리가 없는 날짜를 넘겨도 true를 줄 때가 있어서, 다시 음력으로 돌려 확인해요
    cal.setSolarDate(s.year, s.month, s.day)
    const back = cal.getLunarCalendar()
    if (back.year !== b.year || back.month !== b.month || back.day !== b.day || !!back.intercalation !== b.leap) return null
    return { year: s.year, month: s.month, day: s.day }
  }
  const d = new Date(Date.UTC(b.year, b.month - 1, b.day))
  if (d.getUTCFullYear() !== b.year || d.getUTCMonth() !== b.month - 1 || d.getUTCDate() !== b.day) return null
  return { year: b.year, month: b.month, day: b.day }
}

/** 상대 오행이 나(일간)에게 어떤 관계인지 */
export type Relation = 'same' | 'support' | 'output' | 'wealth' | 'power'

export function relationTo(me: Element, other: Element): Relation {
  if (me === other) return 'same'
  if (GENERATES[other] === me) return 'support' // 나를 도와주는 기운 (인성)
  if (GENERATES[me] === other) return 'output' // 내가 표현하는 기운 (식상)
  if (CONTROLS[me] === other) return 'wealth' // 내가 다루는 기운 (재성)
  return 'power' // 나를 단련시키는 기운 (관성)
}

const TEN_GODS: Record<Relation, [same: string, diff: string]> = {
  same: ['비견', '겁재'],
  output: ['식신', '상관'],
  wealth: ['편재', '정재'],
  power: ['편관', '정관'],
  support: ['편인', '정인'],
}

export function tenGod(dayStem: number, g: Glyph) {
  const me = STEMS[dayStem]
  const [same, diff] = TEN_GODS[relationTo(me.element, g.element)]
  return me.yang === g.yang ? same : diff
}

/** 일간을 뺀 나머지 글자에서 가장 많은 오행 = '주변 기운'. 같으면 월지(태어난 계절) 기운을 먼저 봐요 */
export function surroundingElement(s: Saju): Element {
  const c = { ...s.counts }
  c[STEMS[s.dayStem].element]--
  const season = BRANCHES[s.month.branch].element
  return ELEMENTS.reduce((best, e) => (c[e] > c[best] || (c[e] === c[best] && e === season) ? e : best), season)
}

/** 가장 많은 오행 */
export function strongestElement(s: Saju): Element {
  return ELEMENTS.reduce((best, e) => (s.counts[e] > s.counts[best] ? e : best), ELEMENTS[0])
}

/**
 * 채우면 좋은 오행 (행운 포인트·기운 사용법에 써요).
 * 가장 적은 오행 중에서, 내 기운이 약하면 나를 돕는 쪽, 강하면 힘을 빼 주는 쪽을 골라요.
 */
export function neededElement(s: Saju): Element {
  const me = STEMS[s.dayStem].element
  const total = ELEMENTS.reduce((n, e) => n + s.counts[e], 0)
  const myPower = s.counts[me] + s.counts[ELEMENTS.find((e) => GENERATES[e] === me)!]
  const weak = myPower * 2 < total
  const order: Relation[] = weak ? ['support', 'same', 'output', 'wealth', 'power'] : ['output', 'wealth', 'power', 'support', 'same']
  const min = Math.min(...ELEMENTS.map((e) => s.counts[e]))
  const candidates = ELEMENTS.filter((e) => s.counts[e] === min)
  return candidates.sort((a, b) => order.indexOf(relationTo(me, a)) - order.indexOf(relationTo(me, b)))[0]
}
