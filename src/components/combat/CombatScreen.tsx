import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useCombatStore } from '../../stores/combatStore';
import { CardHand } from './CardHand';
import { Card } from './Card';
import { Enemy } from './Enemy';
import { EnergyOrb } from './EnergyOrb';
import { PlayerStatus } from './PlayerStatus';
import { DamagePopupManager } from './DamagePopup';
import { generateNormalEncounter, ELITE_ENEMIES, BOSS_ENEMIES, EASTER_EGG_ENCOUNTER } from '../../data/enemies';

// 전투 시작 인트로 화면
function BattleIntro({
  encounterType,
  onComplete
}: {
  encounterType: 'ENEMY' | 'ELITE' | 'BOSS';
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<'slash' | 'text' | 'fadeout'>('slash');

  useEffect(() => {
    // 슬래시 애니메이션 후 텍스트
    const timer1 = setTimeout(() => setPhase('text'), 250);
    // 텍스트 표시 후 페이드아웃
    const timer2 = setTimeout(() => setPhase('fadeout'), 800);
    // 완료
    const timer3 = setTimeout(onComplete, 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const getEncounterText = () => {
    switch (encounterType) {
      case 'BOSS': return { main: 'BOSS BATTLE', sub: '강력한 적이 나타났다!' };
      case 'ELITE': return { main: 'ELITE BATTLE', sub: '정예 적과 조우!' };
      default: return { main: 'BATTLE START', sub: '적과 조우했다!' };
    }
  };

  const getAccentColor = () => {
    switch (encounterType) {
      case 'BOSS': return { primary: '#dc2626', glow: 'rgba(220, 38, 38, 0.8)' };
      case 'ELITE': return { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)' };
      default: return { primary: '#d4a84b', glow: 'rgba(212, 168, 75, 0.8)' };
    }
  };

  const text = getEncounterText();
  const colors = getAccentColor();

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-300 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #1a1815 0%, #0d0c0a 50%, #000 100%)',
      }}
    >
      {/* 배경 비네트 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.8) 80%)',
        }}
      />

      {/* 슬래시 라인들 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 메인 슬래시 - 왼쪽 위에서 오른쪽 아래로 */}
        <div
          className="absolute"
          style={{
            top: '30%',
            left: '-10%',
            width: '120%',
            height: '4px',
            background: `linear-gradient(90deg, transparent 0%, ${colors.primary} 30%, #fff 50%, ${colors.primary} 70%, transparent 100%)`,
            transform: 'rotate(15deg)',
            boxShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}`,
            animation: 'slashIn 0.4s ease-out forwards',
          }}
        />
        {/* 서브 슬래시 */}
        <div
          className="absolute"
          style={{
            top: '65%',
            left: '-10%',
            width: '120%',
            height: '2px',
            background: `linear-gradient(90deg, transparent 0%, ${colors.primary}66 30%, ${colors.primary}aa 50%, ${colors.primary}66 70%, transparent 100%)`,
            transform: 'rotate(5deg)',
            boxShadow: `0 0 15px ${colors.glow}`,
            animation: 'slashIn 0.3s ease-out 0.15s forwards',
            opacity: 0,
          }}
        />
      </div>

      {/* 스파크 파티클 */}
      {phase !== 'slash' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: i % 3 === 0 ? '#fff' : colors.primary,
                boxShadow: `0 0 ${4 + Math.random() * 8}px ${colors.glow}`,
                animation: `sparkFly ${0.5 + Math.random() * 0.5}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 메인 텍스트 */}
      {phase !== 'slash' && (
        <div className="relative z-10 text-center">
          {/* 메인 타이틀 */}
          <div
            className="relative"
            style={{
              animation: 'textSlam 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            }}
          >
            {/* 텍스트 그림자 레이어 */}
            <span
              className="absolute inset-0 block text-5xl sm:text-6xl md:text-7xl tracking-wider"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                color: '#000',
                transform: 'translate(4px, 4px)',
              }}
            >
              {text.main}
            </span>
            {/* 글로우 레이어 */}
            <span
              className="absolute inset-0 block text-5xl sm:text-6xl md:text-7xl tracking-wider"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                color: colors.primary,
                filter: 'blur(20px)',
                opacity: 0.6,
              }}
            >
              {text.main}
            </span>
            {/* 메인 텍스트 */}
            <span
              className="relative block text-5xl sm:text-6xl md:text-7xl tracking-wider"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                background: encounterType === 'ENEMY'
                  ? 'linear-gradient(180deg, #fff8e0 0%, #ffd860 30%, #d4a84b 70%, #8b6914 100%)'
                  : encounterType === 'ELITE'
                  ? 'linear-gradient(180deg, #f3e8ff 0%, #c084fc 30%, #a855f7 70%, #7c3aed 100%)'
                  : 'linear-gradient(180deg, #fecaca 0%, #f87171 30%, #dc2626 70%, #991b1b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: `drop-shadow(0 0 10px ${colors.glow}) drop-shadow(2px 2px 0 #000)`,
              }}
            >
              {text.main}
            </span>
          </div>

          {/* 서브 텍스트 */}
          <p
            className="mt-6 text-lg sm:text-xl tracking-widest"
            style={{
              fontFamily: '"NeoDunggeunmo", cursive',
              color: colors.primary,
              textShadow: `0 0 20px ${colors.glow}, 2px 2px 0 #000`,
              animation: 'fadeInUp 0.4s ease-out 0.2s forwards',
              opacity: 0,
            }}
          >
            {text.sub}
          </p>

          {/* 장식 라인 */}
          <div
            className="flex items-center justify-center gap-4 mt-6"
            style={{
              animation: 'fadeIn 0.3s ease-out 0.3s forwards',
              opacity: 0,
            }}
          >
            <div
              className="h-[2px] w-20 sm:w-32"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.primary})`,
              }}
            />
            <div
              className="w-3 h-3 rotate-45"
              style={{
                background: colors.primary,
                boxShadow: `0 0 15px ${colors.glow}`,
              }}
            />
            <div
              className="h-[2px] w-20 sm:w-32"
              style={{
                background: `linear-gradient(90deg, ${colors.primary}, transparent)`,
              }}
            />
          </div>
        </div>
      )}

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes slashIn {
          0% {
            transform: translateX(-100%) rotate(var(--rotation, 15deg));
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(0) rotate(var(--rotation, 15deg));
            opacity: 1;
          }
        }
        @keyframes textSlam {
          0% {
            transform: scale(2) translateY(-20px);
            opacity: 0;
          }
          60% {
            transform: scale(0.95);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        @keyframes sparkFly {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(${Math.random() > 0.5 ? '' : '-'}${50 + Math.random() * 100}px, ${Math.random() > 0.5 ? '' : '-'}${50 + Math.random() * 100}px) scale(0);
            opacity: 0;
          }
        }
        @keyframes fadeInUp {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// 승리 인트로 화면
function VictoryIntro({ onFadeStart, onComplete }: { onFadeStart: () => void; onComplete: () => void }) {
  const [phase, setPhase] = useState<'slash' | 'text' | 'fadeout'>('slash');

  useEffect(() => {
    // 슬래시 애니메이션 후 텍스트
    const timer1 = setTimeout(() => setPhase('text'), 300);
    // 텍스트 표시 후 페이드아웃 시작 (동시에 다음 화면 로드)
    const timer2 = setTimeout(() => {
      setPhase('fadeout');
      onFadeStart(); // 페이드아웃 시작과 동시에 다음 화면 로드
    }, 1100);
    // 완료 (페이드아웃 끝난 후 인트로 제거)
    const timer3 = setTimeout(onComplete, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFadeStart, onComplete]);

  const colors = { primary: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)' };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-300 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #1a1610 0%, #0d0b08 50%, #000 100%)',
      }}
    >
      {/* 배경 비네트 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.8) 80%)',
        }}
      />

      {/* 슬래시 라인들 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 메인 슬래시 - 왼쪽 위에서 오른쪽 아래로 */}
        <div
          className="absolute"
          style={{
            top: '30%',
            left: '-10%',
            width: '120%',
            height: '4px',
            background: `linear-gradient(90deg, transparent 0%, ${colors.primary} 30%, #fff 50%, ${colors.primary} 70%, transparent 100%)`,
            transform: 'rotate(15deg)',
            boxShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}`,
            animation: 'victorySlashIn 0.4s ease-out forwards',
          }}
        />
        {/* 서브 슬래시 */}
        <div
          className="absolute"
          style={{
            top: '65%',
            left: '-10%',
            width: '120%',
            height: '2px',
            background: `linear-gradient(90deg, transparent 0%, ${colors.primary}66 30%, ${colors.primary}aa 50%, ${colors.primary}66 70%, transparent 100%)`,
            transform: 'rotate(5deg)',
            boxShadow: `0 0 15px ${colors.glow}`,
            animation: 'victorySlashIn 0.3s ease-out 0.15s forwards',
            opacity: 0,
          }}
        />
      </div>

      {/* 스파크 파티클 */}
      {phase !== 'slash' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: i % 3 === 0 ? '#fff' : colors.primary,
                boxShadow: `0 0 ${4 + Math.random() * 8}px ${colors.glow}`,
                animation: `sparkFly ${0.5 + Math.random() * 0.5}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 메인 텍스트 */}
      {phase !== 'slash' && (
        <div className="relative z-10 text-center">
          {/* 메인 타이틀 */}
          <div
            className="relative"
            style={{
              animation: 'textSlam 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            }}
          >
            {/* 텍스트 그림자 레이어 */}
            <span
              className="absolute inset-0 block text-5xl sm:text-6xl md:text-7xl tracking-wider"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                color: '#000',
                transform: 'translate(4px, 4px)',
              }}
            >
              VICTORY
            </span>
            {/* 글로우 레이어 */}
            <span
              className="absolute inset-0 block text-5xl sm:text-6xl md:text-7xl tracking-wider"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                color: colors.primary,
                filter: 'blur(20px)',
                opacity: 0.6,
              }}
            >
              VICTORY
            </span>
            {/* 메인 텍스트 */}
            <span
              className="relative block text-5xl sm:text-6xl md:text-7xl tracking-wider"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                background: 'linear-gradient(180deg, #fffef0 0%, #ffd860 30%, #d4a84b 70%, #8b6914 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: `drop-shadow(0 0 10px ${colors.glow}) drop-shadow(2px 2px 0 #000)`,
              }}
            >
              VICTORY
            </span>
          </div>

          {/* 서브 텍스트 */}
          <p
            className="mt-6 text-lg sm:text-xl tracking-widest"
            style={{
              fontFamily: '"NeoDunggeunmo", cursive',
              color: colors.primary,
              textShadow: `0 0 20px ${colors.glow}, 2px 2px 0 #000`,
              animation: 'fadeInUp 0.4s ease-out 0.2s forwards',
              opacity: 0,
            }}
          >
            전투에서 승리했다!
          </p>

          {/* 장식 라인 */}
          <div
            className="flex items-center justify-center gap-4 mt-6"
            style={{
              animation: 'fadeIn 0.3s ease-out 0.3s forwards',
              opacity: 0,
            }}
          >
            <div
              className="h-[2px] w-20 sm:w-32"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.primary})`,
              }}
            />
            <div
              className="w-3 h-3 rotate-45"
              style={{
                background: colors.primary,
                boxShadow: `0 0 15px ${colors.glow}`,
              }}
            />
            <div
              className="h-[2px] w-20 sm:w-32"
              style={{
                background: `linear-gradient(90deg, ${colors.primary}, transparent)`,
              }}
            />
          </div>
        </div>
      )}

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes victorySlashIn {
          0% {
            transform: translateX(-100%) rotate(var(--rotation, 15deg));
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(0) rotate(var(--rotation, 15deg));
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// 간단한 툴팁 컴포넌트
function SimpleTooltip({ show, text, position = 'bottom' }: {
  show: boolean;
  text: string;
  position?: 'top' | 'bottom';
}) {
  if (!show) return null;

  return (
    <div
      className="absolute z-[9999] px-2 py-1 rounded whitespace-nowrap pointer-events-none"
      style={{
        ...(position === 'bottom'
          ? { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' }
          : { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }
        ),
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid var(--gold-dark)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
      }}
    >
      <span className="font-card text-xs text-gray-200">{text}</span>
    </div>
  );
}

export function CombatScreen() {
  const { player, getCurrentNode, setPhase, healPlayer, testEnemies, clearTestEnemies, decrementDeserterCount } = useGameStore();
  const {
    enemies,
    hand,
    energy,
    maxEnergy,
    turn,
    selectedCardId,
    playerBlock,
    playerStatuses,
    drawPile,
    discardPile,
    combatLog,
    damagePopups,
    usedCardTypes,
    initCombat,
    playCard,
    selectCard,
    endPlayerTurn,
    startPlayerTurn,
    checkCombatEnd,
    addDamagePopup,
    removeDamagePopup,
    setOnPlayerHit,
    triggerEnemyHit,
    lockCardPlay,
    isEndTurnLocked,
    lockEndTurn,
  } = useCombatStore();

  const currentNode = getCurrentNode();
  const enemyRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const playerRef = useRef<HTMLDivElement>(null);
  const playAreaRef = useRef<HTMLDivElement>(null);
  const combatLogRef = useRef<HTMLDivElement>(null);

  // 전투 로그 자동 스크롤
  useEffect(() => {
    if (combatLogRef.current) {
      combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
    }
  }, [combatLog]);

  // 전투 인트로 상태
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);
  // 홈화면 추가 안내 팝업 (모바일 첫 전투 1회)
  const [showA2HSPrompt, setShowA2HSPrompt] = useState(false);
  // 승리 인트로 상태
  const [showVictory, setShowVictory] = useState(false);
  // 툴팁 상태
  const [hoveredPile, setHoveredPile] = useState<'draw' | 'discard' | null>(null);
  const [showEndTurnTooltip, setShowEndTurnTooltip] = useState(false);
  // 카드 목록 모달 상태
  const [viewingPile, setViewingPile] = useState<'draw' | 'discard' | null>(null);
  // 플레이어 애니메이션 상태
  const [playerAnimation, setPlayerAnimation] = useState<'idle' | 'attack' | 'hurt' | 'skill' | 'death'>('idle');
  // 공격 타겟 위치
  const [attackTargetPos, setAttackTargetPos] = useState<{ x: number; y: number } | null>(null);
  // 공격 중 여부 (카드 사용 불가)
  const [isAttacking, setIsAttacking] = useState(false);
  // 플레이어 사망 처리 중
  const [isPlayerDying, setIsPlayerDying] = useState(false);
  const isPlayerDyingRef = useRef(false);
  // 턴 종료 버튼 딜레이
  const [isEndingTurn, setIsEndingTurn] = useState(false);
  // 배틀로그 높이 (리사이즈 가능)
  const [battleLogHeight, setBattleLogHeight] = useState(160);
  const [isResizingLog, setIsResizingLog] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);
  // 모바일 배틀로그 펼치기/접기
  const [isMobileLogOpen, setIsMobileLogOpen] = useState(false);

  // isPlayerDying 상태를 ref에 동기화
  useEffect(() => {
    isPlayerDyingRef.current = isPlayerDying;
  }, [isPlayerDying]);

  // 피격 콜백 설정
  useEffect(() => {
    setOnPlayerHit(() => {
      // 이미 사망 중이면 애니메이션 변경하지 않음
      if (isPlayerDyingRef.current) return;
      setPlayerAnimation('hurt');
      setTimeout(() => {
        // 사망 중이 아닐 때만 idle로 복귀
        if (!isPlayerDyingRef.current) {
          setPlayerAnimation('idle');
        }
      }, 400);
    });
    return () => setOnPlayerHit(null);
  }, [setOnPlayerHit]);
  // 대기 중인 공격 (애니메이션 중간에 실행)
  const pendingAttackRef = useRef<{
    cardInstanceId: string;
    targetEnemyId?: string;
    hits: { targetId: string; value: number; modifier?: number }[]; // 각 타격 정보
    currentHit: number; // 현재 몇 번째 타격인지
    totalHits: number; // 총 타격 횟수
  } | null>(null);

  // 전투 초기화 (인트로와 동시에 백그라운드에서 로드)
  useEffect(() => {
    if (enemies.length === 0) {
      let enemyTemplates;

      // 테스트 모드: testEnemies가 있으면 사용
      if (testEnemies && testEnemies.length > 0) {
        enemyTemplates = testEnemies;
      } else if (currentNode) {
        // 일반 모드: currentNode 기반으로 적 생성
        if (currentNode.type === 'BOSS') {
          enemyTemplates = [BOSS_ENEMIES[0]];
        } else if (currentNode.type === 'ELITE') {
          enemyTemplates = [ELITE_ENEMIES[0]];
        } else {
          // 이스터에그: 첫 던전(row 0)에서 "파추" 또는 "권혁찬" 이름일 때
          const playerName = useGameStore.getState().playerName;
          const isFirstFloor = currentNode.row === 0;
          const isEasterEggName = playerName === '파추' || playerName === '권혁찬';

          if (isFirstFloor && isEasterEggName) {
            enemyTemplates = EASTER_EGG_ENCOUNTER;
          } else {
            enemyTemplates = generateNormalEncounter();
          }
        }
      } else {
        return; // 적 정보가 없으면 초기화하지 않음
      }

      initCombat(player.deck, enemyTemplates);
      startPlayerTurn();
    }
  }, [currentNode, enemies.length, player.deck, initCombat, startPlayerTurn, testEnemies]);

  // 인트로 완료 핸들러
  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    setIntroComplete(true);

    // 모바일에서 첫 전투 시 홈화면 추가 안내 (1회성)
    const isMobile = window.innerWidth <= 800 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasSeenA2HS = localStorage.getItem('hasSeenA2HSPrompt');
    // PWA로 실행 중이면 안내 불필요
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isMobile && !hasSeenA2HS && !isStandalone) {
      setShowA2HSPrompt(true);
      localStorage.setItem('hasSeenA2HSPrompt', 'true');
    }
  }, []);

  // 승리 인트로 페이드 시작 핸들러 (백그라운드에서 다음 화면 로드)
  const handleVictoryFadeStart = useCallback(() => {
    // 전투 승리 시 탈주 카운트 감소
    decrementDeserterCount();

    // 테스트 모드면 메인 메뉴로, 아니면 카드 보상으로
    if (testEnemies && testEnemies.length > 0) {
      clearTestEnemies();
      setPhase('MAIN_MENU');
    } else {
      setPhase('CARD_REWARD');
    }
  }, [setPhase, testEnemies, clearTestEnemies, decrementDeserterCount]);

  // 승리 인트로 완료 핸들러 (인트로 제거)
  const handleVictoryComplete = useCallback(() => {
    setShowVictory(false);
  }, []);

  // 승리 체크 (인트로 완료 후에만)
  useEffect(() => {
    if (!introComplete || showVictory) return;
    const result = checkCombatEnd();
    if (result === 'VICTORY') {
      const hasBurningBlood = player.relics.some(r => r.id === 'burning_blood');
      if (hasBurningBlood) healPlayer(6);
      // 바로 CARD_REWARD로 가지 않고 승리 인트로 표시
      setShowVictory(true);
    }
  }, [introComplete, showVictory, enemies, checkCombatEnd, player.relics, healPlayer]);

  // 플레이어 사망 체크
  useEffect(() => {
    if (player.currentHp <= 0 && !isPlayerDying) {
      setIsPlayerDying(true);
      setPlayerAnimation('death');
    }
  }, [player.currentHp, isPlayerDying]);

  // 사망 애니메이션 완료 후 게임오버
  const handleDeathAnimationEnd = useCallback(() => {
    if (playerAnimation === 'death') {
      setTimeout(() => setPhase('GAME_OVER'), 500);
    }
  }, [playerAnimation, setPhase]);

  const setEnemyRef = useCallback((enemyId: string, el: HTMLDivElement | null) => {
    if (el) enemyRefs.current.set(enemyId, el);
    else enemyRefs.current.delete(enemyId);
  }, []);

  // 배틀로그 리사이즈 핸들러
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizingLog(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    resizeStartY.current = clientY;
    resizeStartHeight.current = battleLogHeight;
  }, [battleLogHeight]);

  useEffect(() => {
    if (!isResizingLog) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = clientY - resizeStartY.current;
      const newHeight = Math.max(80, Math.min(400, resizeStartHeight.current + deltaY));
      setBattleLogHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizingLog(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizingLog]);

  // 배경 파티클 데이터 (한 번만 생성)
  const particles = useMemo(() =>
    [...Array(25)].map((_, i) => ({
      id: i,
      left: 25 + Math.random() * 50,
      top: 15 + Math.random() * 45,
      opacity: 0.4 + Math.random() * 0.4,
      size: 2 + Math.random() * 3,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 5,
    })), []);

  // 데미지 팝업을 위한 위치 계산 (hitIndex로 다중 타격 시 위치 오프셋)
  const showDamagePopup = useCallback((targetId: string | 'player', value: number, type: 'damage' | 'block' | 'skill', modifier?: number, hitIndex?: number) => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (targetId === 'player' && playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 3;
    } else if (targetId !== 'player') {
      const el = enemyRefs.current.get(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 3;
      }
    }

    // 다중 타격 시 위치 오프셋 (겹침 방지)
    if (hitIndex !== undefined && hitIndex > 0) {
      x += (hitIndex % 2 === 0 ? -1 : 1) * 20 * hitIndex;
      y -= 15 * hitIndex;
    }

    addDamagePopup(value, type, x, y, undefined, modifier);
  }, [addDamagePopup]);

  // 데미지 보정값 계산 (힘, 약화, 취약)
  const calculateDamageModifier = useCallback((baseDamage: number, targetEnemyId?: string) => {
    let currentDamage = baseDamage;
    let modifier = 0;

    // 힘 적용
    const strength = playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
    currentDamage += strength;
    modifier += strength;

    // 약화 적용 (25% 감소) - 실제 계산과 동일하게
    const weak = playerStatuses.find(s => s.type === 'WEAK');
    if (weak && weak.stacks > 0) {
      const damageAfterWeak = Math.round(currentDamage * 0.75);
      const weakReduction = currentDamage - damageAfterWeak;
      modifier -= weakReduction;
      currentDamage = damageAfterWeak;
    }

    // 취약 적용 (50% 추가) - 적 상태 확인
    if (targetEnemyId) {
      const enemy = enemies.find(e => e.instanceId === targetEnemyId);
      if (enemy) {
        const vulnerable = enemy.statuses.find(s => s.type === 'VULNERABLE');
        if (vulnerable && vulnerable.stacks > 0) {
          const damageAfterVulnerable = Math.round(currentDamage * 1.5);
          const vulnerableBonus = damageAfterVulnerable - currentDamage;
          modifier += vulnerableBonus;
        }
      }
    }

    return modifier;
  }, [playerStatuses, enemies]);

  // 선택된 카드의 예상 총 데미지 계산 (다중 히트 포함)
  const calculateIncomingDamage = useCallback((targetEnemyId: string): number => {
    if (!selectedCardId) return 0;

    const card = hand.find(c => c.instanceId === selectedCardId);
    if (!card || card.cost > energy) return 0;

    // 타겟이 필요한 카드인지 확인
    const needsTarget = card.effects.some(e =>
      (e.type === 'DAMAGE' && e.target === 'SINGLE') ||
      (e.type === 'APPLY_STATUS' && e.target === 'SINGLE') ||
      (e.type === 'DAMAGE_PER_LOST_HP' && e.target === 'SINGLE') ||
      (e.type === 'HALVE_ENEMY_HP' && e.target === 'SINGLE')
    );

    // 전체 공격 효과 확인
    const hasAllTargetDamage = card.effects.some(e =>
      (e.type === 'DAMAGE' && e.target === 'ALL') ||
      (e.type === 'DAMAGE_PER_PLAYED' && e.target === 'ALL')
    );

    if (!needsTarget && !hasAllTargetDamage) return 0;

    let totalDamage = 0;
    const strength = playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
    const weak = playerStatuses.find(s => s.type === 'WEAK');
    const enemy = enemies.find(e => e.instanceId === targetEnemyId);
    const vulnerable = enemy?.statuses.find(s => s.type === 'VULNERABLE');

    for (const effect of card.effects) {
      if (effect.type === 'DAMAGE' && (effect.target === 'SINGLE' || effect.target === 'ALL')) {
        let damage = effect.value + strength;

        // 약화 (25% 감소)
        if (weak && weak.stacks > 0) {
          damage = Math.round(damage * 0.75);
        }

        // 취약 (50% 추가)
        if (vulnerable && vulnerable.stacks > 0) {
          damage = Math.round(damage * 1.5);
        }

        totalDamage += Math.max(0, damage);
      } else if (effect.type === 'DAMAGE_PER_LOST_HP') {
        // 사선에서: 잃은 HP 기반 피해
        const gameState = useGameStore.getState();
        const lostHp = gameState.player.maxHp - gameState.player.currentHp;
        const ratio = effect.ratio || 1;
        let damage = Math.floor((lostHp / ratio) * effect.value) + strength;

        if (weak && weak.stacks > 0) {
          damage = Math.round(damage * 0.75);
        }
        if (vulnerable && vulnerable.stacks > 0) {
          damage = Math.round(damage * 1.5);
        }

        totalDamage += Math.max(0, damage);
      } else if (effect.type === 'HALVE_ENEMY_HP') {
        // 신의 권능: 적 HP 절반 (최대 피해 제한)
        if (enemy) {
          const halfHp = Math.floor(enemy.currentHp / 2);
          totalDamage += Math.min(halfHp, effect.value);
        }
      } else if (effect.type === 'DAMAGE_PER_PLAYED' && effect.target === 'ALL') {
        // 종언의 일격: 사용한 카드 종류당 피해 (자기 자신 제외)
        const uniqueCount = usedCardTypes.filter(id => id !== 'final_strike').length;
        let damage = effect.value * uniqueCount + strength;

        if (weak && weak.stacks > 0) {
          damage = Math.round(damage * 0.75);
        }
        if (vulnerable && vulnerable.stacks > 0) {
          damage = Math.round(damage * 1.5);
        }

        totalDamage += Math.max(0, damage);
      }
    }

    return totalDamage;
  }, [selectedCardId, hand, energy, playerStatuses, enemies, usedCardTypes]);

  // 선택된 카드의 플레이어 HP 손실 계산 (LOSE_HP 효과)
  const calculatePlayerHpLoss = useCallback((): number => {
    if (!selectedCardId) return 0;

    const card = hand.find(c => c.instanceId === selectedCardId);
    if (!card || card.cost > energy) return 0;

    let totalLoss = 0;
    for (const effect of card.effects) {
      if (effect.type === 'LOSE_HP') {
        totalLoss += effect.value;
      }
    }

    return totalLoss;
  }, [selectedCardId, hand, energy]);

  const handleCardDragEnd = useCallback((cardInstanceId: string, x: number, y: number, dragDistance: number) => {
    // 공격 중이면 카드 사용 불가
    if (isAttacking) {
      selectCard(null);
      return;
    }

    const card = hand.find(c => c.instanceId === cardInstanceId);
    if (!card || card.cost > energy) {
      selectCard(null);
      return;
    }

    const MIN_DRAG_DISTANCE = 80;
    if (dragDistance < MIN_DRAG_DISTANCE) {
      selectCard(null);
      return;
    }

    // 카드 사용 시작 즉시 다른 카드 사용 불가 (0.4초) 및 턴종료 버튼 잠금
    lockCardPlay();
    // 다중 히트 카드는 더 긴 잠금 시간 (히트당 약 1초)
    const damageHitCount = card.effects.filter(e => e.type === 'DAMAGE').length;
    const lockDuration = damageHitCount > 1 ? damageHitCount * 1000 : 1000;
    lockEndTurn(lockDuration);

    const needsTarget = card.effects.some(e =>
      (e.type === 'DAMAGE' && e.target === 'SINGLE') ||
      (e.type === 'APPLY_STATUS' && e.target === 'SINGLE') ||
      (e.type === 'DAMAGE_PER_LOST_HP' && e.target === 'SINGLE') ||
      (e.type === 'HALVE_ENEMY_HP' && e.target === 'SINGLE')
    );

    const SNAP_DISTANCE = 100; // TargetingArrow와 동일한 스냅 거리

    if (needsTarget) {
      let targetEnemyId: string | null = null;
      let minDistance = SNAP_DISTANCE;

      // 스냅 범위 내에서 가장 가까운 적 찾기
      enemyRefs.current.forEach((el, enemyId) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        if (distance < minDistance) {
          const enemy = enemies.find(e => e.instanceId === enemyId);
          if (enemy && enemy.currentHp > 0) {
            minDistance = distance;
            targetEnemyId = enemyId;
          }
        }
      });

      if (targetEnemyId) {
        const confirmedTargetId = targetEnemyId; // TypeScript를 위한 string 타입 확정
        // 모든 DAMAGE 효과 찾기 (쌍둥이타격 등 다중 공격)
        const damageEffects = card.effects.filter(e => e.type === 'DAMAGE' && e.target === 'SINGLE');
        if (damageEffects.length > 0) {
          // 타겟 위치 저장
          const targetEl = enemyRefs.current.get(confirmedTargetId);
          if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            setAttackTargetPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
          }
          // 각 타격별 정보 저장
          const hits = damageEffects.map(effect => ({
            targetId: confirmedTargetId,
            value: effect.value,
            modifier: calculateDamageModifier(effect.value, confirmedTargetId)
          }));
          // 공격 대기 상태로 저장
          pendingAttackRef.current = {
            cardInstanceId,
            targetEnemyId: confirmedTargetId,
            hits,
            currentHit: 0,
            totalHits: hits.length
          };
          setIsAttacking(true);
          setPlayerAnimation('attack');
          // 첫 번째 타격 데미지 팝업 및 피격 효과 (600ms 후)
          const firstHit = hits[0];
          setTimeout(() => {
            triggerEnemyHit(firstHit.targetId);
            showDamagePopup(firstHit.targetId, firstHit.value, 'damage', firstHit.modifier, 0);
          }, 600);
        } else {
          // 데미지 없는 타겟 카드는 스킬 애니메이션 후 실행
          const hasLoseHpTarget = card.effects.some(e => e.type === 'LOSE_HP');
          setPlayerAnimation('skill');
          setTimeout(() => {
            playCard(cardInstanceId, confirmedTargetId);
            if (!hasLoseHpTarget) {
              setPlayerAnimation('idle');
            }
          }, 550);
        }
      }
    } else {
      // 논타겟 카드는 화면 상단에 놓으면 사용 (모바일은 더 아래쪽까지 허용)
      const isMobileLandscape = window.innerHeight < 500;
      const threshold = isMobileLandscape ? 0.65 : 0.5;
      if (y < window.innerHeight * threshold) {
        const blockEffect = card.effects.find(e => e.type === 'BLOCK');
        if (blockEffect) {
          showDamagePopup('player', blockEffect.value, 'block');
        }
        const damageEffect = card.effects.find(e => e.type === 'DAMAGE' && e.target === 'ALL');
        if (damageEffect) {
          // 전체 공격 시 첫 번째 살아있는 적 위치로 이동
          const firstAliveEnemy = enemies.find(e => e.currentHp > 0);
          if (firstAliveEnemy) {
            const targetEl = enemyRefs.current.get(firstAliveEnemy.instanceId);
            if (targetEl) {
              const rect = targetEl.getBoundingClientRect();
              setAttackTargetPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            }
          }
          // 공격 대기 상태로 저장 (각 적별로 modifier 계산, 기본 데미지와 보정값)
          const allEnemyHits = enemies
            .filter(e => e.currentHp > 0)
            .map(e => {
              const modifier = calculateDamageModifier(damageEffect.value, e.instanceId);
              return {
                targetId: e.instanceId,
                value: damageEffect.value,
                modifier
              };
            });
          // 전체 공격은 1회 모션에 모든 적에게 데미지
          pendingAttackRef.current = {
            cardInstanceId,
            targetEnemyId: undefined,
            hits: allEnemyHits,
            currentHit: 0,
            totalHits: 1 // 전체 공격은 1회 모션
          };
          setIsAttacking(true);
          setPlayerAnimation('attack');
          // 애니메이션 중간(600ms)에 모든 적에게 데미지 적용
          setTimeout(() => {
            if (pendingAttackRef.current) {
              pendingAttackRef.current.hits.forEach(hit => {
                showDamagePopup(hit.targetId, hit.value, 'damage', hit.modifier);
              });
            }
          }, 600);
        } else {
          // 데미지 없는 카드는 스킬 애니메이션 후 실행
          const hasLoseHp = card.effects.some(e => e.type === 'LOSE_HP');
          setPlayerAnimation('skill');
          setTimeout(() => {
            playCard(cardInstanceId);
            // LOSE_HP가 있으면 hurt 애니메이션이 실행되므로 idle 설정 안함
            if (!hasLoseHp) {
              setPlayerAnimation('idle');
            }
          }, 550);
        }
      }
    }
    selectCard(null);
  }, [hand, energy, enemies, playCard, selectCard, showDamagePopup, isAttacking, calculateDamageModifier]);

  const handleCardSelect = useCallback((cardInstanceId: string) => {
    selectCard(selectedCardId === cardInstanceId ? null : cardInstanceId);
  }, [selectedCardId, selectCard]);

  // 적 타입 결정 (테스트 모드도 고려)
  const encounterType = useMemo(() => {
    // 테스트 모드: testEnemies에서 보스/엘리트 확인
    if (testEnemies && testEnemies.length > 0) {
      if (testEnemies.some(e => e.id === 'slime_boss')) return 'BOSS';
      if (testEnemies.some(e => e.id === 'gremlin_nob')) return 'ELITE';
      return 'ENEMY';
    }
    // 일반 모드: currentNode 타입 사용
    if (currentNode?.type === 'BOSS') return 'BOSS';
    if (currentNode?.type === 'ELITE') return 'ELITE';
    return 'ENEMY';
  }, [currentNode, testEnemies]);

  return (
    <>
      {/* 전투 시작 인트로 */}
      {showIntro && (
        <BattleIntro
          encounterType={encounterType}
          onComplete={handleIntroComplete}
        />
      )}

      {/* 승리 인트로 */}
      {showVictory && (
        <VictoryIntro onFadeStart={handleVictoryFadeStart} onComplete={handleVictoryComplete} />
      )}

      {/* 홈화면 추가 안내 (모바일 첫 전투 1회) */}
      {showA2HSPrompt && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80"
          onClick={() => setShowA2HSPrompt(false)}
        >
          <div
            className="mx-4 p-6 max-w-sm text-center"
            style={{
              background: 'linear-gradient(180deg, rgba(30, 25, 20, 0.98) 0%, rgba(15, 12, 10, 0.99) 100%)',
              border: '2px solid var(--gold-dark)',
              boxShadow: '0 0 30px rgba(0,0,0,0.9), 0 0 10px var(--gold-glow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">📱</div>
            <h3
              className="text-lg mb-3"
              style={{
                fontFamily: '"NeoDunggeunmo", cursive',
                color: 'var(--gold)',
              }}
            >
              전체화면으로 플레이하기
            </h3>
            <p
              className="text-sm mb-4 leading-relaxed"
              style={{
                fontFamily: '"NeoDunggeunmo", cursive',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              브라우저 메뉴에서<br />
              <span style={{ color: 'var(--gold-light)' }}>"홈 화면에 추가"</span>를 선택하면<br />
              주소창 없이 전체화면으로<br />
              플레이할 수 있습니다!
            </p>
            <button
              onClick={() => setShowA2HSPrompt(false)}
              className="px-6 py-2 transition-all hover:brightness-125"
              style={{
                fontFamily: '"NeoDunggeunmo", cursive',
                background: 'linear-gradient(180deg, var(--gold) 0%, var(--gold-dark) 100%)',
                color: '#1a1205',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      <div
        ref={playAreaRef}
        className="w-full h-screen combat-arena vignette flex flex-col relative overflow-hidden"
      >
        {/* 데미지 팝업 */}
        <DamagePopupManager
          popups={damagePopups}
          onPopupComplete={removeDamagePopup}
        />

      {/* 배경 파티클 효과 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <style>{`
          @keyframes particleMove {
            0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; }
            25% { transform: translateY(-20px) translateX(10px) scale(1.2); opacity: 0.5; }
            50% { transform: translateY(-35px) translateX(0) scale(1); opacity: 0.4; }
            75% { transform: translateY(-20px) translateX(-10px) scale(1.3); opacity: 0.5; }
          }
        `}</style>
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size + 2}px`,
              height: `${p.size + 2}px`,
              backgroundColor: '#fff',
              boxShadow: '0 0 8px #ffd700, 0 0 16px #ffd700, 0 0 24px rgba(255, 215, 0, 0.6)',
              animation: `particleMove ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ===== 상단 UI ===== */}
      <div className="combat-top-area relative z-20 flex justify-between items-start px-2 xs:px-3 md:px-[5%] lg:px-[8%] pt-1 md:pt-2 h-14 xs:h-16 sm:h-18 md:h-24 lg:h-28">
        {/* 덱 더미들 - 카드 스타일 유지 */}
        <div className="combat-scale flex gap-1 xs:gap-2 md:gap-4 scale-[0.45] xs:scale-[0.5] sm:scale-[0.7] md:scale-100 lg:scale-110 origin-top-left">
          {/* 뽑기 더미 */}
          <button
            className="group relative transition-all duration-200 active:scale-95 hover:scale-105"
            onMouseEnter={() => setHoveredPile('draw')}
            onMouseLeave={() => setHoveredPile(null)}
            onClick={() => setViewingPile('draw')}
          >
            {/* 글로우 효과 */}
            <div
              className="absolute -inset-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(ellipse, rgba(212, 168, 75, 0.4) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
            <div className="relative">
              <img
                src="/card.png"
                alt="뽑기 더미"
                className="w-16 h-20 md:w-20 md:h-24"
                style={{
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
                }}
              />
              {/* 카드 수 - 중앙 표시 */}
              <span
                className="absolute inset-0 flex items-center justify-center text-lg md:text-xl"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  color: 'var(--gold-light)',
                  textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                }}
              >
                {drawPile.length}
              </span>
            </div>
            <SimpleTooltip show={hoveredPile === 'draw'} text="뽑기 더미" />
          </button>

          {/* 버린 더미 */}
          <button
            className="group relative transition-all duration-200 active:scale-95 hover:scale-105"
            onMouseEnter={() => setHoveredPile('discard')}
            onMouseLeave={() => setHoveredPile(null)}
            onClick={() => setViewingPile('discard')}
          >
            {/* 글로우 효과 */}
            <div
              className="absolute -inset-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(ellipse, rgba(220, 80, 80, 0.4) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
            <div className="relative">
              <img
                src="/card2.png"
                alt="버린 더미"
                className="w-16 h-20 md:w-20 md:h-24"
                style={{
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
                }}
              />
              {/* 카드 수 - 중앙 표시 */}
              <span
                className="absolute inset-0 flex items-center justify-center text-lg md:text-xl"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  color: 'var(--attack-light)',
                  textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                }}
              >
                {discardPile.length}
              </span>
            </div>
            <SimpleTooltip show={hoveredPile === 'discard'} text="버린 더미" />
          </button>
        </div>

        {/* 턴 표시 - 중앙 고정 */}
        <div className="combat-turn-display absolute left-1/2 -translate-x-1/2 top-0 scale-[0.5] xs:scale-[0.55] sm:scale-[0.7] md:scale-90 lg:scale-100">
          <div className="relative">
            <img
              src="/turn.png"
              alt="Turn"
              className="w-auto h-16 md:h-20"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 -mt-5">
              <span
                className="text-sm md:text-base tracking-widest"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  color: 'var(--gold)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.9)'
                }}
              >
                TURN
              </span>
              <span
                className="text-xl md:text-2xl text-white"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  textShadow: '0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)'
                }}
              >
                {turn}
              </span>
            </div>
          </div>
        </div>

        {/* 전투 로그 - PC용 */}
        <div
          className="combat-log-pc absolute top-1 md:top-2 right-2 md:right-[5%] lg:right-[8%] w-72 md:w-80 lg:w-96 overflow-hidden rounded-lg"
          style={{
            height: `${battleLogHeight}px`,
            background: 'linear-gradient(180deg, rgba(20,18,15,0.98) 0%, rgba(8,6,5,0.99) 100%)',
            border: '2px solid rgba(212,168,75,0.4)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {/* 헤더 라인 */}
          <div
            className="absolute top-0 left-0 right-0 h-6 flex items-center justify-center z-10"
            style={{
              background: 'linear-gradient(180deg, rgba(20,18,15,1) 0%, rgba(15,12,10,0.98) 100%)',
              borderBottom: '1px solid rgba(212,168,75,0.3)',
            }}
          >
            <span className="font-display text-[10px] tracking-widest text-[var(--gold-dark)]">BATTLE LOG</span>
          </div>
          {/* 코너 장식 */}
          <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-[var(--gold)] opacity-50 z-20" />
          <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-[var(--gold)] opacity-50 z-20" />
          <div
            ref={combatLogRef}
            className="px-3 pb-4 h-full overflow-y-auto text-xs md:text-sm font-card scroll-smooth"
            style={{ paddingTop: '28px' }}
          >
            {combatLog.map((log, i) => (
              <div
                key={i}
                className="py-0.5"
                style={{
                  color: log.includes('피해') ? 'var(--attack-light)' :
                         log.includes('방어') ? 'var(--block-light)' :
                         log.includes('승리') ? 'var(--gold-light)' : '#777',
                }}
              >
                {log}
              </div>
            ))}
          </div>
          {/* 리사이즈 핸들 (하단) */}
          <div
            className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize z-30 flex items-center justify-center group"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(212,168,75,0.2) 100%)',
            }}
          >
            <div
              className="w-10 h-1 rounded-full transition-all group-hover:w-16 group-hover:bg-[var(--gold)]"
              style={{
                background: isResizingLog ? 'var(--gold)' : 'rgba(212,168,75,0.5)',
              }}
            />
          </div>
        </div>

        {/* 모바일용 전투 로그 - 펼치기/접기 버튼 */}
        <div className="combat-log-mobile absolute top-1 right-1 z-30">
          <button
            onClick={() => setIsMobileLogOpen(!isMobileLogOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded transition-all active:scale-95"
            style={{
              background: 'rgba(20,18,15,0.95)',
              border: '1px solid rgba(212,168,75,0.5)',
              boxShadow: isMobileLogOpen ? '0 0 10px rgba(212,168,75,0.3)' : 'none',
            }}
          >
            <span className="font-display text-[8px] tracking-wider text-[var(--gold)]">LOG</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              style={{
                transform: isMobileLogOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* 모바일 로그 패널 */}
          {isMobileLogOpen && (
            <div
              className="absolute top-full right-0 mt-1 w-56 max-h-32 overflow-y-auto rounded-lg"
              style={{
                background: 'rgba(20,18,15,0.98)',
                border: '1px solid rgba(212,168,75,0.4)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
              }}
            >
              <div className="p-2">
                {combatLog.length === 0 ? (
                  <div className="text-[10px] text-gray-500 text-center py-2">로그 없음</div>
                ) : (
                  combatLog.slice(-10).map((log, i) => (
                    <div
                      key={i}
                      className="py-0.5 text-[10px] font-card"
                      style={{
                        color: log.includes('피해') ? 'var(--attack-light)' :
                               log.includes('방어') ? 'var(--block-light)' :
                               log.includes('승리') ? 'var(--gold-light)' : '#888',
                      }}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== 메인 전투 영역 ===== */}
      <div className="combat-main-area flex-1 relative z-10 flex items-center justify-center -mt-4 xs:-mt-6 sm:-mt-8 md:mt-0">
        <div className="combat-gap flex items-center justify-center gap-1 xs:gap-2 sm:gap-4 md:gap-20 lg:gap-32">
          {/* 플레이어 영역 - 좌측 */}
          <div className="combat-scale combat-player flex flex-col items-center scale-[0.5] xs:scale-[0.55] sm:scale-[0.7] md:scale-90 lg:scale-110 z-10" ref={playerRef}>
            <PlayerStatus
              player={player}
              block={playerBlock}
              statuses={playerStatuses}
              animation={playerAnimation}
              attackTargetPos={attackTargetPos}
              enemyCount={enemies.filter(e => e.currentHp > 0).length}
              incomingDamage={calculatePlayerHpLoss()}
              onAnimationEnd={() => {
                // 사망 애니메이션 완료 시
                if (playerAnimation === 'death') {
                  handleDeathAnimationEnd();
                  return;
                }
                if (pendingAttackRef.current) {
                  const { currentHit, totalHits, hits, cardInstanceId, targetEnemyId } = pendingAttackRef.current;
                  const nextHit = currentHit + 1;

                  if (nextHit < totalHits) {
                    // 다음 타격이 있으면 다시 공격 모션
                    pendingAttackRef.current.currentHit = nextHit;
                    const hitData = hits[nextHit];
                    const hitIdx = nextHit;
                    setPlayerAnimation('idle');
                    // 약간의 딜레이 후 다음 공격
                    setTimeout(() => {
                      setPlayerAnimation('attack');
                      // 데미지 팝업 및 피격 효과
                      setTimeout(() => {
                        triggerEnemyHit(hitData.targetId);
                        showDamagePopup(hitData.targetId, hitData.value, 'damage', hitData.modifier, hitIdx);
                      }, 600);
                    }, 100);
                  } else {
                    // 모든 타격 완료, 카드 실행
                    playCard(cardInstanceId, targetEnemyId);
                    pendingAttackRef.current = null;
                    setPlayerAnimation('idle');
                    setAttackTargetPos(null);
                    setIsAttacking(false);
                  }
                } else {
                  setPlayerAnimation('idle');
                  setAttackTargetPos(null);
                  setIsAttacking(false);
                }
              }}
            />
          </div>

          {/* 적 영역 - 우측 */}
          <div className="combat-enemy-gap flex items-end justify-center gap-0.5 xs:gap-1 sm:gap-2 md:gap-4 lg:gap-6">
            {enemies.map((enemy, index) => {
              // 적마다 다른 높이로 배치 (시각적 변화)
              const yOffsets = [-15, 8, -5, 12, -8];
              const yOffset = yOffsets[index % yOffsets.length];
              return (
              <div
                key={enemy.instanceId}
                ref={(el) => setEnemyRef(enemy.instanceId, el)}
                className={`combat-scale combat-enemy-${index} transition-all duration-300 scale-[0.5] xs:scale-[0.55] sm:scale-[0.7] md:scale-90 lg:scale-110`}
                style={{
                  ['--enemy-offset' as string]: `${yOffset}px`,
                }}
              >
                <Enemy
                  enemy={enemy}
                  isTargetable={selectedCardId !== null && enemy.currentHp > 0}
                  incomingDamage={selectedCardId && enemy.currentHp > 0 ? calculateIncomingDamage(enemy.instanceId) : 0}
                  ignoreBlock={selectedCardId ? hand.find(c => c.instanceId === selectedCardId)?.effects.some(e => e.type === 'HALVE_ENEMY_HP') : false}
                />
              </div>
            );
            })}
          </div>
        </div>
      </div>

      {/* ===== 하단 UI 영역 ===== */}
      <div className="combat-bottom-area relative z-20 h-28 xs:h-32 sm:h-36 md:h-44 lg:h-56">
        {/* 바닥 그라데이션 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, rgba(5,5,8,0.99) 0%, rgba(5,5,8,0.85) 50%, transparent 100%)`,
          }}
        />

        {/* 에너지 오브 - 좌측 (안쪽으로) */}
        <div className="combat-scale absolute left-1 xs:left-2 md:left-[6%] lg:left-[10%] bottom-14 xs:bottom-16 sm:bottom-18 md:bottom-18 lg:bottom-20 z-30 scale-[0.5] xs:scale-[0.55] sm:scale-[0.7] md:scale-90 lg:scale-110 origin-bottom-left">
          <EnergyOrb current={energy} max={maxEnergy} />
        </div>

        {/* 카드 패 - 중앙 하단 */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none">
          <div className="combat-scale pointer-events-auto scale-[0.5] xs:scale-[0.55] sm:scale-[0.7] md:scale-90 lg:scale-110 origin-bottom">
            <CardHand
              cards={hand}
              energy={energy}
              selectedCardId={selectedCardId}
              onCardSelect={handleCardSelect}
              onCardDragEnd={handleCardDragEnd}
            />
          </div>
        </div>

        {/* 턴 종료 버튼 - 우측 하단 */}
        <div
          className="combat-scale absolute right-1 xs:right-2 md:right-[6%] lg:right-[10%] bottom-8 xs:bottom-10 sm:bottom-12 md:bottom-10 lg:bottom-[4.25rem] z-30 scale-[0.5] xs:scale-[0.55] sm:scale-[0.7] md:scale-90 lg:scale-110 origin-bottom-right"
          onMouseEnter={() => setShowEndTurnTooltip(true)}
          onMouseLeave={() => setShowEndTurnTooltip(false)}
        >
          <button
            onClick={() => {
              if (isEndingTurn || isPlayerDying || isEndTurnLocked) return;
              setIsEndingTurn(true);
              endPlayerTurn();
              setTimeout(() => setIsEndingTurn(false), 2500);
            }}
            disabled={isEndingTurn || isPlayerDying || isEndTurnLocked}
            className={`relative active:scale-95 transition-all duration-300 ${isEndingTurn || isEndTurnLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            <div className="relative">
              <img
                src="/turnend.png"
                alt="턴 종료"
                style={{
                  imageRendering: 'pixelated',
                  width: '165px',
                  height: '87px',
                  filter: energy === 0 && !isEndingTurn && !isEndTurnLocked
                    ? 'drop-shadow(0 0 12px rgba(255, 200, 100, 0.8))'
                    : 'drop-shadow(0 0 6px rgba(255, 150, 50, 0.4))',
                  animation: energy === 0 && !isEndingTurn && !isEndTurnLocked
                    ? 'energy-glow 2s ease-in-out infinite'
                    : 'none',
                }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  fontFamily: '"NeoDunggeunmo", cursive',
                  fontSize: '20px',
                  color: energy === 0 ? '#f0d890' : '#d4b870',
                  textShadow: energy === 0
                    ? '0 0 8px rgba(212, 168, 75, 0.6), 0 2px 4px rgba(0,0,0,0.8)'
                    : '0 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                턴 종료
              </span>
            </div>
          </button>
          {/* 턴 끝내기 툴팁 */}
          {showEndTurnTooltip && (
            <div
              className="absolute z-[9999] px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none"
              style={{
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '8px',
                background: 'rgba(0, 0, 0, 0.95)',
                border: '2px solid var(--gold)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
              }}
            >
              <div className="font-title text-sm mb-1 text-[var(--gold-light)]">
                턴 끝내기
              </div>
              <div className="font-card text-xs text-gray-300">
                현재 턴을 종료하고 적의 턴으로 넘깁니다.
                <br />
                남은 에너지: {energy}/{maxEnergy}
              </div>
              {/* 화살표 */}
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
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
      </div>

      {/* 타겟팅 안내 - 카드 드래그 시 (모바일에서 숨김) */}
      {selectedCardId && (
        <div className="combat-release-hint absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-40">
          <div
            className="px-5 py-2 rounded-lg font-title text-sm"
            style={{
              background: 'rgba(0,0,0,0.85)',
              border: '2px solid var(--skill)',
              color: 'var(--skill-light)',
              boxShadow: '0 0 20px var(--skill-glow)',
            }}
          >
            Release on target
          </div>
        </div>
      )}

      {/* 카드 목록 모달 */}
      {viewingPile && (
        <div
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setViewingPile(null)}
        >
          <div
            className="rounded-xl p-4 sm:p-6 max-w-4xl max-h-[90vh] overflow-auto"
            style={{
              background: 'linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-darkest) 100%)',
              border: `2px solid ${viewingPile === 'draw' ? 'var(--gold)' : 'var(--attack)'}`,
              boxShadow: `0 0 40px rgba(0,0,0,0.8), 0 0 20px ${viewingPile === 'draw' ? 'var(--gold-glow)' : 'var(--attack-glow)'}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="font-title text-xl sm:text-2xl mb-4 sm:mb-6 text-center"
              style={{ color: viewingPile === 'draw' ? 'var(--gold-light)' : 'var(--attack-light)' }}
            >
              {viewingPile === 'draw' ? '뽑기 더미' : '버린 더미'}
              <span className="ml-2 text-base opacity-70">
                ({viewingPile === 'draw' ? drawPile.length : discardPile.length}장)
              </span>
            </h2>

            {(viewingPile === 'draw' ? drawPile : discardPile).length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-card">
                카드가 없습니다
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                {(viewingPile === 'draw' ? drawPile : discardPile).map((card, index) => (
                  <div key={`${card.instanceId}-${index}`} className="scale-75 sm:scale-90 origin-top-left">
                    <Card card={card} size="sm" />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setViewingPile(null)}
              className="mt-4 sm:mt-6 px-6 py-2 rounded-lg font-title text-sm sm:text-base text-gray-300 hover:text-white transition-colors block mx-auto"
              style={{
                background: 'linear-gradient(180deg, var(--bg-light) 0%, var(--bg-dark) 100%)',
                border: '1px solid var(--gold-dark)',
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
