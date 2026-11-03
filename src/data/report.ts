// 캐해 리포트: 사주 계산 결과 → 내 타입 이름 + 6개 박스(상세 시트) 문구
// 문구 안의 **굵게** 는 진하게, 줄바꿈(\n)은 문단 나눔으로 보여요.
import {
  ELEMENTS,
  ELEMENT_META,
  STEMS,
  elementLabel,
  neededElement,
  relationTo,
  strongestElement,
  surroundingElement,
  type Element,
  type Relation,
  type Saju,
} from './saju'

export type ReportBlock = { heading: string; body: string }

export type SectionKey = 'elements' | 'personality' | 'guide' | 'caution' | 'relationships' | 'lucky'

export type ReportSection = {
  key: SectionKey
  /** 박스·시트 제목 (영문, 줄 단위) */
  title: string[]
  /** 박스 아래 작은 한글 */
  ko: string
  /** 박스 색 (피그마 그대로) */
  color: string
  tags: string[]
  blocks: ReportBlock[]
}

export type LuckyItem = { label: string; value: string }

export type Report = {
  /** 'Lemon Yellow Fire' */
  typeName: string
  /** 중심 기운 (일간의 오행) */
  core: Element
  surround: Element
  strongest: Element
  needed: Element
  lucky: { color: string; items: LuckyItem[] }
  sections: ReportSection[]
}

/** 일간(10가지)마다 타입 이름과 두 번째 성향 문단 */
const STEM_TYPES: { name: string; heading: string; body: string }[] = [
  {
    name: 'Forest Green Wood',
    heading: '곧게 뻗어 가는\n타고난 리더',
    body: '큰 나무처럼 **위로 곧게 자라려는 힘**이 있어요. 목표가 생기면 돌아가지 않고 정면으로 나아가고, 주변 사람들이 자연스럽게 기대고 싶어지는 든든함이 있어요.\n자존심이 강한 만큼 **굽히는 걸 어려워할 때**도 있지만, 그 곧음이 결국 사람들의 믿음을 만들어요.',
  },
  {
    name: 'Mint Green Wood',
    heading: '부드럽지만,\n어디서든 살아남아요',
    body: '꽃과 덩굴처럼 **유연하게 길을 찾아가는 타입**이에요. 상황이 바뀌어도 금방 적응하고, 사람 사이의 분위기를 읽는 감각이 좋아요.\n여려 보여도 속은 질겨서, **틈만 있으면 기어이 꽃을 피워 내는** 끈기가 있어요.',
  },
  {
    name: 'Hot Pink Fire',
    heading: '있기만 해도\n분위기가 환해져요',
    body: '태양처럼 **밝고 솔직한 에너지**를 가졌어요. 숨기는 게 서툴러서 감정이 얼굴에 다 드러나지만, 그 투명함 덕분에 사람들이 쉽게 마음을 열어요.\n시작하는 힘이 강해서 **판을 벌이고 사람을 모으는 일**에 재능이 있어요.',
  },
  {
    name: 'Lemon Yellow Fire',
    heading: '조용하지만,\n한번 붙으면 오래 가요',
    body: '평소에는 차분하고 조용해 보여도, 마음을 정하면 **쉽게 포기하지 않는 편**이에요.\n겉으로 크게 드러내지 않아도 안쪽에는 강한 추진력과 자기 기준이 있어요. 촛불처럼 **가까운 사람을 오래 비춰 주는** 따뜻함이 있고, 섬세하게 관찰하고 깊이 집중하는 힘도 남달라요.',
  },
  {
    name: 'Burnt Orange Earth',
    heading: '흔들리지 않는\n든든한 산',
    body: '큰 산처럼 **묵직하고 믿음직한 타입**이에요. 쉽게 동요하지 않고, 모두가 우왕좌왕할 때 중심을 잡아 줘요.\n말보다 행동으로 보여 주는 편이라 처음엔 무뚝뚝해 보여도, 알고 나면 **누구보다 의리 있는 사람**이에요.',
  },
  {
    name: 'Soft Peach Earth',
    heading: '모든 걸 품어 주는\n다정한 들판',
    body: '너른 들판처럼 **사람과 일을 품고 길러 내는 힘**이 있어요. 세심하게 챙기고, 작은 것도 놓치지 않는 꼼꼼함이 장점이에요.\n겉으론 순해 보여도 **실속을 정확히 아는** 똑똑한 타입이에요.',
  },
  {
    name: 'Chrome Silver Metal',
    heading: '단단하고,\n결정은 시원하게',
    body: '무쇠처럼 **단단하고 결단력 있는 타입**이에요. 옳고 그름이 분명하고, 해야 할 말은 돌려 말하지 않아요.\n의리를 중요하게 여겨서 한 번 내 사람이면 끝까지 지켜 줘요. **위기일수록 더 침착해지는** 강한 멘탈의 소유자예요.',
  },
  {
    name: 'Neon Lime Metal',
    heading: '날카롭게 빛나는\n감각의 보석',
    body: '보석처럼 **섬세하고 반짝이는 감각**을 가졌어요. 디테일을 보는 눈이 남다르고, 완성도에 대한 기준이 높아요.\n예민한 만큼 상처도 잘 받지만, 다듬어질수록 **더 선명하게 빛나는** 타입이에요.',
  },
  {
    name: 'Deep Ocean Water',
    heading: '깊고 넓게,\n멀리 흘러가요',
    body: '바다처럼 **생각이 깊고 스케일이 큰 타입**이에요. 한곳에 머무르기보다 새로운 경험과 사람을 찾아 넓게 흘러가요.\n속을 다 보여 주지 않아 신비롭게 느껴지기도 하지만, **무엇이든 받아들이는 포용력**이 커요.',
  },
  {
    name: 'Aqua Blue Water',
    heading: '조용히 스며들어\n마음을 적셔요',
    body: '비와 이슬처럼 **조용히 스며드는 섬세함**을 가졌어요. 눈치가 빠르고 상대의 감정을 잘 알아채서, 곁에 있으면 편안하다는 말을 자주 들어요.\n상상력과 직감이 뛰어나 **보이지 않는 흐름을 먼저 읽는** 타입이에요.',
  },
]

