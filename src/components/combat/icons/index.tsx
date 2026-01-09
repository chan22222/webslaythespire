// Slay the Spire 스타일 SVG 아이콘 컴포넌트들

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// 검 아이콘 (공격)
export function SwordIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M19.5 2L21 3.5L18.5 6L19.5 7L18 8.5L17 7.5L12 12.5L11 11.5L7.5 15L8 18.5L6.5 20L4 17.5L5.5 16L9 15.5L8.5 14L11.5 11L10.5 10L15.5 5L14.5 4L16 2.5L17 3.5L19.5 2Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />
      <path
        d="M6 18L3 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 방패 아이콘 (방어)
export function ShieldIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V5L12 2Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V5L12 2Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M12 5L7 7V11C7 14.5 9 18 12 19.5C15 18 17 14.5 17 11V7L12 5Z"
        fill="rgba(255,255,255,0.15)"
      />
    </svg>
  );
}

// 파워/버프 아이콘
export function PowerIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 2L9 9H2L7.5 13.5L5.5 21L12 16L18.5 21L16.5 13.5L22 9H15L12 2Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />
      <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

// 해골 아이콘 (디버프/독)
export function SkullIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <ellipse cx="12" cy="10" rx="8" ry="8" fill={color} />
      <path d="M8 18V22H10V20H14V22H16V18" fill={color} />
      <ellipse cx="9" cy="9" rx="2" ry="2.5" fill="black" />
      <ellipse cx="15" cy="9" rx="2" ry="2.5" fill="black" />
      <path d="M10 14L12 13L14 14" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 하트 아이콘 (힐)
export function HeartIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
        fill={color}
      />
      <ellipse cx="8" cy="8" rx="2" ry="1.5" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

// 번개 아이콘 (에너지)
export function LightningIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M13 2L4 14H11L10 22L19 10H12L13 2Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 취약 아이콘 (깨진 방패)
export function VulnerableIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 2L20 5V11C20 14 18.5 17 16 19"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeDasharray="3 2"
      />
      <path d="M10 8L14 16M14 8L10 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 약화 아이콘
export function WeakIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 2C12 2 8 6 8 10C8 14 12 18 12 18C12 18 16 14 16 10C16 6 12 2 12 2Z"
        fill={color}
        opacity="0.3"
      />
      <path
        d="M12 6V14M9 11L15 11"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M7 19L17 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M9 22L15 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 힘 아이콘 (주먹)
export function StrengthIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M5 12V18C5 19.1 5.9 20 7 20H8C9.1 20 10 19.1 10 18V14"
        fill={color}
      />
      <path
        d="M10 10V8C10 6.9 10.9 6 12 6C13.1 6 14 6.9 14 8V10"
        fill={color}
      />
      <path
        d="M14 10V7C14 5.9 14.9 5 16 5C17.1 5 18 5.9 18 7V12"
        fill={color}
      />
      <path
        d="M18 12V8C18 6.9 18.9 6 20 6C21.1 6 22 6.9 22 8V16C22 19.3 19.3 22 16 22H10C7.2 22 5 19.8 5 17"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <circle cx="8" cy="4" r="2" fill={color} />
      <path d="M6 6L4 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 4L12 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 민첩 아이콘
export function DexterityIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8L12 2Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <circle cx="12" cy="10" r="2" fill={color} />
    </svg>
  );
}

// 독 아이콘
export function PoisonIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M9 3H15V6C15 6 18 7 18 11V14C18 18 15 20 12 21C9 20 6 18 6 14V11C6 7 9 6 9 6V3Z"
        fill={color}
        opacity="0.8"
      />
      <circle cx="9" cy="11" r="1.5" fill="black" />
      <circle cx="15" cy="11" r="1.5" fill="black" />
      <path d="M9 15C9 15 10.5 17 12 17C13.5 17 15 15 15 15" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="1.5" r="1" fill={color} />
    </svg>
  );
}
