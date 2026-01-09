import { useState } from 'react';
import { EnemyInstance } from '../../types/enemy';
import { HealthBar } from '../common/HealthBar';
import { STATUS_INFO } from '../../types/status';
import { getEnemyCharacter } from './characters';
import {
  SwordIcon,
  ShieldIcon,
  PowerIcon,
  SkullIcon,
  VulnerableIcon,
  WeakIcon,
  StrengthIcon,
  PoisonIcon,
} from './icons';

interface EnemyProps {
  enemy: EnemyInstance;
  isTargetable?: boolean;
}

function EnemyStatusBadge({ status }: { status: { type: string; stacks: number } }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const info = STATUS_INFO[status.type as keyof typeof STATUS_INFO];

  const getIcon = () => {
    switch (status.type) {
      case 'VULNERABLE':
        return <VulnerableIcon size={14} color="#ff6b6b" />;
      case 'WEAK':
        return <WeakIcon size={14} color="#a78bfa" />;
      case 'STRENGTH':
        return <StrengthIcon size={14} color="#4ade80" />;
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
        {getIcon()}
        <span className="text-white font-title text-xs">{status.stacks}</span>
      </div>

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

export function Enemy({ enemy, isTargetable = false }: EnemyProps) {
  const [showIntentTooltip, setShowIntentTooltip] = useState(false);

  const getIntentTooltip = () => {
    switch (enemy.intent.type) {
      case 'ATTACK':
        const hits = enemy.intent.hits || 1;
        return hits > 1
          ? `플레이어에게 ${hits}회 공격`
          : '플레이어에게 공격';
      case 'DEFEND':
        return '방어도를 획득합니다';
      case 'BUFF':
        return '힘 +3 (공격력 증가)';
      case 'DEBUFF':
        return '약화 부여 (공격력 25% 감소)';
      default:
        return '알 수 없는 행동';
    }
  };

  const getIntentDisplay = () => {
    switch (enemy.intent.type) {
      case 'ATTACK':
        return (
          <div className="intent-attack flex items-center gap-2 px-4 py-2 rounded-lg">
            <SwordIcon size={22} color="#fff" />
            <span className="font-title text-lg font-bold text-white">
              {enemy.intent.damage}
            </span>
            {enemy.intent.hits && enemy.intent.hits > 1 && (
              <span className="text-sm text-white/70 font-title">x{enemy.intent.hits}</span>
            )}
          </div>
        );
      case 'DEFEND':
        return (
          <div className="intent-defend flex items-center gap-2 px-4 py-2 rounded-lg">
            <ShieldIcon size={22} color="#fff" />
            <span className="font-title text-lg font-bold text-white">
              {enemy.intent.block}
            </span>
          </div>
        );
      case 'BUFF':
        return (
          <div className="intent-buff flex items-center gap-2 px-4 py-2 rounded-lg">
            <PowerIcon size={22} color="#fff" />
            <span className="font-title text-sm text-white">강화</span>
          </div>
        );
      case 'DEBUFF':
        return (
          <div className="intent-debuff flex items-center gap-2 px-4 py-2 rounded-lg">
            <SkullIcon size={22} color="#fff" />
            <span className="font-title text-sm text-white">저주</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-medium)] border-2 border-[var(--gold-dark)]">
            <span className="text-lg font-title text-[var(--gold)]">?</span>
          </div>
        );
    }
  };

  if (enemy.currentHp <= 0) return null;

  return (
    <div
      data-enemy-id={enemy.instanceId}
      className={`flex flex-col items-center transition-all duration-300 ${isTargetable ? 'scale-105' : ''}`}
    >
      {/* 인텐트 표시 */}
      <div
        className="mb-6 animate-float relative cursor-help"
        onMouseEnter={() => setShowIntentTooltip(true)}
        onMouseLeave={() => setShowIntentTooltip(false)}
      >
        {getIntentDisplay()}

        {/* 인텐트 툴팁 */}
        {showIntentTooltip && (
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg whitespace-nowrap z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              border: '2px solid var(--gold)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
            }}
          >
            <span className="font-card text-sm text-[var(--gold-light)]">
              {getIntentTooltip()}
            </span>
            {/* 화살표 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full"
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid var(--gold)',
              }}
            />
          </div>
        )}
      </div>

      {/* 적 본체 */}
      <div className="relative">
        {/* 타겟팅 글로우 */}
        {isTargetable && (
          <div
            className="absolute -inset-8 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(224, 64, 64, 0.4) 0%, transparent 70%)',
              animation: 'pulse 1s ease-in-out infinite',
            }}
          />
        )}

        {/* 적 캐릭터 SVG */}
        <div
          className={`relative transition-all duration-200 ${isTargetable ? 'drop-shadow-[0_0_20px_rgba(224,64,64,0.5)]' : ''}`}
          style={{
            filter: isTargetable
              ? 'drop-shadow(0 0 15px rgba(224, 64, 64, 0.6))'
              : 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.5))',
          }}
        >
          {getEnemyCharacter(enemy.templateId, 100, isTargetable)}
        </div>

        {/* 블록 표시 */}
        {enemy.block > 0 && (
          <div
            className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--block-light) 0%, var(--block-dark) 100%)',
              border: '3px solid var(--block-bright)',
              boxShadow: '0 0 20px rgba(40, 102, 168, 0.7), inset 0 0 10px rgba(255,255,255,0.2)',
            }}
          >
            <ShieldIcon size={18} color="#fff" className="absolute opacity-30" />
            <span className="font-title text-base font-bold text-white relative z-10">{enemy.block}</span>
          </div>
        )}
      </div>

      {/* 이름 */}
      <div
        className="mt-4 px-4 py-1 rounded-full"
        style={{
          background: 'linear-gradient(180deg, rgba(30,25,20,0.9) 0%, rgba(15,12,10,0.95) 100%)',
          border: '1px solid var(--gold-dark)',
        }}
      >
        <span className="font-title text-sm text-[var(--gold-light)] tracking-wide">
          {enemy.name}
        </span>
      </div>

      {/* 체력바 */}
      <div className="w-40 mt-3">
        <HealthBar
          current={enemy.currentHp}
          max={enemy.maxHp}
          block={0}
          size="sm"
          showNumbers
        />
      </div>

      {/* 상태 효과 - 고정 높이로 레이아웃 안정화 */}
      <div className="flex gap-2 mt-3 flex-wrap justify-center max-w-40 min-h-[32px]">
        {enemy.statuses.map((status, index) => (
          <EnemyStatusBadge key={index} status={status} />
        ))}
      </div>
    </div>
  );
}
