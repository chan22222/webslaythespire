// Slay the Spire 스타일 실루엣 캐릭터 SVG
import { useEffect, useState, useRef } from 'react';

interface CharacterProps {
  size?: number;
  className?: string;
  isTargetable?: boolean;
}

// 스프라이트시트 설정
const SPRITE_CONFIG = {
  frameWidth: 69,
  frameHeight: 44,
  columns: 6,
  // 각 애니메이션의 시작 행과 프레임 수
  // multiRow: true인 경우 startRow/startFrame ~ endRow/endFrame 까지 연속 재생
  animations: {
    idle: { row: 0, frames: 6, speed: 150 },
    attack: {
      multiRow: true,
      startRow: 11, startFrame: 3,
      endRow: 14, endFrame: 1,
      speed: 50
    },
    hurt: {
      multiRow: true,
      startRow: 7, startFrame: 2,
      endRow: 7, endFrame: 5,
      speed: 100
    },
  },
};

type AnimationState = 'idle' | 'attack' | 'hurt';

interface WarriorSpriteProps {
  size?: number;
  className?: string;
  animation?: AnimationState;
  onAnimationEnd?: () => void;
}

// multiRow 애니메이션의 총 프레임 수 계산
function getMultiRowFrameCount(startRow: number, startFrame: number, endRow: number, endFrame: number): number {
  const columns = SPRITE_CONFIG.columns;
  const startIndex = startRow * columns + startFrame;
  const endIndex = endRow * columns + endFrame;
  return endIndex - startIndex + 1;
}

// 프레임 인덱스로부터 row, col 계산
function getFramePosition(startRow: number, startFrame: number, frameIndex: number): { row: number; col: number } {
  const columns = SPRITE_CONFIG.columns;
  const startIndex = startRow * columns + startFrame;
  const currentIndex = startIndex + frameIndex;
  return {
    row: Math.floor(currentIndex / columns),
    col: currentIndex % columns,
  };
}

