import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useCombatStore } from '../../stores/combatStore';
import { CardHand } from './CardHand';
import { Enemy } from './Enemy';
import { EnergyOrb } from './EnergyOrb';
import { PlayerStatus } from './PlayerStatus';
import { generateNormalEncounter, ELITE_ENEMIES, BOSS_ENEMIES } from '../../data/enemies';

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
    initCombat,
    playCard,
    selectCard,
    endPlayerTurn,
    startPlayerTurn,
    checkCombatEnd,
  } = useCombatStore();

  const currentNode = getCurrentNode();
  const enemyRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const playAreaRef = useRef<HTMLDivElement>(null);

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

  const handleCardDragEnd = useCallback((cardInstanceId: string, x: number, y: number, dragDistance: number) => {
    const card = hand.find(c => c.instanceId === cardInstanceId);
    if (!card || card.cost > energy) {
      selectCard(null);
      return;
    }

    const MIN_DRAG_DISTANCE = 100;
    if (dragDistance < MIN_DRAG_DISTANCE) {
      selectCard(null);
      return;
    }

    const needsTarget = card.effects.some(e =>
      (e.type === 'DAMAGE' && e.target === 'SINGLE') ||
      (e.type === 'APPLY_STATUS' && e.target === 'SINGLE')
    );

    if (needsTarget) {
      let targetEnemyId: string | null = null;
      enemyRefs.current.forEach((el, enemyId) => {
        const rect = el.getBoundingClientRect();
        if (x >= rect.left - 20 && x <= rect.right + 20 &&
            y >= rect.top - 20 && y <= rect.bottom + 20) {
          const enemy = enemies.find(e => e.instanceId === enemyId);
          if (enemy && enemy.currentHp > 0) targetEnemyId = enemyId;
        }
      });
      if (targetEnemyId) playCard(cardInstanceId, targetEnemyId);
    } else {
      if (playAreaRef.current) {
        const rect = playAreaRef.current.getBoundingClientRect();
        if (y < rect.top + rect.height * 0.6) playCard(cardInstanceId);
      }
    }
    selectCard(null);
  }, [hand, energy, enemies, playCard, selectCard]);

  const handleCardSelect = useCallback((cardInstanceId: string) => {
    selectCard(selectedCardId === cardInstanceId ? null : cardInstanceId);
  }, [selectedCardId, selectCard]);

  return (
    <div
      ref={playAreaRef}
      className="w-full h-screen combat-arena vignette flex flex-col relative overflow-hidden"
    >
      {/* ===== 상단 UI ===== */}
      <div className="relative z-20 flex justify-between items-start px-4 pt-3">
        {/* 덱 파일 */}
        <div className="flex flex-col gap-3">
          {/* 뽑기 더미 */}
          <button className="group relative w-14 h-18 transition-transform hover:scale-110">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="absolute w-10 h-14 rounded bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg-darkest)] border-2 border-[var(--gold-dark)]"
                  style={{ transform: 'rotate(-6deg) translateY(3px)', left: '-20px' }} />
                <div className="absolute w-10 h-14 rounded bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg-darkest)] border-2 border-[var(--gold-dark)]"
                  style={{ transform: 'rotate(-2deg) translateY(1px)', left: '-20px' }} />
                <div className="relative w-10 h-14 rounded bg-gradient-to-br from-[var(--bg-medium)] to-[var(--bg-dark)] border-2 border-[var(--gold)]"
                  style={{ left: '-20px' }} />
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--bg-darkest)] border border-[var(--gold-dark)] rounded-full px-2 py-0.5">
              <span className="font-title text-xs text-[var(--gold-light)]">{drawPile.length}</span>
            </div>
          </button>

          {/* 버린 더미 */}
          <button className="group relative w-14 h-18 transition-transform hover:scale-110">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <div className="relative w-10 h-14 rounded bg-gradient-to-br from-[var(--attack-deep)] to-[var(--bg-darkest)] border-2 border-[var(--attack-dark)] opacity-70"
                style={{ left: '-20px' }} />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--bg-darkest)] border border-[var(--attack-dark)] rounded-full px-2 py-0.5">
              <span className="font-title text-xs text-[var(--attack-light)]">{discardPile.length}</span>
            </div>
          </button>
        </div>

        {/* 턴 표시 */}
        <div
          className="px-5 py-2 rounded-b-lg"
          style={{
            background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-darkest) 100%)',
            borderLeft: '2px solid var(--gold-dark)',
            borderRight: '2px solid var(--gold-dark)',
            borderBottom: '2px solid var(--gold-dark)',
          }}
        >
          <span className="font-display text-sm tracking-widest text-[var(--gold)]">
            TURN
          </span>
          <span className="font-title text-xl text-white ml-2">{turn}</span>
        </div>

        {/* 빈 공간 (대칭) */}
        <div className="w-14" />
      </div>

      {/* ===== 메인 전투 영역 ===== */}
      <div className="flex-1 relative z-10 flex">
        {/* 적 영역 - 화면 중앙~우측 상단 */}
        <div className="flex-1 flex items-start justify-center pt-8">
          <div className="flex items-end justify-center gap-10">
            {enemies.map((enemy, index) => (
              <div
                key={enemy.instanceId}
                ref={(el) => setEnemyRef(enemy.instanceId, el)}
                className="transition-all duration-300"
                style={{
                  transform: `translateY(${index % 2 === 0 ? 0 : 20}px)`,
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
      <div className="relative z-20" style={{ height: '280px' }}>
        {/* 바닥 그라데이션 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(5,5,8,0.98) 0%, rgba(5,5,8,0.85) 50%, transparent 100%)',
          }}
        />

        {/* 플레이어 - 좌측 하단 */}
        <div className="absolute left-6 bottom-4 z-30">
          <PlayerStatus
            player={player}
            block={playerBlock}
            statuses={playerStatuses}
          />
        </div>

        {/* 에너지 오브 - 플레이어 우측 */}
        <div className="absolute left-40 bottom-24 z-30">
          <EnergyOrb current={energy} max={maxEnergy} />
        </div>

        {/* 카드 패 - 중앙 하단 */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
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
        <div className="absolute right-6 bottom-10 z-30">
          <button
            onClick={endPlayerTurn}
            className="group relative overflow-hidden"
            style={{
              padding: '14px 24px',
              background: 'linear-gradient(180deg, #3a2820 0%, #1a1410 100%)',
              border: '3px solid var(--gold-dark)',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <span className="font-title text-sm tracking-wider text-[var(--gold-light)] relative z-10">
              턴 종료
            </span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'linear-gradient(180deg, rgba(212,168,75,0.2) 0%, transparent 100%)',
              }}
            />
          </button>
        </div>
      </div>

      {/* 타겟팅 안내 */}
      {selectedCardId && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-pulse">
          <div
            className="px-5 py-2 rounded-lg font-title text-sm"
            style={{
              background: 'rgba(0,0,0,0.85)',
              border: '2px solid var(--skill)',
              color: 'var(--skill-light)',
              boxShadow: '0 0 20px var(--skill-glow)',
            }}
          >
            적에게 드래그
          </div>
        </div>
      )}
    </div>
  );
}
