import { useState, useEffect, useRef } from 'react';
import { EnemyInstance } from '../../types/enemy';
import { HealthBar } from '../common/HealthBar';
import { STATUS_INFO } from '../../types/status';
import { getEnemyCharacter } from './characters';
import { useCombatStore } from '../../stores/combatStore';
import { SkillEffect } from './PlayerStatus';
import {
  VulnerableIcon,
  WeakIcon,
  StrengthIcon,
  PoisonIcon,
} from './icons';

interface EnemyProps {
  enemy: EnemyInstance;
  isTargetable?: boolean;
  incomingDamage?: number; // 예상 피해량 (버프/디버프 계산 완료된 값)
  ignoreBlock?: boolean; // 방어도 무시 (신의권능 등)
}

// 몹별 인텐트 위치 오프셋 설정 (양수: 위로, 음수: 아래로)
const ENEMY_INTENT_OFFSET: Record<string, number> = {
  goblin: -50,
  skeleton: -15,
  mushroom: -25,
  acid_mushroom: -25,
  flying_eye: -9,
  green_flying_eye: -9,
  gremlin_nob: 50, // 이블 위자드
  // 새 몹 추가 시 여기에 설정
};

// 몹별 그림자 크기 설정
const ENEMY_SHADOW_SIZE: Record<string, number> = {
  slime_boss: 120, // 나이트본
  gremlin_nob: 90, // 이블 위자드
  // 기본값: 70
};

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

function BuffIntent({ stacks }: { stacks?: number }) {
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
      {/* 스택 수 표시 */}
      {stacks && stacks > 1 && (
        <div className="absolute bottom-1 right-1 z-10">
          <span
            className="font-title text-xs font-bold text-white"
            style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
          >
            +{stacks}
          </span>
        </div>
      )}
    </div>
  );
}

