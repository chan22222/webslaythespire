import { useState } from 'react';
import { EnemyInstance } from '../../types/enemy';
import { HealthBar } from '../common/HealthBar';
import { STATUS_INFO } from '../../types/status';
import { getEnemyCharacter } from './characters';
import {
  VulnerableIcon,
  WeakIcon,
  StrengthIcon,
  PoisonIcon,
} from './icons';

interface EnemyProps {
  enemy: EnemyInstance;
  isTargetable?: boolean;
}

// ===== 게임 스타일 의도 표시 컴포넌트 =====

function AttackIntent({ damage, hits }: { damage: number; hits?: number }) {
  return (
    <div className="relative flex items-center" style={{ height: '48px' }}>
      {/* 검 아이콘 */}
      <div className="relative" style={{ width: '32px', height: '48px' }}>
        <svg viewBox="0 0 32 48" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 8px rgba(184, 37, 37, 0.8))' }}>
          <defs>
            <linearGradient id="swordBlade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e8e8e8" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#c0c0c0" />
            </linearGradient>
            <linearGradient id="swordHandle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="50%" stopColor="#A0522D" />
              <stop offset="100%" stopColor="#6B3510" />
            </linearGradient>
          </defs>
          {/* 검날 */}
          <path
            d="M16 2 L20 32 L16 38 L12 32 Z"
            fill="url(#swordBlade)"
            stroke="#888"
            strokeWidth="0.5"
          />
          {/* 가드 */}
          <rect x="8" y="32" width="16" height="4" rx="1" fill="#c9a227" stroke="#a07d1c" strokeWidth="0.5" />
          {/* 손잡이 */}
          <rect x="13" y="36" width="6" height="10" rx="1" fill="url(#swordHandle)" />
          {/* 폼멜 */}
          <circle cx="16" cy="46" r="2" fill="#c9a227" />
        </svg>
      </div>
      {/* 데미지 숫자 배지 */}
      <div
        className="relative flex items-center justify-center -ml-1"
        style={{
          width: '36px',
          height: '36px',
          background: 'linear-gradient(135deg, #e04040 0%, #b82525 50%, #7a1818 100%)',
          borderRadius: '50%',
          border: '2px solid #ff6b6b',
          boxShadow: '0 0 15px rgba(184, 37, 37, 0.7), inset 0 0 8px rgba(255,255,255,0.2)',
        }}
      >
        <div className="flex flex-col items-center">
          <span
            className="font-title text-lg font-bold text-white leading-none"
            style={{ textShadow: '0 0 8px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0,0,0,0.9)' }}
          >
            {damage}
          </span>
          {hits && hits > 1 && (
            <span className="font-title text-[9px] text-white/90 leading-none" style={{ marginTop: '1px' }}>
              x{hits}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DefendIntent({ block }: { block: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: '52px', height: '58px' }}>
      {/* 배경 글로우 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, rgba(40, 102, 168, 0.5) 0%, transparent 70%)',
          filter: 'blur(6px)',
        }}
      />
      {/* 방패 형태 SVG */}
      <svg viewBox="0 0 52 58" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(40, 102, 168, 0.8))' }}>
        <defs>
          <linearGradient id="defendGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--block-light)" />
            <stop offset="100%" stopColor="var(--block-dark)" />
          </linearGradient>
          <linearGradient id="defendHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        {/* 방패 외곽 */}
        <path
          d="M26 3 L47 10 L47 28 C47 42 36 52 26 56 C16 52 5 42 5 28 L5 10 Z"
          fill="url(#defendGradient)"
          stroke="var(--block-bright)"
          strokeWidth="2.5"
        />
        {/* 하이라이트 */}
        <path
          d="M26 6 L44 12 L44 28 C44 40 34 49 26 52 C18 49 8 40 8 28 L8 12 Z"
          fill="url(#defendHighlight)"
        />
        {/* 내부 장식 */}
        <path
          d="M26 14 L38 18 L38 28 C38 36 32 42 26 45 C20 42 14 36 14 28 L14 18 Z"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
      </svg>
      {/* 방어도 숫자 */}
      <span
        className="relative z-10 font-title text-xl font-bold text-white"
        style={{ textShadow: '0 0 10px rgba(74, 154, 216, 0.8), 0 2px 4px rgba(0,0,0,0.8)', marginTop: '-4px' }}
      >
        {block}
      </span>
    </div>
  );
}

