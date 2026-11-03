import { useState } from 'react'
import BottomNav, { type TabKey } from './components/BottomNav'
import FriendsRoom from './screens/FriendsRoom'

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ minHeight: 700, display: 'grid', placeItems: 'center', color: '#6e767c' }}>
      {label} 화면은 곧 만들 예정이에요
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('friends')

  return (
    <div className="phone">
      {tab === 'friends' && <FriendsRoom />}
      {tab === 'home' && <ComingSoon label="홈" />}
      {tab === 'myluck' && <ComingSoon label="내 행운" />}
      {tab === 'frequency' && <ComingSoon label="주파수" />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
