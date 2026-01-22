// Shuffle & Slash 스타일 실루엣 캐릭터 SVG
import { useEffect, useLayoutEffect, useState, useRef } from 'react';

interface CharacterProps {
  size?: number;
  className?: string;
  isAttacking?: boolean;
}

// 스프라이트시트 설정 (character_sprite_1.png - 4x4 그리드, 256x256 프레임)
// 1~6: idle, 7~16: skill
const SPRITE_CONFIG = {
  frameWidth: 256,
  frameHeight: 256,
  columns: 4,
  sheetWidth: 1024,
  sheetHeight: 1024,
  animations: {
    idle: { startFrame: 0, frames: 6, speed: 150 },
    hurt: { startFrame: 0, frames: 6, speed: 100 },
    skill: { startFrame: 6, frames: 10, speed: 100 },
    death: { startFrame: 0, frames: 6, speed: 100 },
    shield: { startFrame: 6, frames: 10, speed: 100 },
  },
};

// 공격 스프라이트시트 설정 (character_sprite_dash.png - 4x4 그리드, 256x256 프레임, 16프레임)
const ATTACK_SPRITE_CONFIG = {
  frameWidth: 256,
  frameHeight: 256,
  columns: 4,
  sheetWidth: 1024,
  sheetHeight: 1024,
  animations: {
    attack: { startFrame: 0, frames: 16, speed: 60 },        // 전체 (달리기 + 공격)
    attack_combo: { startFrame: 6, frames: 10, speed: 60 },  // 공격만 (6~15프레임)
  },
};

type AnimationState = 'idle' | 'attack' | 'attack_combo' | 'hurt' | 'skill' | 'death' | 'shield';

// 공격 애니메이션인지 확인 (attack, attack_combo는 character_sprite_dash.png 사용)
const isAttackAnimation = (animation: AnimationState) => animation === 'attack' || animation === 'attack_combo';

interface WarriorSpriteProps {
  size?: number;
  className?: string;
  animation?: AnimationState;
  onAnimationEnd?: () => void;
}

