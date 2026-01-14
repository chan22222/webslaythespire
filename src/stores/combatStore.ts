import { create } from 'zustand';
import { CombatState, createInitialCombatState } from '../types/combat';
import { CardInstance, createCardInstance } from '../types/card';
import { EnemyInstance, EnemyTemplate, createEnemyInstance } from '../types/enemy';
import { Status, STATUS_INFO } from '../types/status';
import { shuffle } from '../utils/shuffle';
import { useGameStore } from './gameStore';

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
  drawCards: (count: number) => void;
  playCard: (cardInstanceId: string, targetEnemyId?: string) => void;
  discardHand: () => void;
  selectCard: (cardInstanceId: string | null) => void;

  // 데미지 및 효과
  dealDamageToEnemy: (enemyId: string, damage: number) => void;
  dealDamageToPlayer: (baseDamage: number, attackerEnemyId?: string) => void;
  gainPlayerBlock: (amount: number) => void;
  applyStatusToEnemy: (enemyId: string, status: Status) => void;
  applyStatusToPlayer: (status: Status) => void;
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

  // 플레이어 디버프 이펙트 트리거
  playerDebuffTrigger: number;
  triggerPlayerDebuff: () => void;

  // 추가 턴 (시간 왜곡)
  extraTurnPending: boolean;
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  ...createInitialCombatState(),
  playerBlock: 0,
  playerStatuses: [],
  damagePopups: [],
  enemyHitTriggers: {},
  enemySkillTriggers: {},
  playerDebuffTrigger: 0,
  extraTurnPending: false,
  onPlayerHit: null,
  setOnPlayerHit: (callback) => set({ onPlayerHit: callback }),

  triggerPlayerDebuff: () => {
    set(state => ({ playerDebuffTrigger: state.playerDebuffTrigger + 1 }));
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

  initCombat: (deck: CardInstance[], enemyTemplates: EnemyTemplate[]) => {
    // 덱 복사 및 셔플
    const shuffledDeck = shuffle(deck.map(card => createCardInstance(card)));

    // 적 생성
    const enemies = enemyTemplates.map(template => {
      const enemy = createEnemyInstance(template);
      // 첫 번째 의도 설정
      enemy.intent = template.getNextIntent(enemy, 1);
      return enemy;
    });

    set({
      ...createInitialCombatState(),
      drawPile: shuffledDeck,
      enemies,
      playerBlock: 0,
      playerStatuses: [],
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
  },

  startPlayerTurn: () => {
    const { turn, maxEnergy, playerStatuses, extraDrawNextTurn } = get();

    // 첫 턴이 아니면 방어도 리셋 (BLOCK_RETAIN 상태가 있으면 유지)
    if (turn > 1) {
      const blockRetain = playerStatuses.find(s => s.type === 'BLOCK_RETAIN');
      if (!blockRetain || blockRetain.stacks <= 0) {
        set({ playerBlock: 0 });
      } else {
        get().addToCombatLog('방어도 유지 상태로 방어도가 유지됩니다!');
      }
    }

    // 에너지 리셋
    set({ energy: maxEnergy });

    // 유물 효과 트리거 (ON_TURN_START)
    const gameState = useGameStore.getState();
    const relics = gameState.player.relics;
    let turnExtraEnergy = 0;
    let turnExtraDraw = 0;
    let turnDamageToPlayer = 0;
    let turnHealAmount = 0;

    relics.forEach(relic => {
      relic.effects.forEach(effect => {
        if (effect.trigger === 'ON_TURN_START') {
          const context = {
            gainEnergy: (amount: number) => { turnExtraEnergy += amount; },
            drawCards: (count: number) => { turnExtraDraw += count; },
            damagePlayer: (amount: number) => { turnDamageToPlayer += amount; },
            heal: (amount: number) => { turnHealAmount += amount; },
            gainBlock: () => {},
            gainStrength: () => {},
            gainDexterity: () => {},
          };
          effect.execute(context);
        }
      });
    });

    // 턴 시작 유물 효과 적용
    if (turnHealAmount > 0) {
      useGameStore.getState().healPlayer(turnHealAmount);
      get().addToCombatLog(`유물 효과로 HP ${turnHealAmount} 회복!`);
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

    // 금속화 효과: 턴 시작 시 방어도 획득
    const metallicize = playerStatuses.find(s => s.type === 'METALLICIZE');
    if (metallicize && metallicize.stacks > 0) {
      get().gainPlayerBlock(metallicize.stacks);
      get().addToCombatLog(`금속화로 방어도 ${metallicize.stacks} 획득!`);
    }

    // 독 피해 처리 (방어도 무시, 직접 HP 감소)
    const poisonStatus = playerStatuses.find(s => s.type === 'POISON');
    if (poisonStatus && poisonStatus.stacks > 0) {
      const poisonDamage = poisonStatus.stacks;
      get().addToCombatLog(`중독으로 ${poisonDamage} 피해!`);

      // 직접 HP 감소 (방어도 무시)
      useGameStore.getState().takeDamage(poisonDamage);

      // 초록색 팝업 표시
      get().addDamagePopup(poisonDamage, 'poison', 0, 0, 'player');

      poisonStatus.stacks -= 1;
      set({
        playerStatuses: poisonStatus.stacks > 0
          ? playerStatuses.map(s => s.type === 'POISON' ? poisonStatus : s)
          : playerStatuses.filter(s => s.type !== 'POISON'),
      });
    }

    // 카드 5장 드로우 + 추가 드로우 (유물 효과)
    const totalDraw = 5 + extraDrawNextTurn + turnExtraDraw;
    get().drawCards(totalDraw);

    // 추가 드로우 리셋
    set({
      turn: turn,
      isPlayerTurn: true,
      extraDrawNextTurn: 0,
    });

    get().addToCombatLog(`--- 턴 ${turn} 시작 ---`);
  },

  endPlayerTurn: () => {
    const { playerStatuses } = get();

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

    // STRENGTH_DOWN 처리: 힘 감소 후 제거
    const strengthDown = playerStatuses.find(s => s.type === 'STRENGTH_DOWN');
    let processedStatuses = [...playerStatuses];

    if (strengthDown && strengthDown.stacks > 0) {
      const strengthStatus = processedStatuses.find(s => s.type === 'STRENGTH');
      if (strengthStatus) {
        strengthStatus.stacks -= strengthDown.stacks;
        get().addToCombatLog(`힘이 ${strengthDown.stacks} 감소했습니다.`);
      }
      // STRENGTH_DOWN 제거
      processedStatuses = processedStatuses.filter(s => s.type !== 'STRENGTH_DOWN');
    }

    // 상태 효과 지속시간 감소 (약화, 취약, 방어도 유지, 무적)
    const updatedStatuses = processedStatuses
      .map(s => ({
        ...s,
        stacks: (s.type === 'WEAK' || s.type === 'VULNERABLE' || s.type === 'BLOCK_RETAIN' || s.type === 'INVULNERABLE')
          ? s.stacks - 1
          : s.stacks,
      }))
      .filter(s => s.stacks > 0);

    set({
      isPlayerTurn: false,
      playerStatuses: updatedStatuses,
    });

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

    // 적 턴 실행
    get().executeEnemyTurn();
  },

  executeEnemyTurn: async () => {
    const { enemies, turn } = get();

    // 순차적으로 적 행동 처리
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (enemy.currentHp <= 0) continue;

      // 적 방어도 리셋
      enemy.block = 0;

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

        // 피격 콜백 호출
        const { onPlayerHit } = get();
        if (onPlayerHit) {
          onPlayerHit();
        }

        // 데미지 처리 (약화/취약은 dealDamageToPlayer에서 합연산 처리)
        get().dealDamageToPlayer(baseDamage, enemy.instanceId);

        // 다음 적 공격 전 딜레이
        await new Promise(resolve => setTimeout(resolve, 600));
      } else if (enemy.intent.type === 'DEFEND') {
        get().triggerEnemySkill(enemy.instanceId);
        enemy.block += enemy.intent.block || 0;
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (enemy.intent.type === 'BUFF') {
        get().triggerEnemySkill(enemy.instanceId);
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
        // intent에 정의된 statusType과 stacks 사용
        const statusType = enemy.intent.statusType || 'WEAK';
        const stacks = enemy.intent.statusStacks || 1;
        get().applyStatusToPlayer({ type: statusType, stacks });
        await new Promise(resolve => setTimeout(resolve, 500));
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
    const updatedEnemies = enemies.map(enemy => {
      if (enemy.currentHp <= 0) return enemy;

      // 템플릿에서 다음 의도 가져오기 (간소화)
      const nextIntent = getNextEnemyIntent(enemy, turn + 1);
      return { ...enemy, intent: nextIntent };
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

  drawCards: (count: number) => {
    const { drawPile, hand, discardPile } = get();
    const newHand = [...hand];
    let newDrawPile = [...drawPile];
    let newDiscardPile = [...discardPile];

    for (let i = 0; i < count; i++) {
      if (newDrawPile.length === 0) {
        if (newDiscardPile.length === 0) break;
        // 버린 카드 더미를 셔플해서 뽑기 더미로
        newDrawPile = shuffle(newDiscardPile);
        newDiscardPile = [];
      }

      const card = newDrawPile.pop();
      if (card) {
        newHand.push(card);
      }
    }

    set({
      drawPile: newDrawPile,
      hand: newHand,
      discardPile: newDiscardPile,
    });
  },

  playCard: (cardInstanceId: string, targetEnemyId?: string) => {
    const { hand, energy, enemies } = get();
    const cardIndex = hand.findIndex(c => c.instanceId === cardInstanceId);

    if (cardIndex === -1) return;

    const card = hand[cardIndex];

    // 에너지 체크
    if (card.cost > energy) {
      get().addToCombatLog('에너지가 부족합니다!');
      return;
    }

    // 타겟이 필요한 카드인지 체크
    const needsTarget = card.effects.some(e =>
      e.type === 'DAMAGE' && e.target === 'SINGLE' ||
      e.type === 'APPLY_STATUS' && e.target === 'SINGLE'
    );

    if (needsTarget && !targetEnemyId) {
      // 타겟팅 모드 활성화
      set({ selectedCardId: cardInstanceId, targetingMode: true });
      return;
    }

    // 카드 효과 실행
    const pName = useGameStore.getState().playerName;
    get().addToCombatLog(`${pName}(이)가 ${card.name} 사용!`);

    card.effects.forEach(effect => {
      switch (effect.type) {
        case 'DAMAGE': {
          // 기본 데미지 + 힘만 계산 (약화/취약은 dealDamageToEnemy에서 합연산 처리)
          let baseDamage = effect.value;
          const strength = get().playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
          baseDamage += strength;

          if (effect.target === 'ALL') {
            enemies.forEach(enemy => {
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
          // HP 직접 감소 (방어도 무시)
          useGameStore.getState().modifyHp(-effect.value);
          get().addDamagePopup(effect.value, 'damage', 0, 0, 'player');
          // 피격 애니메이션 트리거
          const { onPlayerHit } = get();
          if (onPlayerHit) {
            onPlayerHit();
          }
          get().addToCombatLog(`HP ${effect.value} 감소!`);
          break;
        }
        case 'HEAL':
          // 힐은 gameStore에서 처리
          break;
        case 'UPGRADE_HAND': {
          // 손에 있는 업그레이드 가능한 카드 중 랜덤 1장 업그레이드
          const currentHand = get().hand;
          const upgradableCards = currentHand.filter(c => !c.upgraded && c.upgradeEffect);
          if (upgradableCards.length > 0) {
            const randomCard = upgradableCards[Math.floor(Math.random() * upgradableCards.length)];
            const upgradedCard = {
              ...randomCard,
              ...randomCard.upgradeEffect,
              upgraded: true,
            };
            const newHand = currentHand.map(c =>
              c.instanceId === randomCard.instanceId ? upgradedCard : c
            );
            set({ hand: newHand });
            get().addToCombatLog(`${randomCard.name}을(를) 업그레이드!`);
          }
          break;
        }
        case 'UPGRADE_ALL_HAND': {
          // 손에 있는 모든 카드 업그레이드
          const currentHandAll = get().hand;
          let upgradedCount = 0;
          const newHandAll = currentHandAll.map(c => {
            if (!c.upgraded && c.upgradeEffect) {
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
        case 'DAMAGE_PER_EXHAUST': {
          // 종언의 일격: 소멸된 카드당 피해
          const exhaustCount = get().exhaustPile.length;
          const dmgPerExhaust = effect.value * exhaustCount;
          const str2 = get().playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
          const totalDmg = dmgPerExhaust + str2;

          if (effect.target === 'ALL') {
            enemies.forEach(enemy => {
              if (enemy.currentHp > 0) {
                get().dealDamageToEnemy(enemy.instanceId, totalDmg);
              }
            });
            get().addToCombatLog(`소멸 카드 ${exhaustCount}장 × ${effect.value} = ${totalDmg} 피해!`);
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
          // 신의 권능: 적 HP 절반 감소
          if (targetEnemyId) {
            const targetEnemy = get().enemies.find(e => e.instanceId === targetEnemyId);
            if (targetEnemy) {
              const halfHp = Math.floor(targetEnemy.currentHp / 2);
              const cappedDmg = Math.min(halfHp, effect.value); // 최대 피해 제한
              get().dealDamageToEnemy(targetEnemyId, cappedDmg);
              get().addToCombatLog(`${targetEnemy.name}의 HP를 ${cappedDmg} 감소! (절반)`);
            }
          }
          break;
        }
        case 'EXTRA_TURN': {
          // 시간 왜곡: 추가 턴
          set({ extraTurnPending: true });
          get().addToCombatLog('추가 턴을 얻습니다!');
          break;
        }
      }
    });

    // 카드 사용 후 처리 (DRAW 효과로 hand가 변경되었을 수 있으므로 다시 가져옴)
    const currentHand = get().hand;
    const newHand = currentHand.filter(c => c.instanceId !== cardInstanceId);
    const { discardPile, exhaustPile, energy: currentEnergy } = get();

    // exhaust 카드는 소멸 더미로, 아니면 버린 더미로
    if (card.exhaust) {
      set({
        hand: newHand,
        exhaustPile: [...exhaustPile, card],
        energy: currentEnergy - card.cost,
        selectedCardId: null,
        targetingMode: false,
      });
      get().addToCombatLog(`${card.name} 소멸!`);
    } else {
      set({
        hand: newHand,
        discardPile: [...discardPile, card],
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

    set({
      hand: [],
      discardPile: [...discardPile, ...hand],
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
    const { enemies, playerStatuses } = get();
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
      modifiers.push('약화-25%');
    }

    // 적 취약: +50% 데미지
    const vulnerable = enemy.statuses.find(s => s.type === 'VULNERABLE');
    if (vulnerable && vulnerable.stacks > 0) {
      damageMultiplier += 0.5;
      modifiers.push('취약+50%');
    }

    // 최종 데미지 계산 (버림 사용)
    const finalDamage = Math.floor(baseDamage * damageMultiplier);

    // 방어도 먼저 소모
    let remainingDamage = finalDamage;
    let newBlock = enemy.block;
    if (newBlock > 0) {
      if (newBlock >= remainingDamage) {
        newBlock -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= newBlock;
        newBlock = 0;
      }
    }

    // HP 감소
    const newHp = Math.max(0, enemy.currentHp - remainingDamage);

    // 로그 출력 (배수 적용 시 상세 표시)
    if (modifiers.length > 0) {
      get().addToCombatLog(`${enemy.name}에게 ${finalDamage} 피해! [${baseDamage} × ${damageMultiplier.toFixed(2)} (${modifiers.join(', ')})]`);
    } else {
      get().addToCombatLog(`${enemy.name}에게 ${finalDamage} 피해! (남은 HP: ${newHp})`);
    }

    // 새로운 enemy 객체 생성
    const updatedEnemy = { ...enemy, currentHp: newHp, block: newBlock };
    const updatedEnemies = [...enemies];
    updatedEnemies[enemyIndex] = updatedEnemy;

    set({ enemies: updatedEnemies });
  },

  dealDamageToPlayer: (baseDamage: number, attackerEnemyId?: string) => {
    const { playerBlock, playerStatuses, enemies } = get();

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
          modifiers.push('약화-25%');
        }
      }
    }

    // 플레이어 취약: +50% 데미지
    const vulnerable = playerStatuses.find(s => s.type === 'VULNERABLE');
    if (vulnerable && vulnerable.stacks > 0) {
      damageMultiplier += 0.5;
      modifiers.push('취약+50%');
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
    }

    // 실제 HP 데미지 팝업 (빨간색) - 오른쪽 아래, 약간 딜레이
    if (remainingDamage > 0) {
      setTimeout(() => {
        get().addDamagePopup(remainingDamage, 'damage', 0, 0, 'player', undefined, 30, 10);
      }, blockedAmount > 0 ? 150 : 0);
      const pName = useGameStore.getState().playerName;
      get().addToCombatLog(`${pName}(이)가 ${remainingDamage} 피해를 입었습니다!`);
      // gameStore의 HP를 실제로 감소
      useGameStore.getState().modifyHp(-remainingDamage);
    }

    return remainingDamage;
  },

  gainPlayerBlock: (amount: number) => {
    const { playerBlock } = get();
    set({ playerBlock: playerBlock + amount });
    const pName = useGameStore.getState().playerName;
    get().addToCombatLog(`${pName}(이)가 방어도 ${amount} 획득!`);
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
    const statusName = STATUS_INFO[status.type]?.name || status.type;
    get().addToCombatLog(`${enemy.name}에게 ${statusName} ${status.stacks} 부여!`);
  },

  applyStatusToPlayer: (status: Status) => {
    const { playerStatuses } = get();
    const existingStatus = playerStatuses.find(s => s.type === status.type);

    // 디버프(약화, 취약, 중독)일 경우 이펙트 트리거
    const debuffTypes = ['WEAK', 'VULNERABLE', 'POISON'];
    if (debuffTypes.includes(status.type)) {
      get().triggerPlayerDebuff();
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
    const statusName = STATUS_INFO[status.type]?.name || status.type;
    get().addToCombatLog(`${pName}(이)가 ${statusName} ${status.stacks} 획득!`);
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
    const { enemies } = get();

    // 모든 적이 죽었는지 확인
    const allEnemiesDead = enemies.every(e => e.currentHp <= 0);
    if (allEnemiesDead) {
      get().addToCombatLog('승리!');
      return 'VICTORY';
    }

    return 'ONGOING';
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
    });
  },
}));

// 간소화된 적 의도 결정 함수
function getNextEnemyIntent(enemy: EnemyInstance, turn: number): EnemyInstance['intent'] {
  // 컬티스트: 힘+3 → 공격 → 공격...
  if (enemy.templateId === 'cultist') {
    return turn === 1
      ? { type: 'BUFF', statusType: 'STRENGTH', statusStacks: 3 }
      : { type: 'ATTACK', damage: 9 + Math.floor(Math.random() * 3) };
  }

  // 턱 벌레: 방어 7 → 공격 (2턴 주기)
  if (enemy.templateId === 'jaw_worm') {
    return turn % 2 === 1
      ? { type: 'DEFEND', block: 7 }
      : { type: 'ATTACK', damage: 7 + Math.floor(Math.random() * 5) };
  }

  // 붉은 이: 공격 → 힘+3 (2턴 주기)
  if (enemy.templateId === 'louse_red') {
    return turn % 2 === 1
      ? { type: 'ATTACK', damage: 4 + Math.floor(Math.random() * 3) }
      : { type: 'BUFF', statusType: 'STRENGTH', statusStacks: 3 };
  }

  // 녹색 이: 공격 → 약화 1 → 공격 (3턴 주기)
  if (enemy.templateId === 'louse_green') {
    const pattern = turn % 3;
    if (pattern === 1) return { type: 'ATTACK', damage: 4 + Math.floor(Math.random() * 3) };
    if (pattern === 2) return { type: 'DEBUFF', statusType: 'WEAK', statusStacks: 1 };
    return { type: 'ATTACK', damage: 4 + Math.floor(Math.random() * 3) };
  }

  // 산성 슬라임: 중독 5 → 공격 패턴
  if (enemy.templateId === 'acid_slime_m') {
    return turn % 2 === 1
      ? { type: 'DEBUFF', statusType: 'POISON', statusStacks: 5 }
      : { type: 'ATTACK', damage: 10 + Math.floor(Math.random() * 3) };
  }

  // 가시 슬라임: 공격 → 방어 패턴
  if (enemy.templateId === 'spike_slime_m') {
    return turn % 2 === 1
      ? { type: 'ATTACK', damage: 9 + Math.floor(Math.random() * 3) }
      : { type: 'DEFEND', block: 5 };
  }

  // 고위 노블레스: 힘+5 → 공격...
  if (enemy.templateId === 'gremlin_nob') {
    return turn === 1
      ? { type: 'BUFF', statusType: 'STRENGTH', statusStacks: 5 }
      : { type: 'ATTACK', damage: 13 + Math.floor(Math.random() * 3) };
  }

  // 슬라임 보스: 공격 → 중독 7 → 취약 2 (3턴 주기)
  if (enemy.templateId === 'slime_boss') {
    const pattern = turn % 3;
    if (pattern === 1) return { type: 'ATTACK', damage: 25 + Math.floor(Math.random() * 6) };
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
