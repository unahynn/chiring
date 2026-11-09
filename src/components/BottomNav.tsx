import type { ComponentType } from 'react'
import { FrequencyIcon, FriendsIcon, HomeIcon, MyLuckIcon } from './icons'
import './BottomNav.css'

export type TabKey = 'home' | 'myluck' | 'friends' | 'frequency'

const TABS: { key: TabKey; label: string; Icon: ComponentType }[] = [
  { key: 'home', label: '홈', Icon: HomeIcon },
  { key: 'myluck', label: '아카이브', Icon: MyLuckIcon },
  { key: 'friends', label: '친구방', Icon: FriendsIcon },
  { key: 'frequency', label: '기운 충전', Icon: FrequencyIcon },
]

type Props = {
  active: TabKey
  onChange: (tab: TabKey) => void
}

/** 하단 탭바 + 홈 인디케이터 */
export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className={`bottom-nav bottom-nav--${active}`}>
      <ul className="bottom-nav__list">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = key === active
          return (
            <li key={key}>
              <button
                className={`bottom-nav__item${isActive ? ' is-active' : ''}`}
                onClick={() => onChange(key)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon />
                <span>{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="home-indicator" />
    </nav>
  )
}