// 워리어 스프라이트 캐릭터 (idle: character_sprite_1.png, attack: character_sprite_dash.png)
export function WarriorSprite({
  size = 120,
  className = '',
  animation = 'idle',
  onAnimationEnd
}: WarriorSpriteProps) {
  const [frame, setFrame] = useState(0);

  // 공격 애니메이션인지에 따라 다른 config 사용
  const useAttackSprite = isAttackAnimation(animation);
  const spriteConfig = useAttackSprite ? ATTACK_SPRITE_CONFIG : SPRITE_CONFIG;
  const config = useAttackSprite
    ? ATTACK_SPRITE_CONFIG.animations[animation as 'attack' | 'attack_combo']
    : SPRITE_CONFIG.animations[animation as 'idle' | 'hurt' | 'skill' | 'death' | 'shield'];

  // onAnimationEnd를 ref로 관리하여 의존성 문제 방지
  const onAnimationEndRef = useRef(onAnimationEnd);
  onAnimationEndRef.current = onAnimationEnd;

  // 스케일 계산 (256px 프레임 기준으로 size에 맞춤)
  const scale = size / 190;
  const width = spriteConfig.frameWidth * scale;
  const height = spriteConfig.frameHeight * scale;

  const totalFrames = config.frames;

  // 애니메이션 변경 시 즉시 프레임 리셋 (렌더링 전에 실행)
  useLayoutEffect(() => {
    setFrame(0);
  }, [animation]);

  useEffect(() => {
    let hasEnded = false; // onAnimationEnd가 한 번만 호출되도록 추적

    const interval = setInterval(() => {
      setFrame((prev) => {
        // 이미 마지막 프레임에 도달했고 끝난 경우 (루프하지 않는 애니메이션)
        if (animation !== 'idle' && animation !== 'shield' && hasEnded && prev >= totalFrames - 1) {
          return prev; // 더 이상 진행하지 않음
        }
        const nextFrame = prev + 1;
        if (nextFrame >= totalFrames) {
          if (animation !== 'idle' && animation !== 'shield') {
            if (!hasEnded && onAnimationEndRef.current) {
              hasEnded = true;
              setTimeout(() => onAnimationEndRef.current?.(), 0);
            }
            return totalFrames - 1; // 마지막 프레임에서 멈춤
          }
          return 0; // idle, shield는 루프
        }
        return nextFrame;
      });
    }, config.speed);

    return () => clearInterval(interval);
  }, [animation, totalFrames, config.speed]);

  // 연속 프레임 인덱스에서 row/col 계산 (frame이 범위를 벗어나지 않도록 보정)
  const safeFrame = Math.min(frame, totalFrames - 1);
  const absoluteFrame = config.startFrame + safeFrame;
  const col = absoluteFrame % spriteConfig.columns;
  const row = Math.floor(absoluteFrame / spriteConfig.columns);

  const bgX = -(col * spriteConfig.frameWidth) * scale;
  const bgY = -(row * spriteConfig.frameHeight) * scale;

  // 공격 애니메이션은 dash 스프라이트, 그 외는 기본 스프라이트 사용
  const spriteUrl = useAttackSprite
    ? '/sprites/character_sprite_dash.png'
    : '/sprites/character_sprite_1.png';

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${spriteUrl})`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundSize: `${spriteConfig.sheetWidth * scale}px ${spriteConfig.sheetHeight * scale}px`,
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
export function CultistSilhouette({ size = 100, className = '' }: CharacterProps) {
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

    </svg>
  );
}

// 턱 벌레 (Jaw Worm) 실루엣
export function JawWormSilhouette({ size = 100, className = '' }: CharacterProps) {
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
    </svg>
  );
}

// 플라잉아이 스프라이트 설정
const FLYING_EYE_CONFIG = {
  frameWidth: 150,
  frameHeight: 150,
  totalFrames: 8,
  animationSpeed: 100, // ms per frame
  // 실제 스프라이트 영역 (여백 제거)
  cropOffsetX: 45,
  cropOffsetY: 50,
  cropWidth: 60,
  cropHeight: 50,
};

const FLYING_EYE_ATTACK_CONFIG = {
  frameWidth: 150,
  frameHeight: 150,
  totalFrames: 8,
  animationSpeed: 80,
  cropOffsetX: 35,
  cropOffsetY: 50,
  cropWidth: 80,
  cropHeight: 50,
};

// 플라잉아이 (Flying Eye) - 애니메이션 스프라이트
export function FlyingEyeSprite({ size = 80, className = '', variant = 'red', isAttacking = false }: CharacterProps & { variant?: 'red' | 'green' }) {
  const config = isAttacking ? FLYING_EYE_ATTACK_CONFIG : FLYING_EYE_CONFIG;
  const [frame, setFrame] = useState(config.totalFrames - 1);

  // 상태 변경 시 frame 리셋
  useEffect(() => {
    setFrame(config.totalFrames - 1);
  }, [isAttacking, config.totalFrames]);

  // 컨테이너는 idle 기준 고정
  const scaledSize = size * 1.7;
  const baseScale = scaledSize / FLYING_EYE_CONFIG.cropHeight;
  const containerWidth = FLYING_EYE_CONFIG.cropWidth * baseScale;
  const containerHeight = FLYING_EYE_CONFIG.cropHeight * baseScale;

  // 실제 스프라이트 크기
  const scale = scaledSize / config.cropHeight;
  const displayWidth = config.cropWidth * scale;
  const displayHeight = config.cropHeight * scale;

  // 애니메이션 루프 (역방향)
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev - 1 + config.totalFrames) % config.totalFrames);
    }, config.animationSpeed);

    return () => clearInterval(interval);
  }, [config.totalFrames, config.animationSpeed]);

  // 그린 버전은 hue-rotate 필터로 색상 변경
  const colorFilter = variant === 'green'
    ? 'hue-rotate(90deg) saturate(1.2)'
    : 'none';

  // frame이 totalFrames를 초과하지 않도록 보정
  const safeFrame = ((frame % config.totalFrames) + config.totalFrames) % config.totalFrames;
  // 현재 프레임의 시작 위치 + crop offset
  const bgX = -(safeFrame * config.frameWidth + config.cropOffsetX) * scale;
  const bgY = -config.cropOffsetY * scale;

  const spriteUrl = isAttacking ? '/sprites/mob/flyingeye_Attack.png' : '/sprites/mob/flyingeye.png';

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight + 30,
        paddingBottom: '30px',
      }}
    >
      <div
        className="absolute"
        style={{
          width: displayWidth,
          height: displayHeight,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scaleX(-1)',
          backgroundImage: `url(${spriteUrl})`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundSize: `${config.frameWidth * config.totalFrames * scale}px ${config.frameHeight * scale}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter: colorFilter,
        }}
      />
    </div>
  );
}

