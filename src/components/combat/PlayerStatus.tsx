import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Player } from '../../types/player';
import { Status } from '../../types/status';
import { HealthBar } from '../common/HealthBar';
import { STATUS_INFO } from '../../types/status';
import { WarriorSprite } from './characters';
import { useCombatStore } from '../../stores/combatStore';
import { useGameStore } from '../../stores/gameStore';
import {
  VulnerableIcon,
  WeakIcon,
  StrengthIcon,
  DexterityIcon,
  PoisonIcon,
  MetallicizeIcon,
  InvulnerableIcon,
} from './icons';

// 스킬 이펙트 컴포넌트 (export해서 Enemy에서도 사용)
export function SkillEffect({ isActive, color = 'cyan' }: { isActive: boolean; color?: 'cyan' | 'green' }) {
  if (!isActive) return null;

  // 고정된 화살표 위치들 (x: 가로, y: 세로 오프셋, delay: 지연시간)
  const arrows = [
    { x: -45, y: 25, delay: 0.02 },
    { x: -22, y: -15, delay: 0.08 },
    { x: 0, y: 12, delay: 0 },
    { x: 22, y: -22, delay: 0.05 },
    { x: 45, y: 5, delay: 0.1 },
  ];

  const colors = color === 'green'
    ? { fill: 'rgba(74, 222, 128, 0.9)', stroke: 'rgba(134, 239, 172, 1)', glow: 'rgba(34, 197, 94, 1)', glowBg: 'rgba(34, 197, 94, 0.5)' }
    : { fill: 'rgba(125, 211, 252, 0.9)', stroke: 'rgba(186, 230, 253, 1)', glow: 'rgba(56, 189, 248, 1)', glowBg: 'rgba(56, 189, 248, 0.5)' };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: '40%',
        top: '30%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: '120px',
        height: '100px',
      }}
    >
      {/* 위쪽 화살표들 */}
      {arrows.map((arrow, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: '50%',
            bottom: `${arrow.y}px`,
            marginLeft: `${arrow.x}px`,
            animation: `skillArrowFloat 0.7s ease-out forwards`,
            animationDelay: `${arrow.delay}s`,
          }}
        >
          <svg
            width="20"
            height="28"
            viewBox="0 0 20 28"
            style={{
              filter: `drop-shadow(0 0 8px ${colors.glow})`,
            }}
          >
            <path
              d="M10 0 L18 12 L13 12 L13 28 L7 28 L7 12 L2 12 Z"
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="1"
            />
          </svg>
        </div>
      ))}

      {/* 중앙 글로우 이펙트 */}
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2"
        style={{
          width: '100px',
          height: '80px',
          background: `radial-gradient(ellipse at center bottom, ${colors.glowBg} 0%, transparent 70%)`,
          animation: 'skillGlow 0.5s ease-out forwards',
        }}
      />

      <style>{`
        @keyframes skillArrowFloat {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.8);
          }
          20% {
            opacity: 1;
            transform: translateY(-10px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-70px) scale(0.6);
          }
        }
        @keyframes skillGlow {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.8);
          }
          30% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) scale(1.3);
          }
        }
      `}</style>
    </div>
  );
}

