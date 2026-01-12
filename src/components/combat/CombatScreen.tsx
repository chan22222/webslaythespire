import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useCombatStore } from '../../stores/combatStore';
import { CardHand } from './CardHand';
import { Card } from './Card';
import { Enemy } from './Enemy';
import { EnergyOrb } from './EnergyOrb';
import { PlayerStatus } from './PlayerStatus';
import { DamagePopupManager } from './DamagePopup';
import { generateNormalEncounter, ELITE_ENEMIES, BOSS_ENEMIES } from '../../data/enemies';

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
  const { player, getCurrentNode, setPhase, healPlayer } = useGameStore();
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
    initCombat,
    playCard,
    selectCard,
    endPlayerTurn,
    startPlayerTurn,
    checkCombatEnd,
    addDamagePopup,
    removeDamagePopup,
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

  // 툴팁 상태
  const [hoveredPile, setHoveredPile] = useState<'draw' | 'discard' | null>(null);
  const [showEndTurnTooltip, setShowEndTurnTooltip] = useState(false);
  // 카드 목록 모달 상태
  const [viewingPile, setViewingPile] = useState<'draw' | 'discard' | null>(null);
  // 플레이어 애니메이션 상태
  const [playerAnimation, setPlayerAnimation] = useState<'idle' | 'attack' | 'hurt'>('idle');
  // 공격 타겟 위치
  const [attackTargetPos, setAttackTargetPos] = useState<{ x: number; y: number } | null>(null);
  // 대기 중인 공격 (애니메이션 중간에 실행)
  const pendingAttackRef = useRef<{
    cardInstanceId: string;
    targetEnemyId?: string;
    damagePopups: { targetId: string; value: number }[];
  } | null>(null);

  useEffect(() => {
    if (enemies.length === 0 && currentNode) {
      let enemyTemplates;
      if (currentNode.type === 'BOSS') {
        enemyTemplates = [BOSS_ENEMIES[0]];
      } else if (currentNode.type === 'ELITE') {
        enemyTemplates = [ELITE_ENEMIES[0]];
      } else {
        enemyTemplates = generateNormalEncounter();
      }
      initCombat(player.deck, enemyTemplates);
      startPlayerTurn();
    }
  }, [currentNode, enemies.length, player.deck, initCombat, startPlayerTurn]);

  useEffect(() => {
    const result = checkCombatEnd();
    if (result === 'VICTORY') {
      const hasBurningBlood = player.relics.some(r => r.id === 'burning_blood');
      if (hasBurningBlood) healPlayer(6);
      setTimeout(() => setPhase('CARD_REWARD'), 1000);
    }
  }, [enemies, checkCombatEnd, setPhase, player.relics, healPlayer]);

  const setEnemyRef = useCallback((enemyId: string, el: HTMLDivElement | null) => {
    if (el) enemyRefs.current.set(enemyId, el);
    else enemyRefs.current.delete(enemyId);
  }, []);

  // 배경 파티클 데이터 (한 번만 생성)
  const particles = useMemo(() =>
    [...Array(12)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 50,
      opacity: 0.15 + Math.random() * 0.2,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
    })), []);

  // 데미지 팝업을 위한 위치 계산
  const showDamagePopup = useCallback((targetId: string | 'player', value: number, type: 'damage' | 'block') => {
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

    addDamagePopup(value, type, x, y);
  }, [addDamagePopup]);

  const handleCardDragEnd = useCallback((cardInstanceId: string, x: number, y: number, dragDistance: number) => {
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

    const needsTarget = card.effects.some(e =>
      (e.type === 'DAMAGE' && e.target === 'SINGLE') ||
      (e.type === 'APPLY_STATUS' && e.target === 'SINGLE')
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
        const damageEffect = card.effects.find(e => e.type === 'DAMAGE');
        if (damageEffect) {
          // 타겟 위치 저장
          const targetEl = enemyRefs.current.get(targetEnemyId);
          if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            setAttackTargetPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
          }
          // 공격 대기 상태로 저장
          pendingAttackRef.current = {
            cardInstanceId,
            targetEnemyId,
            damagePopups: [{ targetId: targetEnemyId, value: damageEffect.value }]
          };
          setPlayerAnimation('attack');
          // 애니메이션 중간(600ms)에 데미지 적용
          setTimeout(() => {
            if (pendingAttackRef.current) {
              pendingAttackRef.current.damagePopups.forEach(p => {
                showDamagePopup(p.targetId, p.value, 'damage');
              });
              playCard(pendingAttackRef.current.cardInstanceId, pendingAttackRef.current.targetEnemyId);
              pendingAttackRef.current = null;
            }
          }, 600);
        } else {
          // 데미지 없는 카드는 바로 실행
          playCard(cardInstanceId, targetEnemyId);
        }
      }
    } else {
      // 논타겟 카드는 화면 상단 절반에 놓으면 사용
      if (y < window.innerHeight * 0.5) {
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
          // 공격 대기 상태로 저장
          const popups = enemies
            .filter(e => e.currentHp > 0)
            .map(e => ({ targetId: e.instanceId, value: damageEffect.value }));
          pendingAttackRef.current = {
            cardInstanceId,
            damagePopups: popups
          };
          setPlayerAnimation('attack');
          // 애니메이션 중간(600ms)에 데미지 적용
          setTimeout(() => {
            if (pendingAttackRef.current) {
              pendingAttackRef.current.damagePopups.forEach(p => {
                showDamagePopup(p.targetId, p.value, 'damage');
              });
              playCard(pendingAttackRef.current.cardInstanceId, pendingAttackRef.current.targetEnemyId);
              pendingAttackRef.current = null;
            }
          }, 600);
        } else {
          // 데미지 없는 카드는 바로 실행
          playCard(cardInstanceId);
        }
      }
    }
    selectCard(null);
  }, [hand, energy, enemies, playCard, selectCard, showDamagePopup]);

  const handleCardSelect = useCallback((cardInstanceId: string) => {
    selectCard(selectedCardId === cardInstanceId ? null : cardInstanceId);
  }, [selectedCardId, selectCard]);

  return (
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
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1 h-1 rounded-full bg-[var(--gold)]"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ===== 상단 UI ===== */}
      <div className="relative z-20 flex justify-between items-start px-2 md:px-[5%] lg:px-[8%] pt-1 md:pt-2">
        {/* 덱 더미들 - 카드 스타일 유지 */}
        <div className="flex gap-2 md:gap-4 scale-[0.6] md:scale-100 lg:scale-110 origin-top-left">
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
              {/* 뒤쪽 카드들 (쌓인 효과) */}
              <div
                className="absolute w-10 h-14 md:w-12 md:h-16 rounded-sm"
                style={{
                  background: 'linear-gradient(135deg, #2a2520 0%, #0a0805 100%)',
                  border: '1px solid rgba(212, 168, 75, 0.3)',
                  transform: 'rotate(-8deg) translate(-2px, 3px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}
              />
              <div
                className="absolute w-10 h-14 md:w-12 md:h-16 rounded-sm"
                style={{
                  background: 'linear-gradient(135deg, #252015 0%, #0a0805 100%)',
                  border: '1px solid rgba(212, 168, 75, 0.4)',
                  transform: 'rotate(-4deg) translate(-1px, 1px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}
              />
              {/* 맨 위 카드 */}
              <div
                className="relative w-10 h-14 md:w-12 md:h-16 rounded-sm overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #3a3025 0%, #1a1510 50%, #0a0805 100%)',
                  border: '2px solid var(--gold)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                {/* 카드 무늬 */}
                <div className="absolute inset-2 rounded-sm opacity-20" style={{
                  border: '1px solid var(--gold)',
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(212,168,75,0.1) 3px, rgba(212,168,75,0.1) 6px)',
                }} />
              </div>
            </div>
            {/* 카드 수 뱃지 */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #2a2520 0%, #0a0805 100%)',
                border: '2px solid var(--gold)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 10px rgba(212, 168, 75, 0.2)',
              }}
            >
              <span className="font-title text-xs md:text-sm text-[var(--gold-light)]" style={{ textShadow: '0 0 6px rgba(212, 168, 75, 0.5)' }}>
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
            {/* 카드 (버린 더미는 한 장만) */}
            <div
              className="relative w-10 h-14 md:w-12 md:h-16 rounded-sm overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #3a2020 0%, #1a0a0a 50%, #0a0505 100%)',
                border: '2px solid var(--attack)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {/* 카드 무늬 */}
              <div className="absolute inset-2 rounded-sm opacity-15" style={{
                border: '1px solid var(--attack)',
                background: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(220,80,80,0.1) 3px, rgba(220,80,80,0.1) 6px)',
              }} />
            </div>
            {/* 카드 수 뱃지 */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #2a1515 0%, #0a0505 100%)',
                border: '2px solid var(--attack)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 10px rgba(220, 80, 80, 0.2)',
              }}
            >
              <span className="font-title text-xs md:text-sm text-[var(--attack-light)]" style={{ textShadow: '0 0 6px rgba(220, 80, 80, 0.5)' }}>
                {discardPile.length}
              </span>
            </div>
            <SimpleTooltip show={hoveredPile === 'discard'} text="버린 더미" />
          </button>
        </div>

        {/* 턴 표시 - 기존 스타일 업그레이드 */}
        <div
          className="relative px-4 md:px-6 py-1.5 md:py-2 rounded-b-lg scale-[0.8] md:scale-100 lg:scale-110"
          style={{
            background: 'linear-gradient(180deg, #252020 0%, #0a0808 100%)',
            borderLeft: '2px solid var(--gold)',
            borderRight: '2px solid var(--gold)',
            borderBottom: '3px solid var(--gold)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.6), 0 0 20px rgba(212, 168, 75, 0.15)',
          }}
        >
          {/* 상단 장식 라인 */}
          <div
            className="absolute top-0 left-2 right-2 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--gold-dark), transparent)' }}
          />
          <div className="flex items-center gap-2">
            <span
              className="font-display text-[10px] md:text-xs tracking-widest"
              style={{ color: 'var(--gold-dark)' }}
            >
              TURN
            </span>
            <span
              className="font-title text-xl md:text-2xl text-white"
              style={{ textShadow: '0 0 15px rgba(212, 168, 75, 0.4), 0 2px 4px rgba(0,0,0,0.8)' }}
            >
              {turn}
            </span>
          </div>
          {/* 코너 장식 */}
          <div className="absolute -bottom-1 left-0 w-2 h-2 border-l-2 border-b-2 border-[var(--gold)]" style={{ borderRadius: '0 0 0 4px' }} />
          <div className="absolute -bottom-1 right-0 w-2 h-2 border-r-2 border-b-2 border-[var(--gold)]" style={{ borderRadius: '0 0 4px 0' }} />
        </div>

        {/* 전투 로그 - 기존 스타일 업그레이드 */}
        <div
          className="relative w-48 h-20 md:w-56 md:h-24 lg:w-64 lg:h-28 overflow-hidden rounded-lg hidden md:block scale-100 lg:scale-110 origin-top-right"
          style={{
            background: 'linear-gradient(180deg, rgba(20,18,15,0.98) 0%, rgba(8,6,5,0.99) 100%)',
            border: '2px solid rgba(212,168,75,0.4)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {/* 헤더 라인 */}
          <div
            className="absolute top-0 left-0 right-0 h-5 flex items-center justify-center z-10"
            style={{
              background: 'linear-gradient(180deg, rgba(20,18,15,1) 0%, rgba(15,12,10,0.98) 100%)',
              borderBottom: '1px solid rgba(212,168,75,0.3)',
            }}
          >
            <span className="font-display text-[8px] tracking-widest text-[var(--gold-dark)] opacity-70">BATTLE LOG</span>
          </div>
          {/* 코너 장식 */}
          <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-[var(--gold)] opacity-50 z-20" />
          <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-[var(--gold)] opacity-50 z-20" />
          <div
            ref={combatLogRef}
            className="px-2 pb-2 h-full overflow-y-auto text-[10px] md:text-[11px] lg:text-xs font-card scroll-smooth"
            style={{ paddingTop: '24px' }}
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
        </div>
      </div>

      {/* ===== 메인 전투 영역 ===== */}
      <div className="flex-1 relative z-10 flex items-center justify-center">
        <div className="flex items-center justify-center gap-8 md:gap-20 lg:gap-32">
          {/* 플레이어 영역 - 좌측 */}
          <div className="flex flex-col items-center scale-[0.45] md:scale-90 lg:scale-110 z-10" ref={playerRef}>
            <PlayerStatus
              player={player}
              block={playerBlock}
              statuses={playerStatuses}
              animation={playerAnimation}
              attackTargetPos={attackTargetPos}
              enemyCount={enemies.filter(e => e.currentHp > 0).length}
              onAnimationEnd={() => {
                setPlayerAnimation('idle');
                setAttackTargetPos(null);
              }}
            />
          </div>

          {/* 적 영역 - 우측 */}
          <div className="flex items-end justify-center gap-1 md:gap-4 lg:gap-6">
            {enemies.map((enemy, index) => (
              <div
                key={enemy.instanceId}
                ref={(el) => setEnemyRef(enemy.instanceId, el)}
                className="transition-all duration-300 scale-[0.45] md:scale-90 lg:scale-110"
                style={{
                  transform: `translateY(${index % 2 === 0 ? 0 : 10}px)`,
                }}
              >
                <Enemy
                  enemy={enemy}
                  isTargetable={selectedCardId !== null && enemy.currentHp > 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 하단 UI 영역 ===== */}
      <div className="relative z-20 h-24 md:h-44 lg:h-56">
        {/* 바닥 그라데이션 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, rgba(5,5,8,0.99) 0%, rgba(5,5,8,0.85) 50%, transparent 100%)`,
          }}
        />

        {/* 에너지 오브 - 좌측 (안쪽으로) */}
        <div className="absolute left-2 md:left-[6%] lg:left-[10%] bottom-2 md:bottom-8 lg:bottom-10 z-30 scale-[0.45] md:scale-90 lg:scale-110 origin-bottom-left">
          <EnergyOrb current={energy} max={maxEnergy} />
        </div>

        {/* 카드 패 - 중앙 하단 */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto scale-[0.45] md:scale-90 lg:scale-110 origin-bottom">
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
          className="absolute right-2 md:right-[6%] lg:right-[10%] bottom-2 md:bottom-8 lg:bottom-10 z-30"
          onMouseEnter={() => setShowEndTurnTooltip(true)}
          onMouseLeave={() => setShowEndTurnTooltip(false)}
        >
          <button
            onClick={endPlayerTurn}
            className={`group relative overflow-hidden active:scale-95 transition-all duration-300 px-3 py-2 md:px-5 md:py-3 lg:px-6 lg:py-3 rounded-full ${energy === 0 ? 'animate-pulse-glow' : ''}`}
            style={{
              background: energy === 0
                ? 'linear-gradient(180deg, #3a2515 0%, #1a0d08 100%)'
                : 'linear-gradient(180deg, #2a2015 0%, #0a0805 100%)',
              border: `2px solid ${energy === 0 ? 'var(--gold)' : 'var(--gold-dark)'}`,
              boxShadow: energy === 0
                ? '0 4px 15px rgba(0,0,0,0.6), 0 0 20px rgba(212, 168, 75, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                : '0 4px 15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* 에너지 0일 때 내부 글로우 */}
            {energy === 0 && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(212, 168, 75, 0.15) 0%, transparent 70%)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            )}
            <span
              className="font-title text-[10px] md:text-sm lg:text-base tracking-wider relative z-10 transition-colors duration-300"
              style={{
                color: energy === 0 ? 'var(--gold-light)' : 'var(--gold)',
                textShadow: energy === 0
                  ? '0 0 8px rgba(212, 168, 75, 0.6)'
                  : 'none',
              }}
            >
              턴 끝내기
            </span>
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

      {/* 타겟팅 안내 - 카드 드래그 시 */}
      {selectedCardId && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-40">
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
  );
}