// 고블린 스프라이트 설정
const GOBLIN_CONFIG = {
  frameWidth: 150,
  frameHeight: 150,
  totalFrames: 4,
  animationSpeed: 150,
  cropOffsetX: 40,
  cropOffsetY: 45,
  cropWidth: 70,
  cropHeight: 55,
};

const GOBLIN_ATTACK_CONFIG = {
  frameWidth: 150,
  frameHeight: 150,
  totalFrames: 8,
  animationSpeed: 80,
  cropOffsetX: 20,
  cropOffsetY: 45,
  cropWidth: 100,
  cropHeight: 55,
};

// 고블린 (Goblin) - 애니메이션 스프라이트
export function GoblinSprite({ size = 80, className = '', isAttacking = false }: CharacterProps) {
  const [frame, setFrame] = useState(0);
  const config = isAttacking ? GOBLIN_ATTACK_CONFIG : GOBLIN_CONFIG;

  // 상태 변경 시 frame 리셋
  useEffect(() => {
    setFrame(0);
  }, [isAttacking]);

  // 컨테이너는 idle 기준 고정
  const scaledSize = size * 2.1;
  const baseScale = scaledSize / GOBLIN_CONFIG.cropHeight;
  const containerWidth = GOBLIN_CONFIG.cropWidth * baseScale;
  const containerHeight = GOBLIN_CONFIG.cropHeight * baseScale;

  // 실제 스프라이트 크기
  const scale = scaledSize / config.cropHeight;
  const displayWidth = config.cropWidth * scale;
  const displayHeight = config.cropHeight * scale;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % config.totalFrames);
    }, config.animationSpeed);
    return () => clearInterval(interval);
  }, [config.totalFrames, config.animationSpeed]);

  // frame이 totalFrames를 초과하지 않도록 보정
  const safeFrame = frame % config.totalFrames;
  const bgX = -(safeFrame * config.frameWidth + config.cropOffsetX) * scale;
  const bgY = -config.cropOffsetY * scale;

  const spriteUrl = isAttacking ? '/sprites/mob/goblin_Attack.png' : '/sprites/mob/goblin.png';

  return (
    <div className={`relative ${className}`} style={{ width: containerWidth, height: containerHeight }}>
      <div
        className="absolute"
        style={{
          width: displayWidth,
          height: displayHeight,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scaleX(-1)',
          backgroundImage: `url(${spriteUrl})`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundSize: `${config.frameWidth * config.totalFrames * scale}px ${config.frameHeight * scale}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter: 'none',
        }}
      />
    </div>
  );
}

// 스켈레톤 스프라이트 설정
const SKELETON_CONFIG = {
  frameWidth: 150,
  frameHeight: 150,
  totalFrames: 4,
  animationSpeed: 180,
  cropOffsetX: 35,
  cropOffsetY: 40,
  cropWidth: 80,
  cropHeight: 60,
};

const SKELETON_ATTACK_CONFIG = {
  frameWidth: 150,
  frameHeight: 150,
  totalFrames: 8,
  animationSpeed: 80,
  cropOffsetX: 0,
  cropOffsetY: 35,
  cropWidth: 150,
  cropHeight: 65,
};

// 스켈레톤 (Skeleton) - 애니메이션 스프라이트
export function SkeletonSprite({ size = 80, className = '', isAttacking = false }: CharacterProps) {
  const [frame, setFrame] = useState(0);
  const config = isAttacking ? SKELETON_ATTACK_CONFIG : SKELETON_CONFIG;

  // 상태 변경 시 frame 리셋
  useEffect(() => {
    setFrame(0);
  }, [isAttacking]);

  // 컨테이너는 idle 기준 고정
  const scaledSize = size * 2.1;
  const baseScale = scaledSize / SKELETON_CONFIG.cropHeight;
  const containerWidth = SKELETON_CONFIG.cropWidth * baseScale;
  const containerHeight = SKELETON_CONFIG.cropHeight * baseScale;

  // 실제 스프라이트 크기
  const scale = scaledSize / config.cropHeight;
  const displayWidth = config.cropWidth * scale;
  const displayHeight = config.cropHeight * scale;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % config.totalFrames);
    }, config.animationSpeed);
    return () => clearInterval(interval);
  }, [config.totalFrames, config.animationSpeed]);

  // frame이 totalFrames를 초과하지 않도록 보정
  const safeFrame = frame % config.totalFrames;
  const bgX = -(safeFrame * config.frameWidth + config.cropOffsetX) * scale;
  const bgY = -config.cropOffsetY * scale;

  const spriteUrl = isAttacking ? '/sprites/mob/skeleton_Attack.png' : '/sprites/mob/skeleton.png';

  return (
    <div className={`relative ${className}`} style={{ width: containerWidth, height: containerHeight }}>
      <div
        className="absolute"
        style={{
          width: displayWidth,
          height: displayHeight,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scaleX(-1)',
          backgroundImage: `url(${spriteUrl})`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundSize: `${config.frameWidth * config.totalFrames * scale}px ${config.frameHeight * scale}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter: 'none',
        }}
      />
    </div>
  );
}

