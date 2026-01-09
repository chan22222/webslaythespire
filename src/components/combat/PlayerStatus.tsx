import { useState } from 'react';
import { Player } from '../../types/player';
import { Status } from '../../types/status';
import { HealthBar } from '../common/HealthBar';
import { STATUS_INFO } from '../../types/status';
import { IroncladSilhouette } from './characters';
import {
  ShieldIcon,
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
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg whitespace-nowrap z-50"
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

export function PlayerStatus({ player, block, statuses }: PlayerStatusProps) {
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
          className="relative transition-all duration-300"
          style={{
            filter: block > 0
              ? 'drop-shadow(0 0 15px rgba(40, 102, 168, 0.6))'
              : 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.6))',
          }}
        >
          <IroncladSilhouette size={90} />
        </div>

        {/* 블록 뱃지 */}
        {block > 0 && (
          <div
            className="absolute -right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--block-light) 0%, var(--block-dark) 100%)',
              border: '3px solid var(--block-bright)',
              boxShadow: '0 0 25px rgba(40, 102, 168, 0.8), inset 0 0 15px rgba(255,255,255,0.2)',
            }}
          >
            <ShieldIcon size={20} color="#fff" className="absolute opacity-30" />
            <span className="font-title text-lg font-bold text-white relative z-10">{block}</span>
          </div>
        )}
      </div>

      {/* 체력바 */}
      <div className="w-36 mt-4">
        <HealthBar
          current={player.currentHp}
          max={player.maxHp}
          block={0}
          size="md"
          showNumbers
        />
      </div>

      {/* 상태 효과 - 고정 높이로 레이아웃 안정화 */}
      <div className="flex gap-2 mt-3 flex-wrap justify-center max-w-36 min-h-[32px]">
        {statuses.map((status, index) => (
          <StatusBadge key={index} status={status} />
        ))}
      </div>
    </div>
  );
}
