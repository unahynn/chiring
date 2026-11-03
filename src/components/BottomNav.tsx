import homeIcon from '../assets/friends/nav-home.png'
import myLuckIcon from '../assets/friends/nav-myluck.png'
import friendsIcon from '../assets/friends/nav-friends.png'
import frequencyIcon from '../assets/friends/nav-frequency.png'
import './BottomNav.css'

export type TabKey = 'home' | 'myluck' | 'friends' | 'frequency'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'home', label: '홈', icon: homeIcon },
  { key: 'myluck', label: '내 행운', icon: myLuckIcon },
  { key: 'friends', label: '친구방', icon: friendsIcon },
  { key: 'frequency', label: '주파수', icon: frequencyIcon },
]

type Props = {
  active: TabKey
  onChange: (tab: TabKey) => void
}

/** 하단 탭바 + 홈 인디케이터 */
export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      <ul className="bottom-nav__list">
        {TABS.map((tab) => {
          const isActive = tab.key === active
          return (
            <li key={tab.key}>
              <button
                className={`bottom-nav__item${isActive ? ' is-active' : ''}`}
                onClick={() => onChange(tab.key)}
                aria-current={isActive ? 'page' : undefined}
              >
                <img src={tab.icon} alt="" width={28} height={28} />
                <span>{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="home-indicator" />
    </nav>
  )
}
