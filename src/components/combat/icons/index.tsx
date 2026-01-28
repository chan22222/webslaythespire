// Shuffle & Slash 스타일 SVG 아이콘 컴포넌트들

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

// 약화 아이콘 (깨진 검 형태)
export function WeakIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 역삼각형 - 불안정함 표현 */}
      <path
        d="M12 22 L3 8 L7 3 L12 5 L17 3 L21 8 Z"
        fill={color}
        opacity="0.9"
      />
      {/* 금간 자국 */}
      <path
        d="M12 6 L11 10 L9 11 L10.5 14 L8 17 L10 18 L12 21"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M12 6 L13 9 L15 10.5 L13.5 13 L16 16 L14 17.5 L12 21"
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      {/* 하강 화살표 */}
      <path
        d="M12 9 L10 13 L11 13 L11 16 L13 16 L13 13 L14 13 Z"
        fill="rgba(255,255,255,0.9)"
      />
    </svg>
  );
}

// 힘 아이콘 (상승 불꽃 - BuffIntent와 동일 스타일)
export function StrengthIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 불꽃 형태 */}
      <path
        d="M12 2 L15 8 L18 6 L16 12 L20 14 L15 17 L17 22 L12 19 L7 22 L9 17 L4 14 L8 12 L6 6 L9 8 Z"
        fill={color}
        opacity="0.9"
      />
      {/* 내부 코어 */}
      <ellipse cx="12" cy="13" rx="3" ry="4" fill="rgba(255,255,255,0.4)" />
      {/* 상승 화살표 */}
      <path
        d="M12 8 L14.5 12 L13 12 L13 16 L11 16 L11 12 L9.5 12 Z"
        fill="rgba(255,255,255,0.95)"
      />
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

// 독 아이콘 (동그란 물약병)
export function PoisonIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 물약병 목 */}
      <rect x="10" y="2" width="4" height="4" fill={color} rx="0.5" />
      {/* 물약병 마개 */}
      <rect x="9.5" y="1" width="5" height="2" fill={color} opacity="0.7" rx="1" />
      {/* 동그란 물약병 몸체 */}
      <circle cx="12" cy="14" r="8" fill={color} opacity="0.9" />
      {/* 물약 내용물 하이라이트 */}
      <ellipse cx="10" cy="12" rx="2.5" ry="2" fill="rgba(255,255,255,0.3)" />
      {/* 거품 */}
      <circle cx="14" cy="11" r="1" fill="rgba(255,255,255,0.4)" />
      <circle cx="15.5" cy="13" r="0.7" fill="rgba(255,255,255,0.3)" />
      <circle cx="9" cy="15" r="0.5" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
}

// 금속화 아이콘 (철 갑옷/금속 방패)
export function MetallicizeIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 금속 방패 기본 형태 */}
      <path
        d="M12 2L4 6V12C4 17 7.5 21 12 22C16.5 21 20 17 20 12V6L12 2Z"
        fill={color}
        opacity="0.9"
      />
      {/* 금속 광택 효과 */}
      <path
        d="M12 3L6 6.5V12C6 15.5 8.5 19 12 20"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* 리벳/볼트 장식 */}
      <circle cx="8" cy="9" r="1.2" fill="rgba(255,255,255,0.6)" />
      <circle cx="16" cy="9" r="1.2" fill="rgba(255,255,255,0.6)" />
      <circle cx="12" cy="14" r="1.2" fill="rgba(255,255,255,0.6)" />
      {/* 중앙 금속 엠블럼 */}
      <path
        d="M12 7L14 10H10L12 7Z"
        fill="rgba(255,255,255,0.4)"
      />
      <path
        d="M10 10L12 17L14 10"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

// 치유 감소 아이콘 (깨진 하트)
export function HealReductionIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 하트 */}
      <path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
        fill={color}
        opacity="0.6"
      />
      {/* X 표시 */}
      <path
        d="M8 8L16 16M16 8L8 16"
        stroke="rgba(0,0,0,0.8)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M8 8L16 16M16 8L8 16"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 무적 아이콘 (빛나는 방패)
export function InvulnerableIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 빛나는 후광 */}
      <circle cx="12" cy="12" r="10" fill={color} opacity="0.2" />
      {/* 방패 기본 형태 */}
      <path
        d="M12 3L5 6V11C5 15.5 8 19.5 12 21C16 19.5 19 15.5 19 11V6L12 3Z"
        fill={color}
        opacity="0.95"
      />
      {/* 방패 테두리 광택 */}
      <path
        d="M12 4L6.5 6.5V11C6.5 14.5 9 18 12 19.5"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1"
        fill="none"
      />
      {/* 중앙 별 모양 */}
      <path
        d="M12 7L13 10L16 10L13.5 12L14.5 15L12 13L9.5 15L10.5 12L8 10L11 10Z"
        fill="rgba(255,255,255,0.9)"
      />
    </svg>
  );
}

