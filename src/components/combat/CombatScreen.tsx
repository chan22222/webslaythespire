import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useCombatStore } from '../../stores/combatStore';
import { CardHand } from './CardHand';
import { Enemy } from './Enemy';
import { EnergyOrb } from './EnergyOrb';
import { PlayerStatus } from './PlayerStatus';
import { DamagePopupManager } from './DamagePopup';
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

    if (needsTarget) {
      let targetEnemyId: string | null = null;
      enemyRefs.current.forEach((el, enemyId) => {
        const rect = el.getBoundingClientRect();
        if (x >= rect.left - 40 && x <= rect.right + 40 &&
            y >= rect.top - 40 && y <= rect.bottom + 40) {
          const enemy = enemies.find(e => e.instanceId === enemyId);
          if (enemy && enemy.currentHp > 0) targetEnemyId = enemyId;
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
      if (y < window.innerHeight * 0.7) {
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
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[var(--gold)]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              opacity: 0.15 + Math.random() * 0.2,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* ===== 상단 UI ===== */}
      <div className="relative z-20 flex justify-between items-start px-6 pt-4">
        {/* 덱 더미들 */}
        <div className="flex gap-6">
          {/* 뽑기 더미 */}
          <button className="group relative transition-transform hover:scale-110 active:scale-95">
            <div className="relative">
              <div
                className="absolute w-12 h-16 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--bg-light) 0%, var(--bg-darkest) 100%)',
                  border: '2px solid var(--gold-dark)',
                  transform: 'rotate(-8deg) translate(-2px, 4px)',
                }}
              />
              <div
                className="absolute w-12 h-16 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--bg-light) 0%, var(--bg-darkest) 100%)',
                  border: '2px solid var(--gold-dark)',
                  transform: 'rotate(-4deg) translate(-1px, 2px)',
                }}
              />
              <div
                className="relative w-12 h-16 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
                  border: '2px solid var(--gold)',
                }}
              >
                <div
                  className="absolute inset-1 rounded opacity-30"
                  style={{
                    background: `repeating-linear-gradient(45deg, var(--gold-dark), var(--gold-dark) 2px, transparent 2px, transparent 8px)`,
                  }}
                />
              </div>
            </div>
            <div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-darkest) 100%)',
                border: '2px solid var(--gold)',
              }}
            >
              <span className="font-title text-sm text-[var(--gold-light)]">{drawPile.length}</span>
            </div>
          </button>

          {/* 버린 더미 */}
          <button className="group relative transition-transform hover:scale-110 active:scale-95">
            <div
              className="relative w-12 h-16 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, var(--attack-deep) 0%, var(--bg-darkest) 100%)',
                border: '2px solid var(--attack-dark)',
                opacity: 0.8,
              }}
            />
            <div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(180deg, var(--attack-dark) 0%, var(--bg-darkest) 100%)',
                border: '2px solid var(--attack)',
              }}
            >
              <span className="font-title text-sm text-[var(--attack-light)]">{discardPile.length}</span>
            </div>
          </button>
        </div>

        {/* 턴 표시 */}
        <div
          className="px-6 py-3 rounded-b-xl"
          style={{
            background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-darkest) 100%)',
            borderLeft: '3px solid var(--gold)',
            borderRight: '3px solid var(--gold)',
            borderBottom: '3px solid var(--gold)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="font-display text-sm tracking-[0.2em] text-[var(--gold-dark)]">TURN</span>
            <span className="font-title text-2xl text-white" style={{ textShadow: '0 0 10px var(--gold-glow)' }}>
              {turn}
            </span>
          </div>
        </div>

        {/* 전투 로그 */}
        <div
          className="w-56 h-20 overflow-hidden rounded-lg"
          style={{
            background: 'linear-gradient(180deg, rgba(10,10,15,0.85) 0%, rgba(5,5,8,0.9) 100%)',
            border: '1px solid rgba(212,168,75,0.3)',
          }}
        >
          <div className="p-2 h-full overflow-y-auto text-xs font-card">
            {combatLog.slice(-4).map((log, i) => (
              <div
                key={i}
                className="py-0.5"
                style={{
                  color: log.includes('피해') ? 'var(--attack-light)' :
                         log.includes('방어') ? 'var(--block-light)' :
                         log.includes('승리') ? 'var(--gold-light)' : '#999',
                  opacity: 0.5 + (i * 0.15),
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 메인 전투 영역 - 플레이어와 적이 가깝게 마주보는 구도 ===== */}
      <div className="flex-1 relative z-10 flex items-center justify-center">
        <div className="flex items-center justify-center gap-24">
          {/* 플레이어 영역 - 좌측 */}
          <div className="flex flex-col items-center" ref={playerRef}>
            <PlayerStatus
              player={player}
              block={playerBlock}
              statuses={playerStatuses}
            />
          </div>

          {/* 적 영역 - 우측 */}
          <div className="flex items-end justify-center gap-6">
            {enemies.map((enemy, index) => (
              <div
                key={enemy.instanceId}
                ref={(el) => setEnemyRef(enemy.instanceId, el)}
                className="transition-all duration-300"
                style={{
                  transform: `translateY(${index % 2 === 0 ? 0 : 15}px)`,
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
            background: `linear-gradient(to top, rgba(5,5,8,0.99) 0%, rgba(5,5,8,0.85) 50%, transparent 100%)`,
          }}
        />

        {/* 에너지 오브 - 좌측 */}
        <div className="absolute left-8 bottom-20 z-30">
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
        <div className="absolute right-8 bottom-16 z-30">
          <button
            onClick={endPlayerTurn}
            className="group relative overflow-hidden"
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(180deg, #3a2820 0%, #1a1410 100%)',
              border: '3px solid var(--gold)',
              borderRadius: '10px',
              boxShadow: '0 6px 25px rgba(0,0,0,0.6), 0 0 20px var(--gold-glow)',
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(180deg, rgba(212,168,75,0.3) 0%, transparent 100%)' }}
            />
            <div
              className="absolute top-0 left-2 right-2 h-px"
              style={{ background: 'linear-gradient(90deg, transparent 0%, var(--gold-light) 50%, transparent 100%)' }}
            />
            <span className="font-title text-base tracking-wider text-[var(--gold-light)] relative z-10">
              END TURN
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
    </div>
  );
}
