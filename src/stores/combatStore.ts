import { create } from 'zustand';
import { CombatState, createInitialCombatState } from '../types/combat';
import { CardInstance, createCardInstance } from '../types/card';
import { EnemyInstance, EnemyTemplate, createEnemyInstance } from '../types/enemy';
import { Status, STATUS_INFO } from '../types/status';
import { shuffle } from '../utils/shuffle';
import { useGameStore } from './gameStore';
import { useStatsStore } from './statsStore';
import { playCardDraw, playHit, playShieldBlock, playBuff, playDebuff, playEnemyBuff, playWin, playPlayerHit, playTimeSkill, playInvincibility, playThunder } from '../utils/sound';
import {
  resetBattleAchievementState,
  resetTurnAchievementState,
  recordCardUsed,
  recordHealUsed,
  recordBlockGained,
  recordDamageToEnemy,
  recordBlockReduced,
  recordDamageTakenWithFullEnergy,
  recordWeakAndVulnerable,
  recordKillWithCard,
  recordBlockBeforeEnemyTurn,
  getBattleAchievementState,
  checkBattleEndAchievements,
  checkImmediateAchievements,
  checkTurnEndAchievements,
  checkBlockNotReducedAchievement,
  checkHpChangeAchievements,
  checkHandAchievements,
  checkKillAchievements,
} from '../utils/achievementChecker';

// 데미지 팝업 타입
export interface DamagePopup {
  id: string;
  value: number;
  type: 'damage' | 'block' | 'heal' | 'buff' | 'debuff' | 'skill' | 'blocked' | 'poison';
  x: number;
  y: number;
  modifier?: number; // 버프/디버프로 인한 보정값
}

interface CombatStore extends CombatState {
  // 전투 초기화
  initCombat: (deck: CardInstance[], enemies: EnemyTemplate[]) => void;

  // 턴 관리
  startPlayerTurn: () => void;
  endPlayerTurn: () => void;
  executeEnemyTurn: () => void;

  // 피격 콜백
  onPlayerHit: (() => void) | null;
  setOnPlayerHit: (callback: (() => void) | null) => void;

  // 카드 관리
  drawCards: (count: number, silent?: boolean) => void;
  playCard: (cardInstanceId: string, targetEnemyId?: string, skipDamage?: boolean) => void;
  discardHand: () => void;
  selectCard: (cardInstanceId: string | null) => void;

  // 데미지 및 효과
  dealDamageToEnemy: (enemyId: string, damage: number) => void;
  dealDamageToPlayer: (baseDamage: number, attackerEnemyId?: string) => void;
  gainPlayerBlock: (amount: number) => void;
  applyStatusToEnemy: (enemyId: string, status: Status) => void;
  applyStatusToPlayer: (status: Status) => void;
  applyCardStatusToEnemy: (cardInstanceId: string, targetEnemyId: string) => void;
  gainEnergy: (amount: number) => void;

  // 유틸리티
  addToCombatLog: (message: string) => void;
  checkCombatEnd: () => 'ONGOING' | 'VICTORY' | 'DEFEAT';
  resetCombat: () => void;

  // 플레이어 상태 (전투 중)
  playerBlock: number;
  playerStatuses: Status[];

  // 데미지 팝업
  damagePopups: DamagePopup[];
  addDamagePopup: (value: number, type: DamagePopup['type'], x: number, y: number, targetId?: string, modifier?: number, offsetX?: number, offsetY?: number) => void;
  removeDamagePopup: (id: string) => void;

  // 적 피격 효과 트리거 (애니메이션용)
  enemyHitTriggers: Record<string, number>;
  triggerEnemyHit: (enemyId: string) => void;

  // 적 스킬 효과 트리거 (BUFF/DEFEND 애니메이션용)
  enemySkillTriggers: Record<string, number>;
  triggerEnemySkill: (enemyId: string) => void;

  // 적 공격 애니메이션 트리거
  enemyAttackTriggers: Record<string, number>;
  triggerEnemyAttack: (enemyId: string) => void;

  // 플레이어 디버프 이펙트 트리거
  playerDebuffTrigger: number;
  triggerPlayerDebuff: () => void;

  // 번개 이펙트 큐 (벼락치는 황야)
  thunderEffectQueue: { targetType: 'player' | 'enemy'; targetId?: string; delay: number }[];
  addThunderEffect: (targetType: 'player' | 'enemy', targetId: string | undefined, delay: number) => void;
  clearThunderEffects: () => void;

  // 히트 이펙트 큐 (적이 피해 받을 때)
  hitEffectQueue: { enemyId: string; x: number; y: number }[];
  addHitEffect: (enemyId: string, x: number, y: number) => void;
  removeHitEffect: (enemyId: string) => void;

  // 추가 턴 (시간 왜곡)
  extraTurnPending: boolean;

  // 카드 사용 중 (1초간 다른 카드 사용 불가)
  isPlayingCard: boolean;
  lockCardPlay: () => void;

  // 카드 사용 중 턴종료 버튼 잠금
  isEndTurnLocked: boolean;
  lockEndTurn: (duration?: number) => void;

  // 타겟팅 중인 적 ID (드래그 중 적 위에 있을 때)
  targetedEnemyId: string | null;
  setTargetedEnemyId: (id: string | null) => void;

  // 현재 사용 중인 카드 정보 (업적 체크용)
  currentPlayingCardId: string | null;
  currentPlayingCardName: string | null;
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  ...createInitialCombatState(),
  playerBlock: 0,
  playerStatuses: [],
  damagePopups: [],
  enemyHitTriggers: {},
  enemySkillTriggers: {},
  enemyAttackTriggers: {},
  playerDebuffTrigger: 0,
  thunderEffectQueue: [],
  hitEffectQueue: [],
  extraTurnPending: false,
  isPlayingCard: false,
  isEndTurnLocked: false,
  targetedEnemyId: null,
  currentPlayingCardId: null,
  currentPlayingCardName: null,
  onPlayerHit: null,
  setOnPlayerHit: (callback) => set({ onPlayerHit: callback }),

  triggerPlayerDebuff: () => {
    set(state => ({ playerDebuffTrigger: state.playerDebuffTrigger + 1 }));
  },

  addThunderEffect: (targetType, targetId, delay) => {
    set(state => ({
      thunderEffectQueue: [...state.thunderEffectQueue, { targetType, targetId, delay }],
    }));
  },

  clearThunderEffects: () => {
    set({ thunderEffectQueue: [] });
  },

  addHitEffect: (enemyId, x, y) => {
    const id = `${enemyId}-${Date.now()}`;
    set(state => ({
      hitEffectQueue: [...state.hitEffectQueue, { enemyId: id, x, y }],
    }));
  },

  removeHitEffect: (effectId) => {
    set(state => ({
      hitEffectQueue: state.hitEffectQueue.filter(e => e.enemyId !== effectId),
    }));
  },

  addDamagePopup: (value: number, type: DamagePopup['type'], x: number, y: number, targetId?: string, modifier?: number, offsetX?: number, offsetY?: number) => {
    let finalX = x;
    let finalY = y;

    // targetId가 'player'면 플레이어 요소 위치 자동 찾기
    if (targetId === 'player') {
      const playerEl = document.querySelector('[data-player]');
      if (playerEl) {
        const rect = playerEl.getBoundingClientRect();
        finalX = rect.left + rect.width / 2;
        finalY = rect.top + rect.height / 3;
      }
    }

    // 오프셋 적용
    if (offsetX) finalX += offsetX;
    if (offsetY) finalY += offsetY;

    const id = `popup-${Date.now()}-${Math.random()}`;
    set(state => ({
      damagePopups: [...state.damagePopups, { id, value, type, x: finalX, y: finalY, modifier }],
    }));
  },

  removeDamagePopup: (id: string) => {
    set(state => ({
      damagePopups: state.damagePopups.filter(p => p.id !== id),
    }));
  },

  triggerEnemyHit: (enemyId: string) => {
    set(state => ({
      enemyHitTriggers: {
        ...state.enemyHitTriggers,
        [enemyId]: (state.enemyHitTriggers[enemyId] || 0) + 1,
      },
    }));
  },

  triggerEnemySkill: (enemyId: string) => {
    set(state => ({
      enemySkillTriggers: {
        ...state.enemySkillTriggers,
        [enemyId]: (state.enemySkillTriggers[enemyId] || 0) + 1,
      },
    }));
  },

  triggerEnemyAttack: (enemyId: string) => {
    set(state => ({
      enemyAttackTriggers: {
        ...state.enemyAttackTriggers,
        [enemyId]: (state.enemyAttackTriggers[enemyId] || 0) + 1,
      },
    }));
  },

  initCombat: (deck: CardInstance[], enemyTemplates: EnemyTemplate[]) => {
    // 업적 체크용 전투 상태 초기화
    resetBattleAchievementState();

    // 덱 복사 및 셔플
    const shuffledDeck = shuffle(deck.map(card => createCardInstance(card)));

    // 적 생성
    const enemies = enemyTemplates.map(template => {
      const enemy = createEnemyInstance(template);
      // 첫 번째 의도 설정
      enemy.intent = getNextEnemyIntent(enemy, 1);
      return enemy;
    });

    set({
      ...createInitialCombatState(),
      drawPile: shuffledDeck,
      enemies,
      playerBlock: 0,
      playerStatuses: [],
      currentPlayingCardId: null,
      currentPlayingCardName: null,
    });

    // 유물 효과 트리거 (ON_COMBAT_START)
    const gameState = useGameStore.getState();
    const relics = gameState.player.relics;
    let startingBlock = 0;
    let startingEnergy = 0;
    let startingStrength = 0;
    let startingDexterity = 0;
    let extraDraw = 0;
    let damageToPlayer = 0;

    // 모든 적에게 부여할 상태 목록
    const statusesToAllEnemies: { type: string; stacks: number }[] = [];

    relics.forEach(relic => {
      relic.effects.forEach(effect => {
        if (effect.trigger === 'ON_COMBAT_START') {
          // 유물 효과를 컨텍스트로 실행
          const context = {
            gainBlock: (amount: number) => { startingBlock += amount; },
            gainEnergy: (amount: number) => { startingEnergy += amount; },
            gainStrength: (amount: number) => { startingStrength += amount; },
            gainDexterity: (amount: number) => { startingDexterity += amount; },
            drawCards: (count: number) => { extraDraw += count; },
            damagePlayer: (amount: number) => { damageToPlayer += amount; },
            heal: () => {},
            applyStatusToAllEnemies: (status: { type: string; stacks: number }) => {
              statusesToAllEnemies.push(status);
            },
          };
          effect.execute(context);
        }
      });
    });

    // 전투 시작 효과 적용
    if (damageToPlayer > 0) {
      get().dealDamageToPlayer(damageToPlayer);
      get().addToCombatLog(`유물 효과로 HP ${damageToPlayer} 손실!`);
    }
    if (startingBlock > 0) {
      set({ playerBlock: startingBlock });
      get().addToCombatLog(`유물 효과로 방어도 ${startingBlock} 획득!`);
    }
    if (startingEnergy > 0) {
      set(state => ({ maxEnergy: state.maxEnergy + startingEnergy }));
      get().addToCombatLog(`유물 효과로 에너지 +${startingEnergy}!`);
    }
    if (startingStrength > 0) {
      get().applyStatusToPlayer({ type: 'STRENGTH', stacks: startingStrength });
      get().addToCombatLog(`유물 효과로 힘 ${startingStrength} 획득!`);
    }
    if (startingDexterity !== 0) {
      get().applyStatusToPlayer({ type: 'DEXTERITY', stacks: startingDexterity });
      get().addToCombatLog(`유물 효과로 민첩 ${startingDexterity > 0 ? '+' : ''}${startingDexterity}!`);
    }
    // extraDraw는 startPlayerTurn에서 처리
    if (extraDraw > 0) {
      set({ extraDrawNextTurn: extraDraw });
    }

    // 모든 적에게 상태 부여
    if (statusesToAllEnemies.length > 0) {
      const currentEnemies = get().enemies;
      statusesToAllEnemies.forEach(status => {
        currentEnemies.forEach((enemy) => {
          get().applyStatusToEnemy(enemy.instanceId, status as Status);
        });
        get().addToCombatLog(`유물 효과로 모든 적에게 ${status.type === 'VULNERABLE' ? '장비파괴' : status.type} ${status.stacks} 부여!`);
      });
    }
  },

