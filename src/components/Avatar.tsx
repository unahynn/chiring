import type { AvatarCrop } from '../data/moments'
import './Avatar.css'

type Props = {
  src: string
  crop?: AvatarCrop
  /** 원 크기(px). 크롭 값은 32px 기준이라 크기에 맞춰 늘려요. */
  size?: number
  className?: string
}

export default function Avatar({ src, crop, size = 32, className = '' }: Props) {
  const k = size / 32
  const style = crop
    ? { left: crop.left * k, top: crop.top * k, width: crop.width * k, height: crop.height * k }
    : undefined
  return (
    <span className={`avatar ${className}`} style={{ width: size, height: size }}>
      <img src={src} alt="" style={style} draggable={false} />
    </span>
  )
}