// 디버프 이펙트 컴포넌트 (아래 화살표)
export function DebuffEffect({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  // 고정된 화살표 위치들 (x: 가로, y: 세로 오프셋, delay: 지연시간)
  const arrows = [
    { x: -45, y: 60, delay: 0.02 },
    { x: -22, y: 30, delay: 0.08 },
    { x: 0, y: 50, delay: 0 },
    { x: 22, y: 25, delay: 0.05 },
    { x: 45, y: 45, delay: 0.1 },
  ];

  const colors = { fill: 'rgba(168, 85, 247, 0.9)', stroke: 'rgba(192, 132, 252, 1)', glow: 'rgba(147, 51, 234, 1)', glowBg: 'rgba(147, 51, 234, 0.5)' };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: '40%',
        top: '10%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: '120px',
        height: '100px',
      }}
    >
      {/* 아래쪽 화살표들 */}
      {arrows.map((arrow, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: '50%',
            top: `${arrow.y}px`,
            marginLeft: `${arrow.x}px`,
            animation: `debuffArrowFall 0.7s ease-out forwards`,
            animationDelay: `${arrow.delay}s`,
          }}
        >
          <svg
            width="20"
            height="28"
            viewBox="0 0 20 28"
            style={{
              filter: `drop-shadow(0 0 8px ${colors.glow})`,
              transform: 'rotate(180deg)',
            }}
          >
            <path
              d="M10 0 L18 12 L13 12 L13 28 L7 28 L7 12 L2 12 Z"
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="1"
            />
          </svg>
        </div>
      ))}

      {/* 중앙 글로우 이펙트 */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2"
        style={{
          width: '100px',
          height: '80px',
          background: `radial-gradient(ellipse at center, ${colors.glowBg} 0%, transparent 70%)`,
          animation: 'debuffGlow 0.5s ease-out forwards',
        }}
      />

      <style>{`
        @keyframes debuffArrowFall {
          0% {
            opacity: 0;
            transform: translateY(-40px) scale(0.8);
          }
          20% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(60px) scale(0.6);
          }
        }
        @keyframes debuffGlow {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.8);
          }
          30% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) scale(1.3);
          }
        }
      `}</style>
    </div>
  );
}

interface PlayerStatusProps {
  player: Player;
  block: number;
  statuses: Status[];
  animation?: 'idle' | 'attack' | 'attack_combo' | 'hurt' | 'skill' | 'death';
  animationKey?: number; // 같은 애니메이션 재트리거용
  attackTargetPos?: { x: number; y: number } | null;
  enemyCount?: number;
  onAnimationEnd?: () => void;
  incomingDamage?: number; // 예상 HP 손실 (LOSE_HP 카드)
}