function DebuffIntent({ statusType, stacks }: { statusType?: string; stacks?: number }) {
  // 상태 타입에 따라 색상 결정
  const getColors = () => {
    switch (statusType) {
      case 'POISON':
        return {
          glow: 'rgba(132, 204, 22, 0.6)',
          glowDark: 'rgba(63, 98, 18, 0.3)',
          gradStart: '#bef264',
          gradMid: '#84cc16',
          gradEnd: '#3f6212',
          stroke: '#d9f99d',
          accent: '#84cc16',
          accentLight: '#bef264',
          shadow: 'rgba(132, 204, 22, 0.9)',
        };
      case 'VULNERABLE':
        return {
          glow: 'rgba(239, 68, 68, 0.6)',
          glowDark: 'rgba(153, 27, 27, 0.3)',
          gradStart: '#fca5a5',
          gradMid: '#ef4444',
          gradEnd: '#991b1b',
          stroke: '#fecaca',
          accent: '#ef4444',
          accentLight: '#fca5a5',
          shadow: 'rgba(239, 68, 68, 0.9)',
        };
      case 'UNDEAD': // 언데드화 - 어두운 보라색
        return {
          glow: 'rgba(88, 28, 135, 0.6)',
          glowDark: 'rgba(59, 7, 100, 0.3)',
          gradStart: '#a855f7',
          gradMid: '#7c3aed',
          gradEnd: '#581c87',
          stroke: '#c084fc',
          accent: '#7c3aed',
          accentLight: '#a855f7',
          shadow: 'rgba(88, 28, 135, 0.9)',
        };
      default: // WEAK
        return {
          glow: 'rgba(139, 92, 246, 0.6)',
          glowDark: 'rgba(91, 33, 182, 0.3)',
          gradStart: '#a78bfa',
          gradMid: '#8b5cf6',
          gradEnd: '#5b21b6',
          stroke: '#c4b5fd',
          accent: '#8b5cf6',
          accentLight: '#a78bfa',
          shadow: 'rgba(139, 92, 246, 0.9)',
        };
    }
  };

  const colors = getColors();
  const gradientId = `debuffGrad_${statusType || 'weak'}`;
  const highlightId = `debuffHighlight_${statusType || 'weak'}`;
  const crackId = `crackGrad_${statusType || 'weak'}`;

  // 독 전용 물약병 아이콘
  if (statusType === 'POISON') {
    return (
      <div className="relative flex items-center justify-center" style={{ width: '56px', height: '60px' }}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, ${colors.glow} 0%, ${colors.glowDark} 40%, transparent 70%)`,
            filter: 'blur(12px)',
            animation: 'pulse 2.5s ease-in-out infinite',
          }}
        />
        <svg viewBox="0 0 56 60" className="absolute inset-0 w-full h-full" style={{ filter: `drop-shadow(0 0 14px ${colors.shadow})` }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.gradStart} />
              <stop offset="40%" stopColor={colors.gradMid} />
              <stop offset="100%" stopColor={colors.gradEnd} />
            </linearGradient>
          </defs>
          <g transform="rotate(45 28 30)">
            {/* 물약병 목 */}
            <rect x="23" y="4" width="10" height="10" fill={`url(#${gradientId})`} rx="1.5" />
            {/* 물약병 마개 */}
            <rect x="22" y="0" width="12" height="5" fill={colors.gradMid} opacity="0.7" rx="2" />
            {/* 동그란 물약병 몸체 */}
            <circle cx="28" cy="32" r="20" fill={`url(#${gradientId})`} opacity="0.9" />
            {/* 물약 내용물 하이라이트 */}
            <ellipse cx="22" cy="26" rx="6" ry="5" fill="rgba(255,255,255,0.3)" />
            {/* 거품 */}
            <circle cx="34" cy="24" r="2.5" fill="rgba(255,255,255,0.4)" />
            <circle cx="38" cy="30" r="1.8" fill="rgba(255,255,255,0.3)" />
            <circle cx="20" cy="36" r="1.2" fill="rgba(255,255,255,0.25)" />
          </g>
        </svg>
        {/* 중앙 숫자 - 공격처럼 흰색 */}
        <div className="relative z-10 flex flex-col items-center">
          <span
            className="font-title text-xl font-bold text-white"
            style={{ textShadow: '0 0 10px rgba(132, 204, 22, 0.8), 0 2px 4px rgba(0,0,0,0.8)' }}
          >
            {stacks || 1}
          </span>
        </div>
      </div>
    );
  }

  // 언데드화 전용 해골 이모지
  if (statusType === 'UNDEAD') {
    return (
      <div className="relative flex items-center justify-center" style={{ width: '52px', height: '56px' }}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, ${colors.glow} 0%, ${colors.glowDark} 40%, transparent 70%)`,
            filter: 'blur(12px)',
            animation: 'pulse 2.5s ease-in-out infinite',
          }}
        />
        <span
          className="relative z-10 text-4xl"
          style={{
            filter: `drop-shadow(0 0 12px ${colors.shadow})`,
          }}
        >
          💀
        </span>
      </div>
    );
  }

  // 기본 디버프 아이콘 (약화/취약)
  return (
    <div className="relative flex items-center justify-center" style={{ width: '52px', height: '56px' }}>
      {/* 배경 글로우 */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glow} 0%, ${colors.glowDark} 40%, transparent 70%)`,
          filter: 'blur(10px)',
          animation: 'pulse 2.5s ease-in-out infinite',
        }}
      />
      {/* 깨진 형태 SVG */}
      <svg viewBox="0 0 52 56" className="absolute inset-0 w-full h-full" style={{ filter: `drop-shadow(0 0 12px ${colors.shadow})` }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.gradStart} />
            <stop offset="40%" stopColor={colors.gradMid} />
            <stop offset="100%" stopColor={colors.gradEnd} />
          </linearGradient>
          <linearGradient id={highlightId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id={crackId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.5)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.8)" />
          </linearGradient>
        </defs>
        {/* 역삼각형 기반 - 방패의 반대, 불안정한 형태 */}
        <path
          d="M26 54 L4 18 L14 4 L26 8 L38 4 L48 18 Z"
          fill={`url(#${gradientId})`}
          stroke={colors.stroke}
          strokeWidth="2"
        />
        {/* 하이라이트 */}
        <path
          d="M26 50 L8 20 L16 8 L26 11 L36 8 L44 20 Z"
          fill={`url(#${highlightId})`}
        />
        {/* 금간 자국 - 깨짐 표현 */}
        <path
          d="M26 12 L24 22 L20 24 L23 30 L18 36 L22 38 L26 50"
          stroke={`url(#${crackId})`}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26 12 L28 20 L32 23 L29 28 L34 34 L30 37 L26 50"
          stroke={`url(#${crackId})`}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 작은 파편들 */}
        <path d="M12 26 L8 28 L10 32" fill={colors.accent} opacity="0.8" />
        <path d="M40 26 L44 28 L42 32" fill={colors.accent} opacity="0.8" />
        <circle cx="16" cy="38" r="2" fill={colors.accentLight} opacity="0.6" />
        <circle cx="36" cy="40" r="1.5" fill={colors.accentLight} opacity="0.6" />
        {/* 중앙 하강 심볼 */}
        <path
          d="M26 38 L20 28 L23 28 L23 18 L29 18 L29 28 L32 28 Z"
          fill="rgba(255,255,255,0.95)"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1"
        />
      </svg>
      {/* 스택 수 표시 */}
      {stacks && (
        <div className="absolute bottom-0 right-0 z-10">
          <span
            className="font-title text-sm font-bold"
            style={{ color: colors.gradStart, textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
          >
            {stacks}
          </span>
        </div>
      )}
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
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg z-[9999] pointer-events-none"
          style={{
            background: 'rgba(0, 0, 0, 0.95)',
            border: `2px solid ${info.isDebuff ? '#e04040' : '#4ade80'}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
            width: '180px',
          }}
        >
          <div className="font-title text-sm mb-1 whitespace-nowrap text-center" style={{ color: info.isDebuff ? '#ff6b6b' : '#4ade80' }}>
            {info.name}
          </div>
          <div className="font-card text-xs text-gray-300 text-center">
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

export function Enemy({ enemy, isTargetable = false, incomingDamage = 0, ignoreBlock = false }: EnemyProps) {
  const [showIntentTooltip, setShowIntentTooltip] = useState(false);
  const [isDying, setIsDying] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [isHurt, setIsHurt] = useState(false);
  const [isSkillActive, setIsSkillActive] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [prevHp, setPrevHp] = useState(enemy.currentHp);

  // 플레이어 상태 구독 (취약 확인용)
  const playerStatuses = useCombatStore(state => state.playerStatuses);

  // 피격 트리거 구독 (다중 타격용)
  const hitTrigger = useCombatStore(state => state.enemyHitTriggers[enemy.instanceId] || 0);
  const prevHitTriggerRef = useRef(hitTrigger);

  // 스킬 트리거 구독 (BUFF/DEFEND 애니메이션용)
  const skillTrigger = useCombatStore(state => state.enemySkillTriggers[enemy.instanceId] || 0);
  const prevSkillTriggerRef = useRef(skillTrigger);

  // 공격 트리거 구독 (공격 애니메이션용)
  const attackTrigger = useCombatStore(state => state.enemyAttackTriggers[enemy.instanceId] || 0);
  const prevAttackTriggerRef = useRef(attackTrigger);

  // 피격 트리거 감지 (다중 타격 애니메이션)
  useEffect(() => {
    if (hitTrigger > prevHitTriggerRef.current) {
      setIsHurt(true);
      setTimeout(() => {
        setIsHurt(false);
      }, 300);
    }
    prevHitTriggerRef.current = hitTrigger;
  }, [hitTrigger]);

  // 스킬 트리거 감지 (BUFF/DEFEND 애니메이션)
  useEffect(() => {
    if (skillTrigger > prevSkillTriggerRef.current) {
      setIsSkillActive(true);
      setTimeout(() => {
        setIsSkillActive(false);
      }, 700);
    }
    prevSkillTriggerRef.current = skillTrigger;
  }, [skillTrigger]);

  // 공격 트리거 감지 (공격 애니메이션)
  useEffect(() => {
    if (attackTrigger > prevAttackTriggerRef.current) {
      setIsAttacking(true);
      setTimeout(() => {
        setIsAttacking(false);
      }, 600);
    }
    prevAttackTriggerRef.current = attackTrigger;
  }, [attackTrigger]);

  // 피격 감지 (HP 감소 시) - 죽음 처리용
  useEffect(() => {
    if (enemy.currentHp < prevHp) {
      // HP 감소 시에도 피격 효과 (단일 타격용)
      if (hitTrigger === prevHitTriggerRef.current) {
        setIsHurt(true);
        setTimeout(() => {
          setIsHurt(false);
        }, 300);
      }
      // 죽음 처리 (공간 유지하고 페이드아웃만)
      if (enemy.currentHp <= 0 && !isDying) {
        setTimeout(() => {
          setIsDying(true);
          // 페이드아웃 후 visibility: hidden으로 전환 (공간 유지)
          setTimeout(() => {
            setIsRemoved(true);
          }, 400);
        }, 300);
      }
    }
    setPrevHp(enemy.currentHp);
  }, [enemy.currentHp, prevHp, isDying, hitTrigger]);

  // 적 공격 데미지 계산 (힘, 약화, 플레이어 취약 반영)
  const calculateEnemyDamage = (baseDamage: number) => {
    let damage = baseDamage;

    // 적의 힘 적용
    const enemyStrength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
    damage += enemyStrength;

    // 적의 약화 적용 (25% 감소)
    const enemyWeak = enemy.statuses.find(s => s.type === 'WEAK');
    if (enemyWeak && enemyWeak.stacks > 0) {
      damage = Math.round(damage * 0.75);
    }

    // 플레이어 취약 적용 (50% 추가)
    const playerVulnerable = playerStatuses.find(s => s.type === 'VULNERABLE');
    if (playerVulnerable && playerVulnerable.stacks > 0) {
      damage = Math.round(damage * 1.5);
    }

    return Math.max(0, damage);
  };

  // 데미지 계산 과정 문자열 생성 (예: "9+3" 또는 "9-2+4")
  const getDamageBreakdown = (baseDamage: number) => {
    const parts: string[] = [String(baseDamage)];

    // 적의 힘
    const enemyStrength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
    if (enemyStrength > 0) {
      parts.push(`+${enemyStrength}`);
    } else if (enemyStrength < 0) {
      parts.push(`${enemyStrength}`);
    }

    // 적의 약화 (25% 감소) - 힘 적용 후 계산
    const enemyWeak = enemy.statuses.find(s => s.type === 'WEAK');
    if (enemyWeak && enemyWeak.stacks > 0) {
      const damageAfterStr = baseDamage + enemyStrength;
      const reduction = damageAfterStr - Math.round(damageAfterStr * 0.75);
      if (reduction > 0) {
        parts.push(`-${reduction}`);
      }
    }

    // 플레이어 취약 (50% 추가)
    const playerVulnerable = playerStatuses.find(s => s.type === 'VULNERABLE');
    if (playerVulnerable && playerVulnerable.stacks > 0) {
      let damageBeforeVuln = baseDamage + enemyStrength;
      if (enemyWeak && enemyWeak.stacks > 0) {
        damageBeforeVuln = Math.round(damageBeforeVuln * 0.75);
      }
      const bonus = Math.round(damageBeforeVuln * 1.5) - damageBeforeVuln;
      if (bonus > 0) {
        parts.push(`+${bonus}`);
      }
    }

    return parts.length > 1 ? parts.join('') : null;
  };

  const getIntentTooltip = () => {
    switch (enemy.intent.type) {
      case 'ATTACK':
        const baseDamage = enemy.intent.damage || 0;
        const calculatedDamage = calculateEnemyDamage(baseDamage);
        const breakdown = getDamageBreakdown(baseDamage);
        const hits = enemy.intent.hits || 1;
        const totalDamage = calculatedDamage * hits;

        // 수정치가 있으면 "9+3=12" 형식, 없으면 "9" 형식
        const damageText = breakdown
          ? `${breakdown}=${calculatedDamage}`
          : `${calculatedDamage}`;

        return hits > 1
          ? `${damageText} 데미지를 ${hits}회 가합니다. (총 ${totalDamage})`
          : `${damageText} 데미지를 가합니다.`;
      case 'DEFEND':
        const block = enemy.intent.block || 0;
        return `${block} 방어도를 획득합니다.`;
      case 'BUFF':
        const buffType = enemy.intent.statusType || 'STRENGTH';
        const buffStacks = enemy.intent.statusStacks || 3;
        if (buffType === 'STRENGTH') {
          return `자신을 강화합니다. (힘 +${buffStacks})`;
        }
        return `버프를 사용합니다.`;
      case 'DEBUFF':
        const debuffType = enemy.intent.statusType || 'WEAK';
        const debuffStacks = enemy.intent.statusStacks || 1;
        if (debuffType === 'POISON') {
          return `중독 ${debuffStacks}을 부여합니다. (매 턴 피해)`;
        } else if (debuffType === 'WEAK') {
          return `무기손상 ${debuffStacks}을 부여합니다. (피해량 25% 감소)`;
        } else if (debuffType === 'VULNERABLE') {
          return `장비파괴 ${debuffStacks}을 부여합니다. (받는 피해 50% 증가)`;
        } else if (debuffType === 'UNDEAD') {
          return `언데드화를 부여합니다. (회복이 피해로 전환)`;
        }
        return `디버프를 부여합니다.`;
      default:
        return '알 수 없는 행동';
    }
  };

  const getIntentDisplay = () => {
    switch (enemy.intent.type) {
      case 'ATTACK':
        const baseDamage = enemy.intent.damage || 0;
        const calculatedDamage = calculateEnemyDamage(baseDamage);
        return <AttackIntent damage={calculatedDamage} hits={enemy.intent.hits} />;
      case 'DEFEND':
        return <DefendIntent block={enemy.intent.block || 0} />;
      case 'BUFF':
        return <BuffIntent stacks={enemy.intent.statusStacks} />;
      case 'DEBUFF':
        return <DebuffIntent statusType={enemy.intent.statusType} stacks={enemy.intent.statusStacks} />;
      default:
        return <UnknownIntent />;
    }
  };

  // 죽은 적도 공간 유지 (visibility: hidden으로 처리)
  return (
    <div
      className="transition-all"
      style={{
        minWidth: '100px',
        visibility: isRemoved ? 'hidden' : 'visible',
        opacity: isDying ? 0 : 1,
        transitionDuration: '300ms',
        transitionTimingFunction: 'ease-out',
      }}
    >
      <div
        data-enemy-id={enemy.instanceId}
        className="flex flex-col items-center transition-transform"
        style={{
          transform: isDying ? 'scale(0.8)' : 'scale(1)',
          transitionDuration: '300ms',
        }}
      >
      {/* 인텐트 표시 */}
      <div
        className="animate-float relative cursor-help"
        onMouseEnter={() => setShowIntentTooltip(true)}
        onMouseLeave={() => setShowIntentTooltip(false)}
        style={{
          opacity: isDying ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
          marginBottom: `${ENEMY_INTENT_OFFSET[enemy.templateId] ?? 0}px`,
          zIndex: 10,
        }}
      >
        <div className="flex items-center gap-1">
          {getIntentDisplay()}
          {/* 힘 버프 있을 때 초록색 위 화살표 */}
          {enemy.intent.type === 'ATTACK' && enemy.statuses.find(s => s.type === 'STRENGTH' && s.stacks > 0) && (
            <div
              className="flex items-center justify-center animate-pulse"
              style={{
                width: '20px',
                height: '20px',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(74, 222, 128, 0.8))',
                }}
              >
                <path
                  d="M12 20 L12 8 M6 12 L12 6 L18 12"
                  stroke="#4ade80"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          )}
          {/* 약화 상태일 때 보라색 아래 화살표 */}
          {enemy.intent.type === 'ATTACK' && enemy.statuses.find(s => s.type === 'WEAK' && s.stacks > 0) && (
            <div
              className="flex items-center justify-center animate-pulse"
              style={{
                width: '20px',
                height: '20px',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.8))',
                }}
              >
                <path
                  d="M12 4 L12 16 M6 12 L12 18 L18 12"
                  stroke="#a855f7"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          )}
        </div>

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
            className="absolute -inset-4 rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(224, 64, 64, 0.35) 0%, transparent 70%)',
            }}
          />
        )}

        {/* 스킬 이펙트 (BUFF/DEFEND 시) */}
        <SkillEffect isActive={isSkillActive} color="green" />

        {/* 적 캐릭터 SVG */}
        <div
          className="relative"
          style={{
            filter: isDying
              ? 'grayscale(1)'
              : isHurt
                ? 'sepia(1) saturate(6) hue-rotate(-50deg) brightness(0.9)'
                : 'none',
            opacity: isDying ? 0 : 1,
            transition: 'filter 0.6s ease-out, opacity 0.8s ease-out',
            animation: isHurt ? 'shake 0.3s ease-in-out' : 'none',
          }}
        >
          {getEnemyCharacter(enemy.templateId, 100, isAttacking)}
          {/* 바닥 그림자 */}
          <div
            className="absolute left-1/2"
            style={{
              bottom: '-8px',
              width: `${ENEMY_SHADOW_SIZE[enemy.templateId] || 70}px`,
              height: `${(ENEMY_SHADOW_SIZE[enemy.templateId] || 70) * 0.23}px`,
              background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translateX(-50%)',
              opacity: isDying ? 0 : 1,
              transition: 'opacity 0.3s ease-out',
              zIndex: -1,
            }}
          />
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
        className="mt-4 px-2"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '2px',
          opacity: isDying ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
        }}
      >
        <span
          className="text-sm text-white"
          style={{
            fontFamily: '"NeoDunggeunmo", cursive',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}
        >
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
          size="md"
          showNumbers
          incomingDamage={incomingDamage}
          enemyBlock={ignoreBlock ? 0 : enemy.block}
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
    </div>
  );
}
