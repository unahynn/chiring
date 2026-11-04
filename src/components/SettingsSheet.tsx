import BottomSheet from './BottomSheet'
import { CloseIcon } from './icons'
import './SettingsSheet.css'

type Item = { label: string; onClick: () => void; danger?: boolean }

/** 톱니바퀴(설정)를 누르면 올라오는 간단한 메뉴 */
export default function SettingsSheet({ open, onClose, items }: { open: boolean; onClose: () => void; items: Item[] }) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      tone="light"
      label="설정"
      className="settings-sheet"
      header={
        <div className="settings-sheet__head">
          <h2>설정</h2>
          <button className="settings-sheet__close" onClick={onClose} aria-label="닫기">
            <CloseIcon />
          </button>
        </div>
      }
    >
      <ul className="settings-sheet__list">
        {items.map((it) => (
          <li key={it.label}>
            <button
              className={it.danger ? 'is-danger' : undefined}
              onClick={() => {
                onClose()
                it.onClick()
              }}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="settings-sheet__bottom">
        <div className="home-indicator" />
      </div>
    </BottomSheet>
  )
}
