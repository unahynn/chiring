// 주파수: 친구에게 보낼 내용 → 키워드 추천 → 필요한 기운 고르기
// 지금은 간단한 단어 규칙으로 동작해요. 나중에 AI나 서버로 바꿔도 함수 모양은 그대로 쓰면 돼요.

export type EnergyType = 'water' | 'fire' | 'wood' | 'metal' | 'earth'

/**
 * 기운 = 색 (디자인 규칙)
 * 블루 = 물, 그린 = 나무, 네온 = 금, 핑크 = 불, 오렌지 = 흙
 * 친구 목록 점, 필요한 기운 카드, 기운 생성중 그라데이션이 모두 이 색을 따라가요.
 */
export const ENERGY_META: Record<EnergyType, { label: string; dot: string }> = {
  water: { label: '물 (水)', dot: '#13e2ff' },
  wood: { label: '나무 (木)', dot: '#5effc7' },
  metal: { label: '금 (金)', dot: '#cefb6a' },
  fire: { label: '불 (火)', dot: '#ffa1f7' },
  earth: { label: '흙 (土)', dot: '#ff5500' },
}

/** 내용에 들어간 단어 → 추천 키워드 (위에서부터 먼저 맞는 순서대로) */
const KEYWORD_RULES: { match: RegExp; keywords: string[] }[] = [
  { match: /전남친|전여친|재회|연락|헤어|이별|썸|짝사랑|연애/, keywords: ['마음 진정', '새 인연 찾기', '기분 전환', '멘탈 회복', '꿀잠 자기'] },
  { match: /시험|공부|면접|발표|과제|자격증|합격|수능/, keywords: ['합격 기운', '집중력', '긴장 완화', '자신감', '꿀잠 자기'] },
  { match: /잠|피곤|야근|지쳐|지친|번아웃|쉬고/, keywords: ['꿀잠 자기', '에너지 충전', '멘탈 회복', '휴식'] },
  { match: /우울|힘들|슬프|슬퍼|속상|눈물|외로/, keywords: ['멘탈 회복', '기분 전환', '마음 진정', '위로'] },
  { match: /돈|월급|용돈|통장|지갑|알바|주식/, keywords: ['금전운', '대박 기운', '절약', '기분 전환'] },
  { match: /아프|감기|병원|다쳤|건강/, keywords: ['건강 회복', '꿀잠 자기', '에너지 충전'] },
  { match: /화나|짜증|싸웠|열받|빡/, keywords: ['마음 진정', '기분 전환', '화해', '멘탈 회복'] },
]

const DEFAULT_KEYWORDS = ['마음 진정', '기분 전환', '멘탈 회복', '꿀잠 자기', '자신감']

export function suggestKeywords(text: string): string[] {
  const out: string[] = []
  for (const rule of KEYWORD_RULES) {
    if (rule.match.test(text)) for (const k of rule.keywords) if (!out.includes(k)) out.push(k)
  }
  for (const k of DEFAULT_KEYWORDS) if (out.length < 5 && !out.includes(k)) out.push(k)
  return out.slice(0, 5)
}

/** 키워드·내용으로 어떤 기운이 가장 필요한지 점수 매기기 */
const ENERGY_HINTS: Record<EnergyType, RegExp> = {
  water: /진정|재회|연락|전남친|전여친|화나|짜증|열받|긴장|생각|화해|싸웠/,
  fire: /자신감|열정|에너지|발표|면접|용기|도전/,
  wood: /새 인연|기분 전환|성장|시작|설렘|위로|멘탈/,
  metal: /금전|돈|대박|합격|집중|절약|월급|시험/,
  earth: /꿀잠|휴식|건강|안정|피곤|쉬|아프/,
}

/**
 * need: 친구 목록에 색으로 표시된 '오늘 필요한 기운'.
 * 친구를 골랐다면 결과도 그 기운으로 맞춰요 (목록의 색 = 결과 카드의 색).
 * 내용·키워드는 카드 문구를 정하는 데 써요. need가 없을 때만 내용으로 기운을 골라요.
 */
export function pickEnergy(text: string, keywords: string[], need?: EnergyType): EnergyType {
  if (need) return need
  const all = `${text} ${keywords.join(' ')}`
  let best: EnergyType = need ?? 'water'
  let bestScore = -1
  for (const type of Object.keys(ENERGY_HINTS) as EnergyType[]) {
    const re = new RegExp(ENERGY_HINTS[type].source, 'g')
    const score = (all.match(re) ?? []).length
    if (score > bestScore) {
      best = type
      bestScore = score
    }
  }
  return best
}

export type EnergyCard = {
  type: EnergyType
  /** 그림·글자 이미지 이름 (assets/frequency/v2/need-{key}.png …). 같은 기운이라도 상황마다 달라요 */
  key: string
  subtitle: string
  title: string
  /** 키워드 3개 → 위 2개, 아래 1개 */
  tags: string[]
  /** 제목에서 친구 이름 색 */
  color: string
}

/** 필요한 기운 확인 화면 내용. 피그마 '필요한 기운 확인' (물부처의 기운) 기준 */
export function energyCard(type: EnergyType, text: string): EnergyCard {
  const aboutContact = /전남친|전여친|재회|연락/.test(text)
  switch (type) {
    case 'water':
      return aboutContact
        ? {
            type,
            key: 'water-contact',
            subtitle: '활활 타오르는\n연락 충동을 잠재워 주는',
            title: '물부처의 기운',
            tags: ['# 물의 기운', '# 새로운 인연의 기운', '# 연락충동에 찬물을 얹는'],
            color: '#91e2ff',
          }
        : {
            type,
            key: 'water',
            subtitle: '뜨거워진 마음을\n차분하게 식혀 주는',
            title: '물의 기운',
            tags: ['# 물의 기운', '# 마음 진정', '# 생각을 비우는'],
            color: '#91e2ff',
          }
    case 'fire':
      return {
        type,
        key: 'fire',
        subtitle: '움츠러든 마음에\n불씨를 지펴 주는',
        title: '불의 기운',
        tags: ['# 불의 기운', '# 자신감 충전', '# 용기 한 스푼'],
        color: '#ffa1f7',
      }
    case 'wood':
      return {
        type,
        key: 'wood',
        subtitle: '새로운 시작에\n싹을 틔워 주는',
        title: '나무의 기운',
        tags: ['# 나무의 기운', '# 새로운 시작', '# 기분 전환'],
        color: '#8fffd9',
      }
    case 'metal':
      return {
        type,
        key: 'metal',
        subtitle: '흩어진 운을\n단단하게 모아 주는',
        title: '금의 기운',
        tags: ['# 금의 기운', '# 합격 기운', '# 행운 모으기'],
        color: '#dcfc8f',
      }
    case 'earth':
      return {
        type,
        key: 'earth',
        subtitle: '지친 몸과 마음을\n포근하게 감싸 주는',
        title: '흙의 기운',
        tags: ['# 흙의 기운', '# 꿀잠 자기', '# 푹 쉬기'],
        color: '#ffaa80',
      }
  }
}
