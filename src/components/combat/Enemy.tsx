import { useState, useEffect } from 'react';
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
    <div className="relative flex items-center justify-center" style={{ width: '52px', height: '56px' }}>
      {/* 배경 글로우 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.6) 0%, rgba(185, 28, 28, 0.3) 40%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />
      {/* 다이아몬드 형태 SVG */}
      <svg viewBox="0 0 52 56" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.9))' }}>
        <defs>
          <linearGradient id="attackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="attackHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="attackCrack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#450a0a" />
            <stop offset="100%" stopColor="#1c0505" />
          </linearGradient>
        </defs>
        {/* 다이아몬드 */}
        <path
          d="M26 4 L48 28 L26 52 L4 28 Z"
          fill="url(#attackGrad)"
          stroke="#fca5a5"
          strokeWidth="2"
        />
        {/* 하이라이트 */}
        <path
          d="M26 8 L44 28 L26 48 L8 28 Z"
          fill="url(#attackHighlight)"
        />
        {/* 십자 장식 라인 */}
        <path
          d="M26 10 L26 46"
          stroke="url(#attackCrack)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M12 28 L40 28"
          stroke="url(#attackCrack)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* 작은 파편들 */}
        <path d="M10 18 L6 20 L8 24" fill="#ef4444" opacity="0.8" />
        <path d="M42 18 L46 20 L44 24" fill="#ef4444" opacity="0.8" />
        <circle cx="14" cy="38" r="2" fill="#fca5a5" opacity="0.6" />
        <circle cx="38" cy="38" r="1.5" fill="#fca5a5" opacity="0.6" />
      </svg>
      {/* 데미지 숫자 */}
      <div className="relative z-10 flex flex-col items-center">
        <span
          className="font-title text-xl font-bold text-white"
          style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.8), 0 2px 4px rgba(0,0,0,0.8)' }}
        >
          {damage}
        </span>
        {hits && hits > 1 && (
          <span className="font-title text-[10px] text-white/90" style={{ marginTop: '-3px' }}>
            x{hits}
          </span>
        )}
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
    <div className="relative flex items-center justify-center" style={{ width: '52px', height: '56px' }}>
      {/* 배경 글로우 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(74, 222, 128, 0.6) 0%, rgba(22, 163, 74, 0.3) 40%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />
      {/* 상승 불꽃/에너지 형태 SVG */}
      <svg viewBox="0 0 52 56" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 12px rgba(74, 222, 128, 0.9))' }}>
        <defs>
          <linearGradient id="buffGrad" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#166534" />
            <stop offset="40%" stopColor="#22c55e" />
            <stop offset="80%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </linearGradient>
          <linearGradient id="buffHighlight" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.5)" />
          </linearGradient>
        </defs>
        {/* 중앙 불꽃 */}
        <path
          d="M26 4 L32 18 L38 14 L34 28 L42 32 L32 38 L36 48 L26 42 L16 48 L20 38 L10 32 L18 28 L14 14 L20 18 Z"
          fill="url(#buffGrad)"
          stroke="#86efac"
          strokeWidth="2"
        />
        {/* 하이라이트 */}
        <path
          d="M26 8 L30 18 L34 16 L31 26 L36 30 L30 34 L32 42 L26 38 L20 42 L22 34 L16 30 L21 26 L18 16 L22 18 Z"
          fill="url(#buffHighlight)"
        />
        {/* 내부 에너지 코어 */}
        <ellipse cx="26" cy="28" rx="6" ry="8" fill="#bbf7d0" opacity="0.6" />
        <ellipse cx="26" cy="26" rx="3" ry="4" fill="rgba(255,255,255,0.8)" />
        {/* 스파크 이펙트 */}
        <circle cx="8" cy="24" r="2" fill="#4ade80" opacity="0.8" />
        <circle cx="44" cy="24" r="2" fill="#4ade80" opacity="0.8" />
        <circle cx="14" cy="44" r="1.5" fill="#86efac" opacity="0.6" />
        <circle cx="38" cy="44" r="1.5" fill="#86efac" opacity="0.6" />
        {/* 상승 화살표 */}
        <path
          d="M26 14 L32 26 L28 26 L28 40 L24 40 L24 26 L20 26 Z"
          fill="rgba(255,255,255,0.95)"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

