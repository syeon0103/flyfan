import React from 'react'

interface FandomIconProps {
  /** 아이돌 대표 색상 (hex) */
  color?: string
  /** 아이콘 너비 (height는 비율에 맞게 자동 계산) */
  size?: number
  className?: string
}

/**
 * 팬덤 다이아몬드 아이콘
 * 모든 아이돌에 통일 적용, color prop으로 아이돌별 색상 설정
 */
export default function FandomIcon({ color = '#FFA33B', size = 24, className }: FandomIconProps) {
  // 원본 비율 25 × 22
  const height = Math.round(size * (22 / 25))

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 25 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8.53125 6.5625L11.8438 0H12.2188L15.5312 6.5625H8.53125ZM11.0938 21.375L0.3125 8.4375H11.0938V21.375ZM12.9688 21.375V8.4375H23.75L12.9688 21.375ZM17.5938 6.5625L14.3438 0H20.7812L24.0625 6.5625H17.5938ZM0 6.5625L3.28125 0H9.71875L6.46875 6.5625H0Z"
        fill={color}
      />
    </svg>
  )
}
