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

  // 툴팁 상태
  const [hoveredPile, setHoveredPile] = useState<'draw' | 'discard' | null>(null);
  // 카드 목록 모달 상태
  const [viewingPile, setViewingPile] = useState<'draw' | 'discard' | null>(null);

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
          showDamagePopup(targetEnemyId, damageEffect.value, 'damage');
        }
        playCard(cardInstanceId, targetEnemyId);
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
          enemies.forEach(enemy => {
            if (enemy.currentHp > 0) {
              showDamagePopup(enemy.instanceId, damageEffect.value, 'damage');
            }
          });
        }
        playCard(cardInstanceId);
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
        {/* 덱 더미들 */}
        <div className="flex gap-2 md:gap-4 scale-[0.6] md:scale-100 lg:scale-110 origin-top-left">
          {/* 뽑기 더미 */}
          <button
            className="group relative transition-transform active:scale-95"
            onMouseEnter={() => setHoveredPile('draw')}
            onMouseLeave={() => setHoveredPile(null)}
            onClick={() => setViewingPile('draw')}
          >
            <div className="relative">
              <div
                className="absolute w-10 h-14 md:w-12 md:h-16 rounded"
                style={{
                  background: 'linear-gradient(135deg, var(--bg-light) 0%, var(--bg-darkest) 100%)',
                  border: '1px solid var(--gold-dark)',
                  transform: 'rotate(-6deg) translate(-1px, 2px)',
                }}
              />
              <div
                className="relative w-10 h-14 md:w-12 md:h-16 rounded"
                style={{
                  background: 'linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
                  border: '2px solid var(--gold)',
                }}
              />
            </div>
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-darkest) 100%)',
                border: '2px solid var(--gold)',
              }}
            >
              <span className="font-title text-xs md:text-sm text-[var(--gold-light)]">{drawPile.length}</span>
            </div>
            <SimpleTooltip show={hoveredPile === 'draw'} text="뽑기 더미" />
          </button>

          {/* 버린 더미 */}
          <button
            className="group relative transition-transform active:scale-95"
            onMouseEnter={() => setHoveredPile('discard')}
            onMouseLeave={() => setHoveredPile(null)}
            onClick={() => setViewingPile('discard')}
          >
            <div
              className="relative w-10 h-14 md:w-12 md:h-16 rounded"
              style={{
                background: 'linear-gradient(135deg, var(--attack-deep) 0%, var(--bg-darkest) 100%)',
                border: '2px solid var(--attack-dark)',
              }}
            />
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(180deg, var(--attack-dark) 0%, var(--bg-darkest) 100%)',
                border: '2px solid var(--attack)',
              }}
            >
              <span className="font-title text-xs md:text-sm text-[var(--attack-light)]">{discardPile.length}</span>
            </div>
            <SimpleTooltip show={hoveredPile === 'discard'} text="버린 더미" />
          </button>
        </div>

        {/* 턴 표시 */}
        <div
          className="px-3 md:px-5 py-1 md:py-2 rounded-b-lg scale-[0.8] md:scale-100 lg:scale-110"
          style={{
            background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-darkest) 100%)',
            borderLeft: '2px solid var(--gold)',
            borderRight: '2px solid var(--gold)',
            borderBottom: '2px solid var(--gold)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-display text-xs md:text-sm tracking-wider text-[var(--gold-dark)]">TURN</span>
            <span className="font-title text-lg md:text-xl text-white">{turn}</span>
          </div>
        </div>

        {/* 전투 로그 - 모바일에서 숨김 */}
        <div
          className="w-48 h-20 md:w-56 md:h-24 lg:w-64 lg:h-28 overflow-hidden rounded hidden md:block scale-100 lg:scale-110 origin-top-right"
          style={{
            background: 'linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(5,5,8,0.98) 100%)',
            border: '2px solid rgba(212,168,75,0.3)',
          }}
        >
          <div className="p-2 h-full overflow-y-auto text-[10px] md:text-[11px] lg:text-xs font-card">
            {combatLog.slice(-6).map((log, i) => (
              <div
                key={i}
                className="py-0.5 truncate"
                style={{
                  color: log.includes('피해') ? 'var(--attack-light)' :
                         log.includes('방어') ? 'var(--block-light)' :
                         log.includes('승리') ? 'var(--gold-light)' : '#888',
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
          <div className="flex flex-col items-center scale-[0.45] md:scale-90 lg:scale-110" ref={playerRef}>
            <PlayerStatus
              player={player}
              block={playerBlock}
              statuses={playerStatuses}
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

        {/* 턴 종료 버튼 - 우측 하단 (안쪽으로) */}
        <div className="absolute right-2 md:right-[6%] lg:right-[10%] bottom-2 md:bottom-8 lg:bottom-10 z-30">
          <button
            onClick={endPlayerTurn}
            className="group relative overflow-hidden active:scale-95 transition-transform px-2 py-1 md:px-5 md:py-3 lg:px-6 lg:py-3"
            style={{
              background: 'linear-gradient(180deg, #3a2820 0%, #1a1410 100%)',
              border: '2px solid var(--gold)',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.6), 0 0 15px var(--gold-glow)',
            }}
          >
            <span className="font-title text-[9px] md:text-base lg:text-lg tracking-wider text-[var(--gold-light)] relative z-10">
              턴 끝내기
            </span>
          </button>
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