/** 중심 기운 × 주변 기운 → 첫 번째 성향 제목 */
const IMAGERY: Record<Element, Record<Element, string>> = {
  wood: {
    wood: '숲을 이룬 나무,\n함께일 때 더 단단해요',
    fire: '꽃을 피우려\n쉬지 않고 자라는 나무',
    earth: '넓은 땅에\n깊게 뿌리내린 나무',
    metal: '도끼질에도 꺾이지 않고\n다듬어지는 나무',
    water: '물을 머금고\n천천히 크게 자라는 나무',
  },
  fire: {
    fire: '모일수록\n더 크게 번지는 불꽃',
    earth: '주변을 따뜻하게\n데워 주는 화로',
    metal: '단단한 쇠도 녹여\n모양을 만드는 불',
    water: '차가운 물 속에서도\n꺼지지 않는 불씨',
    wood: '장작을 품고\n오래 타오르는 불',
  },
  earth: {
    earth: '겹겹이 쌓여\n흔들리지 않는 산',
    metal: '속에 보석을\n품고 있는 땅',
    water: '물길을 품어\n생명을 키우는 땅',
    wood: '뿌리를 받아 내며\n더 단단해지는 땅',
    fire: '햇볕에 데워진\n따뜻한 땅',
  },
  metal: {
    metal: '부딪힐수록\n더 빛나는 금속',
    water: '맑은 물을 길어 올리는\n샘가의 바위',
    wood: '나무를 다듬어\n쓸모를 만드는 칼',
    fire: '뜨거운 불에\n단련되는 강철',
    earth: '흙 속에서 천천히\n빛을 키우는 원석',
  },
  water: {
    water: '모여서 큰 흐름이 되는\n물줄기',
    wood: '숲을 키우며\n흘러가는 시냇물',
    fire: '햇살을 받아\n반짝이는 수면',
    earth: '둑을 만나\n깊어지는 호수',
    metal: '바위 틈에서\n끝없이 솟는 샘물',
  },
}