function StatusBadge({ status }: { status: Status }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const badgeRef = useRef<HTMLDivElement>(null);
  const info = STATUS_INFO[status.type];

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'VULNERABLE':
        return <VulnerableIcon size={14} color="#ff6b6b" />;
      case 'WEAK':
        return <WeakIcon size={14} color="#a78bfa" />;
      case 'STRENGTH':
        return <StrengthIcon size={14} color="#4ade80" />;
      case 'STRENGTH_DOWN':
        return <StrengthIcon size={14} color="#ff6b6b" />;
      case 'DEXTERITY':
        return <DexterityIcon size={14} color="#60a5fa" />;
      case 'POISON':
        return <PoisonIcon size={14} color="#84cc16" />;
      case 'METALLICIZE':
        return <MetallicizeIcon size={14} color="#94a3b8" />;
      case 'INVULNERABLE':
        return <InvulnerableIcon size={14} color="#fbbf24" />;
      case 'HEAL_REDUCTION':
        return <span style={{ fontSize: '14px', filter: 'grayscale(1)' }}>❤️</span>;
      case 'UNDEAD':
        return <span style={{ fontSize: '14px' }}>💀</span>;
      default:
        return null;
    }
  };

  const handleMouseEnter = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setTooltipPos({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
    setShowTooltip(true);
  };

  return (
    <div
      ref={badgeRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-help
          ${info.isDebuff ? 'status-debuff' : 'status-buff'}
        `}
        style={{
          boxShadow: info.isDebuff
            ? '0 0 8px rgba(180, 60, 60, 0.4)'
            : '0 0 8px rgba(60, 180, 60, 0.4)',
        }}
      >
        {getStatusIcon(status.type)}
        <span className="text-white font-title text-xs">{status.stacks}</span>
      </div>

      {/* 툴팁 - Portal로 body에 렌더링 */}
      {showTooltip && createPortal(
        <div
          className="fixed px-3 py-2 rounded-lg pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 10,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(0, 0, 0, 0.95)',
            border: `2px solid ${info.isDebuff ? '#e04040' : '#4ade80'}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
            width: '180px',
            zIndex: 99999,
          }}
        >
          <div className="font-title text-sm mb-1 whitespace-nowrap text-center" style={{ color: info.isDebuff ? '#ff6b6b' : '#4ade80' }}>
            {info.name}
          </div>
          <div className="font-card text-xs text-gray-300 text-center">
            {info.description}
          </div>
          {/* 화살표 */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full"
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `8px solid ${info.isDebuff ? '#e04040' : '#4ade80'}`,
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
}

function BlockBadge({ block }: { block: number }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="absolute -left-2 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-help"
      style={{
        width: '44px',
        height: '52px',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* 방패 모양 SVG 배경 */}
      <svg
        viewBox="0 0 44 52"
        className="absolute inset-0 w-full h-full"
        style={{
          filter: 'drop-shadow(0 0 12px rgba(40, 102, 168, 0.8))',
        }}
      >
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--block-light)" />
            <stop offset="100%" stopColor="var(--block-dark)" />
          </linearGradient>
          <linearGradient id="shieldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        {/* 방패 외곽 */}
        <path
          d="M22 2 L40 8 L40 24 C40 36 30 46 22 50 C14 46 4 36 4 24 L4 8 Z"
          fill="url(#shieldGradient)"
          stroke="var(--block-bright)"
          strokeWidth="2.5"
        />
        {/* 하이라이트 */}
        <path
          d="M22 4 L38 9.5 L38 24 C38 34.5 29 43.5 22 47 C15 43.5 6 34.5 6 24 L6 9.5 Z"
          fill="url(#shieldHighlight)"
        />
        {/* 내부 방패 라인 */}
        <path
          d="M22 10 L32 14 L32 24 C32 32 26 38 22 41 C18 38 12 32 12 24 L12 14 Z"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />
      </svg>
      {/* 숫자 */}
      <span
        className="font-title text-lg font-bold text-white relative z-10"
        style={{
          textShadow: '0 0 10px rgba(40, 102, 168, 0.8), 0 2px 4px rgba(0,0,0,0.5)',
          marginTop: '-4px',
        }}
      >
        {block}
      </span>

      {/* 툴팁 - 오른쪽에 표시 */}
      {showTooltip && (
        <div
          className="absolute z-[9999] px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none"
          style={{
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: '12px',
            background: 'rgba(0, 0, 0, 0.95)',
            border: '2px solid var(--block-bright)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div className="font-title text-sm mb-1 text-[var(--block-bright)]">
            방어도
          </div>
          <div className="font-card text-xs text-gray-300">
            피해를 받으면 방어도가 먼저 감소합니다.
            <br />
            턴이 끝나면 방어도가 0이 됩니다.
          </div>
          {/* 화살표 - 왼쪽으로 */}
          <div
            style={{
              position: 'absolute',
              right: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '8px solid var(--block-bright)',
            }}
          />
        </div>
      )}
    </div>
  );
}

export function PlayerStatus({ player, block, statuses, animation = 'idle', animationKey = 0, attackTargetPos, enemyCount = 1, onAnimationEnd, incomingDamage = 0 }: PlayerStatusProps) {
  // 플레이어 이름
  const playerName = useGameStore(state => state.playerName);

  // 디버프 이펙트 상태
  const [showDebuffEffect, setShowDebuffEffect] = useState(false);
  const playerDebuffTrigger = useCombatStore(state => state.playerDebuffTrigger);
  const prevDebuffTrigger = useRef(playerDebuffTrigger);

  // 디버프 트리거 감지
  useEffect(() => {
    if (playerDebuffTrigger > prevDebuffTrigger.current) {
      setShowDebuffEffect(true);
      const timer = setTimeout(() => setShowDebuffEffect(false), 700);
      prevDebuffTrigger.current = playerDebuffTrigger;
      return () => clearTimeout(timer);
    }
  }, [playerDebuffTrigger]);

  // 공격 시 타겟 위치에 따라 이동 거리 계산
  const getAttackTransform = () => {
    // attack 또는 attack_combo일 때 이동 (combo는 이미 이동한 상태 유지)
    if (animation !== 'attack' && animation !== 'attack_combo') return 'translateX(0)';
    if (!attackTargetPos) return 'translateX(150px)'; // 기본값

    // 플레이어 기준 위치 (화면 왼쪽 1/3 지점 정도)
    const baseX = window.innerWidth * 0.35;
    const dx = attackTargetPos.x - baseX;

    // 모바일 감지 (높이 500px 미만)
    const isMobile = window.innerHeight < 500;

    // 몹 마릿수에 따라 이동 비율 조절 (모바일에서는 더 크게)
    let ratio;
    if (isMobile) {
      ratio = enemyCount === 1 ? 0.9 : enemyCount === 2 ? 1.1 : 1.5;
    } else {
      ratio = enemyCount === 1 ? 0.55 : enemyCount === 2 ? 0.75 : 0.9;
    }
    const moveX = dx * ratio;

    return `translateX(${moveX}px)`;
  };

  return (
    <div data-player className="flex flex-col items-center">
      {/* 플레이어 캐릭터 프레임 */}
      <div className="relative">
        {/* 블록 글로우 */}
        {block > 0 && (
          <div
            className="absolute -inset-6 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(40, 102, 168, 0.4) 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        )}

        {/* 스킬 이펙트 */}
        <SkillEffect isActive={animation === 'skill'} />

        {/* 디버프 이펙트 */}
        <DebuffEffect isActive={showDebuffEffect} />

        {/* 플레이어 캐릭터 SVG */}
        <div
          className="relative transition-transform duration-[400ms]"
          style={{
            filter: block > 0
              ? 'drop-shadow(0 0 15px rgba(40, 102, 168, 0.6))'
              : 'none',
            transform: getAttackTransform(),
          }}
        >
          <WarriorSprite size={180} animation={animation} animationKey={animationKey} onAnimationEnd={onAnimationEnd} className="relative -left-2" />
          {/* 바닥 그림자 */}
          <div
            className="absolute left-1/2"
            style={{
              bottom: '-10px',
              width: '100px',
              height: '20px',
              background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translateX(-83%)',
              zIndex: -1,
            }}
          />
        </div>

        {/* 블록 뱃지 - 방패 모양 */}
        {block > 0 && (
          <BlockBadge block={block} />
        )}
      </div>

      {/* 플레이어 이름 */}
      <div
        className="mt-4 px-3 py-0.5 -ml-14"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '2px',
        }}
      >
        <span
          className="text-base"
          style={{
            fontFamily: '"NeoDunggeunmo", cursive',
            color: playerName === '상습 탈주자' ? '#ff4444' : 'white',
            textShadow: playerName === '상습 탈주자'
              ? '0 0 8px rgba(255, 68, 68, 0.6)'
              : '0 1px 2px rgba(0,0,0,0.8)'
          }}
        >
          {playerName}
        </span>
      </div>

      {/* 체력바 */}
      <div className="w-36 mt-2 -ml-14">
        <HealthBar
          current={player.currentHp}
          max={player.maxHp}
          block={0}
          size="md"
          showNumbers
          incomingDamage={incomingDamage}
        />
      </div>

      {/* 상태 효과 - 3줄 높이 고정 */}
      <div className="relative z-[100] flex gap-2 mt-3 flex-wrap justify-center content-start max-w-40 -ml-14 min-h-[100px]">
        {statuses.map((status, index) => (
          <StatusBadge key={index} status={status} />
        ))}
      </div>
    </div>
  );
}
