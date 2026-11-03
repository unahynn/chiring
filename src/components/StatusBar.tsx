import './StatusBar.css'

/** iOS 상단 상태바 (9:41 · 신호 · 와이파이 · 배터리) */
/** tone='dark': 밝은 배경 위에서 검은 글씨 */
export default function StatusBar({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <div className={`status-bar${tone === 'dark' ? ' status-bar--dark' : ''}`}>
      <span className="status-bar__time">9:41</span>
      <svg width="79" height="13" viewBox="0 0 79 13" fill="currentColor" aria-hidden>
        <rect x="0" y="8" width="3.2" height="4.5" rx="1" />
        <rect x="4.7" y="5.8" width="3.2" height="6.7" rx="1" />
        <rect x="9.4" y="3.4" width="3.2" height="9.1" rx="1" />
        <rect x="14.1" y="1" width="3.2" height="11.5" rx="1" />
        <path d="M29.5 3.2c2.2 0 4.2.8 5.7 2.2l1.1-1.1A9.6 9.6 0 0 0 29.5 1.6a9.6 9.6 0 0 0-6.8 2.7l1.1 1.1a8 8 0 0 1 5.7-2.2Zm0 3.2c1.3 0 2.5.5 3.4 1.3l1.1-1.1a6.4 6.4 0 0 0-4.5-1.8 6.4 6.4 0 0 0-4.5 1.8L26.1 7.7a4.9 4.9 0 0 1 3.4-1.3Zm0 3.2c-.5 0-.9.2-1.2.5l1.2 1.2 1.2-1.2c-.3-.3-.7-.5-1.2-.5Z" />
        <rect x="52.5" y="1" width="23" height="11.5" rx="3.5" fill="none" stroke="currentColor" strokeOpacity=".4" />
        <rect x="54.5" y="3" width="19" height="7.5" rx="2" />
        <path d="M77 4.8v3.9c.8-.3 1.3-1.1 1.3-1.95S77.8 5.1 77 4.8Z" fillOpacity=".5" />
      </svg>
    </div>
  )
}
