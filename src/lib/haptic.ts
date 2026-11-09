/**
 * 짧은 진동(햅틱)
 * - 안드로이드 등: navigator.vibrate
 * - 아이폰 사파리(iOS 18 이상): vibrate가 없어서, 스위치 모양 체크박스를 눌렀을 때 나는
 *   시스템 햅틱을 빌려 써요. 화면에 안 보이는 스위치를 잠깐 만들어 눌렀다가 바로 지워요.
 * 지원하지 않는 기기에서는 아무 일도 안 일어나요.
 */
let label: HTMLLabelElement | null = null

function iosTick() {
  if (typeof document === 'undefined') return
  if (!label) {
    label = document.createElement('label')
    label.ariaHidden = 'true'
    label.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    input.tabIndex = -1
    label.appendChild(input)
    document.body.appendChild(label)
  }
  label.click()
}

const canVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

/** 톡 — 가벼운 한 번 */
export function hapticTick(ms = 8) {
  if (canVibrate()) navigator.vibrate(ms)
  else iosTick()
}

/** 두두둥 — 다 됐을 때 */
export function hapticSuccess() {
  if (canVibrate()) {
    navigator.vibrate([30, 60, 30, 60, 60])
    return
  }
  iosTick()
  setTimeout(iosTick, 90)
  setTimeout(iosTick, 180)
}
