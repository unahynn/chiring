import { useState } from 'react'
import BottomNav, { type TabKey } from './components/BottomNav'
import FriendsRoom from './screens/FriendsRoom'
import Story from './screens/Story'
import { MOMENTS } from './data/moments'

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ minHeight: 700, display: 'grid', placeItems: 'center', color: '#6e767c' }}>
      {label} 화면은 곧 만들 예정이에요
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('friends')
  /** 열려 있는 스토리(Lucky Moments 카드). 열려 있으면 탭바 없이 스토리 화면만 보여요. */
  const [storyId, setStoryId] = useState<string | null>(null)
  const story = MOMENTS.find((m) => m.id === storyId)

  if (story) {
    return (
      <div className="phone">
        <Story key={story.id} moment={story} onBack={() => setStoryId(null)} />
      </div>
    )
  }

  return (
    <div className="phone">
      {tab === 'friends' && <FriendsRoom onOpenMoment={setStoryId} />}
      {tab === 'home' && <ComingSoon label="홈" />}
      {tab === 'myluck' && <ComingSoon label="내 행운" />}
      {tab === 'frequency' && <ComingSoon label="주파수" />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