  startPlayerTurn: () => {
    const { turn, maxEnergy, playerStatuses, extraDrawNextTurn, playerBlock } = get();

    // 업적 체크: 적 턴 후 방어도가 깎이지 않았는지 (첫 턴 제외)
    if (turn > 1) {
      checkBlockNotReducedAchievement(playerBlock);
    }

    // 업적 체크용 턴 상태 초기화
    resetTurnAchievementState();

    // 첫 턴이 아니면 방어도 리셋 (BLOCK_RETAIN 상태가 있으면 유지)
    if (turn > 1) {
      const blockRetain = playerStatuses.find(s => s.type === 'BLOCK_RETAIN');
      if (!blockRetain || blockRetain.stacks <= 0) {
        set({ playerBlock: 0 });
      } else {
        get().addToCombatLog('방어도 유지 상태로 방어도가 유지됩니다!');
      }

      // 플레이어 약화/취약 감소 (불사/무적은 피해 처리 후 감소)
      const reducedStatuses = playerStatuses
        .map(s => ({
          ...s,
          stacks: (s.type === 'WEAK' || s.type === 'VULNERABLE') ? s.stacks - 1 : s.stacks,
        }))
        .filter(s => s.stacks > 0);
      set({ playerStatuses: reducedStatuses });
    }

    // 에너지 리셋
    set({ energy: maxEnergy });

    // 15턴 이상: DANGER - 매 턴 취약과 치유 감소 2씩 부여 (유물 효과보다 먼저 적용)
    if (turn >= 15) {
      get().applyStatusToPlayer({ type: 'VULNERABLE', stacks: 2 });
      get().applyStatusToPlayer({ type: 'HEAL_REDUCTION', stacks: 2 });
      get().addToCombatLog(`⚠️ DANGER! 적이 조금 더 강력해집니다!`);
    }

    // 25턴 진입 시 업적 즉시 달성
    if (turn === 25) {
      useStatsStore.getState().updateMaxTurnInBattle(turn);
      useStatsStore.getState().unlockAchievement('turn_25_in_battle');
    }

    // 25턴 이상: 매 턴 모든 적 힘 +3
    if (turn >= 25) {
      const { enemies } = get();
      const updatedEnemies = enemies.map(enemy => {
        if (enemy.currentHp <= 0) return enemy;
        const existingStrength = enemy.statuses.find(s => s.type === 'STRENGTH');
        if (existingStrength) {
          existingStrength.stacks += 3;
        } else {
          enemy.statuses.push({ type: 'STRENGTH', stacks: 3 });
        }
        return enemy;
      });
      set({ enemies: updatedEnemies });
      get().addToCombatLog(`💀 적들의 힘이 3 증가했습니다!`);
    }

    // 유물 효과 트리거 (ON_TURN_START)
    const gameState = useGameStore.getState();
    const relics = gameState.player.relics;
    let turnExtraEnergy = 0;
    let turnExtraDraw = 0;
    let turnDamageToPlayer = 0;
    let turnHealAmount = 0;
    let turnStrength = 0;
    let turnDexterity = 0;

    relics.forEach(relic => {
      relic.effects.forEach(effect => {
        if (effect.trigger === 'ON_TURN_START') {
          const context = {
            gainEnergy: (amount: number) => { turnExtraEnergy += amount; },
            drawCards: (count: number) => { turnExtraDraw += count; },
            damagePlayer: (amount: number) => { turnDamageToPlayer += amount; },
            heal: (amount: number) => { turnHealAmount += amount; },
            gainBlock: () => {},
            gainStrength: (amount: number) => { turnStrength += amount; },
            gainDexterity: (amount: number) => { turnDexterity += amount; },
          };
          effect.execute(context);
        }
      });
    });

    // 턴 시작 유물 효과 적용
    if (turnHealAmount > 0) {
      const currentStatuses = get().playerStatuses;
      const undead = currentStatuses.find(s => s.type === 'UNDEAD');
      const healReduction = currentStatuses.find(s => s.type === 'HEAL_REDUCTION');

      // 언데드화 상태면 피해로 전환
      if (undead && undead.stacks > 0) {
        // 무적 상태면 피해 무효화
        const invulnerable = currentStatuses.find(s => s.type === 'INVULNERABLE');
        if (invulnerable && invulnerable.stacks > 0) {
          get().addToCombatLog(`💀 언데드화! 하지만 무적으로 피해 무효화!`);
        } else {
          // 불사 상태면 HP가 1 아래로 내려가지 않음
          const undying = currentStatuses.find(s => s.type === 'UNDYING');
          const currentHp = useGameStore.getState().player.currentHp;
          if (undying && undying.stacks > 0 && currentHp - turnHealAmount < 1) {
            const actualDamage = Math.max(0, currentHp - 1);
            if (actualDamage > 0) {
              useGameStore.getState().modifyHp(-actualDamage);
            }
            get().addToCombatLog(`💀 언데드화! 유물 회복이 피해로 전환! 불사로 HP 1 유지!`);
          } else {
            useGameStore.getState().modifyHp(-turnHealAmount);
            get().addToCombatLog(`💀 언데드화! 유물 회복이 ${turnHealAmount} 피해로 전환!`);
          }
        }
      } else {
        // 치유 감소 또는 15턴 이상이면 50% 감소
        let finalTurnHeal = turnHealAmount;
        if ((healReduction && healReduction.stacks > 0) || turn >= 15) {
          finalTurnHeal = Math.floor(turnHealAmount * 0.5);
          get().addToCombatLog(`(치유 감소로 50% 감소)`);
        }
        useGameStore.getState().healPlayer(finalTurnHeal);
        get().addToCombatLog(`유물 효과로 HP ${finalTurnHeal} 회복!`);
      }
    }
    if (turnDamageToPlayer > 0) {
      get().dealDamageToPlayer(turnDamageToPlayer);
      get().addToCombatLog(`유물 효과로 HP ${turnDamageToPlayer} 손실!`);
    }
    if (turnExtraEnergy !== 0) {
      set(state => ({ energy: state.energy + turnExtraEnergy }));
      if (turnExtraEnergy > 0) {
        get().addToCombatLog(`유물 효과로 에너지 +${turnExtraEnergy}!`);
      }
    }
    if (turnStrength !== 0) {
      get().applyStatusToPlayer({ type: 'STRENGTH', stacks: turnStrength });
      get().addToCombatLog(`유물 효과로 힘 +${turnStrength}!`);
    }
    if (turnDexterity !== 0) {
      get().applyStatusToPlayer({ type: 'DEXTERITY', stacks: turnDexterity });
      get().addToCombatLog(`유물 효과로 민첩 +${turnDexterity}!`);
    }

    // 금속화 효과: 턴 시작 시 방어도 획득 (민첩 적용)
    const metallicize = playerStatuses.find(s => s.type === 'METALLICIZE');
    if (metallicize && metallicize.stacks > 0) {
      const dexterity = playerStatuses.find(s => s.type === 'DEXTERITY')?.stacks || 0;
      const blockAmount = metallicize.stacks + dexterity;
      get().gainPlayerBlock(blockAmount);
      get().addToCombatLog(`금속화로 방어도 ${blockAmount} 획득!`);
    }

    // 독 피해 처리 (방어도 무시, 직접 HP 감소)
    // 최신 상태를 가져옴 (UNDYING 감소 등이 반영된 상태)
    const currentStatuses = get().playerStatuses;
    const poisonStatus = currentStatuses.find(s => s.type === 'POISON');
    if (poisonStatus && poisonStatus.stacks > 0) {
      const poisonDamage = poisonStatus.stacks;

      // 무적 상태면 독 피해도 무효화
      const invulnerable = currentStatuses.find(s => s.type === 'INVULNERABLE');
      if (invulnerable && invulnerable.stacks > 0) {
        get().addToCombatLog(`무적! 중독 피해 무효화!`);
        get().addDamagePopup(0, 'blocked', 0, 0, 'player');
      } else {
        get().addToCombatLog(`중독으로 ${poisonDamage} 피해!`);

        // 불사 상태면 HP가 1 아래로 내려가지 않음
        const undying = currentStatuses.find(s => s.type === 'UNDYING');
        const currentHp = useGameStore.getState().player.currentHp;
        if (undying && undying.stacks > 0 && currentHp - poisonDamage < 1) {
          const actualDamage = Math.max(0, currentHp - 1);
          if (actualDamage > 0) {
            useGameStore.getState().takeDamage(actualDamage);
          }
          get().addToCombatLog(`불사! HP가 1 아래로 내려가지 않습니다!`);
          get().addDamagePopup(actualDamage, 'poison', 0, 0, 'player');
        } else {
          // 직접 HP 감소 (방어도 무시)
          useGameStore.getState().takeDamage(poisonDamage);
          // 초록색 팝업 표시
          get().addDamagePopup(poisonDamage, 'poison', 0, 0, 'player');
        }
      }

      // 최신 상태를 다시 가져와서 중독만 업데이트
      const latestStatuses = get().playerStatuses;
      const newPoisonStacks = poisonStatus.stacks - 1;
      set({
        playerStatuses: newPoisonStacks > 0
          ? latestStatuses.map(s => s.type === 'POISON' ? { ...s, stacks: newPoisonStacks } : s)
          : latestStatuses.filter(s => s.type !== 'POISON'),
      });
    }

    // 불사/무적 감소 (모든 피해 처리 후, 첫 턴 제외)
    if (turn > 1) {
      const statusesAfterDamage = get().playerStatuses;
      const reducedProtectionStatuses = statusesAfterDamage
        .map(s => ({
          ...s,
          stacks: (s.type === 'UNDYING' || s.type === 'INVULNERABLE') ? s.stacks - 1 : s.stacks,
        }))
        .filter(s => s.stacks > 0);
      set({ playerStatuses: reducedProtectionStatuses });
    }

    // 카드 5장 드로우 + 추가 드로우 (유물 효과)
    // 첫 턴(전투 시작)에는 소리 없이 드로우
    const totalDraw = 5 + extraDrawNextTurn + turnExtraDraw;
    get().drawCards(totalDraw, turn === 1);

    // 추가 드로우 리셋
    set({
      turn: turn,
      isPlayerTurn: true,
      extraDrawNextTurn: 0,
    });

    get().addToCombatLog(`--- 턴 ${turn} 시작 ---`);
  },