// 다음 턴 블록 아이콘 (방패 + 시계)
export function BlockNextTurnIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 방패 */}
      <path
        d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V5L12 2Z"
        fill={color}
        opacity="0.9"
      />
      {/* 시계 */}
      <circle cx="12" cy="11" r="5" fill="rgba(255,255,255,0.9)" />
      <circle cx="12" cy="11" r="4" fill="rgba(0,0,0,0.2)" />
      {/* 시계 바늘 */}
      <path d="M12 8V11L14 13" stroke="rgba(0,0,0,0.8)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 블록 유지 아이콘 (방패 + 고리)
export function BlockRetainIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 방패 */}
      <path
        d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V5L12 2Z"
        fill={color}
        opacity="0.9"
      />
      {/* 무한 기호/고리 */}
      <path
        d="M8 11C8 9 10 9 12 11C14 13 16 13 16 11C16 9 14 9 12 11C10 13 8 13 8 11Z"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

// 불사 아이콘 (불꽃 해골)
export function UndyingIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 불꽃 */}
      <path
        d="M12 1C14 4 17 5 17 9C17 11 15 13 15 13C16 11 15 9 14 8C14 10 12 12 12 12C12 10 10 8 10 8C9 9 8 11 9 13C9 13 7 11 7 9C7 5 10 4 12 1Z"
        fill={color}
        opacity="0.9"
      />
      {/* 해골 */}
      <ellipse cx="12" cy="16" rx="5" ry="5" fill="rgba(255,255,255,0.95)" />
      <ellipse cx="10" cy="15" rx="1.2" ry="1.5" fill="rgba(0,0,0,0.8)" />
      <ellipse cx="14" cy="15" rx="1.2" ry="1.5" fill="rgba(0,0,0,0.8)" />
      <path d="M10 18.5L12 18L14 18.5" stroke="rgba(0,0,0,0.8)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// 공격 시 블록 획득 아이콘 (검 + 방패)
export function GainBlockOnAttackIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 검 */}
      <path
        d="M4 2L6 4L4 6L6 8L14 8L16 6L14 4L6 4L4 2Z"
        fill={color}
        opacity="0.9"
        transform="rotate(-45 10 6)"
      />
      {/* 방패 */}
      <path
        d="M14 10L10 12V16C10 19 12 21 14 22C16 21 18 19 18 16V12L14 10Z"
        fill={color}
        opacity="0.9"
      />
      {/* 화살표 */}
      <path
        d="M7 14L10 11"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 가시 아이콘 (가시 달린 방패)
export function ThornsIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 방패 */}
      <path
        d="M12 4L6 7V12C6 16 8.5 19 12 21C15.5 19 18 16 18 12V7L12 4Z"
        fill={color}
        opacity="0.9"
      />
      {/* 가시들 */}
      <path d="M4 8L7 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M3 12L6 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M4 16L7 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M20 8L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M21 12L18 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M20 16L17 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 기름 표시 아이콘 (기름통)
export function OilMarkedIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 기름통 몸체 */}
      <rect x="5" y="6" width="14" height="16" rx="2" fill={color} opacity="0.9" />
      {/* 기름통 상단 */}
      <rect x="7" y="3" width="10" height="4" rx="1" fill={color} opacity="0.8" />
      {/* 기름 방울 */}
      <path
        d="M12 10C12 10 9 14 9 16C9 18 10.5 19 12 19C13.5 19 15 18 15 16C15 14 12 10 12 10Z"
        fill="rgba(255,255,255,0.8)"
      />
      {/* 불꽃 표시 */}
      <path
        d="M17 4L19 2L20 4L19 6L17 4Z"
        fill="#ff6b6b"
      />
    </svg>
  );
}

// 공격 봉인 아이콘 (봉인된 검)
export function AttackDisabledIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 검 */}
      <path
        d="M19.5 2L21 3.5L18.5 6L19.5 7L18 8.5L17 7.5L12 12.5L11 11.5L7.5 15L8 18.5L6.5 20L4 17.5L5.5 16L9 15.5L8.5 14L11.5 11L10.5 10L15.5 5L14.5 4L16 2.5L17 3.5L19.5 2Z"
        fill={color}
        opacity="0.5"
      />
      {/* 금지 원 */}
      <circle cx="12" cy="12" r="9" stroke="#ff4444" strokeWidth="2.5" fill="none" />
      <path d="M6 6L18 18" stroke="#ff4444" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 블록을 피해로 전환 아이콘
export function BlockToDamageIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* 방패 */}
      <path
        d="M6 3L2 5V9C2 12 4 15 6 16"
        fill={color}
        opacity="0.9"
      />
      {/* 화살표 */}
      <path
        d="M9 10L15 10M15 10L12 7M15 10L12 13"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 검 */}
      <path
        d="M18 4L22 8L20 10L18 8L16 10L14 8L18 4Z"
        fill="#ff6b6b"
      />
      <path d="M14 14L18 18" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
