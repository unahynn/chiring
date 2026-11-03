// 주파수: 친구에게 보낼 내용 → 키워드 추천 → 필요한 기운 고르기
// 지금은 간단한 단어 규칙으로 동작해요. 나중에 AI나 서버로 바꿔도 함수 모양은 그대로 쓰면 돼요.

export type EnergyType = 'water' | 'fire' | 'wood' | 'metal' | 'earth'

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

export function pickEnergy(text: string, keywords: string[]): EnergyType {
  const all = `${text} ${keywords.join(' ')}`
  let best: EnergyType = 'water'
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
  subtitle: string
  title: string
  desc: string
  tags: string[]
  /** 강조색 · 카드 그라데이션 끝색 · 그라데이션 중간색 */
  color: string
  stops: [string, string, string, string, string]
}

/** 결과 카드 내용. name은 "수민이"처럼 부르는 이름 */
export function energyCard(type: EnergyType, name: string, text: string): EnergyCard {
  const aboutContact = /전남친|전여친|재회|연락/.test(text)
  switch (type) {
    case 'water':
      return aboutContact
        ? {
            type,
            subtitle: '활활 타오르는\n연락 충동을 잠재워 줄',
            title: '물(水)의 기운',
            desc: `${name}는 지금 불 기운이 활활 타오르는 중!\n감정에 휩쓸려 연락 버튼을 누르기 전에,\n차가운 물 기운으로 마음의 온도를 낮추는게 필요해`,
            tags: ['# 물의 기운', '# 새로운 인연의 기운', '# 연락충돌을 눌러줄', '# 생각을 비우는'],
            color: '#39caff',
            stops: ['#ffffff', '#cdf2ff', '#9ce5ff', '#6ad7ff', '#39caff'],
          }
        : {
            type,
            subtitle: '뜨거워진 마음을\n차분하게 식혀 줄',
            title: '물(水)의 기운',
            desc: `${name}는 지금 마음이 조금 달아올라 있어.\n한 템포 쉬어 가면서\n시원한 물 기운으로 생각을 정리하는게 필요해`,
            tags: ['# 물의 기운', '# 마음 진정', '# 생각을 비우는'],
            color: '#39caff',
            stops: ['#ffffff', '#cdf2ff', '#9ce5ff', '#6ad7ff', '#39caff'],
          }
    case 'fire':
      return {
        type,
        subtitle: '움츠러든 마음에\n불씨를 지펴 줄',
        title: '불(火)의 기운',
        desc: `${name}는 지금 에너지가 조금 식어 있어.\n자신 있게 한 발 내딛을 수 있도록\n뜨거운 불 기운으로 용기를 채우는게 필요해`,
        tags: ['# 불의 기운', '# 자신감 충전', '# 열정 가득'],
        color: '#ff5ccf',
        stops: ['#ffffff', '#ffd6f3', '#ffadea', '#ff85dc', '#ff5ccf'],
      }
    case 'wood':
      return {
        type,
        subtitle: '새로운 시작에\n싹을 틔워 줄',
        title: '나무(木)의 기운',
        desc: `${name}는 지금 새 출발이 필요한 때!\n지난 일은 흘려보내고\n쑥쑥 자라는 나무 기운으로 기분을 바꾸는게 필요해`,
        tags: ['# 나무의 기운', '# 새로운 시작', '# 기분 전환'],
        color: '#3ee8a8',
        stops: ['#ffffff', '#d4fbec', '#a8f6d9', '#73efc1', '#3ee8a8'],
      }
    case 'metal':
      return {
        type,
        subtitle: '흩어진 운을\n단단하게 모아 줄',
        title: '금(金)의 기운',
        desc: `${name}는 지금 결과가 걸린 중요한 순간!\n흔들리지 않고 끝까지 해낼 수 있도록\n반짝이는 금 기운으로 운을 모으는게 필요해`,
        tags: ['# 금의 기운', '# 합격 기운', '# 집중력'],
        color: '#b6ea3c',
        stops: ['#ffffff', '#f0fbcf', '#e0f6a0', '#cbf06e', '#b6ea3c'],
      }
    case 'earth':
      return {
        type,
        subtitle: '지친 몸과 마음을\n포근하게 감싸 줄',
        title: '흙(土)의 기운',
        desc: `${name}는 지금 쉼이 필요한 상태야.\n아무 생각 없이 푹 잘 수 있도록\n든든한 흙 기운으로 마음을 다지는게 필요해`,
        tags: ['# 흙의 기운', '# 꿀잠 자기', '# 안정감'],
        color: '#ff8a3d',
        stops: ['#ffffff', '#ffe2cf', '#ffc59f', '#ffa86e', '#ff8a3d'],
      }
  }
}
