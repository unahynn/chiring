import type { EnergyType } from './energy'

/** 주파수 카드 3종 (피그마 '주파수 카드 선택 옵션 1·2·3') — 그림: assets/frequency/card-{기운}-{1·2·3}.webp
 *  모든 카드는 같은 비율 (978×1236, 화면에선 326×412 · 옆 카드 248×314) */
const CARD_IMAGES = import.meta.glob<string>('../assets/frequency/card-*.webp', { eager: true, import: 'default' })
export const cardSrc = (energy: EnergyType, n: number) => CARD_IMAGES[`../assets/frequency/card-${energy}-${n}.webp`]

export const CARD_LABELS: Record<EnergyType, [string, string, string]> = {
  water: ['미련 폭파 기운', '연락 말고 그냥 자 주파수', '새로운 인연이 들어오는 기운'],
  wood: ['새출발 풀충전', 'Let It Bloom!', '합격 싹 틔우는 기운'],
  metal: ['적게 일하고 많이 받는 기운', '지갑닫는 주파수', 'Saving mode ON'],
  fire: ['Just Move! Move! Move!', '가만히 있어도 살 10kg 빠지는 주파수', '10000 칼로리 태워주는 기운'],
  earth: ['일단 진정 기운', 'Build It Up!', '차곡차곡 쌓아올리기'],
}

export const signalCards = (energy: EnergyType) =>
  CARD_LABELS[energy].map((label, i) => ({ id: `${energy}-${i + 1}`, src: cardSrc(energy, i + 1), label }))

export type SignalCard = ReturnType<typeof signalCards>[number]

/**
 * '기운 주파수 다시 듣기' 목록 카드 (피그마) — 따로 정한 기운만, 나머지는 위 3장 그대로
 * 그림 파일(card-{기운}-{번호}.webp)이 없는 카드는 빼고 보여줘요.
 */
const REPLAY_SETS: Partial<Record<EnergyType, [number, string][]>> = {
  water: [
    [2, '연락 말고 그냥 자 주파수'],
    [3, '새로운 인연이 들어오는 기운'],
    [4, 'Chill Mode ON'],
    [5, '마음을 식히는 주파수'],
    [6, '스트레스 싹 씻어내는 기운'],
  ],
}

export const replayCards = (energy: EnergyType): SignalCard[] => {
  const set = REPLAY_SETS[energy]
  if (!set) return signalCards(energy)
  return set.map(([n, label]) => ({ id: `${energy}-${n}`, src: cardSrc(energy, n), label })).filter((c) => c.src)
}
