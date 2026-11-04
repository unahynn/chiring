// 피그마에서 그대로 내보낸 아이콘이에요. 색은 글자색(currentColor)을 따라가요.
type IconProps = { size?: number }

export function HomeIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M13.0098 3H15.0116V4.45584H16.0125V6.06766H17.0134V7.17687H18.0142V8.28609H19.0151V9.3953H20.016V10.5045H21.0169V11.6137H22.0178V12.7229H23.0187V13.8321H24.0196V14.9414H25.0205V16.0506H26.0214V17.1598H21.7752V25.9295H17.0134V19.3782H11.008V25.9295H6.36752V17.1598H2V16.0506H3.00089V14.9414H4.00178V13.8321H5.00267V12.7229H6.00356V11.6137H7.00445V10.5045H8.00534V9.3953H9.00623V8.28609H10.0071V7.17687H11.008V6.06766H12.0089V4.45584H13.0098V3Z" />
      <rect x="9.03906" y="16.4648" width="10.1909" height="9.46296" />
    </svg>
  )
}

export function MyLuckIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="currentColor" aria-hidden>
      <path d="M15 13H13V11H11V9H9V3L13 3V5H15V3H19V9H17V11H15V13ZM15 13H17V11H19V9H25V13H23V15H25V19H19V17H17V15H15V13ZM9 19H3V15H5V13H3L3 9H9V11H11V13H13V15H11V17H9V19ZM9 19H11V17H13V15H15V17H17V19H19V25H15V23H13V25H9V19Z" />
    </svg>
  )
}

export function FriendsIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.4116 3H16.9702V3.93174H17.8967V4.86348H18.8231V5.79521H19.7495V10.4539H18.8231V11.3856H17.8967V12.3174H16.9702V13.2491H11.4116V12.3174H10.4851V11.3856H9.55866V10.4539H8.63222V5.79521H9.55866V4.86348H10.4851V3.93174H11.4116V3ZM11.4116 15.1126H16.9702V16.0443H18.8231V16.9761H20.676V17.9078H21.6024V18.8395H22.5289V19.7713H23.4553V21.6348H24.3818V26.2934H23.4553V26.2094H4.92644V26.2934H4V21.6348H4.92644V19.7713H5.85289V18.8395H6.77933V17.9078H7.70578V16.9761H9.55866V16.0443H11.4116V15.1126Z" />
    </svg>
  )
}

export function FrequencyIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M13.2322 0H15.2744V5.06944H16.2955V9.125H20.38V11.1528H19.3589V12.1667H22.4222V13.1806H26.5066V15.2083H22.4222V16.2222H19.3589V17.2361H20.38V19.2639H16.2955V23.3194H15.2744V28H13.2322V23.3194H12.2111V19.2639H8.12666V17.2361H9.14777V16.2222H6.08444V15.2083H2V13.1806H6.08444V12.1667H9.14777V11.1528H8.12666V9.125H12.2111V5.06944H13.2322V0Z" />
    </svg>
  )
}

export function CaretLeftIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path d="M17.5 22.7422L8.75 13.9922L17.5 5.24219" stroke="currentColor" strokeWidth="1.47826" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CloverIcon({ size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 17 17" fill="currentColor" aria-hidden>
      <path d="M9 7.5H7.5V6H6V4.5H4.5V0H7.5V1.5H9V0H12V4.5H10.5V6H9V7.5ZM9 7.5H10.5V6H12V4.5H16.5V7.5H15V9H16.5V12H12V10.5H10.5V9H9V7.5ZM4.5 12H0V9H1.5V7.5H0V4.5H4.5V6H6V7.5H7.5V9H6V10.5H4.5V12ZM4.5 12H6V10.5H7.5V9H9V10.5H10.5V12H12V16.5H9V15H7.5V16.5H4.5V12Z" />
    </svg>
  )
}

export function CaretRightIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M7.5 3.75 13.75 10 7.5 16.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CloseIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 2.5 13.5 13.5M13.5 2.5 2.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function PencilIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M14.2 2.6a2.2 2.2 0 0 1 3.1 3.1L8 15l-4.3 1.3a.5.5 0 0 1-.6-.6L4.4 11.4l9.8-8.8Z" />
    </svg>
  )
}

export function CameraIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M4.5 9.5A2.5 2.5 0 0 1 7 7h2.6l1.6-2.2c.3-.4.7-.6 1.2-.6h3.2c.5 0 .9.2 1.2.6L18.4 7H21a2.5 2.5 0 0 1 2.5 2.5V20a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 20V9.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="14" cy="14.6" r="4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function SettingsIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  )
}