// 머쉬룸 스프라이트 설정
const MUSHROOM_CONFIG = {
  frameWidth: 150,
  frameHeight: 150,
  totalFrames: 4,
  animationSpeed: 200,
  cropOffsetX: 50,
  cropOffsetY: 50,
  cropWidth: 50,
  cropHeight: 50,
};

const MUSHROOM_ATTACK_CONFIG = {
  frameWidth: 150,
  frameHeight: 150,
  totalFrames: 8,
  animationSpeed: 80,
  cropOffsetX: 40,
  cropOffsetY: 50,
  cropWidth: 70,
  cropHeight: 50,
};

// 머쉬룸 (Mushroom) - 애니메이션 스프라이트
export function MushroomSprite({ size = 80, className = '', variant = 'normal', isAttacking = false }: CharacterProps & { variant?: 'normal' | 'acid' }) {
  const config = isAttacking ? MUSHROOM_ATTACK_CONFIG : MUSHROOM_CONFIG;
  const [frame, setFrame] = useState(0);

  // 상태 변경 시 frame 리셋
  useEffect(() => {
    setFrame(0);
  }, [isAttacking]);

  // 컨테이너는 idle 기준 고정
  const scaledSize = size * 1.9;
  const baseScale = scaledSize / MUSHROOM_CONFIG.cropHeight;
  const containerWidth = MUSHROOM_CONFIG.cropWidth * baseScale;
  const containerHeight = MUSHROOM_CONFIG.cropHeight * baseScale;

  // 실제 스프라이트 크기
  const scale = scaledSize / config.cropHeight;
  const displayWidth = config.cropWidth * scale;
  const displayHeight = config.cropHeight * scale;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % config.totalFrames);
    }, config.animationSpeed);
    return () => clearInterval(interval);
  }, [config.totalFrames, config.animationSpeed]);

  // 산성 버전은 녹색 색조
  const colorFilter = variant === 'acid'
    ? 'hue-rotate(60deg) saturate(1.5)'
    : 'none';

  // frame이 totalFrames를 초과하지 않도록 보정
  const safeFrame = frame % config.totalFrames;
  const bgX = -(safeFrame * config.frameWidth + config.cropOffsetX) * scale;
  const bgY = -config.cropOffsetY * scale;

  const spriteUrl = isAttacking ? '/sprites/mob/mushroom_Attack.png' : '/sprites/mob/mushroom.png';

  return (
    <div className={`relative ${className}`} style={{ width: containerWidth, height: containerHeight }}>
      <div
        className="absolute"
        style={{
          width: displayWidth,
          height: displayHeight,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scaleX(-1)',
          backgroundImage: `url(${spriteUrl})`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundSize: `${config.frameWidth * config.totalFrames * scale}px ${config.frameHeight * scale}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter: colorFilter,
        }}
      />
    </div>
  );
}

// 슬라임 실루엣
export function SlimeSilhouette({ size = 100, className = '', variant = 'medium' }: CharacterProps & { variant?: 'small' | 'medium' | 'large' }) {
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
    </svg>
  );
}

// 그렘린 놉 (엘리트) 실루엣
export function GremlinNobSilhouette({ size = 140, className = '' }: CharacterProps) {
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
    </svg>
  );
}

// EvilWizard 스프라이트 설정
const EVIL_WIZARD_CONFIG = {
  frameWidth: 140,
  frameHeight: 140,
  sheetWidth: 1400,
  sheetHeight: 140,
  totalFrames: 8,
  animationSpeed: 150,
  cropOffsetX: 5,
  cropOffsetY: 35,
  cropWidth: 120,
  cropHeight: 105,
};

const EVIL_WIZARD_ATTACK_CONFIG = {
  frameWidth: 140,
  frameHeight: 140,
  sheetWidth: 1820,
  sheetHeight: 140,
  totalFrames: 13,
  animationSpeed: 55,
  cropOffsetX: -5,
  cropOffsetY: 35,
  cropWidth: 140,
  cropHeight: 105,
};

// EvilWizard (엘리트) - 애니메이션 스프라이트
export function EvilWizardSprite({ size = 120, className = '', isAttacking = false }: CharacterProps) {
  const [frame, setFrame] = useState(0);
  const config = isAttacking ? EVIL_WIZARD_ATTACK_CONFIG : EVIL_WIZARD_CONFIG;

  // 컨테이너는 idle 기준 crop 크기로 설정
  const scaledSize = size * 3.4;
  const baseScale = scaledSize / EVIL_WIZARD_CONFIG.cropHeight;
  const containerWidth = EVIL_WIZARD_CONFIG.cropWidth * baseScale;
  const containerHeight = EVIL_WIZARD_CONFIG.cropHeight * baseScale * 0.45; // HP바 가깝게

  // 실제 스프라이트 크기
  const scale = scaledSize / config.cropHeight;
  const displayWidth = config.cropWidth * scale;
  const displayHeight = config.cropHeight * scale;

  // 상태 변경 시 frame 리셋 및 interval 재설정
  useEffect(() => {
    setFrame(0);
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % config.totalFrames);
    }, config.animationSpeed);
    return () => clearInterval(interval);
  }, [isAttacking, config.totalFrames, config.animationSpeed]);

  // frame이 totalFrames를 초과하지 않도록 보정
  const safeFrame = frame % config.totalFrames;
  const bgX = -(safeFrame * config.frameWidth + config.cropOffsetX) * scale;
  const bgY = -config.cropOffsetY * scale;
  const spriteUrl = isAttacking ? '/sprites/mob/EvilWizard_Attack.png' : '/sprites/mob/EvilWizard.png';

  return (
    <div className={`relative ${className}`} style={{ width: containerWidth, height: containerHeight, overflow: 'visible' }}>
      <div
        className="absolute"
        style={{
          width: displayWidth,
          height: displayHeight,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -38%) scaleX(-1)',
          backgroundImage: `url(${spriteUrl})`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundSize: `${config.sheetWidth * scale}px ${config.sheetHeight * scale}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter: 'none',
        }}
      />
    </div>
  );
}