/** 주변 기운이 나에게 어떤 관계인지 → 첫 번째 성향 문단 + 해시태그 ({D}=중심, {S}=주변) */
const RELATION_TEXT: Record<Relation, { tag: string; body: string }> = {
  power: {
    tag: '숨겨진 에너지',
    body: '당신의 중심에는 **{D}의 에너지가 있고, 주변에는 {S}의 기운이 강하게 자리한 편**이에요. 그래서 겉으로는 차분하고 조용해 보여도, 안쪽에는 **쉽게 흔들리지 않는 중심**이 있습니다.\n주변의 분위기나 사람들의 말, 예상하지 못한 상황에 영향을 받는 순간이 있어도 결국에는 스스로의 중심을 다시 찾아가는 힘이 강한 편이에요.\n특히 압박이나 긴장이 있는 환경에서 한 번 마음을 정하고 나면 쉽게 포기하지 않습니다. **외부의 자극 속에서 오히려 집중력과 끈기가 더 선명해지는 타입**이라고 볼 수 있어요.',
  },
  same: {
    tag: '마이웨이',
    body: '당신의 중심에는 **{D}의 에너지가 있고, 주변에도 같은 {S}의 기운이 넉넉하게 모여 있는 편**이에요. 내 색이 분명하고, 한 번 정한 방향은 남이 뭐라 해도 밀고 나가는 힘이 있어요.\n혼자서도 잘 해내지만 비슷한 결의 사람들과 함께할 때 에너지가 몇 배로 커지는 타입이에요. 다만 고집으로 보일 수 있는 순간도 있어서, **내 속도와 남의 속도를 맞추는 연습**이 큰 무기가 돼요.',
  },
  support: {
    tag: '흡수력 만렙',
    body: '당신의 중심에는 **{D}의 에너지가 있고, 주변에는 나를 키워 주는 {S}의 기운이 감싸고 있는 편**이에요. 그래서 **생각이 깊고, 배우고 흡수하는 힘이 큰 타입**이에요.\n바로 움직이기보다 충분히 이해하고 납득한 뒤 움직이는 편이라 시작은 느려 보여도, 한번 시작하면 깊이가 남달라요. 응원해 주는 사람과 좋은 환경이 있을 때 **가진 재능이 가장 크게 피어나요**.',
  },
  output: {
    tag: '표현 장인',
    body: '당신의 중심에는 **{D}의 에너지가 있고, 주변에는 내가 뿜어내는 {S}의 기운이 넓게 퍼져 있는 편**이에요. 머릿속에 있는 걸 **말, 글, 손끝으로 표현해 내는 힘**이 큰 타입이에요.\n아이디어가 끊이지 않고 감각이 빨라서, 분위기를 바꾸거나 새로운 걸 만들어 내는 자리에서 빛이 나요. 대신 에너지를 밖으로 많이 쓰는 만큼 **충전 시간을 꼭 챙겨야** 오래 반짝일 수 있어요.',
  },
  wealth: {
    tag: '현실 감각',
    body: '당신의 중심에는 **{D}의 에너지가 있고, 주변에는 내가 다루고 키워 갈 {S}의 기운이 넓게 펼쳐진 편**이에요. 현실 감각이 좋고 **결과를 눈에 보이게 만드는 힘**이 있는 타입이에요.\n무엇이 필요한지, 어디에 힘을 써야 하는지를 빨리 알아채고 실속 있게 움직여요. 해야 할 일이 많을수록 오히려 판을 정리하며 **주도권을 잡는 편**이에요.',
  },
}

/** 오행별 문구 묶음 */
const BY_ELEMENT: Record<
  Element,
  {
    strong: string
    lacking: string
    useHeading: string
    use: string
    fill: string
    over: string
    tired: string
    friendHeading: string
    friend: string
    lucky: { colorName: string; color: string; number: string; direction: string; item: string; place: string; time: string }
  }
