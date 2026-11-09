/**
 * '기운 주파수 다시 듣기'에 쌓여 있는 지난 주파수 (나중에 서버에서 받아올 자리)
 * 카드 id(`{기운}-{1·2·3}`)마다 누가 보냈는지와 뒷면 메세지.
 * 메세지의 줄바꿈(\n)은 카드 뒷면에 그대로 보여요.
 */
export type ReplayGift = { from: string; message: string }

export const REPLAY_GIFTS: Record<string, ReplayGift> = {
  'water-1': { from: 'Dayun', message: '미련은 오늘로\n싹 다 폭파!\n넌 더 좋은 사람\n만날 거야' },
  'water-2': { from: 'Jiwon', message: '저번처럼 백퍼\n후회한다 진짜..\n연락하지 말고\n잠이나 자 ——' },
  'water-3': { from: 'Yujin', message: '올해는 진짜\n좋은 사람 온다\n소개팅 들어오면\n무조건 나가!' },
  'water-4': { from: 'SSU', message: '오늘은 아무것도\n하지 말고\n칠 모드 ON\n푹 쉬어' },
  'water-5': { from: 'Nahyun', message: '화날 땐\n일단 숨 크게\n열 번만 쉬고\n얘기하자' },
  'water-6': { from: 'Kwon', message: '스트레스는\n오늘로 싹\n씻어내고\n개운하게 자!' },
  'wood-1': { from: 'Nahyun', message: '새로운 시작\n완전 응원해\n충전 100%로\n가보자고!' },
  'wood-2': { from: 'Kwon', message: '너는 원래\n잘하는 사람이야\n이제 활짝\n필 차례!' },
  'wood-3': { from: 'SSU', message: '이번엔 진짜\n합격이다\n붙으면 밥\n쏘는 거 알지?' },
  'metal-1': { from: 'Jiwon', message: '오늘은 적당히\n일하고\n월급은 두 배로\n받자' },
  'metal-2': { from: 'Yujin', message: '장바구니\n그만 담아..\n이번 달은\n지갑 닫기!' },
  'metal-3': { from: 'Dayun', message: '세이빙 모드\nON\n통장 잔고\n꼭 지켜!' },
  'fire-1': { from: 'Kwon', message: '일단 나가서\n걷기라도 해\n움직이면\n기분도 풀려' },
  'fire-2': { from: 'Nahyun', message: '오늘도\n충분히 잘했어\n가만히 있어도\n빛나는 너' },
  'fire-3': { from: 'SSU', message: '운동 같이\n가자고 했지?\n내일 아침\n7시 헬스장!' },
  'earth-1': { from: 'Yujin', message: '일단 진정하고\n숨 크게 쉬어\n다 잘\n될 거야' },
  'earth-2': { from: 'Jiwon', message: '하나씩\n쌓으면 돼\n너 지금\n잘하고 있어' },
  'earth-3': { from: 'Dayun', message: '차곡차곡\n모으다 보면\n어느새\n큰 산이 돼 있을걸' },
}