  endPlayerTurn: () => {
    // 손패 버리기
    get().discardHand();

    // 유물 효과 트리거 (ON_TURN_END)
    const gameState = useGameStore.getState();
    const relics = gameState.player.relics;
    let turnEndDamage = 0;

    relics.forEach(relic => {
      relic.effects.forEach(effect => {
        if (effect.trigger === 'ON_TURN_END') {
          const context = {
            damagePlayer: (amount: number) => { turnEndDamage += amount; },
            gainEnergy: () => {},
            drawCards: () => {},
            gainBlock: () => {},
            gainStrength: () => {},
            gainDexterity: () => {},
            heal: () => {},
          };
          effect.execute(context);
        }
      });
    });

    if (turnEndDamage > 0) {
      get().dealDamageToPlayer(turnEndDamage);
      get().addToCombatLog(`유물 효과로 HP ${turnEndDamage} 손실!`);
    }

    // 지형 효과 처리 (턴 종료 시)
    const { activeTerrain, enemies } = get();
    if (activeTerrain === 'toxic_swamp') {
      // 독성 늪지대: 모든 캐릭터 중독 2
      get().applyStatusToPlayer({ type: 'POISON', stacks: 2 });
      enemies.forEach(enemy => {
        if (enemy.currentHp > 0) {
          get().applyStatusToEnemy(enemy.instanceId, { type: 'POISON', stacks: 2 });
        }
      });
      get().addToCombatLog(`🌿 독성 늪지대: 모든 캐릭터가 중독 2!`);
    } else if (activeTerrain === 'lava_zone') {
      // 용암 지대: 모든 캐릭터 데미지 3
      get().dealDamageToPlayer(3);
      enemies.forEach(enemy => {
        if (enemy.currentHp > 0) {
          get().dealDamageToEnemy(enemy.instanceId, 3);
        }
      });
      get().addToCombatLog(`🔥 용암 지대: 모든 캐릭터가 3 피해!`);
    } else if (activeTerrain === 'thunder_wasteland') {
      // 벼락치는 황야: 무작위 대상 5번 낙뢰
      const allTargets: { type: 'player' | 'enemy'; id?: string }[] = [{ type: 'player' }];
      enemies.forEach(enemy => {
        if (enemy.currentHp > 0) {
          allTargets.push({ type: 'enemy', id: enemy.instanceId });
        }
      });
      get().addToCombatLog(`⚡ 벼락치는 황야: 낙뢰 5회!`);
      // 이펙트 큐 초기화
      get().clearThunderEffects();
      for (let i = 0; i < 5; i++) {
        const target = allTargets[Math.floor(Math.random() * allTargets.length)];
        // 번개 이펙트 큐에 추가
        get().addThunderEffect(target.type, target.id, i * 200);
        setTimeout(() => {
          // 번개 효과음 재생
          playThunder();
          if (target.type === 'player') {
            get().dealDamageToPlayer(3);
          } else if (target.id) {
            const enemy = get().enemies.find(e => e.instanceId === target.id);
            if (enemy && enemy.currentHp > 0) {
              get().dealDamageToEnemy(target.id, 3);
            }
          }
        }, i * 200);
      }
    }

    // STRENGTH_DOWN 처리: 힘 감소 후 제거
    // 최신 playerStatuses 사용 (지형 효과로 상태가 변경되었을 수 있음)
    const latestPlayerStatuses = get().playerStatuses;
    const strengthDown = latestPlayerStatuses.find(s => s.type === 'STRENGTH_DOWN');
    let processedStatuses = [...latestPlayerStatuses];

    if (strengthDown && strengthDown.stacks > 0) {
      const strengthStatus = processedStatuses.find(s => s.type === 'STRENGTH');
      if (strengthStatus) {
        strengthStatus.stacks -= strengthDown.stacks;
        get().addToCombatLog(`힘이 ${strengthDown.stacks} 감소했습니다.`);
      }
      // STRENGTH_DOWN 제거
      processedStatuses = processedStatuses.filter(s => s.type !== 'STRENGTH_DOWN');
    }

    // 상태 효과 지속시간 감소 (방어도 유지만 - 약화/취약/불사/무적은 턴 시작 시 감소)
    const updatedStatuses = processedStatuses
      .map(s => ({
        ...s,
        stacks: (s.type === 'BLOCK_RETAIN' || s.type === 'HEAL_REDUCTION' || s.type === 'UNDEAD')
          ? s.stacks - 1
          : s.stacks,
      }))
      .filter(s => s.stacks > 0);

    set({
      isPlayerTurn: false,
      playerStatuses: updatedStatuses,
    });

    // 업적 추적: 적 턴 전 방어도 저장 (적 턴 후에 체크하기 위해)
    const currentBlock = get().playerBlock;
    recordBlockBeforeEnemyTurn(currentBlock);
    checkTurnEndAchievements(currentBlock);

    // 추가 턴 처리 (시간 왜곡)
    const { extraTurnPending } = get();
    if (extraTurnPending) {
      set({ extraTurnPending: false });
      get().addToCombatLog('--- 추가 턴 시작! ---');
      // 적 턴 건너뛰고 바로 플레이어 턴
      set(state => ({ turn: state.turn + 1 }));
      get().startPlayerTurn();
      return;
    }

    // 적 턴 실행 (벼락치는 황야면 번개 이펙트 후 실행)
    if (activeTerrain === 'thunder_wasteland') {
      // 5회 * 200ms + 여유 시간
      setTimeout(() => {
        get().executeEnemyTurn();
      }, 1200);
    } else {
      get().executeEnemyTurn();
    }
  },