function BuffIntent() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: '48px', height: '48px' }}>
      {/* 배경 글로우 */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(74, 222, 128, 0.5) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
      {/* 상승 화살표 형태 SVG */}
      <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.8))' }}>
        <defs>
          <linearGradient id="buffGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#166534" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
        {/* 원형 배경 */}
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="url(#buffGradient)"
          stroke="#86efac"
          strokeWidth="2"
        />
        {/* 상승 화살표 */}
        <path
          d="M24 10 L32 22 L27 22 L27 36 L21 36 L21 22 L16 22 Z"
          fill="rgba(255,255,255,0.95)"
        />
      </svg>
    </div>
  );
}

function DebuffIntent() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: '48px', height: '48px' }}>
      {/* 배경 글로우 */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
      {/* 하강 화살표 형태 SVG */}
      <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))' }}>
        <defs>
          <linearGradient id="debuffGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {/* 원형 배경 */}
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="url(#debuffGradient)"
          stroke="#d8b4fe"
          strokeWidth="2"
        />
        {/* 하강 화살표 */}
        <path
          d="M24 38 L16 26 L21 26 L21 12 L27 12 L27 26 L32 26 Z"
          fill="rgba(255,255,255,0.95)"
        />
      </svg>
    </div>
  );
}

function UnknownIntent() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: '48px', height: '48px' }}>
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, rgba(212, 168, 75, 0.4) 0%, transparent 70%)',
          filter: 'blur(6px)',
        }}
      />
      <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 8px rgba(212, 168, 75, 0.6))' }}>
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="var(--bg-medium)"
          stroke="var(--gold)"
          strokeWidth="2"
        />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="var(--gold-light)"
          fontSize="20"
          fontWeight="bold"
          fontFamily="Cinzel, serif"
        >
          ?
        </text>
      </svg>
    </div>
  );
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
        const damage = enemy.intent.damage || 0;
        const hits = enemy.intent.hits || 1;
        const totalDamage = damage * hits;
        return hits > 1
          ? `${damage} 데미지를 ${hits}회 가합니다. (총 ${totalDamage})`
          : `${damage} 데미지를 가합니다.`;
      case 'DEFEND':
        const block = enemy.intent.block || 0;
        return `${block} 방어도를 획득합니다.`;
      case 'BUFF':
        return '자신을 강화합니다. (힘 +3)';
      case 'DEBUFF':
        return '약화를 부여합니다. (피해량 25% 감소)';
      default:
        return '알 수 없는 행동';
    }
  };

  const getIntentDisplay = () => {
    switch (enemy.intent.type) {
      case 'ATTACK':
        return <AttackIntent damage={enemy.intent.damage || 0} hits={enemy.intent.hits} />;
      case 'DEFEND':
        return <DefendIntent block={enemy.intent.block || 0} />;
      case 'BUFF':
        return <BuffIntent />;
      case 'DEBUFF':
        return <DebuffIntent />;
      default:
        return <UnknownIntent />;
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
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg whitespace-nowrap z-[9999] pointer-events-none"
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

        {/* 블록 표시 - 방패 모양 */}
        {enemy.block > 0 && (
          <div
            className="absolute -left-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{ width: '40px', height: '46px' }}
          >
            <svg
              viewBox="0 0 40 46"
              className="absolute inset-0 w-full h-full"
              style={{ filter: 'drop-shadow(0 0 10px rgba(40, 102, 168, 0.8))' }}
            >
              <defs>
                <linearGradient id="enemyShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--block-light)" />
                  <stop offset="100%" stopColor="var(--block-dark)" />
                </linearGradient>
              </defs>
              <path
                d="M20 2 L36 8 L36 22 C36 32 28 40 20 44 C12 40 4 32 4 22 L4 8 Z"
                fill="url(#enemyShieldGrad)"
                stroke="var(--block-bright)"
                strokeWidth="2"
              />
              <path
                d="M20 5 L33 10 L33 22 C33 30 26 37 20 40 C14 37 7 30 7 22 L7 10 Z"
                fill="rgba(255,255,255,0.15)"
              />
            </svg>
            <span
              className="relative z-10 font-title text-base font-bold text-white"
              style={{ textShadow: '0 0 8px rgba(40, 102, 168, 0.8), 0 2px 3px rgba(0,0,0,0.6)', marginTop: '-2px' }}
            >
              {enemy.block}
            </span>
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