// NightBorne 스프라이트 설정 (멀티 row)
const NIGHTBORNE_CONFIG = {
  frameWidth: 80,
  frameHeight: 80,
  sheetWidth: 1840,
  sheetHeight: 400,
  idleFrames: 9,
  attackFrames: 12,
  idleRow: 0,
  attackRow: 2,
  animationSpeed: 120,
  attackAnimationSpeed: 45,
  // crop 설정 - 캐릭터 영역
  idleCropOffsetX: 10,
  idleCropOffsetY: 15,
  idleCropWidth: 60,
  idleCropHeight: 65,
  // 공격용 crop - 더 넓게
  attackCropOffsetX: 0,
  attackCropOffsetY: 15,
  attackCropWidth: 80,
  attackCropHeight: 65,
};

// NightBorne (보스) - 애니메이션 스프라이트
export function NightBorneSprite({ size = 150, className = '', isAttacking = false }: CharacterProps) {
  const [frame, setFrame] = useState(0);

  const totalFrames = isAttacking ? NIGHTBORNE_CONFIG.attackFrames : NIGHTBORNE_CONFIG.idleFrames;
  const row = isAttacking ? NIGHTBORNE_CONFIG.attackRow : NIGHTBORNE_CONFIG.idleRow;
  const speed = isAttacking ? NIGHTBORNE_CONFIG.attackAnimationSpeed : NIGHTBORNE_CONFIG.animationSpeed;

  // 현재 상태에 맞는 crop 설정
  const cropOffsetX = isAttacking ? NIGHTBORNE_CONFIG.attackCropOffsetX : NIGHTBORNE_CONFIG.idleCropOffsetX;
  const cropOffsetY = isAttacking ? NIGHTBORNE_CONFIG.attackCropOffsetY : NIGHTBORNE_CONFIG.idleCropOffsetY;
  const cropWidth = isAttacking ? NIGHTBORNE_CONFIG.attackCropWidth : NIGHTBORNE_CONFIG.idleCropWidth;
  const cropHeight = isAttacking ? NIGHTBORNE_CONFIG.attackCropHeight : NIGHTBORNE_CONFIG.idleCropHeight;

  // 상태 변경 시 frame 리셋
  useEffect(() => {
    setFrame(0);
  }, [isAttacking]);

  // 컨테이너 크기 - idle 기준 고정
  const scaledSize = size * 2.4;
  const baseScale = scaledSize / NIGHTBORNE_CONFIG.idleCropHeight;
  const containerWidth = NIGHTBORNE_CONFIG.idleCropWidth * baseScale;
  const containerHeight = NIGHTBORNE_CONFIG.idleCropHeight * baseScale * 0.55; // HP바 가깝게

  // 실제 스프라이트 크기 - idle 기준 scale 고정
  const scale = scaledSize / NIGHTBORNE_CONFIG.idleCropHeight;
  const displayWidth = cropWidth * scale;
  const displayHeight = cropHeight * scale;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % totalFrames);
    }, speed);
    return () => clearInterval(interval);
  }, [totalFrames, speed]);

  // frame이 totalFrames를 초과하지 않도록 보정
  const safeFrame = frame % totalFrames;
  const bgX = -(safeFrame * NIGHTBORNE_CONFIG.frameWidth + cropOffsetX) * scale;
  const bgY = -(row * NIGHTBORNE_CONFIG.frameHeight + cropOffsetY) * scale;

  return (
    <div className={`relative ${className}`} style={{ width: containerWidth, height: containerHeight, overflow: 'visible' }}>
      <div
        className="absolute"
        style={{
          width: displayWidth,
          height: displayHeight,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -47%) scaleX(-1)',
          backgroundImage: 'url(/sprites/mob/NightBorne.png)',
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundSize: `${NIGHTBORNE_CONFIG.sheetWidth * scale}px ${NIGHTBORNE_CONFIG.sheetHeight * scale}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter: 'none',
        }}
      />
    </div>
  );
}

// 슬라임 보스 실루엣
export function SlimeBossSilhouette({ size = 180, className = '' }: CharacterProps) {
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
    </svg>
  );
}

// 이스터에그 적 - PNG 이미지 (1.5배 스케일)
function EasterEggEnemy({ imageUrl, size }: { imageUrl: string; size: number }) {
  const scaledSize = size * 1.5;

  return (
    <div
      className="relative"
      style={{
        width: scaledSize,
        height: scaledSize,
      }}
    >
      <img
        src={imageUrl}
        alt="Easter Egg Enemy"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          filter: 'none',
        }}
      />
    </div>
  );
}

// 캐릭터 매핑
export function getEnemyCharacter(templateId: string, size: number, isAttacking: boolean = false) {
  switch (templateId) {
    case 'goblin':
      return <GoblinSprite size={size} isAttacking={isAttacking} />;
    case 'skeleton':
      return <SkeletonSprite size={size} isAttacking={isAttacking} />;
    case 'flying_eye':
      return <FlyingEyeSprite size={size * 0.8} variant="red" isAttacking={isAttacking} />;
    case 'green_flying_eye':
      return <FlyingEyeSprite size={size * 0.8} variant="green" isAttacking={isAttacking} />;
    case 'acid_mushroom':
      return <MushroomSprite size={size} variant="acid" isAttacking={isAttacking} />;
    case 'mushroom':
      return <MushroomSprite size={size} variant="normal" isAttacking={isAttacking} />;
    case 'gremlin_nob':
      return <EvilWizardSprite size={size * 1.2} isAttacking={isAttacking} />;
    case 'slime_boss':
      return <NightBorneSprite size={size * 1.5} isAttacking={isAttacking} />;
    // 이스터에그 적
    case 'real_tukbug':
      return <EasterEggEnemy imageUrl="/sprites/mob/easteregg/tukbug.png" size={size} />;
    case 'kkuchu':
      return <EasterEggEnemy imageUrl="/sprites/mob/easteregg/kkuchu.png" size={size} />;
    default:
      return <GoblinSprite size={size} isAttacking={isAttacking} />;
  }
}
