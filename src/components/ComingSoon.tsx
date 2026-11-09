/** 아직 만들지 않은 탭 자리 */
export default function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ minHeight: 700, display: 'grid', placeItems: 'center', color: '#6e767c' }}>
      {label} 화면은 곧 만들 예정이에요
    </div>
  )
}