  executeEnemyTurn: async () => {
    const { enemies, turn } = get();

    // 순차적으로 적 행동 처리
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (enemy.currentHp <= 0) continue;

      // 적 방어도 리셋
      enemy.block = 0;

      // 적 중독 처리 (턴 시작 시)
      const poisonStatus = enemy.statuses.find(s => s.type === 'POISON');
      if (poisonStatus && poisonStatus.stacks > 0) {
        const poisonDamage = poisonStatus.stacks;
        // 중독 피해 (방어도 무시, 직접 HP 감소)
        enemy.currentHp = Math.max(0, enemy.currentHp - poisonDamage);
        get().addToCombatLog(`${enemy.name}이(가) 중독으로 ${poisonDamage} 피해!`);
        get().addDamagePopup(poisonDamage, 'poison', 0, 0, enemy.instanceId);

        // 중독 스택 감소
        poisonStatus.stacks -= 1;
        if (poisonStatus.stacks <= 0) {
          enemy.statuses = enemy.statuses.filter(s => s.type !== 'POISON');
        }

        // 적이 중독으로 죽었으면 다음 적으로
        if (enemy.currentHp <= 0) {
          get().addToCombatLog(`${enemy.name}이(가) 중독으로 쓰러졌습니다!`);
          // 적 상태 업데이트
          const updatedEnemies = [...get().enemies];
          updatedEnemies[i] = enemy;
          set({ enemies: updatedEnemies });
          get().checkCombatEnd();
          continue;
        }
      }

      // 의도 실행
      get().addToCombatLog(`${enemy.name}의 행동!`);

      // 의도에 따른 행동 (간소화된 버전)
      if (enemy.intent.type === 'ATTACK') {
        const damage = enemy.intent.damage || 0;
        const strength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
        const baseDamage = damage + strength;

        // 디버그: 기본 공격력 로그
        if (strength > 0) {
          get().addToCombatLog(`[${enemy.name}: 기본 ${damage} + 힘 ${strength} = ${baseDamage}]`);
        }

        // 공격 애니메이션 트리거
        get().triggerEnemyAttack(enemy.instanceId);

        // 공격 애니메이션 재생 후 데미지 적용
        await new Promise(resolve => setTimeout(resolve, 400));

        // 플레이어 피격 사운드 (방어도가 있으면 shield, 없으면 hit)
        if (get().playerBlock > 0) {
          playShieldBlock();
        } else {
          playHit();
        }

        // 피격 콜백 호출
        const { onPlayerHit } = get();
        if (onPlayerHit) {
          onPlayerHit();
        }

        // 데미지 처리 (약화/취약은 dealDamageToPlayer에서 합연산 처리)
        get().dealDamageToPlayer(baseDamage, enemy.instanceId);

        // 다음 적 공격 전 딜레이
        await new Promise(resolve => setTimeout(resolve, 400));
      } else if (enemy.intent.type === 'DEFEND') {
        get().triggerEnemySkill(enemy.instanceId);
        playEnemyBuff();
        const terrain = get().activeTerrain;
        if (terrain === 'gladiator_arena') {
          // 검투사의 경기장: 방어도 획득 불가
          get().addToCombatLog(`⚔️ ${enemy.name} 방어도 획득 불가!`);
        } else {
          let blockAmount = enemy.intent.block || 0;
          if (terrain === 'sacred_ground') {
            blockAmount *= 2; // 신성한 구역: 2배
          }
          enemy.block += blockAmount;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (enemy.intent.type === 'BUFF') {
        get().triggerEnemySkill(enemy.instanceId);
        playEnemyBuff();
        // intent에 정의된 statusType과 stacks 사용 (기본: 힘 +3)
        const statusType = enemy.intent.statusType || 'STRENGTH';
        const stacks = enemy.intent.statusStacks || 3;
        const existingStatus = enemy.statuses.find(s => s.type === statusType);
        if (existingStatus) {
          existingStatus.stacks += stacks;
        } else {
          enemy.statuses.push({ type: statusType, stacks });
        }
        get().addToCombatLog(`${enemy.name}이(가) 힘을 얻었습니다!`);
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (enemy.intent.type === 'DEBUFF') {
        // 공격 애니메이션 트리거
        get().triggerEnemyAttack(enemy.instanceId);

        // 애니메이션 재생 후 디버프 적용
        await new Promise(resolve => setTimeout(resolve, 400));

        // intent에 정의된 statusType과 stacks 사용
        const statusType = enemy.intent.statusType || 'WEAK';
        const stacks = enemy.intent.statusStacks || 1;
        get().applyStatusToPlayer({ type: statusType, stacks });
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // 상태 효과 감소
      enemy.statuses = enemy.statuses
        .map(s => ({
          ...s,
          stacks: s.type === 'WEAK' || s.type === 'VULNERABLE' ? s.stacks - 1 : s.stacks,
        }))
        .filter(s => s.stacks > 0);
    }

    // 다음 의도 설정
    // 캐시된 enemies(block, statuses 수정됨)와 store의 enemies(HP 변경됨)를 병합
    const storeEnemies = get().enemies;
    const updatedEnemies = storeEnemies.map((storeEnemy, i) => {
      const cachedEnemy = enemies[i];
      // store에서 HP, 캐시에서 block과 statuses 가져옴
      const mergedEnemy = {
        ...storeEnemy,
        block: cachedEnemy.block,
        statuses: cachedEnemy.statuses,
      };

      if (mergedEnemy.currentHp <= 0) return mergedEnemy;

      // 템플릿에서 다음 의도 가져오기 (간소화)
      const nextIntent = getNextEnemyIntent(mergedEnemy, turn + 1);
      return { ...mergedEnemy, intent: nextIntent };
    });

    set({
      enemies: updatedEnemies,
      turn: turn + 1,
    });

    // 승리/패배 체크 후 플레이어 턴 시작
    if (get().checkCombatEnd() === 'ONGOING') {
      get().startPlayerTurn();
    }
  },

  drawCards: (count: number, silent?: boolean) => {
    const { drawPile, hand, discardPile, activeTerrain } = get();
    const newHand = [...hand];
    let newDrawPile = [...drawPile];
    let newDiscardPile = [...discardPile];
    let drawnCount = 0;

    for (let i = 0; i < count; i++) {
      if (newDrawPile.length === 0) {
        if (newDiscardPile.length === 0) break;
        // 버린 카드 더미를 셔플해서 뽑기 더미로
        newDrawPile = shuffle(newDiscardPile);
        newDiscardPile = [];
      }

      let card = newDrawPile.pop();
      if (card) {
        // 무중력 공간: 코스트 무작위 변경
        if (activeTerrain === 'zero_gravity') {
          card = { ...card, cost: Math.floor(Math.random() * 4) }; // 0~3
        }
        newHand.push(card);
        // 카드 드로우 사운드 재생 (딜레이를 줘서 순차 재생, silent면 재생 안 함)
        if (!silent) {
          setTimeout(() => playCardDraw(), drawnCount * 110);
        }
        drawnCount++;
      }
    }

    set({
      drawPile: newDrawPile,
      hand: newHand,
      discardPile: newDiscardPile,
    });

    // 고대 도서관: 카드 뽑을 때마다 무작위 적에게 피해 1 (힘 절반 적용, 50ms 딜레이)
    if (activeTerrain === 'ancient_library' && drawnCount > 0) {
      const strength = get().playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
      const halfStrength = Math.floor(strength / 2);
      const baseDamage = 1 + halfStrength;
      for (let i = 0; i < drawnCount; i++) {
        setTimeout(() => {
          const aliveEnemies = get().enemies.filter(e => e.currentHp > 0);
          if (aliveEnemies.length > 0) {
            const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            get().dealDamageToEnemy(randomEnemy.instanceId, Math.max(0, baseDamage));
          }
        }, i * 50);
      }
    }

    // 업적 추적: 손패 변경 시 체크 (공격 카드 5장 이상 등)
    checkHandAchievements(newHand);
  },

  playCard: (cardInstanceId: string, targetEnemyId?: string, skipDamage?: boolean) => {
    const { hand, energy, enemies } = get();
    const cardIndex = hand.findIndex(c => c.instanceId === cardInstanceId);

    if (cardIndex === -1) return;

    const card = hand[cardIndex];

    // 에너지 체크
    if (card.cost > energy) {
      get().addToCombatLog('에너지가 부족합니다!');
      return;
    }

    // 공격 카드 금지 체크 (ATTACK_DISABLED)
    const attackDisabled = get().playerStatuses.find(s => s.type === 'ATTACK_DISABLED');
    if (attackDisabled && attackDisabled.stacks > 0 && card.type === 'ATTACK') {
      get().addToCombatLog('공격 카드를 사용할 수 없습니다!');
      return;
    }

    // 타겟이 필요한 카드인지 체크
    const needsTarget = card.effects.some(e =>
      (e.type === 'DAMAGE' && e.target === 'SINGLE') ||
      (e.type === 'APPLY_STATUS' && e.target === 'SINGLE') ||
      (e.type === 'DAMAGE_PER_LOST_HP' && e.target === 'SINGLE') ||
      (e.type === 'HALVE_ENEMY_HP' && e.target === 'SINGLE') ||
      (e.type === 'APPLY_OIL' && e.target === 'SINGLE')
    );

    if (needsTarget && !targetEnemyId) {
      // 타겟팅 모드 활성화
      set({ selectedCardId: cardInstanceId, targetingMode: true });
      return;
    }

    // 카드 효과 실행
    const pName = useGameStore.getState().playerName;
    get().addToCombatLog(`${pName}(이)가 ${card.name} 사용!`);

    // 특수 카드 스킬 사운드
    if (card.id === 'time_warp' || card.id === 'infinite_vortex') {
      playTimeSkill();
    } else if (card.type === 'SHIELD') {
      playInvincibility();
    }

    // 현재 사용 중인 카드 정보 저장 (업적 체크용)
    set({ currentPlayingCardId: card.id, currentPlayingCardName: card.name });

    // 통계 업데이트: 카드 사용
    useStatsStore.getState().incrementCardPlayed(card.type);

    // 통계 업데이트: 에너지 사용
    if (card.cost > 0) {
      useStatsStore.getState().addEnergyUsed(card.cost);
    }

    // 업적 체크: 카드 사용 기록
    recordCardUsed(card.id, card.name, card.type);

    // 사용한 카드 종류 기록 (중복 제외)
    const usedCardTypes = get().usedCardTypes;
    if (!usedCardTypes.includes(card.id)) {
      set({ usedCardTypes: [...usedCardTypes, card.id] });
    }

    card.effects.forEach(effect => {
      switch (effect.type) {
        case 'DAMAGE': {
          // skipDamage가 true이면 데미지 처리 건너뛰기 (이미 애니메이션에서 처리됨)
          if (skipDamage) break;

          // 기본 데미지 + 힘 계산 (약화/취약은 dealDamageToEnemy에서 처리)
          let baseDamage = effect.value;
          const strength = get().playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
          baseDamage += strength;

          if (effect.target === 'ALL') {
            get().enemies.forEach(enemy => {
              if (enemy.currentHp > 0) {
                get().dealDamageToEnemy(enemy.instanceId, baseDamage);
              }
            });
          } else if (targetEnemyId) {
            get().dealDamageToEnemy(targetEnemyId, baseDamage);
          }
          break;
        }
        case 'BLOCK': {
          let block = effect.value;

          // 민첩 적용
          const dexterity = get().playerStatuses.find(s => s.type === 'DEXTERITY')?.stacks || 0;
          block += dexterity;

          get().gainPlayerBlock(block);
          break;
        }
        case 'DRAW':
          get().drawCards(effect.value);
          break;
        case 'APPLY_STATUS':
          if (effect.status) {
            if (effect.target === 'SELF') {
              get().applyStatusToPlayer({ type: effect.status, stacks: effect.value });
            } else if (skipDamage) {
              // skipDamage가 true면 적 대상 상태 효과는 나중에 데미지 처리 후 적용
              // (applyCardStatusToEnemy에서 처리)
              break;
            } else if (effect.target === 'ALL') {
              enemies.forEach(enemy => {
                if (enemy.currentHp > 0) {
                  get().applyStatusToEnemy(enemy.instanceId, { type: effect.status!, stacks: effect.value });
                }
              });
            } else if (targetEnemyId) {
              get().applyStatusToEnemy(targetEnemyId, { type: effect.status, stacks: effect.value });
            }
          }
          break;
        case 'GAIN_ENERGY':
          get().gainEnergy(effect.value);
          get().addToCombatLog(`에너지 ${effect.value} 획득!`);
          break;
        case 'LOSE_HP': {
          // 무적 상태면 HP 손실 무효화
          const invulnerableStatus = get().playerStatuses.find(s => s.type === 'INVULNERABLE');
          if (invulnerableStatus && invulnerableStatus.stacks > 0) {
            get().addToCombatLog(`무적! HP 손실 무효화!`);
            get().addDamagePopup(0, 'blocked', 0, 0, 'player');
          } else {
            // HP 직접 감소 (방어도 무시)
            useGameStore.getState().modifyHp(-effect.value);
            get().addDamagePopup(effect.value, 'damage', 0, 0, 'player');
            // 피격 애니메이션 트리거
            const { onPlayerHit } = get();
            if (onPlayerHit) {
              onPlayerHit();
            }
            get().addToCombatLog(`HP ${effect.value} 감소!`);

            // 통계 업데이트: 카드로 HP 손실
            useStatsStore.getState().addHpLostByCard(effect.value);
          }
          break;
        }
        case 'HEAL': {
          let healAmount = effect.value;
          const undead = get().playerStatuses.find(s => s.type === 'UNDEAD');
          const healReduction = get().playerStatuses.find(s => s.type === 'HEAL_REDUCTION');

          // 언데드화 - 회복이 피해로 전환
          if (undead && undead.stacks > 0) {
            useGameStore.getState().modifyHp(-healAmount);
            get().addDamagePopup(healAmount, 'damage', 0, 0, 'player');
            get().addToCombatLog(`💀 언데드화! 회복이 ${healAmount} 피해로 전환!`);
          } else {
            // 치유 감소 - 50% 감소
            if (healReduction && healReduction.stacks > 0) {
              healAmount = Math.floor(healAmount * 0.5);
              get().addToCombatLog(`(치유 감소로 50% 감소)`);
            }
            useGameStore.getState().healPlayer(healAmount);
            get().addDamagePopup(healAmount, 'heal', 0, 0, 'player');
            get().addToCombatLog(`HP ${healAmount} 회복!`);

            // 통계 업데이트: 회복량
            useStatsStore.getState().addHealing(healAmount);

            // 업적 체크: 회복 사용
            recordHealUsed();
            checkImmediateAchievements();
          }
          break;
        }
        case 'UPGRADE_HAND': {
          // 손에 있는 업그레이드 가능한 카드 중 랜덤 N장 업그레이드
          // 현재 사용 중인 카드(자기 자신)는 제외
          const upgradeCount = effect.value || 1;
          let currentHandUpgrade = get().hand;
          let upgradedNames: string[] = [];

          for (let i = 0; i < upgradeCount; i++) {
            const upgradableCards = currentHandUpgrade.filter(c => !c.upgraded && c.upgradeEffect && c.instanceId !== cardInstanceId);
            if (upgradableCards.length === 0) break;

            const randomCard = upgradableCards[Math.floor(Math.random() * upgradableCards.length)];
            upgradedNames.push(randomCard.name);

            currentHandUpgrade = currentHandUpgrade.map(c =>
              c.instanceId === randomCard.instanceId
                ? { ...c, ...c.upgradeEffect, upgraded: true }
                : c
            );
          }

          if (upgradedNames.length > 0) {
            set({ hand: currentHandUpgrade });
            get().addToCombatLog(`${upgradedNames.join(', ')}을(를) 업그레이드!`);
          }
          break;
        }
        case 'UPGRADE_ALL_HAND': {
          // 손에 있는 모든 카드 업그레이드 (자기 자신 제외)
          const currentHandAll = get().hand;
          let upgradedCount = 0;
          const newHandAll = currentHandAll.map(c => {
            if (!c.upgraded && c.upgradeEffect && c.instanceId !== cardInstanceId) {
              upgradedCount++;
              return {
                ...c,
                ...c.upgradeEffect,
                upgraded: true,
              };
            }
            return c;
          });
          set({ hand: newHandAll });
          if (upgradedCount > 0) {
            get().addToCombatLog(`${upgradedCount}장의 카드를 업그레이드!`);
          }
          break;
        }
        case 'MULTIPLY_STRENGTH': {
          // 한계 돌파: 현재 힘을 배수만큼 증가
          const currentStatuses = get().playerStatuses;
          const strengthStatus = currentStatuses.find(s => s.type === 'STRENGTH');
          if (strengthStatus && strengthStatus.stacks > 0) {
            const newStacks = Math.floor(strengthStatus.stacks * effect.value);
            const gained = newStacks - strengthStatus.stacks;
            const updatedStatuses = currentStatuses.map(s =>
              s.type === 'STRENGTH' ? { ...s, stacks: newStacks } : s
            );
            set({ playerStatuses: updatedStatuses });
            get().addToCombatLog(`힘이 ${gained} 증가! (${strengthStatus.stacks} → ${newStacks})`);
          } else {
            get().addToCombatLog('힘이 없어서 효과 없음!');
          }
          break;
        }
        case 'BLOCK_RETAIN': {
          // 철벽의 요새: N턴간 방어도 유지 상태 부여
          get().applyStatusToPlayer({ type: 'BLOCK_RETAIN', stacks: effect.value });
          get().addToCombatLog(`${effect.value}턴간 방어도가 유지됩니다!`);
          break;
        }
        case 'DAMAGE_PER_LOST_HP': {
          // skipDamage가 true이면 데미지 처리 건너뛰기 (이미 애니메이션에서 처리됨)
          if (skipDamage) break;

          // 사선에서: 잃은 HP 기반 피해
          const gameState = useGameStore.getState();
          const lostHp = gameState.player.maxHp - gameState.player.currentHp;
          const ratio = effect.ratio || 1;
          const baseDmg = Math.floor((lostHp / ratio) * effect.value);

          // 힘 적용
          const str = get().playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
          const finalDmg = baseDmg + str;

          if (targetEnemyId) {
            get().dealDamageToEnemy(targetEnemyId, finalDmg);
            get().addToCombatLog(`잃은 HP ${lostHp}로 ${finalDmg} 피해!`);
          }
          break;
        }
        case 'REDUCE_ATTACK_COST': {
          // 전술 지휘: 마지막으로 뽑은 카드들 중 공격 카드 코스트 감소
          const currentHandForCost = get().hand;
          // 마지막 DRAW 효과로 뽑은 카드들 (가장 최근에 추가된 카드들)
          const drawnCount = card.effects.find(e => e.type === 'DRAW')?.value || 0;
          const recentCards = currentHandForCost.slice(-drawnCount);

          let reducedCount = 0;
          const newHandCost = currentHandForCost.map(c => {
            if (recentCards.some(rc => rc.instanceId === c.instanceId) && c.type === 'ATTACK') {
              reducedCount++;
              return { ...c, cost: Math.max(0, c.cost - effect.value) };
            }
            return c;
          });
          set({ hand: newHandCost });
          if (reducedCount > 0) {
            get().addToCombatLog(`공격 카드 ${reducedCount}장의 코스트 ${effect.value} 감소!`);
          }
          break;
        }
        case 'GAIN_MAX_HP_ON_KILL': {
          // 피의 축제: 적 처치 시 최대 HP 증가
          // 이 효과는 DAMAGE 효과와 함께 사용되므로, 적이 죽었는지 확인
          if (targetEnemyId) {
            const targetEnemy = get().enemies.find(e => e.instanceId === targetEnemyId);
            if (targetEnemy && targetEnemy.currentHp <= 0) {
              useGameStore.getState().modifyMaxHp(effect.value);
              get().addToCombatLog(`적 처치! 최대 HP ${effect.value} 증가!`);
            }
          }
          break;
        }
        case 'DAMAGE_PER_PLAYED': {
          // 종언의 일격: 사용한 카드 종류당 피해 (자기 자신 제외)
          const uniqueCount = get().usedCardTypes.filter(id => id !== 'final_strike').length;
          const dmgPerPlayed = effect.value * uniqueCount;
          const str2 = get().playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
          const totalDmg = dmgPerPlayed + str2;

          if (effect.target === 'ALL') {
            enemies.forEach(enemy => {
              if (enemy.currentHp > 0) {
                get().dealDamageToEnemy(enemy.instanceId, totalDmg);
              }
            });
            get().addToCombatLog(`카드 종류 ${uniqueCount}개 × ${effect.value} = ${totalDmg} 피해!`);
          }
          break;
        }
        case 'RETURN_PLAYED_CARDS': {
          // 무한의 소용돌이: 이번 턴에 사용한 카드를 손으로
          // discardPile에서 최근 카드들을 가져옴
          const returnCount = Math.min(effect.value, get().discardPile.length);
          const cardsToReturn = get().discardPile.slice(-returnCount);
          const remainingDiscard = get().discardPile.slice(0, -returnCount);

          set({
            hand: [...get().hand, ...cardsToReturn],
            discardPile: remainingDiscard,
          });
          // 카드 드로우 사운드 재생 (딜레이를 줘서 순차 재생)
          for (let i = 0; i < returnCount; i++) {
            setTimeout(() => playCardDraw(), i * 110);
          }
          get().addToCombatLog(`${returnCount}장의 카드가 손으로 돌아왔습니다!`);
          break;
        }
        case 'INVULNERABLE': {
          // 절대 방어 영역: N턴간 무적
          get().applyStatusToPlayer({ type: 'INVULNERABLE', stacks: effect.value });
          get().addToCombatLog(`${effect.value}턴간 무적!`);
          break;
        }
        case 'HALVE_ENEMY_HP': {
          // 신의 권능: 적 HP 절반 감소 (방어도/배수 무시, 직접 HP 감소)
          if (targetEnemyId) {
            const currentEnemies = get().enemies;
            const enemyIndex = currentEnemies.findIndex(e => e.instanceId === targetEnemyId);
            if (enemyIndex !== -1) {
              const targetEnemy = currentEnemies[enemyIndex];
              const halfHp = Math.floor(targetEnemy.currentHp / 2);
              const cappedDmg = Math.min(halfHp, effect.value); // 최대 피해 제한
              const newHp = targetEnemy.currentHp - cappedDmg;

              // 직접 HP 감소 (방어도/배수 무시)
              const updatedEnemy = { ...targetEnemy, currentHp: Math.max(0, newHp) };
              const updatedEnemies = [...currentEnemies];
              updatedEnemies[enemyIndex] = updatedEnemy;
              set({ enemies: updatedEnemies });

              get().addToCombatLog(`${targetEnemy.name}의 HP를 ${cappedDmg} 감소! (${targetEnemy.currentHp} → ${newHp})`);
            }
          }
          break;
        }
        case 'CONSUME_ENERGY_DRAW': {
          // 무한의 소용돌이: 에너지 소비해서 카드 드로우
          const currentEnergy = get().energy;
          const maxConsume = effect.maxConsume || 3;
          const energyToConsume = Math.min(currentEnergy, maxConsume);
          const cardsToDraw = energyToConsume * effect.value;

          if (energyToConsume > 0) {
            set({ energy: currentEnergy - energyToConsume });
            get().drawCards(cardsToDraw);
            get().addToCombatLog(`에너지 ${energyToConsume} 소비! 카드 ${cardsToDraw}장 드로우!`);
          }
          break;
        }
        case 'EXTRA_TURN': {
          // 시간 왜곡: 추가 턴
          set({ extraTurnPending: true });
          get().addToCombatLog('추가 턴을 얻습니다!');
          break;
        }
        case 'RANDOM_HEAL': {
          // 야생 버섯 섭취: 랜덤 범위 HP 회복/손실
          const currentTerrain = get().activeTerrain;

          // 독성 늪지대: 고정 HP 5 회복 (독 면역)
          if (currentTerrain === 'toxic_swamp') {
            const fixedHeal = 5;
            const undead = get().playerStatuses.find(s => s.type === 'UNDEAD');
            if (undead && undead.stacks > 0) {
              useGameStore.getState().modifyHp(-fixedHeal);
              get().addDamagePopup(fixedHeal, 'damage', 0, 0, 'player');
              get().addToCombatLog(`🌿 독성 늪지대: 💀 언데드화! 회복이 ${fixedHeal} 피해로 전환!`);
            } else {
              useGameStore.getState().healPlayer(fixedHeal);
              get().addDamagePopup(fixedHeal, 'heal', 0, 0, 'player');
              get().addToCombatLog(`🌿 독성 늪지대: 야생 버섯이 정화됨! HP ${fixedHeal} 회복!`);
              useStatsStore.getState().addHealing(fixedHeal);
            }
            break;
          }

          const minVal = effect.min ?? 0;
          const maxVal = effect.value;
          const critChance = effect.critChance ?? 0;
          const critDamage = effect.critDamage ?? 0;

          // 크리티컬 체크 (버섯 독)
          if (Math.random() < critChance && critDamage > 0) {
            useGameStore.getState().modifyHp(-critDamage);
            get().addDamagePopup(critDamage, 'poison', 0, 0, 'player');
            get().addToCombatLog(`독버섯! HP ${critDamage} 손실!`);
          } else {
            // 랜덤 힐/데미지
            let randomValue = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
            if (randomValue > 0) {
              const undead = get().playerStatuses.find(s => s.type === 'UNDEAD');
              const healReduction = get().playerStatuses.find(s => s.type === 'HEAL_REDUCTION');

              // 언데드화 - 회복이 피해로 전환
              if (undead && undead.stacks > 0) {
                useGameStore.getState().modifyHp(-randomValue);
                get().addDamagePopup(randomValue, 'damage', 0, 0, 'player');
                get().addToCombatLog(`💀 언데드화! 회복이 ${randomValue} 피해로 전환!`);
              } else {
                // 치유 감소 - 50% 감소
                if (healReduction && healReduction.stacks > 0) {
                  randomValue = Math.floor(randomValue * 0.5);
                  get().addToCombatLog(`(치유 감소로 50% 감소)`);
                }
                useGameStore.getState().healPlayer(randomValue);
                get().addDamagePopup(randomValue, 'heal', 0, 0, 'player');
                get().addToCombatLog(`HP ${randomValue} 회복!`);

                // 통계 업데이트: 회복량
                useStatsStore.getState().addHealing(randomValue);
              }
            } else if (randomValue < 0) {
              useGameStore.getState().modifyHp(randomValue);
              get().addDamagePopup(Math.abs(randomValue), 'damage', 0, 0, 'player');
              get().addToCombatLog(`HP ${Math.abs(randomValue)} 손실!`);
            } else {
              get().addToCombatLog(`효과 없음...`);
            }
          }
          break;
        }
        case 'APPLY_UNDYING': {
          // 광전사의 반지: 불사 상태 부여
          get().applyStatusToPlayer({ type: 'UNDYING', stacks: effect.value });
          get().addToCombatLog(`${effect.value}턴간 불사 상태!`);
          break;
        }
        case 'APPLY_BLOCK_ON_ATTACK': {
          // 최선의 방어: 공격 시 방어도 획득 패시브
          get().applyStatusToPlayer({ type: 'GAIN_BLOCK_ON_ATTACK', stacks: effect.value });
          get().addToCombatLog(`공격 카드 사용 시 방어도 ${effect.value} 획득 효과!`);
          break;
        }
        case 'REDUCE_SLASH_COST': {
          // 기본기 충실: '베기' 카드 코스트 감소 (덱, 손, 버린 더미 모두)
          const costReduction = effect.value;

          // 손패
          const newHandSlash = get().hand.map(c => {
            if (c.name.includes('베기')) {
              return { ...c, cost: Math.max(0, c.cost - costReduction), originalCost: Math.max(0, c.originalCost - costReduction) };
            }
            return c;
          });

          // 뽑기 더미
          const newDrawPile = get().drawPile.map(c => {
            if (c.name.includes('베기')) {
              return { ...c, cost: Math.max(0, c.cost - costReduction), originalCost: Math.max(0, c.originalCost - costReduction) };
            }
            return c;
          });

          // 버린 더미
          const newDiscardPile = get().discardPile.map(c => {
            if (c.name.includes('베기')) {
              return { ...c, cost: Math.max(0, c.cost - costReduction), originalCost: Math.max(0, c.originalCost - costReduction) };
            }
            return c;
          });

          set({ hand: newHandSlash, drawPile: newDrawPile, discardPile: newDiscardPile });
          get().addToCombatLog(`'베기' 카드 코스트 ${costReduction} 감소!`);
          break;
        }
        case 'APPLY_OIL': {
          // 기름통: 적에게 기름 마킹 (용암 지대: 직접 공격으로 변경)
          if (targetEnemyId) {
            const explosionDmg = effect.explosionDamage || 12;
            const currentTerrain = get().activeTerrain;
            if (currentTerrain === 'lava_zone') {
              // 용암 지대: 기름통이 일반 공격으로 변경 (3배 피해)
              const lavaDamage = explosionDmg * 3; // 12*3=36, 18*3=54
              get().dealDamageToEnemy(targetEnemyId, lavaDamage);
              get().addToCombatLog(`🔥 용암 지대: 기름통 폭발! ${lavaDamage} 피해!`);
            } else {
              get().applyStatusToEnemy(targetEnemyId, { type: 'OIL_MARKED', stacks: explosionDmg });
              get().addToCombatLog(`적에게 기름 부착! 처치 시 ${explosionDmg} 폭발!`);
            }
          }
          break;
        }
        case 'APPLY_THORNS': {
          // 바늘 갑옷: 방어도 반사 패시브 (value = 반사 비율 %)
          get().applyStatusToPlayer({ type: 'THORNS', stacks: effect.value });
          get().addToCombatLog(`피격 시 방어도의 ${effect.value}% 반사!`);
          break;
        }
        case 'APPLY_ATTACK_DISABLED': {
          // 방패 용사: 공격 카드 사용 금지
          get().applyStatusToPlayer({ type: 'ATTACK_DISABLED', stacks: effect.value });
          get().addToCombatLog(`공격 카드 사용 금지!`);
          break;
        }
        case 'APPLY_BLOCK_TO_DAMAGE': {
          // 방패 용사: 방어도 획득 시 피해 (value = 비율 %)
          get().applyStatusToPlayer({ type: 'BLOCK_TO_DAMAGE', stacks: effect.value });
          get().addToCombatLog(`방어도 획득 시 ${effect.value}% 피해 변환!`);
          break;
        }
        // 지형 카드 효과
        case 'TERRAIN_TOXIC_SWAMP': {
          // 무중력 공간에서 변경 시 코스트 복구
          if (get().activeTerrain === 'zero_gravity') {
            const restoredHand = get().hand.map(c => ({ ...c, cost: c.originalCost }));
            set({ hand: restoredHand });
            get().addToCombatLog(`🌀 무중력 해제: 카드 코스트 복구!`);
          }
          set({ activeTerrain: 'toxic_swamp' });
          get().addToCombatLog(`🌿 지형 변경: 독성 늪지대!`);
          break;
        }
        case 'TERRAIN_LAVA_ZONE': {
          // 무중력 공간에서 변경 시 코스트 복구
          if (get().activeTerrain === 'zero_gravity') {
            const restoredHand = get().hand.map(c => ({ ...c, cost: c.originalCost }));
            set({ hand: restoredHand });
            get().addToCombatLog(`🌀 무중력 해제: 카드 코스트 복구!`);
          }
          set({ activeTerrain: 'lava_zone' });
          get().addToCombatLog(`🔥 지형 변경: 용암 지대!`);
          break;
        }
        case 'TERRAIN_SACRED_GROUND': {
          // 무중력 공간에서 변경 시 코스트 복구
          if (get().activeTerrain === 'zero_gravity') {
            const restoredHand = get().hand.map(c => ({ ...c, cost: c.originalCost }));
            set({ hand: restoredHand });
            get().addToCombatLog(`🌀 무중력 해제: 카드 코스트 복구!`);
          }
          set({ activeTerrain: 'sacred_ground' });
          get().addToCombatLog(`✨ 지형 변경: 신성한 구역!`);
          break;
        }
        case 'TERRAIN_GLADIATOR_ARENA': {
          // 무중력 공간에서 변경 시 코스트 복구
          if (get().activeTerrain === 'zero_gravity') {
            const restoredHand = get().hand.map(c => ({ ...c, cost: c.originalCost }));
            set({ hand: restoredHand });
            get().addToCombatLog(`🌀 무중력 해제: 카드 코스트 복구!`);
          }
          set({ activeTerrain: 'gladiator_arena' });
          get().addToCombatLog(`⚔️ 지형 변경: 검투사의 경기장!`);
          break;
        }
        case 'TERRAIN_ZERO_GRAVITY': {
          set({ activeTerrain: 'zero_gravity' });
          get().addToCombatLog(`🌀 지형 변경: 무중력 공간!`);
          // 현재 손패 카드 코스트 무작위 변경
          const currentHandCards = get().hand;
          const randomizedHand = currentHandCards.map(c => ({
            ...c,
            cost: Math.floor(Math.random() * 4), // 0~3
          }));
          set({ hand: randomizedHand });
          break;
        }
        case 'TERRAIN_THUNDER_WASTELAND': {
          // 무중력 공간에서 변경 시 코스트 복구
          if (get().activeTerrain === 'zero_gravity') {
            const restoredHand = get().hand.map(c => ({ ...c, cost: c.originalCost }));
            set({ hand: restoredHand });
            get().addToCombatLog(`🌀 무중력 해제: 카드 코스트 복구!`);
          }
          set({ activeTerrain: 'thunder_wasteland' });
          get().addToCombatLog(`⚡ 지형 변경: 벼락치는 황야!`);
          break;
        }
        case 'TERRAIN_ANCIENT_LIBRARY': {
          // 무중력 공간에서 변경 시 코스트 복구
          if (get().activeTerrain === 'zero_gravity') {
            const restoredHand = get().hand.map(c => ({ ...c, cost: c.originalCost }));
            set({ hand: restoredHand });
            get().addToCombatLog(`🌀 무중력 해제: 카드 코스트 복구!`);
          }
          set({ activeTerrain: 'ancient_library' });
          get().addToCombatLog(`📚 지형 변경: 고대 도서관!`);
          break;
        }
      }
    });

    // GAIN_BLOCK_ON_ATTACK 효과: 공격 카드 사용 시 방어도 획득
    if (card.type === 'ATTACK') {
      const blockOnAttack = get().playerStatuses.find(s => s.type === 'GAIN_BLOCK_ON_ATTACK');
      if (blockOnAttack && blockOnAttack.stacks > 0) {
        get().gainPlayerBlock(blockOnAttack.stacks);
        get().addToCombatLog(`최선의 방어! 방어도 ${blockOnAttack.stacks} 획득!`);
      }
    }

    // 카드 사용 후 처리 (DRAW 효과로 hand가 변경되었을 수 있으므로 다시 가져옴)
    const currentHand = get().hand;
    const newHand = currentHand.filter(c => c.instanceId !== cardInstanceId);
    const { discardPile, exhaustPile, energy: currentEnergy, activeTerrain } = get();

    // exhaust 카드는 소멸 더미로 (고대 도서관: 소멸 안 하고 버려진 카드 더미로, 단 TERRAIN 카드는 제외)
    if (card.exhaust) {
      if (activeTerrain === 'ancient_library' && card.type !== 'TERRAIN') {
        // 고대 도서관: 소멸 카드도 버려진 카드 더미로 (TERRAIN 카드는 정상 소멸)
        const restoredCard = { ...card, cost: card.originalCost };
        set({
          hand: newHand,
          discardPile: [...discardPile, restoredCard],
          energy: currentEnergy - card.cost,
          selectedCardId: null,
          targetingMode: false,
        });
        get().addToCombatLog(`📚 고대 도서관: ${card.name} 소멸 방지!`);
      } else {
        set({
          hand: newHand,
          exhaustPile: [...exhaustPile, card],
          energy: currentEnergy - card.cost,
          selectedCardId: null,
          targetingMode: false,
        });
        get().addToCombatLog(`${card.name} 소멸!`);
      }
    }
    // returnToHand 카드는 잠시 버린 후 다시 손으로 돌아옴
    else if (card.returnToHand) {
      // 먼저 카드를 버린 더미로 이동
      set({
        hand: newHand,
        discardPile: [...discardPile, card],
        energy: currentEnergy - card.cost,
        selectedCardId: null,
        targetingMode: false,
      });
      // 딜레이 후 다시 손으로
      setTimeout(() => {
        const currentDiscard = get().discardPile;
        const cardInDiscard = currentDiscard.find(c => c.instanceId === card.instanceId);
        if (cardInDiscard) {
          // 코스트 원래대로 복구
          const restoredCard = { ...cardInDiscard, cost: cardInDiscard.originalCost };
          set({
            hand: [...get().hand, restoredCard],
            discardPile: currentDiscard.filter(c => c.instanceId !== card.instanceId),
          });
          playCardDraw();
          get().addToCombatLog(`${card.name}이(가) 손으로 돌아왔습니다!`);

          // 고대 도서관: 카드가 손으로 돌아올 때도 피해 (힘 절반 적용)
          if (get().activeTerrain === 'ancient_library') {
            const aliveEnemies = get().enemies.filter(e => e.currentHp > 0);
            const strength = get().playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
            const halfStrength = Math.floor(strength / 2);
            const damage = 1 + halfStrength;
            if (aliveEnemies.length > 0) {
              const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
              get().dealDamageToEnemy(randomEnemy.instanceId, Math.max(0, damage));
            }
          }
        }
      }, 300);
    }
    // 일반 카드는 버린 더미로 (코스트 복구)
    else {
      const restoredCard = { ...card, cost: card.originalCost };
      set({
        hand: newHand,
        discardPile: [...discardPile, restoredCard],
        energy: currentEnergy - card.cost,
        selectedCardId: null,
        targetingMode: false,
      });
    }

    // 전투 종료 체크
    get().checkCombatEnd();
  },

  discardHand: () => {
    const { hand, discardPile } = get();

    // 버린 더미로 갈 때 코스트 복구
    const restoredHand = hand.map(c => ({ ...c, cost: c.originalCost }));
    set({
      hand: [],
      discardPile: [...discardPile, ...restoredHand],
    });
  },

  selectCard: (cardInstanceId: string | null) => {
    if (cardInstanceId === null) {
      set({ selectedCardId: null, targetingMode: false });
    } else {
      set({ selectedCardId: cardInstanceId });
    }
  },

  dealDamageToEnemy: (enemyId: string, baseDamage: number) => {
    const { enemies, playerStatuses, activeTerrain } = get();
    const enemyIndex = enemies.findIndex(e => e.instanceId === enemyId);

    if (enemyIndex === -1) return;

    const enemy = enemies[enemyIndex];

    // 합연산 방식으로 배수 계산 (기본 1.0 + 취약 0.5 - 약화 0.25)
    let damageMultiplier = 1.0;
    const modifiers: string[] = [];

    // 플레이어 약화: -25% 데미지
    const weak = playerStatuses.find(s => s.type === 'WEAK');
    if (weak && weak.stacks > 0) {
      damageMultiplier -= 0.25;
      modifiers.push('무기손상-25%');
    }

    // 적 취약: +50% 데미지
    const vulnerable = enemy.statuses.find(s => s.type === 'VULNERABLE');
    if (vulnerable && vulnerable.stacks > 0) {
      damageMultiplier += 0.5;
      modifiers.push('장비파괴+50%');
    }

    // 검투사의 경기장: +50% 데미지
    if (activeTerrain === 'gladiator_arena') {
      damageMultiplier += 0.5;
      modifiers.push('경기장+50%');
    }

    // 최종 데미지 계산 (버림 사용)
    const finalDamage = Math.floor(baseDamage * damageMultiplier);

    // 방어도 먼저 소모
    let remainingDamage = finalDamage;
    let newBlock = enemy.block;
    let blockedAmount = 0;
    if (newBlock > 0) {
      if (newBlock >= remainingDamage) {
        blockedAmount = remainingDamage;
        newBlock -= remainingDamage;
        remainingDamage = 0;
      } else {
        blockedAmount = newBlock;
        remainingDamage -= newBlock;
        newBlock = 0;
      }
      // 적이 방어도로 막았을 때 실드 사운드
      playShieldBlock();
      // 방어도가 흡수한 데미지 팝업 (회색) - 랜덤 위치
      const enemyEl = document.querySelector(`[data-enemy-id="${enemyId}"]`);
      if (enemyEl) {
        const rect = enemyEl.getBoundingClientRect();
        const isMobile = window.innerHeight < 500;
        const randomX = (Math.random() - 0.5) * (isMobile ? 30 : 60);
        const randomY = (Math.random() - 0.5) * (isMobile ? 20 : 40);
        get().addDamagePopup(blockedAmount, 'blocked', rect.left + rect.width / 2 + randomX, rect.top + rect.height / 3 + randomY);
      }
    }

    // HP 감소
    const newHp = Math.max(0, enemy.currentHp - remainingDamage);

    // 실제 HP에 들어간 데미지 팝업 (빨간색) - 막은 양이 있으면 딜레이 후 표시, 랜덤 위치
    if (remainingDamage > 0) {
      const enemyEl = document.querySelector(`[data-enemy-id="${enemyId}"]`);
      if (enemyEl) {
        const rect = enemyEl.getBoundingClientRect();
        const isMobile = window.innerHeight < 500;
        const randomX = (Math.random() - 0.5) * (isMobile ? 30 : 60);
        const randomY = (Math.random() - 0.5) * (isMobile ? 20 : 40);
        setTimeout(() => {
          get().addDamagePopup(remainingDamage, 'damage', rect.left + rect.width / 2 + randomX, rect.top + rect.height / 3 + randomY);
        }, blockedAmount > 0 ? 150 : 0);

        // 히트 이펙트 추가 (랜덤 위치, 약간 아래로)
        const hitRandomX = (Math.random() - 0.5) * (isMobile ? 50 : 100);
        const hitRandomY = (Math.random() - 0.5) * (isMobile ? 35 : 70);
        get().addHitEffect(enemyId, rect.left + rect.width / 2 + hitRandomX, rect.top + rect.height / 2 + hitRandomY);
      }
    }

    // 로그 출력 (방어도 흡수 + 실제 피해)
    if (blockedAmount > 0) {
      get().addToCombatLog(`[방어도 ${blockedAmount} 흡수, 남은 방어도: ${newBlock}]`);
    }
    if (remainingDamage > 0) {
      get().addToCombatLog(`${enemy.name}(이)가 ${remainingDamage} 피해를 입었습니다! (남은 HP: ${newHp})`);
    } else if (blockedAmount > 0) {
      get().addToCombatLog(`${enemy.name}의 방어도가 모든 피해를 흡수!`);
    }

    // 새로운 enemy 객체 생성
    const updatedEnemy = { ...enemy, currentHp: newHp, block: newBlock };
    const updatedEnemies = [...enemies];
    updatedEnemies[enemyIndex] = updatedEnemy;

    set({ enemies: updatedEnemies });

    // 통계 업데이트: 데미지 입힘
    if (remainingDamage > 0) {
      useStatsStore.getState().addDamageDealt(remainingDamage);
      // 통계 업데이트: 한 번에 입힌 최대 피해
      useStatsStore.getState().updateMaxSingleDamage(remainingDamage);
    }

    // 업적 체크: 적에게 피해 입힘
    recordDamageToEnemy(enemyId, remainingDamage);
    checkImmediateAchievements();

    // 업적 체크: 적 3마리에게 모두 피해 입히기 (모두 살아있을 때만)
    const aliveEnemies = get().enemies.filter(e => e.currentHp > 0);
    if (aliveEnemies.length >= 3) {
      const { damagedEnemyIds } = getBattleAchievementState();
      const allAliveHit = aliveEnemies.every(e => damagedEnemyIds.has(e.instanceId));
      if (allAliveHit) {
        useStatsStore.getState().unlockAchievement('damage_3_enemies');
      }
    }

    // 통계 업데이트: 적 처치 (저장은 전투 승리 시 한 번에)
    if (newHp <= 0 && enemy.currentHp > 0) {
      const currentNode = useGameStore.getState().getCurrentNode();
      const nodeType = currentNode?.type || 'ENEMY';
      if (nodeType === 'BOSS') {
        useStatsStore.getState().incrementKill('boss');
      } else if (nodeType === 'ELITE') {
        useStatsStore.getState().incrementKill('elite');
      } else {
        useStatsStore.getState().incrementKill('mob');
      }

      // 업적 체크: 특정 카드로 적 처치
      const { currentPlayingCardId, currentPlayingCardName } = get();
      if (currentPlayingCardId && currentPlayingCardName) {
        recordKillWithCard(currentPlayingCardId, currentPlayingCardName);
        checkKillAchievements(currentPlayingCardId, currentPlayingCardName);
      }

      // OIL_MARKED 효과: 기름 묻은 적 처치 시 모든 적에게 폭발 피해
      // 최신 상태에서 적을 다시 가져옴 (applyStatusToEnemy가 새 객체를 생성하므로)
      const latestEnemy = get().enemies.find(e => e.instanceId === enemyId);
      const oilMarked = latestEnemy?.statuses.find(s => s.type === 'OIL_MARKED');
      if (oilMarked && oilMarked.stacks > 0) {
        const baseExplosionDamage = oilMarked.stacks;
        get().addToCombatLog(`💥 기름통 폭발! 모든 적에게 피해!`);
        // 폭발은 다른 적들에게만 (이미 죽은 적은 제외, 자신도 제외)
        const currentEnemies = get().enemies;
        currentEnemies.forEach(otherEnemy => {
          if (otherEnemy.instanceId !== enemyId && otherEnemy.currentHp > 0) {
            // 기름통이 붙은 적에게는 3배 피해
            const otherOilMarked = otherEnemy.statuses.find(s => s.type === 'OIL_MARKED');
            const finalDamage = otherOilMarked ? baseExplosionDamage * 3 : baseExplosionDamage;
            if (otherOilMarked) {
              get().addToCombatLog(`🔥 ${otherEnemy.name}에게 기름 인화! ${finalDamage} 피해!`);
            }
            setTimeout(() => {
              get().dealDamageToEnemy(otherEnemy.instanceId, finalDamage);
            }, 200);
          }
        });
      }
    }

    // ON_DAMAGE_DEALT 유물 효과 트리거
    const relics = useGameStore.getState().player.relics;
    relics.forEach(relic => {
      relic.effects.forEach(effect => {
        if (effect.trigger === 'ON_DAMAGE_DEALT') {
          const context = {
            damageDealt: remainingDamage, // 실제로 HP에 들어간 데미지
            heal: (amount: number) => {
              const undead = get().playerStatuses.find(s => s.type === 'UNDEAD');
              const healReduction = get().playerStatuses.find(s => s.type === 'HEAL_REDUCTION');

              // 언데드화 - 회복이 피해로 전환
              if (undead && undead.stacks > 0) {
                const invulnerable = get().playerStatuses.find(s => s.type === 'INVULNERABLE');
                const undying = get().playerStatuses.find(s => s.type === 'UNDYING');

                // 무적 상태면 피해 무효화
                if (invulnerable && invulnerable.stacks > 0) {
                  get().addToCombatLog(`💀 언데드화! 하지만 무적으로 피해 무효화!`);
                } else if (undying && undying.stacks > 0) {
                  // 불사 상태면 HP가 1 아래로 내려가지 않음
                  const currentHp = useGameStore.getState().player.currentHp;
                  if (currentHp - amount < 1) {
                    const actualDamage = Math.max(0, currentHp - 1);
                    if (actualDamage > 0) {
                      useGameStore.getState().modifyHp(-actualDamage);
                      get().addDamagePopup(actualDamage, 'damage', 0, 0, 'player');
                    }
                    get().addToCombatLog(`💀 언데드화! 흡혈이 피해로 전환! 불사로 HP 1 유지!`);
                  } else {
                    useGameStore.getState().modifyHp(-amount);
                    get().addDamagePopup(amount, 'damage', 0, 0, 'player');
                    get().addToCombatLog(`💀 언데드화! 흡혈이 ${amount} 피해로 전환!`);
                  }
                } else {
                  useGameStore.getState().modifyHp(-amount);
                  get().addDamagePopup(amount, 'damage', 0, 0, 'player');
                  get().addToCombatLog(`💀 언데드화! 흡혈이 ${amount} 피해로 전환!`);
                }
              } else {
                let finalAmount = amount;
                // 치유 감소 - 50% 감소
                if (healReduction && healReduction.stacks > 0) {
                  finalAmount = Math.floor(amount * 0.5);
                  get().addToCombatLog(`(치유 감소로 50% 감소)`);
                }
                useGameStore.getState().healPlayer(finalAmount);
                get().addDamagePopup(finalAmount, 'heal', 0, 0, 'player');
                get().addToCombatLog(`흡혈! HP ${finalAmount} 회복!`);
              }
            },
          };
          effect.execute(context);
        }
      });
    });
  },

  dealDamageToPlayer: (baseDamage: number, attackerEnemyId?: string) => {
    const { playerBlock, playerStatuses, enemies, activeTerrain } = get();

    // 무적 상태 체크
    const invulnerable = playerStatuses.find(s => s.type === 'INVULNERABLE');
    if (invulnerable && invulnerable.stacks > 0) {
      get().addToCombatLog('무적! 피해 무효화!');
      get().addDamagePopup(0, 'blocked', 0, 0, 'player');
      return 0;
    }

    // 합연산 방식으로 배수 계산 (기본 1.0 + 취약 0.5 - 약화 0.25)
    let damageMultiplier = 1.0;
    const modifiers: string[] = [];

    // 공격자(적)의 약화: -25% 데미지
    if (attackerEnemyId) {
      const attacker = enemies.find(e => e.instanceId === attackerEnemyId);
      if (attacker) {
        const attackerWeak = attacker.statuses.find(s => s.type === 'WEAK');
        if (attackerWeak && attackerWeak.stacks > 0) {
          damageMultiplier -= 0.25;
          modifiers.push('무기손상-25%');
        }
      }
    }

    // 플레이어 취약: +50% 데미지
    const vulnerable = playerStatuses.find(s => s.type === 'VULNERABLE');
    if (vulnerable && vulnerable.stacks > 0) {
      damageMultiplier += 0.5;
      modifiers.push('장비파괴+50%');
    }

    // 검투사의 경기장: +50% 데미지 (적도 더 강해짐)
    if (activeTerrain === 'gladiator_arena') {
      damageMultiplier += 0.5;
      modifiers.push('경기장+50%');
    }

    // 최종 데미지 계산 (버림 사용)
    const finalDamage = Math.floor(baseDamage * damageMultiplier);

    // 로그 출력 (배수 적용 시 상세 표시)
    if (modifiers.length > 0) {
      get().addToCombatLog(`[${baseDamage} × ${damageMultiplier.toFixed(2)} = ${finalDamage} (${modifiers.join(', ')})]`);
    }

    // 방어도 먼저 소모
    let remainingDamage = finalDamage;
    let newBlock = playerBlock;
    let blockedAmount = 0;

    if (newBlock > 0) {
      if (newBlock >= remainingDamage) {
        blockedAmount = remainingDamage;
        newBlock -= remainingDamage;
        remainingDamage = 0;
      } else {
        blockedAmount = newBlock;
        remainingDamage -= newBlock;
        newBlock = 0;
      }
    }

    set({ playerBlock: newBlock });

    // 방어도가 흡수한 데미지 팝업 (회색) - 왼쪽 위
    if (blockedAmount > 0) {
      get().addDamagePopup(blockedAmount, 'blocked', 0, 0, 'player', undefined, -40, -20);
      get().addToCombatLog(`[방어도 ${blockedAmount} 흡수, 남은 방어도: ${newBlock}]`);

      // 업적 추적: 방어도 감소 기록, 최대 막은 피해
      recordBlockReduced();
      useStatsStore.getState().updateMaxBlockedDamage(blockedAmount);

      // THORNS 효과: 방어도 감소분 반사
      const thorns = playerStatuses.find(s => s.type === 'THORNS');
      if (thorns && thorns.stacks > 0 && attackerEnemyId) {
        const thornsDamage = Math.floor(blockedAmount * (thorns.stacks / 100));
        if (thornsDamage > 0) {
          get().dealDamageToEnemy(attackerEnemyId, thornsDamage);
          get().addToCombatLog(`바늘 갑옷! 공격자에게 ${thornsDamage} 반사!`);
        }
      }
    }

    // 실제 HP 데미지 팝업 (빨간색) - 오른쪽 아래, 약간 딜레이
    if (remainingDamage > 0) {
      // UNDYING 효과: HP가 1 아래로 내려가지 않음
      const undying = playerStatuses.find(s => s.type === 'UNDYING');
      const currentHp = useGameStore.getState().player.currentHp;
      let actualDamage = remainingDamage;

      if (undying && undying.stacks > 0) {
        // HP가 1 아래로 내려가지 않도록 데미지 제한
        if (currentHp - remainingDamage < 1) {
          actualDamage = Math.max(0, currentHp - 1);
          if (actualDamage < remainingDamage) {
            get().addToCombatLog(`불사! HP가 1 아래로 내려가지 않습니다!`);
          }
        }
      }

      if (actualDamage > 0) {
        setTimeout(() => {
          get().addDamagePopup(actualDamage, 'damage', 0, 0, 'player', undefined, 30, 10);
        }, blockedAmount > 0 ? 150 : 0);
        const pName = useGameStore.getState().playerName;
        get().addToCombatLog(`${pName}(이)가 ${actualDamage} 피해를 입었습니다!`);
        // gameStore의 HP를 실제로 감소
        useGameStore.getState().modifyHp(-actualDamage);
        // 플레이어 피격 음성 재생
        playPlayerHit();
        // 플레이어 피격 애니메이션 트리거
        const { onPlayerHit } = get();
        if (onPlayerHit) {
          onPlayerHit();
        }
        remainingDamage = actualDamage;
      } else {
        get().addDamagePopup(0, 'blocked', 0, 0, 'player');
        remainingDamage = 0;
      }

      // 통계 업데이트: 데미지 받음
      useStatsStore.getState().addDamageTaken(remainingDamage);

      // 업적 추적: 에너지를 쓰지 않고(풀 에너지) 피해 입음, HP 변경
      const { energy, maxEnergy } = get();
      recordDamageTakenWithFullEnergy(energy, maxEnergy);
      checkImmediateAchievements();
      const finalHp = useGameStore.getState().player.currentHp;
      checkHpChangeAchievements(finalHp);

      // ON_DAMAGE_TAKEN 유물 효과 (가시갑옷 등)
      if (attackerEnemyId && actualDamage > 0) {
        const relics = useGameStore.getState().player.relics;
        relics.forEach(relic => {
          relic.effects.forEach(effect => {
            if (effect.trigger === 'ON_DAMAGE_TAKEN') {
              // 가시갑옷: 공격자에게 2 피해
              if (relic.id === 'thorn_armor') {
                get().dealDamageToEnemy(attackerEnemyId, 2);
                get().addToCombatLog(`가시갑옷! 공격자에게 2 피해!`);
              }
            }
          });
        });
      }
    }

    return remainingDamage;
  },

  gainPlayerBlock: (amount: number) => {
    const { playerBlock, playerStatuses, enemies, activeTerrain } = get();

    // 검투사의 경기장: 방어도 획득 불가
    if (activeTerrain === 'gladiator_arena') {
      get().addToCombatLog(`⚔️ 검투사의 경기장: 방어도 획득 불가!`);
      return;
    }

    // 신성한 구역: 방어도 2배
    let finalAmount = amount;
    if (activeTerrain === 'sacred_ground') {
      finalAmount = amount * 2;
      get().addToCombatLog(`✨ 신성한 구역: 방어도 2배!`);
    }

    const newBlock = playerBlock + finalAmount;
    set({ playerBlock: newBlock });
    const pName = useGameStore.getState().playerName;
    get().addToCombatLog(`${pName}(이)가 방어도 ${finalAmount} 획득!`);

    // 통계 업데이트: 방어도 획득
    useStatsStore.getState().addBlockGained(amount);

    // 업적 추적: 방어도 획득 기록, 한 턴 최대 방어도
    recordBlockGained(amount);
    useStatsStore.getState().updateMaxBlockInTurn(newBlock);
    checkImmediateAchievements();

    // BLOCK_TO_DAMAGE 효과: 방어도 획득 시 무작위 적에게 피해
    const blockToDamage = playerStatuses.find(s => s.type === 'BLOCK_TO_DAMAGE');
    if (blockToDamage && blockToDamage.stacks > 0 && amount > 0) {
      const damageRatio = blockToDamage.stacks / 100; // stacks = 비율 %
      const damageAmount = Math.floor(amount * damageRatio);
      if (damageAmount > 0) {
        // 살아있는 적 중 무작위 선택
        const aliveEnemies = enemies.filter(e => e.currentHp > 0);
        if (aliveEnemies.length > 0) {
          const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
          get().dealDamageToEnemy(randomEnemy.instanceId, damageAmount);
          get().addToCombatLog(`방패 반격! ${randomEnemy.name}에게 ${damageAmount} 피해!`);
        }
      }
    }
  },

  applyStatusToEnemy: (enemyId: string, status: Status) => {
    const { enemies } = get();
    const enemyIndex = enemies.findIndex(e => e.instanceId === enemyId);

    if (enemyIndex === -1) return;

    const enemy = enemies[enemyIndex];
    const existingStatus = enemy.statuses.find(s => s.type === status.type);

    // 새로운 statuses 배열 생성
    let newStatuses: Status[];
    if (existingStatus) {
      newStatuses = enemy.statuses.map(s =>
        s.type === status.type ? { ...s, stacks: s.stacks + status.stacks } : s
      );
    } else {
      newStatuses = [...enemy.statuses, { ...status }];
    }

    // enemy 객체도 새로 생성해야 Zustand가 변경 감지
    const updatedEnemy = { ...enemy, statuses: newStatuses };
    const updatedEnemies = [...enemies];
    updatedEnemies[enemyIndex] = updatedEnemy;

    set({ enemies: updatedEnemies });
    const statusInfo = STATUS_INFO[status.type];
    const statusName = statusInfo?.name || status.type;
    // 적에게 버프일 때만 사운드 (디버프는 플레이어가 거는 것이므로 무음)
    if (!statusInfo?.isDebuff) {
      playBuff();
    }
    get().addToCombatLog(`${enemy.name}에게 ${statusName} ${status.stacks} 부여!`);
  },

  // 카드의 적 대상 상태 효과만 적용 (데미지 처리 후 호출용)
  applyCardStatusToEnemy: (cardInstanceId: string, targetEnemyId: string) => {
    const { discardPile, enemies } = get();
    // 이미 discard로 이동한 카드를 찾음
    const card = discardPile.find(c => c.instanceId === cardInstanceId);
    if (!card) return;

    card.effects.forEach(effect => {
      if (effect.type === 'APPLY_STATUS' && effect.status) {
        if (effect.target === 'ALL') {
          enemies.forEach(enemy => {
            if (enemy.currentHp > 0) {
              get().applyStatusToEnemy(enemy.instanceId, { type: effect.status!, stacks: effect.value });
            }
          });
        } else if (effect.target === 'SINGLE' && targetEnemyId) {
          get().applyStatusToEnemy(targetEnemyId, { type: effect.status, stacks: effect.value });
        }
      }
    });
  },

  applyStatusToPlayer: (status: Status) => {
    const { playerStatuses } = get();
    const existingStatus = playerStatuses.find(s => s.type === status.type);
    const statusInfo = STATUS_INFO[status.type];

    // 디버프(약화, 취약, 중독)일 경우 이펙트 트리거
    const debuffTypes = ['WEAK', 'VULNERABLE', 'POISON'];
    if (debuffTypes.includes(status.type)) {
      get().triggerPlayerDebuff();
    }

    // 버프/디버프 사운드
    if (statusInfo?.isDebuff) {
      playDebuff();
    } else {
      playBuff();
    }

    if (existingStatus) {
      // 뮤테이션 없이 새 객체 생성
      const updatedStatuses = playerStatuses.map(s =>
        s.type === status.type
          ? { ...s, stacks: s.stacks + status.stacks }
          : s
      );
      set({ playerStatuses: updatedStatuses });
    } else {
      set({ playerStatuses: [...playerStatuses, { ...status }] });
    }
    const pName = useGameStore.getState().playerName;
    const statusName = statusInfo?.name || status.type;
    get().addToCombatLog(`${pName}(이)가 ${statusName} ${status.stacks} 획득!`);

    // 통계 업데이트: 힘 획득
    if (status.type === 'STRENGTH' && status.stacks > 0) {
      useStatsStore.getState().addStrengthGained(status.stacks);
      // 업적 체크: 총 힘 30 이상
      useStatsStore.getState().checkStatBasedAchievements();
    }

    // 업적 추적: 무기손상+장비파괴 동시 부여 체크
    if (status.type === 'WEAK' || status.type === 'VULNERABLE') {
      const updatedStatuses = get().playerStatuses;
      const hasWeak = updatedStatuses.some(s => s.type === 'WEAK' && s.stacks > 0);
      const hasVulnerable = updatedStatuses.some(s => s.type === 'VULNERABLE' && s.stacks > 0);
      if (hasWeak && hasVulnerable) {
        recordWeakAndVulnerable();
        checkImmediateAchievements();
      }
    }

    // 업적 추적: 중독 15 이상 중첩
    if (status.type === 'POISON') {
      const updatedStatuses = get().playerStatuses;
      const poisonStatus = updatedStatuses.find(s => s.type === 'POISON');
      if (poisonStatus && poisonStatus.stacks >= 15) {
        useStatsStore.getState().unlockAchievement('poison_15_stacks');
      }
    }
  },

  gainEnergy: (amount: number) => {
    const { energy } = get();
    set({ energy: energy + amount });
  },

  addToCombatLog: (message: string) => {
    const { combatLog } = get();
    // 최대 50개 로그 유지
    set({ combatLog: [...combatLog.slice(-49), message] });
  },

  checkCombatEnd: (): 'ONGOING' | 'VICTORY' | 'DEFEAT' => {
    const { enemies, turn } = get();

    // 모든 적이 죽었는지 확인
    const allEnemiesDead = enemies.every(e => e.currentHp <= 0);
    if (allEnemiesDead) {
      // 전투 종료 시 모든 버프/디버프 초기화
      set({
        playerStatuses: [],
        playerBlock: 0
      });
      playWin();
      get().addToCombatLog('승리!');

      // 업적 추적: 전투 종료 업적 체크, 최대 턴 수 업데이트
      const gameState = useGameStore.getState();
      const playerHp = gameState.player.currentHp;
      const maxHp = gameState.player.maxHp;
      const currentNodeId = gameState.map.currentNodeId;
      const currentNode = gameState.map.nodes.find(n => n.id === currentNodeId);
      const nodeType = currentNode?.type || 'ENEMY';
      checkBattleEndAchievements(playerHp, maxHp, nodeType);
      useStatsStore.getState().updateMaxTurnInBattle(turn);

      // 전투 승리 시 통계 한 번에 저장
      useStatsStore.getState().saveStats();

      return 'VICTORY';
    }

    return 'ONGOING';
  },

  lockCardPlay: () => {
    if (get().isPlayingCard) return;
    set({ isPlayingCard: true });
    setTimeout(() => {
      set({ isPlayingCard: false });
    }, 400);
  },

  lockEndTurn: (duration = 1000) => {
    if (get().isEndTurnLocked) return;
    set({ isEndTurnLocked: true });
    setTimeout(() => {
      set({ isEndTurnLocked: false });
    }, duration);
  },

  setTargetedEnemyId: (id: string | null) => {
    set({ targetedEnemyId: id });
  },

  resetCombat: () => {
    const { combatLog } = get();
    set({
      ...createInitialCombatState(),
      // 이전 전투 로그 유지
      combatLog: combatLog.length > 0 ? [...combatLog, '─────────────'] : [],
      playerBlock: 0,
      playerStatuses: [],
      damagePopups: [],
      isPlayingCard: false,
      isEndTurnLocked: false,
      targetedEnemyId: null,
    });
  },
}));

// 간소화된 적 의도 결정 함수
function getNextEnemyIntent(enemy: EnemyInstance, turn: number): EnemyInstance['intent'] {
  // 고블린: 힘+3 → 공격 → 공격 (3턴 주기 반복)
  if (enemy.templateId === 'goblin') {
    const pattern = turn % 3;
    if (pattern === 1) return { type: 'BUFF', statusType: 'STRENGTH', statusStacks: 3 };
    return { type: 'ATTACK', damage: 9 + Math.floor(Math.random() * 3) }; // 9-11
  }

  // 스켈레톤: 방어 10 → 공격 (2턴 주기)
  if (enemy.templateId === 'skeleton') {
    return turn % 2 === 1
      ? { type: 'DEFEND', block: 10 }
      : { type: 'ATTACK', damage: 7 + Math.floor(Math.random() * 5) }; // 7-11
  }

  // 플라잉아이: 공격 → 장비파괴 1 (2턴 주기)
  if (enemy.templateId === 'flying_eye') {
    return turn % 2 === 1
      ? { type: 'ATTACK', damage: 6 + Math.floor(Math.random() * 3) } // 6-8
      : { type: 'DEBUFF', statusType: 'VULNERABLE', statusStacks: 1 };
  }

  // 그린 플라잉아이: 공격 → 무기손상 1 (2턴 주기)
  if (enemy.templateId === 'green_flying_eye') {
    return turn % 2 === 1
      ? { type: 'ATTACK', damage: 7 + Math.floor(Math.random() * 3) } // 7-9
      : { type: 'DEBUFF', statusType: 'WEAK', statusStacks: 1 };
  }

  // 산성 머쉬룸: 중독 4 → 공격 (2턴 주기)
  if (enemy.templateId === 'acid_mushroom') {
    return turn % 2 === 1
      ? { type: 'DEBUFF', statusType: 'POISON', statusStacks: 4 }
      : { type: 'ATTACK', damage: 10 + Math.floor(Math.random() * 3) }; // 10-12
  }

  // 머쉬룸: 공격 → 방어 9 (2턴 주기)
  if (enemy.templateId === 'mushroom') {
    return turn % 2 === 1
      ? { type: 'ATTACK', damage: 9 + Math.floor(Math.random() * 3) } // 9-11
      : { type: 'DEFEND', block: 9 };
  }

  // 이블 위자드: 힘+4 → 공격 → 언데드화 (3턴 주기)
  if (enemy.templateId === 'gremlin_nob') {
    const pattern = turn % 3;
    if (pattern === 1) return { type: 'BUFF', statusType: 'STRENGTH', statusStacks: 4 };
    if (pattern === 2) return { type: 'ATTACK', damage: 13 + Math.floor(Math.random() * 3) }; // 13-15
    return { type: 'DEBUFF', statusType: 'UNDEAD', statusStacks: 3 }; // 언데드화 3턴
  }

  // 나이트본: 공격 → 중독 7 → 취약 2 (3턴 주기)
  if (enemy.templateId === 'slime_boss') {
    const pattern = turn % 3;
    if (pattern === 1) return { type: 'ATTACK', damage: 24 + Math.floor(Math.random() * 5) }; // 24-28
    if (pattern === 2) return { type: 'DEBUFF', statusType: 'POISON', statusStacks: 7 };
    return { type: 'DEBUFF', statusType: 'VULNERABLE', statusStacks: 2 };
  }

  // 이스터에그 적: ㄹㅇ턱벌레
  if (enemy.templateId === 'real_tukbug') {
    return turn % 3 === 2
      ? { type: 'DEFEND', block: 5 }
      : { type: 'ATTACK', damage: 8 };
  }

  // 이스터에그 적: 꾸추 - 힘+2 → 약화 1 → 공격...
  if (enemy.templateId === 'kkuchu') {
    if (turn === 1) {
      return { type: 'BUFF', statusType: 'STRENGTH', statusStacks: 2 };
    }
    return turn % 2 === 0
      ? { type: 'DEBUFF', statusType: 'WEAK', statusStacks: 1 }
      : { type: 'ATTACK', damage: 7 };
  }

  // 기본
  return { type: 'ATTACK', damage: 6 };
}