function DebuffIntent() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: '52px', height: '56px' }}>
      {/* 배경 글로우 - 어두운 보라 연기 효과 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.6) 0%, rgba(91, 33, 182, 0.3) 40%, transparent 70%)',
          filter: 'blur(10px)',
          animation: 'pulse 2.5s ease-in-out infinite',
        }}
      />
      {/* 깨진 검 형태 SVG */}
      <svg viewBox="0 0 52 56" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.9))' }}>
        <defs>
          <linearGradient id="debuffGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="40%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
          <linearGradient id="debuffHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="crackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f0a1e" />
          </linearGradient>
        </defs>
        {/* 역삼각형 기반 - 방패의 반대, 불안정한 형태 */}
        <path
          d="M26 54 L4 18 L14 4 L26 8 L38 4 L48 18 Z"
          fill="url(#debuffGrad)"
          stroke="#c4b5fd"
          strokeWidth="2"
        />
        {/* 하이라이트 */}
        <path
          d="M26 50 L8 20 L16 8 L26 11 L36 8 L44 20 Z"
          fill="url(#debuffHighlight)"
        />
        {/* 금간 자국 - 깨짐 표현 */}
        <path
          d="M26 12 L24 22 L20 24 L23 30 L18 36 L22 38 L26 50"
          stroke="url(#crackGrad)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26 12 L28 20 L32 23 L29 28 L34 34 L30 37 L26 50"
          stroke="url(#crackGrad)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 작은 파편들 */}
        <path d="M12 26 L8 28 L10 32" fill="#8b5cf6" opacity="0.8" />
        <path d="M40 26 L44 28 L42 32" fill="#8b5cf6" opacity="0.8" />
        <circle cx="16" cy="38" r="2" fill="#a78bfa" opacity="0.6" />
        <circle cx="36" cy="40" r="1.5" fill="#a78bfa" opacity="0.6" />
        {/* 중앙 하강 심볼 */}
        <path
          d="M26 38 L20 28 L23 28 L23 18 L29 18 L29 28 L32 28 Z"
          fill="rgba(255,255,255,0.95)"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1"
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
  const [isDying, setIsDying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // 죽음 감지 및 이펙트 처리
  useEffect(() => {
    if (enemy.currentHp <= 0 && !isDying) {
      setIsDying(true);
      // 딜레이 후 완전히 숨김
      setTimeout(() => {
        setIsVisible(false);
      }, 800);
    }
  }, [enemy.currentHp, isDying]);

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

  if (!isVisible) return null;

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
        style={{
          opacity: isDying ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
        }}
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
            filter: isDying
              ? 'brightness(2) saturate(0) drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))'
              : isTargetable
                ? 'drop-shadow(0 0 15px rgba(224, 64, 64, 0.6))'
                : 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.5))',
            opacity: isDying ? 0 : 1,
            transform: isDying ? 'scale(1.2) translateY(-30px)' : 'scale(1)',
            transition: 'all 0.8s ease-out',
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
          opacity: isDying ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
        }}
      >
        <span className="font-title text-sm text-[var(--gold-light)] tracking-wide">
          {enemy.name}
        </span>
      </div>

      {/* 체력바 */}
      <div
        className="w-40 mt-3"
        style={{
          opacity: isDying ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
        }}
      >
        <HealthBar
          current={enemy.currentHp}
          max={enemy.maxHp}
          block={0}
          size="sm"
          showNumbers
        />
      </div>

      {/* 상태 효과 - 고정 높이로 레이아웃 안정화 */}
      <div
        className="flex gap-2 mt-3 flex-wrap justify-center max-w-40 min-h-[32px]"
        style={{
          opacity: isDying ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
        }}
      >
        {enemy.statuses.map((status, index) => (
          <EnemyStatusBadge key={index} status={status} />
        ))}
      </div>
    </div>
  );
}
