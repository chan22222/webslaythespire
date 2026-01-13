import { NodeType } from '../../types/map';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// 적 아이콘 - 검 두 개 교차
export function EnemyIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 2L17 12L7 22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 2L7 12L17 22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 엘리트 아이콘 - 해골
export function EliteIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="10" r="7" stroke={color} strokeWidth="2" />
      <circle cx="9" cy="9" r="1.5" fill={color} />
      <circle cx="15" cy="9" r="1.5" fill={color} />
      <path d="M9 13L12 15L15 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 17V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M9 19H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 보스 아이콘 - 왕관
export function BossIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 18L5 8L9 12L12 4L15 12L19 8L21 18H3Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 21H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="14" r="1" fill={color} />
      <circle cx="8" cy="14" r="1" fill={color} />
      <circle cx="16" cy="14" r="1" fill={color} />
    </svg>
  );
}

// 휴식 아이콘 - 모닥불
export function RestIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3C12 3 8 7 8 11C8 14 10 16 12 16C14 16 16 14 16 11C16 7 12 3 12 3Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10C12 10 10 12 10 13.5C10 14.5 11 15 12 15C13 15 14 14.5 14 13.5C14 12 12 10 12 10Z"
        fill={color}
      />
      <path d="M6 20L8 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 20L16 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M10 20L11 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M14 20L13 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 상점 아이콘 - 동전 더미
export function ShopIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="17" rx="7" ry="3" stroke={color} strokeWidth="2" />
      <ellipse cx="12" cy="13" rx="7" ry="3" stroke={color} strokeWidth="2" />
      <ellipse cx="12" cy="9" rx="7" ry="3" stroke={color} strokeWidth="2" />
      <path d="M12 6V8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M9 7L9.5 8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 7L14.5 8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 이벤트 아이콘 - 물음표
export function EventIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path
        d="M9 9C9 7.5 10.5 6 12 6C13.5 6 15 7 15 9C15 10.5 13.5 11 12 12V14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill={color} />
    </svg>
  );
}

// 보물 아이콘 - 보물상자
export function TreasureIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="10" width="18" height="10" rx="2" stroke={color} strokeWidth="2" />
      <path d="M3 14H21" stroke={color} strokeWidth="2" />
      <path
        d="M5 10V8C5 6 7 4 12 4C17 4 19 6 19 8V10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="14" r="2" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// 체력 아이콘 - 하트
export function HeartIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
      />
    </svg>
  );
}

// 골드 아이콘 - 동전
export function GoldIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path d="M12 6V18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M15 9H10.5C9.12 9 8 10.12 8 11.5C8 12.88 9.12 14 10.5 14H13.5C14.88 14 16 15.12 16 16.5C16 17.88 14.88 19 13.5 19H9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 덱 아이콘 - 카드 더미
export function DeckIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="4" width="12" height="16" rx="2" stroke={color} strokeWidth="2" />
      <rect x="7" y="2" width="12" height="16" rx="2" stroke={color} strokeWidth="2" fill="none" />
      <rect x="10" y="0" width="12" height="16" rx="2" stroke={color} strokeWidth="2" fill="none" transform="translate(0, 4)" />
    </svg>
  );
}

// 노드 타입에 따른 아이콘 컴포넌트 반환
export function getNodeIconComponent(type: NodeType, size = 24, color = 'currentColor') {
  const props = { size, color };

  switch (type) {
    case 'ENEMY':
      return <EnemyIcon {...props} />;
    case 'ELITE':
      return <EliteIcon {...props} />;
    case 'BOSS':
      return <BossIcon {...props} />;
    case 'REST':
      return <RestIcon {...props} />;
    case 'SHOP':
      return <ShopIcon {...props} />;
    case 'EVENT':
      return <EventIcon {...props} />;
    case 'TREASURE':
      return <TreasureIcon {...props} />;
    default:
      return <EnemyIcon {...props} />;
  }
}
