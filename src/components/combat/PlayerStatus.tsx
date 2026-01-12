import { useState } from 'react';
import { Player } from '../../types/player';
import { Status } from '../../types/status';
import { HealthBar } from '../common/HealthBar';
import { STATUS_INFO } from '../../types/status';
import { WarriorSprite } from './characters';
import {
  VulnerableIcon,
  WeakIcon,
  StrengthIcon,
  DexterityIcon,
  PoisonIcon,
} from './icons';

interface PlayerStatusProps {
  player: Player;
  block: number;
  statuses: Status[];
  animation?: 'idle' | 'attack' | 'hurt';
  attackTargetPos?: { x: number; y: number } | null;
  enemyCount?: number;
  onAnimationEnd?: () => void;
}

function StatusBadge({ status }: { status: Status }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const info = STATUS_INFO[status.type];

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'VULNERABLE':
        return <VulnerableIcon size={14} color="#ff6b6b" />;
      case 'WEAK':
        return <WeakIcon size={14} color="#a78bfa" />;
      case 'STRENGTH':
        return <StrengthIcon size={14} color="#4ade80" />;
      case 'DEXTERITY':
        return <DexterityIcon size={14} color="#60a5fa" />;
      case 'POISON':
        return <PoisonIcon size={14} color="#84cc16" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
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

      {/* 툴팁 */}
      {showTooltip && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg whitespace-nowrap z-[9999] pointer-events-none"
          style={{
            background: 'rgba(0, 0, 0, 0.95)',
            border: `2px solid ${info.isDebuff ? '#e04040' : '#4ade80'}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div className="font-title text-sm mb-1" style={{ color: info.isDebuff ? '#ff6b6b' : '#4ade80' }}>
            {info.name}
          </div>
          <div className="font-card text-xs text-gray-300 max-w-48">
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
        </div>
      )}
    </div>
  );
}

function BlockBadge({ block }: { block: number }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="absolute -right-4 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-help"
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

      {/* 툴팁 - 왼쪽에 표시 (적 이미지에 가려지지 않게) */}
      {showTooltip && (
        <div
          className="absolute z-[9999] px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none"
          style={{
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginRight: '12px',
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
          {/* 화살표 - 오른쪽으로 */}
          <div
            style={{
              position: 'absolute',
              left: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '8px solid var(--block-bright)',
            }}
          />
        </div>
      )}
    </div>
  );
}

export function PlayerStatus({ player, block, statuses, animation = 'idle', attackTargetPos, enemyCount = 1, onAnimationEnd }: PlayerStatusProps) {
  // 공격 시 타겟 위치에 따라 이동 거리 계산
  const getAttackTransform = () => {
    if (animation !== 'attack') return 'translateX(0)';
    if (!attackTargetPos) return 'translateX(200px)'; // 기본값

    // 플레이어 기준 위치 (화면 왼쪽 1/3 지점 정도)
    const baseX = window.innerWidth * 0.35;
    const dx = attackTargetPos.x - baseX;

    // 몹 마릿수에 따라 이동 비율 조절
    const ratio = enemyCount === 1 ? 0.55 : enemyCount === 2 ? 0.65 : 0.75;
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

        {/* 플레이어 캐릭터 SVG */}
        <div
          className="relative transition-transform duration-200"
          style={{
            filter: block > 0
              ? 'drop-shadow(0 0 15px rgba(40, 102, 168, 0.6))'
              : 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.6))',
            transform: getAttackTransform(),
          }}
        >
          <WarriorSprite size={180} animation={animation} onAnimationEnd={onAnimationEnd} />
        </div>

        {/* 블록 뱃지 - 방패 모양 */}
        {block > 0 && (
          <BlockBadge block={block} />
        )}
      </div>

      {/* 체력바 */}
      <div className="w-36 mt-4 -ml-14">
        <HealthBar
          current={player.currentHp}
          max={player.maxHp}
          block={0}
          size="md"
          showNumbers
        />
      </div>

      {/* 상태 효과 - 고정 높이로 레이아웃 안정화 */}
      <div className="flex gap-2 mt-3 flex-wrap justify-center max-w-36 min-h-[32px] -ml-14">
        {statuses.map((status, index) => (
          <StatusBadge key={index} status={status} />
        ))}
      </div>
    </div>
  );
}