> = {
  wood: {
    strong: '**새로 시작하고 자라나려는 힘**이 넘쳐요. 계획을 세우고 앞으로 나아가는 데 에너지를 많이 쓰는 편이라, 늘 다음 목표를 찾고 있어요.',
    lacking: '새로운 걸 시작할 때 **첫발을 떼는 데 시간이 걸릴 수** 있어요. 작은 목표부터 하나씩 세워 보면 흐름이 훨씬 가벼워져요.',
    useHeading: '시작하는 자리에서\n가장 빛나요',
    use: '새 프로젝트, 첫 모임처럼 **무언가를 처음 여는 자리**에서 기운이 살아나요. 계획을 세우고 사람들에게 방향을 보여 주는 역할을 맡아 보세요.',
    fill: '**산책, 식물 키우기, 아침 시간 활용**이 나무 기운을 채워 줘요. 새로운 걸 배우기 시작하는 것도 좋아요.',
    over: '의욕이 넘쳐서 **이것저것 벌여 놓고 마무리를 놓치기** 쉬워요. 시작한 일 세 개 중 하나는 꼭 끝내는 걸 목표로 해 보세요.',
    tired: '괜히 **조급해지고 모든 게 답답하게** 느껴진다면 기운이 꺾였다는 신호예요. 속도를 줄이고 몸을 쭉 펴 주는 시간을 가져 보세요.',
    friendHeading: '앞장서는\n든든한 기둥',
    friend: '모임에서 **먼저 계획을 세우고 이끄는 사람**이에요. 친구들의 성장을 진심으로 응원해서, 고민 상담 1순위로 꼽혀요.',
    lucky: { colorName: '민트 그린', color: '#5effc7', number: '3 · 8', direction: '동쪽', item: '작은 화분', place: '공원 · 숲길', time: '아침 5~9시' },
  },
  fire: {
    strong: '**표현하고 드러내려는 힘**이 강해요. 감정과 열정이 뜨겁고 반응이 빨라서, 어디서든 존재감이 또렷하게 느껴져요.',
    lacking: '마음은 있어도 **겉으로 표현하는 걸 아끼는 편**이에요. 좋아하는 걸 좋다고 먼저 말해 보는 연습이 기운을 채워 줘요.',
    useHeading: '보여 주고 말할 때\n가장 빛나요',
    use: '발표, 기록, 콘텐츠처럼 **나를 드러내는 일**에서 기운이 살아나요. 생각만 하지 말고 밖으로 꺼내는 순간 에너지가 몇 배로 커져요.',
    fill: '**햇볕 쬐기, 땀 나는 운동, 좋아하는 사람 만나기**가 불 기운을 채워 줘요. 밝은 조명과 따뜻한 색 옷도 도움이 돼요.',
    over: '감정이 빨리 달아오르는 만큼 **말이 먼저 나가는 순간**이 있어요. 화가 날 땐 바로 답장하지 말고 한 템포 쉬어 가요.',
    tired: '웃음이 줄고 **아무것도 하기 싫어진다면** 불씨가 약해졌다는 신호예요. 좋아하는 사람과 수다 한 판이 가장 빠른 충전법이에요.',
    friendHeading: '분위기를 띄우는\n무드 메이커',
    friend: '있기만 해도 **대화가 살아나는 사람**이에요. 리액션이 크고 솔직해서, 친구들은 기분 좋은 일이 생기면 제일 먼저 알려 줘요.',
    lucky: { colorName: '핫 핑크', color: '#ff39c7', number: '2 · 7', direction: '남쪽', item: '향초 · 무드등', place: '햇살 좋은 카페', time: '한낮 11~13시' },
  },
  earth: {
    strong: '**지키고 버티는 힘**이 커요. 쉽게 흔들리지 않고 책임감이 강해서, 주변에서 믿고 기대는 사람이 많아요.',
    lacking: '에너지가 이리저리 흩어지기 쉬워요. **규칙적인 루틴과 쉴 곳**을 만들어 두면 중심이 훨씬 단단해져요.',
    useHeading: '꾸준히 쌓을 때\n가장 빛나요',
    use: '매일 조금씩 이어 가는 **루틴과 기록**에서 기운이 살아나요. 사람과 일을 연결하고 중재하는 역할도 잘 어울려요.',
    fill: '**규칙적인 식사와 잠, 정돈된 공간**이 흙 기운을 채워 줘요. 요리나 도자기처럼 손으로 만드는 일도 좋아요.',
    over: '익숙한 걸 지키려다 **변화를 늦게 받아들일 수** 있어요. 가끔은 계획에 없던 선택도 해 보면 의외의 기회가 열려요.',
    tired: '**모든 걸 혼자 짊어지고 있다는 느낌**이 든다면 쉬어야 할 때예요. 부탁하는 것도 능력이라는 걸 기억해요.',
    friendHeading: '언제 가도 있는\n편안한 쉼터',
    friend: '**말없이 곁을 지켜 주는 사람**이에요. 약속을 잘 지키고 변함이 없어서, 오래 알수록 진가가 드러나요.',
    lucky: { colorName: '선셋 오렌지', color: '#ff5500', number: '5 · 10', direction: '중앙', item: '도자기 머그', place: '텃밭 · 정원', time: '늦은 오후' },
  },
  metal: {
    strong: '**정리하고 결단하는 힘**이 강해요. 기준이 분명하고 맺고 끊음이 확실해서, 복잡한 상황을 깔끔하게 정리해 내요.',
    lacking: '결정을 미루거나 **거절을 어려워할 수** 있어요. 기준을 미리 정해 두고 "여기까지"를 말하는 연습이 도움이 돼요.',
    useHeading: '정리하고 마무리할 때\n가장 빛나요',
    use: '흩어진 걸 **정리하고 끝맺는 일**에서 기운이 살아나요. 기준을 세우고 결정을 내려 주는 역할을 맡으면 존재감이 확 커져요.',
    fill: '**책상 정리, 계획표 쓰기, 안 쓰는 물건 비우기**가 금 기운을 채워 줘요. 반짝이는 액세서리를 하나 챙기는 것도 좋아요.',
    over: '기준이 높아서 **나와 남에게 날카로워지는** 순간이 있어요. 완벽보다 "이 정도면 충분해"를 허락하는 연습이 필요해요.',
    tired: '사소한 일에도 **예민하고 날이 선다면** 기운이 과열됐다는 신호예요. 혼자 조용히 정리하는 시간이 꼭 필요해요.',
    friendHeading: '할 말은 하는\n의리파',
    friend: '**정확하고 공정한 사람**이에요. 듣기 좋은 말보다 필요한 말을 해 주고, 내 사람이라면 끝까지 편을 들어 줘요.',
    lucky: { colorName: '네온 라임', color: '#c7f957', number: '4 · 9', direction: '서쪽', item: '실버 액세서리', place: '서점 · 전시장', time: '저녁 17~19시' },
  },
  water: {
    strong: '**생각하고 흡수하는 힘**이 커요. 감수성이 풍부하고 머리 회전이 빨라서, 겉보다 속에서 많은 일이 일어나는 타입이에요.',
    lacking: '쉬지 않고 달리다 **생각을 정리할 틈을 놓치기** 쉬워요. 하루 10분이라도 혼자 머무는 시간이 기운을 채워 줘요.',
    useHeading: '깊이 파고들 때\n가장 빛나요',
    use: '공부, 리서치, 대화처럼 **깊게 이해하는 일**에서 기운이 살아나요. 흐름을 읽고 전략을 짜는 역할이 특히 잘 맞아요.',
    fill: '**물 자주 마시기, 반신욕, 혼자만의 생각 시간**이 물 기운을 채워 줘요. 일기 쓰기나 음악 듣기도 큰 도움이 돼요.',
    over: '생각이 많아서 **걱정이 꼬리에 꼬리를 무는** 때가 있어요. 고민이 길어지면 일단 몸을 움직여서 흐름을 끊어 주세요.',
    tired: '**잠이 늘거나 혼자 숨고 싶어진다면** 마음이 지쳤다는 신호예요. 억지로 버티기보다 푹 쉬고 다시 흐르면 돼요.',
    friendHeading: '속 깊은\n공감 요정',
    friend: '**이야기를 끝까지 들어 주는 사람**이에요. 상대의 마음을 빨리 읽어서, 말하지 않아도 알아주는 친구로 통해요.',
    lucky: { colorName: '아쿠아 블루', color: '#13e2ff', number: '1 · 6', direction: '북쪽', item: '텀블러 · 향수', place: '바다 · 강가', time: '밤 21~23시' },
  },
}