// 워리어 스프라이트 캐릭터
export function WarriorSprite({
  size = 120,
  className = '',
  animation = 'idle',
  onAnimationEnd
}: WarriorSpriteProps) {
  const [frame, setFrame] = useState(0);
  const config = SPRITE_CONFIG.animations[animation];

  // onAnimationEnd를 ref로 관리하여 의존성 문제 방지
  const onAnimationEndRef = useRef(onAnimationEnd);
  onAnimationEndRef.current = onAnimationEnd;

  // 스케일 계산 (기본 44px 높이 기준)
  const scale = size / 44;
  const width = SPRITE_CONFIG.frameWidth * scale;
  const height = SPRITE_CONFIG.frameHeight * scale;

  // multiRow 애니메이션인지 확인
  const isMultiRow = 'multiRow' in config && config.multiRow;

  // 총 프레임 수 계산
  const totalFrames = isMultiRow
    ? getMultiRowFrameCount(
        (config as { startRow: number; startFrame: number; endRow: number; endFrame: number }).startRow,
        (config as { startRow: number; startFrame: number; endRow: number; endFrame: number }).startFrame,
        (config as { startRow: number; startFrame: number; endRow: number; endFrame: number }).endRow,
        (config as { startRow: number; startFrame: number; endRow: number; endFrame: number }).endFrame
      )
    : (config as { frames: number }).frames;

  useEffect(() => {
    setFrame(0); // 애니메이션 변경 시 프레임 리셋

    const interval = setInterval(() => {
      setFrame((prev) => {
        const nextFrame = prev + 1;
        if (nextFrame >= totalFrames) {
          if (animation !== 'idle' && onAnimationEndRef.current) {
            onAnimationEndRef.current();
          }
          return animation === 'idle' ? 0 : totalFrames - 1;
        }
        return nextFrame;
      });
    }, config.speed);

    return () => clearInterval(interval);
  }, [animation, totalFrames, config.speed]);

  // background-position 계산
  let bgX: number;
  let bgY: number;

  if (isMultiRow) {
    const multiConfig = config as { startRow: number; startFrame: number };
    const pos = getFramePosition(multiConfig.startRow, multiConfig.startFrame, frame);
    bgX = -(pos.col * SPRITE_CONFIG.frameWidth) * scale;
    bgY = -(pos.row * SPRITE_CONFIG.frameHeight) * scale;
  } else {
    const singleConfig = config as { row: number };
    bgX = -(frame * SPRITE_CONFIG.frameWidth) * scale;
    bgY = -(singleConfig.row * SPRITE_CONFIG.frameHeight) * scale;
  }

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: 'url(/sprites/warrior.png)',
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundSize: `${414 * scale}px ${748 * scale}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  );
}

// 아이언클래드 (플레이어) 실루엣
export function IroncladSilhouette({ size = 120, className = '' }: CharacterProps) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 100 130" className={className}>
      <defs>
        <linearGradient id="ironcladBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a3535" />
          <stop offset="50%" stopColor="#2a1a1a" />
          <stop offset="100%" stopColor="#1a0a0a" />
        </linearGradient>
        <linearGradient id="ironcladArmor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b4545" />
          <stop offset="50%" stopColor="#5a2525" />
          <stop offset="100%" stopColor="#3a1515" />
        </linearGradient>
        <filter id="ironcladGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 망토 */}
      <path
        d="M25 45 C20 50, 15 80, 20 120 L35 115 L40 70 Z"
        fill="url(#ironcladBody)"
        opacity="0.8"
      />
      <path
        d="M75 45 C80 50, 85 80, 80 120 L65 115 L60 70 Z"
        fill="url(#ironcladBody)"
        opacity="0.8"
      />

      {/* 몸통 */}
      <path
        d="M35 40 L30 90 L40 115 L50 120 L60 115 L70 90 L65 40 Z"
        fill="url(#ironcladBody)"
      />

      {/* 갑옷 하이라이트 */}
      <path
        d="M38 50 L42 85 L50 90 L58 85 L62 50 L50 45 Z"
        fill="url(#ironcladArmor)"
        opacity="0.7"
      />

      {/* 어깨 갑옷 */}
      <ellipse cx="32" cy="42" rx="12" ry="8" fill="url(#ironcladArmor)" />
      <ellipse cx="68" cy="42" rx="12" ry="8" fill="url(#ironcladArmor)" />

      {/* 머리 */}
      <circle cx="50" cy="25" r="18" fill="url(#ironcladBody)" />

      {/* 투구 */}
      <path
        d="M32 25 C32 12, 68 12, 68 25 L65 18 L50 10 L35 18 Z"
        fill="url(#ironcladArmor)"
      />

      {/* 투구 장식 */}
      <path
        d="M50 5 L48 15 L50 10 L52 15 Z"
        fill="#c44"
        filter="url(#ironcladGlow)"
      />

      {/* 눈 (빛나는) */}
      <ellipse cx="43" cy="26" rx="3" ry="2" fill="#ff4444" filter="url(#ironcladGlow)" opacity="0.9" />
      <ellipse cx="57" cy="26" rx="3" ry="2" fill="#ff4444" filter="url(#ironcladGlow)" opacity="0.9" />

      {/* 검 (오른손) */}
      <path
        d="M72 50 L85 35 L88 38 L75 55 Z"
        fill="#666"
      />
      <path
        d="M85 35 L95 15 L92 12 L88 38 Z"
        fill="#888"
      />

      {/* 그림자 */}
      <ellipse cx="50" cy="125" rx="30" ry="5" fill="rgba(0,0,0,0.5)" />
    </svg>
  );
}

// 컬티스트 실루엣
export function CultistSilhouette({ size = 100, className = '', isTargetable = false }: CharacterProps) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 100 140" className={className}>
      <defs>
        <linearGradient id="cultistRobe" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a3a5a" />
          <stop offset="100%" stopColor="#1a1020" />
        </linearGradient>
        <filter id="cultistGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 로브 */}
      <path
        d="M30 35 C15 45, 10 100, 20 130 L50 135 L80 130 C90 100, 85 45, 70 35 Z"
        fill="url(#cultistRobe)"
      />

      {/* 후드 */}
      <path
        d="M30 35 C30 15, 70 15, 70 35 L65 45 L50 50 L35 45 Z"
        fill="url(#cultistRobe)"
      />

      {/* 어둠 속 얼굴 */}
      <ellipse cx="50" cy="38" rx="12" ry="10" fill="#0a0510" />

      {/* 빛나는 눈 */}
      <circle cx="45" cy="36" r="3" fill="#a855f7" filter="url(#cultistGlow)" />
      <circle cx="55" cy="36" r="3" fill="#a855f7" filter="url(#cultistGlow)" />

      {/* 손 (주문 시전) */}
      <path
        d="M25 60 L15 55 L12 58 L20 65 Z"
        fill="#3a2a4a"
      />
      <path
        d="M75 60 L85 55 L88 58 L80 65 Z"
        fill="#3a2a4a"
      />

      {/* 마법 이펙트 */}
      <circle cx="15" cy="50" r="5" fill="#a855f7" opacity="0.5" filter="url(#cultistGlow)">
        <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="85" cy="50" r="5" fill="#a855f7" opacity="0.5" filter="url(#cultistGlow)">
        <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* 타겟 글로우 */}
      {isTargetable && (
        <ellipse cx="50" cy="80" rx="45" ry="60" fill="none" stroke="#e04040" strokeWidth="2" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
}

// 턱 벌레 (Jaw Worm) 실루엣
export function JawWormSilhouette({ size = 100, className = '', isTargetable = false }: CharacterProps) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 120 90" className={className}>
      <defs>
        <linearGradient id="jawWormBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5a7a5a" />
          <stop offset="100%" stopColor="#2a3a2a" />
        </linearGradient>
        <filter id="jawWormGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 몸통 세그먼트 */}
      <ellipse cx="90" cy="55" rx="20" ry="18" fill="url(#jawWormBody)" />
      <ellipse cx="65" cy="50" rx="22" ry="20" fill="url(#jawWormBody)" />
      <ellipse cx="40" cy="45" rx="25" ry="22" fill="url(#jawWormBody)" />

      {/* 머리 */}
      <ellipse cx="18" cy="40" rx="18" ry="20" fill="url(#jawWormBody)" />

      {/* 턱 (위) */}
      <path
        d="M5 30 L0 20 L10 25 L20 22 L25 28 L15 32 Z"
        fill="#4a5a4a"
      />

      {/* 턱 (아래) */}
      <path
        d="M5 50 L0 60 L10 55 L20 58 L25 52 L15 48 Z"
        fill="#3a4a3a"
      />

      {/* 이빨 */}
      <path d="M8 32 L5 28 L10 30 Z" fill="#ddd" />
      <path d="M15 30 L13 25 L18 28 Z" fill="#ddd" />
      <path d="M8 48 L5 52 L10 50 Z" fill="#ddd" />
      <path d="M15 50 L13 55 L18 52 Z" fill="#ddd" />

      {/* 눈 */}
      <circle cx="22" cy="35" r="5" fill="#1a1a1a" />
      <circle cx="23" cy="34" r="2" fill="#ff6b6b" filter="url(#jawWormGlow)" />

      {/* 몸통 줄무늬 */}
      <path d="M50 30 Q55 45, 50 60" stroke="#3a5a3a" strokeWidth="3" fill="none" />
      <path d="M72 32 Q77 50, 72 65" stroke="#3a5a3a" strokeWidth="3" fill="none" />

      {/* 가시 */}
      <path d="M35 25 L38 18 L40 26" fill="#4a5a4a" />
      <path d="M55 22 L58 14 L60 23" fill="#4a5a4a" />
      <path d="M78 28 L81 20 L83 29" fill="#4a5a4a" />

      {isTargetable && (
        <ellipse cx="50" cy="45" rx="55" ry="40" fill="none" stroke="#e04040" strokeWidth="2" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
}

// 이 (Louse) 실루엣
export function LouseSilhouette({ size = 80, className = '', isTargetable = false, variant = 'red' }: CharacterProps & { variant?: 'red' | 'green' }) {
  const colors = variant === 'red'
    ? { body: '#8a4a4a', dark: '#4a2525', glow: '#ff6b6b' }
    : { body: '#4a8a4a', dark: '#254a25', glow: '#6bff6b' };

  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 100 70" className={className}>
      <defs>
        <linearGradient id={`louseBody-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.body} />
          <stop offset="100%" stopColor={colors.dark} />
        </linearGradient>
      </defs>

      {/* 몸통 */}
      <ellipse cx="50" cy="40" rx="35" ry="25" fill={`url(#louseBody-${variant})`} />

      {/* 껍질 패턴 */}
      <path d="M25 35 Q50 20, 75 35" stroke={colors.dark} strokeWidth="3" fill="none" />
      <path d="M30 45 Q50 30, 70 45" stroke={colors.dark} strokeWidth="2" fill="none" />

      {/* 다리 */}
      <path d="M25 45 L10 55 L12 58 L28 48" fill={colors.dark} />
      <path d="M30 50 L18 62 L21 65 L33 52" fill={colors.dark} />
      <path d="M75 45 L90 55 L88 58 L72 48" fill={colors.dark} />
      <path d="M70 50 L82 62 L79 65 L67 52" fill={colors.dark} />

      {/* 머리 */}
      <ellipse cx="20" cy="35" rx="12" ry="10" fill={`url(#louseBody-${variant})`} />

      {/* 눈 */}
      <circle cx="15" cy="32" r="4" fill="#1a1a1a" />
      <circle cx="16" cy="31" r="1.5" fill={colors.glow} />

      {/* 더듬이 */}
      <path d="M12 28 L5 18" stroke={colors.dark} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 26 L15 15" stroke={colors.dark} strokeWidth="2" strokeLinecap="round" />

      {isTargetable && (
        <ellipse cx="45" cy="40" rx="50" ry="35" fill="none" stroke="#e04040" strokeWidth="2" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
}

// 슬라임 실루엣
export function SlimeSilhouette({ size = 100, className = '', isTargetable = false, variant = 'medium' }: CharacterProps & { variant?: 'small' | 'medium' | 'large' }) {
  const scale = variant === 'small' ? 0.6 : variant === 'large' ? 1.3 : 1;

  return (
    <svg width={size * scale} height={size * 0.8 * scale} viewBox="0 0 100 80" className={className}>
      <defs>
        <linearGradient id="slimeBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5aaa5a" />
          <stop offset="50%" stopColor="#3a7a3a" />
          <stop offset="100%" stopColor="#2a5a2a" />
        </linearGradient>
        <filter id="slimeGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 메인 바디 - 물방울 형태 */}
      <path
        d="M50 5 C80 5, 95 40, 90 60 C85 75, 15 75, 10 60 C5 40, 20 5, 50 5 Z"
        fill="url(#slimeBody)"
      />

      {/* 하이라이트 */}
      <ellipse cx="35" cy="25" rx="15" ry="10" fill="rgba(255,255,255,0.2)" />

      {/* 기포 */}
      <circle cx="65" cy="45" r="5" fill="rgba(255,255,255,0.15)" />
      <circle cx="30" cy="50" r="3" fill="rgba(255,255,255,0.1)" />

      {/* 눈 */}
      <ellipse cx="35" cy="40" rx="8" ry="10" fill="#1a3a1a" />
      <ellipse cx="60" cy="40" rx="8" ry="10" fill="#1a3a1a" />
      <circle cx="37" cy="38" r="3" fill="#aaffaa" filter="url(#slimeGlow)" />
      <circle cx="62" cy="38" r="3" fill="#aaffaa" filter="url(#slimeGlow)" />

      {/* 입 */}
      <path d="M40 55 Q50 62, 60 55" stroke="#1a3a1a" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* 점액 드립 */}
      <path d="M25 70 Q23 78, 25 85" stroke="#3a7a3a" strokeWidth="3" fill="none" opacity="0.7" />
      <path d="M75 70 Q77 76, 74 82" stroke="#3a7a3a" strokeWidth="2" fill="none" opacity="0.5" />

      {isTargetable && (
        <ellipse cx="50" cy="45" rx="50" ry="40" fill="none" stroke="#e04040" strokeWidth="2" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
}

// 그렘린 놉 (엘리트) 실루엣
export function GremlinNobSilhouette({ size = 140, className = '', isTargetable = false }: CharacterProps) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 120 150" className={className}>
      <defs>
        <linearGradient id="nobBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7a5a4a" />
          <stop offset="100%" stopColor="#3a2a1a" />
        </linearGradient>
        <filter id="nobGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 다리 */}
      <path d="M35 110 L30 145 L40 145 L45 115" fill="url(#nobBody)" />
      <path d="M75 110 L80 145 L70 145 L65 115" fill="url(#nobBody)" />

      {/* 몸통 */}
      <path
        d="M30 50 C20 60, 20 100, 35 115 L75 115 C90 100, 90 60, 80 50 Z"
        fill="url(#nobBody)"
      />

      {/* 근육 하이라이트 */}
      <path d="M40 60 Q55 55, 70 60 Q65 80, 55 85 Q45 80, 40 60" fill="rgba(255,255,255,0.1)" />

      {/* 어깨 */}
      <ellipse cx="28" cy="55" rx="15" ry="12" fill="url(#nobBody)" />
      <ellipse cx="82" cy="55" rx="15" ry="12" fill="url(#nobBody)" />

      {/* 팔 */}
      <path d="M15 55 L5 80 L15 85 L25 60" fill="url(#nobBody)" />
      <path d="M95 55 L105 80 L95 85 L85 60" fill="url(#nobBody)" />

      {/* 곤봉을 든 손 */}
      <path d="M5 80 L-5 75 L-10 120 L0 125 L10 85" fill="#5a4a3a" />

      {/* 머리 */}
      <ellipse cx="55" cy="35" rx="22" ry="20" fill="url(#nobBody)" />

      {/* 뿔 */}
      <path d="M40 20 L35 5 L42 15" fill="#5a4030" />
      <path d="M70 20 L75 5 L68 15" fill="#5a4030" />

      {/* 분노한 눈 */}
      <path d="M42 32 L52 30 L52 38 L42 36 Z" fill="#1a0a0a" />
      <path d="M58 30 L68 32 L68 36 L58 38 Z" fill="#1a0a0a" />
      <circle cx="47" cy="34" r="2" fill="#ff4444" filter="url(#nobGlow)" />
      <circle cx="63" cy="34" r="2" fill="#ff4444" filter="url(#nobGlow)" />

      {/* 이빨 */}
      <path d="M45 45 L48 52 L51 45" fill="#ddd" />
      <path d="M55 45 L58 52 L61 45" fill="#ddd" />

      {isTargetable && (
        <ellipse cx="55" cy="85" rx="60" ry="70" fill="none" stroke="#e04040" strokeWidth="2" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
}

// 슬라임 보스 실루엣
export function SlimeBossSilhouette({ size = 180, className = '', isTargetable = false }: CharacterProps) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 180 160" className={className}>
      <defs>
        <linearGradient id="bossSlimeBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6aba6a" />
          <stop offset="50%" stopColor="#4a8a4a" />
          <stop offset="100%" stopColor="#2a5a2a" />
        </linearGradient>
        <filter id="bossGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 거대한 몸통 */}
      <path
        d="M90 10 C150 10, 175 70, 170 110 C165 145, 15 145, 10 110 C5 70, 30 10, 90 10 Z"
        fill="url(#bossSlimeBody)"
      />

      {/* 하이라이트 */}
      <ellipse cx="60" cy="40" rx="30" ry="20" fill="rgba(255,255,255,0.15)" />

      {/* 기포들 */}
      <circle cx="130" cy="70" r="10" fill="rgba(255,255,255,0.1)" />
      <circle cx="50" cy="90" r="7" fill="rgba(255,255,255,0.08)" />
      <circle cx="140" cy="100" r="5" fill="rgba(255,255,255,0.1)" />

      {/* 분노한 눈 */}
      <path d="M55 55 L80 50 L80 70 L55 65 Z" fill="#1a3a1a" />
      <path d="M100 50 L125 55 L125 65 L100 70 Z" fill="#1a3a1a" />
      <ellipse cx="70" cy="58" rx="5" ry="6" fill="#ffff66" filter="url(#bossGlow)" />
      <ellipse cx="110" cy="58" rx="5" ry="6" fill="#ffff66" filter="url(#bossGlow)" />

      {/* 거대한 입 */}
      <path
        d="M50 85 Q90 110, 130 85 Q120 100, 90 105 Q60 100, 50 85 Z"
        fill="#1a3a1a"
      />
      {/* 이빨 */}
      <path d="M60 85 L65 95 L70 85" fill="#dfd" />
      <path d="M80 87 L85 97 L90 87" fill="#dfd" />
      <path d="M100 87 L105 97 L110 87" fill="#dfd" />
      <path d="M120 85 L115 95 L110 85" fill="#dfd" />

      {/* 점액 드립 */}
      <path d="M30 140 Q25 155, 30 165" stroke="#3a7a3a" strokeWidth="5" fill="none" opacity="0.6" />
      <path d="M150 140 Q155 152, 150 160" stroke="#3a7a3a" strokeWidth="4" fill="none" opacity="0.5" />
      <path d="M90 145 Q88 158, 92 168" stroke="#3a7a3a" strokeWidth="6" fill="none" opacity="0.7" />

      {isTargetable && (
        <ellipse cx="90" cy="85" rx="90" ry="75" fill="none" stroke="#e04040" strokeWidth="3" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
}

// 캐릭터 매핑
export function getEnemyCharacter(templateId: string, size: number, isTargetable: boolean) {
  switch (templateId) {
    case 'cultist':
      return <CultistSilhouette size={size} isTargetable={isTargetable} />;
    case 'jaw_worm':
      return <JawWormSilhouette size={size} isTargetable={isTargetable} />;
    case 'red_louse':
      return <LouseSilhouette size={size * 0.8} isTargetable={isTargetable} variant="red" />;
    case 'green_louse':
      return <LouseSilhouette size={size * 0.8} isTargetable={isTargetable} variant="green" />;
    case 'small_slime':
      return <SlimeSilhouette size={size * 0.7} isTargetable={isTargetable} variant="small" />;
    case 'medium_slime':
      return <SlimeSilhouette size={size} isTargetable={isTargetable} variant="medium" />;
    case 'large_slime':
      return <SlimeSilhouette size={size * 1.2} isTargetable={isTargetable} variant="large" />;
    case 'gremlin_nob':
      return <GremlinNobSilhouette size={size * 1.2} isTargetable={isTargetable} />;
    case 'slime_boss':
      return <SlimeBossSilhouette size={size * 1.5} isTargetable={isTargetable} />;
    default:
      return <CultistSilhouette size={size} isTargetable={isTargetable} />;
  }
}