const fill = (text: string, vars: Record<string, string>) => text.replace(/\{(\w)\}/g, (_, k: string) => vars[k] ?? '')

export function buildReport(saju: Saju): Report {
  const core = STEMS[saju.dayStem].element
  const surround = surroundingElement(saju)
  const strongest = strongestElement(saju)
  const needed = neededElement(saju)
  const relation = relationTo(core, surround)
  const stemType = STEM_TYPES[saju.dayStem]
  const min = Math.min(...ELEMENTS.map((e) => saju.counts[e]))
  // 가장 적은 기운: 채우면 좋은 기운이 가장 적은 쪽이면 그걸, 아니면 첫 번째로
  const weakest = saju.counts[needed] === min ? needed : ELEMENTS.find((e) => saju.counts[e] === min)!
  const L = BY_ELEMENT[needed].lucky

  return {
    typeName: stemType.name,
    core,
    surround,
    strongest,
    needed,
    lucky: {
      color: L.color,
      items: [
        { label: '행운 색', value: L.colorName },
        { label: '행운 숫자', value: L.number },
        { label: '방향', value: L.direction },
        { label: '아이템', value: L.item },
        { label: '장소', value: L.place },
        { label: '시간', value: L.time },
      ],
    },
    sections: [
      {
        key: 'elements',
        title: ['Five', 'Elements'],
        ko: '나의 오행',
        color: '#ff39c7',
        tags: [`${ELEMENT_META[strongest].ko} 기운 최다`, min === 0 ? `${ELEMENT_META[weakest].ko} 기운 0` : `${ELEMENT_META[weakest].ko} 기운 부족`],
        blocks: [
          { heading: `${elementLabel(strongest)} 기운이\n가장 많아요`, body: BY_ELEMENT[strongest].strong },
          {
            heading: min === 0 ? `${elementLabel(weakest)} 기운은\n비어 있어요` : `${elementLabel(weakest)} 기운이\n조금 부족해요`,
            body: BY_ELEMENT[weakest].lacking,
          },
        ],
      },
      {
        key: 'personality',
        title: ['My', 'Personality'],
        ko: '핵심 성향',
        color: '#ffa1f7',
        tags: [`${ELEMENT_META[core].ko}의중심`, RELATION_TEXT[relation].tag],
        blocks: [
          { heading: IMAGERY[core][surround], body: fill(RELATION_TEXT[relation].body, { D: elementLabel(core), S: elementLabel(surround) }) },
          { heading: stemType.heading, body: stemType.body },
        ],
      },
      {
        key: 'guide',
        title: ['Energy', 'Guide'],
        ko: '내 기운 사용법',
        color: '#13e2ff',
        tags: [`${ELEMENT_META[core].ko} 기운 쓰기`, `${ELEMENT_META[needed].ko} 기운 채우기`],
        blocks: [
          { heading: BY_ELEMENT[core].useHeading, body: BY_ELEMENT[core].use },
          { heading: `${elementLabel(needed)} 기운을\n채워 보세요`, body: BY_ELEMENT[needed].fill },
        ],
      },
      {
        key: 'caution',
        title: ['Caution'],
        ko: '주의 포인트',
        color: '#5effc7',
        tags: [`${ELEMENT_META[strongest].ko} 기운 과열 주의`, '충전 신호'],
        blocks: [
          { heading: `${ELEMENT_META[strongest].ko} 기운이 넘칠 땐\n이것만 조심해요`, body: BY_ELEMENT[strongest].over },
          { heading: '지칠 땐\n이런 신호가 와요', body: BY_ELEMENT[core].tired },
        ],
      },
      {
        key: 'relationships',
        title: ['Relationships'],
        ko: '관계 속 나',
        color: '#ff5500',
        tags: ['친구들이 보는 나', `찰떡 기운 ${ELEMENT_META[needed].ko}`],
        blocks: [
          { heading: BY_ELEMENT[core].friendHeading, body: BY_ELEMENT[core].friend },
          {
            heading: `${elementLabel(needed)} 기운 친구와\n찰떡이에요`,
            body: `내 사주에서 아쉬운 ${elementLabel(needed)} 기운이 강한 친구는 **나에게 없는 걸 자연스럽게 채워 주는** 사람이에요. 함께 있으면 마음이 편하고 일도 술술 풀려요.\n기운이 떨어진 날엔 이 친구에게 먼저 연락해 보세요.`,
          },
        ],
      },
      {
        key: 'lucky',
        title: ['Lucky', 'Points'],
        ko: '행운 포인트',
        color: '#c7f957',
        tags: [`${L.colorName}`, `${L.direction}`],
        blocks: [
          {
            heading: `${elementLabel(needed)} 기운이\n행운을 불러요`,
            body: `행운 포인트는 내 사주에서 **가장 채우고 싶은 ${elementLabel(needed)} 기운**을 기준으로 골랐어요.\n중요한 날엔 행운 색을 옷이나 소품에 한 군데 더해 보세요. 작은 것 하나가 하루의 흐름을 바꿔 줘요.`,
          },
        ],
      },
    ],
  }
}
