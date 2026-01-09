import { create } from 'zustand';
import { CombatState, createInitialCombatState } from '../types/combat';
import { CardInstance, createCardInstance } from '../types/card';
import { EnemyInstance, EnemyTemplate, createEnemyInstance } from '../types/enemy';
import { Status } from '../types/status';
import { shuffle } from '../utils/shuffle';
import { useGameStore } from './gameStore';

// 데미지 팝업 타입
export interface DamagePopup {
  id: string;
  value: number;
  type: 'damage' | 'block' | 'heal' | 'buff' | 'debuff';
  x: number;
  y: number;
}

interface CombatStore extends CombatState {
  // 전투 초기화
  initCombat: (deck: CardInstance[], enemies: EnemyTemplate[]) => void;

  // 턴 관리
  startPlayerTurn: () => void;
  endPlayerTurn: () => void;
  executeEnemyTurn: () => void;

  // 카드 관리
  drawCards: (count: number) => void;
  playCard: (cardInstanceId: string, targetEnemyId?: string) => void;
  discardHand: () => void;
  selectCard: (cardInstanceId: string | null) => void;

  // 데미지 및 효과
  dealDamageToEnemy: (enemyId: string, damage: number) => void;
  dealDamageToPlayer: (damage: number) => void;
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
  addDamagePopup: (value: number, type: DamagePopup['type'], x: number, y: number, targetId?: string) => void;
  removeDamagePopup: (id: string) => void;
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  ...createInitialCombatState(),
  playerBlock: 0,
  playerStatuses: [],
  damagePopups: [],

  addDamagePopup: (value: number, type: DamagePopup['type'], x: number, y: number, targetId?: string) => {
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

    const id = `popup-${Date.now()}-${Math.random()}`;
    set(state => ({
      damagePopups: [...state.damagePopups, { id, value, type, x: finalX, y: finalY }],
    }));
  },

  removeDamagePopup: (id: string) => {
    set(state => ({
      damagePopups: state.damagePopups.filter(p => p.id !== id),
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
    // startPlayerTurn에서 드로우 처리됨
  },

  startPlayerTurn: () => {
    const { turn, maxEnergy, playerStatuses } = get();

    // 방어도 리셋
    set({ playerBlock: 0 });

    // 에너지 리셋
    set({ energy: maxEnergy });

    // 독 피해 처리
    const poisonStatus = playerStatuses.find(s => s.type === 'POISON');
    if (poisonStatus && poisonStatus.stacks > 0) {
      get().dealDamageToPlayer(poisonStatus.stacks);
      poisonStatus.stacks -= 1;
      set({
        playerStatuses: poisonStatus.stacks > 0
          ? playerStatuses.map(s => s.type === 'POISON' ? poisonStatus : s)
          : playerStatuses.filter(s => s.type !== 'POISON'),
      });
    }

    // 카드 5장 드로우
    get().drawCards(5);

    set({
      turn: turn,
      isPlayerTurn: true,
    });

    get().addToCombatLog(`--- 턴 ${turn} 시작 ---`);
  },

  endPlayerTurn: () => {
    // 손패 버리기
    get().discardHand();

    // 상태 효과 지속시간 감소
    const { playerStatuses } = get();
    const updatedStatuses = playerStatuses
      .map(s => ({
        ...s,
        stacks: s.type === 'WEAK' || s.type === 'VULNERABLE' ? s.stacks - 1 : s.stacks,
      }))
      .filter(s => s.stacks > 0);

    set({
      isPlayerTurn: false,
      playerStatuses: updatedStatuses,
    });

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
        const totalDamage = damage + strength;

        // 데미지 팝업 표시
        get().addDamagePopup(totalDamage, 'damage', 0, 0, 'player');
        get().dealDamageToPlayer(totalDamage);

        // 다음 적 공격 전 딜레이
        if (i < enemies.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      } else if (enemy.intent.type === 'DEFEND') {
        enemy.block += enemy.intent.block || 0;
      } else if (enemy.intent.type === 'BUFF') {
        const strengthStatus = enemy.statuses.find(s => s.type === 'STRENGTH');
        if (strengthStatus) {
          strengthStatus.stacks += 3;
        } else {
          enemy.statuses.push({ type: 'STRENGTH', stacks: 3 });
        }
        get().addToCombatLog(`${enemy.name}이(가) 힘을 얻었습니다!`);
      } else if (enemy.intent.type === 'DEBUFF') {
        get().applyStatusToPlayer({ type: 'WEAK', stacks: 1 });
        get().addToCombatLog(`약화되었습니다!`);
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
    get().addToCombatLog(`${card.name} 사용!`);

    card.effects.forEach(effect => {
      switch (effect.type) {
        case 'DAMAGE': {
          let damage = effect.value;

          // 힘 적용
          const strength = get().playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
          damage += strength;

          // 약화 적용
          const weak = get().playerStatuses.find(s => s.type === 'WEAK');
          if (weak && weak.stacks > 0) {
            damage = Math.floor(damage * 0.75);
          }

          if (effect.target === 'ALL') {
            enemies.forEach(enemy => {
              if (enemy.currentHp > 0) {
                get().dealDamageToEnemy(enemy.instanceId, damage);
              }
            });
          } else if (targetEnemyId) {
            get().dealDamageToEnemy(targetEnemyId, damage);
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
          break;
        case 'HEAL':
          // 힐은 gameStore에서 처리
          break;
      }
    });

    // 카드 사용 후 처리
    const newHand = hand.filter(c => c.instanceId !== cardInstanceId);
    const { discardPile } = get();

    set({
      hand: newHand,
      discardPile: [...discardPile, card],
      energy: energy - card.cost,
      selectedCardId: null,
      targetingMode: false,
    });

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

  dealDamageToEnemy: (enemyId: string, damage: number) => {
    const { enemies } = get();
    const enemyIndex = enemies.findIndex(e => e.instanceId === enemyId);

    if (enemyIndex === -1) return;

    const enemy = enemies[enemyIndex];

    // 취약 상태면 50% 추가 피해
    const vulnerable = enemy.statuses.find(s => s.type === 'VULNERABLE');
    let finalDamage = damage;
    if (vulnerable && vulnerable.stacks > 0) {
      finalDamage = Math.floor(damage * 1.5);
    }

    // 방어도 먼저 소모
    let remainingDamage = finalDamage;
    if (enemy.block > 0) {
      if (enemy.block >= remainingDamage) {
        enemy.block -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= enemy.block;
        enemy.block = 0;
      }
    }

    // HP 감소
    enemy.currentHp = Math.max(0, enemy.currentHp - remainingDamage);

    get().addToCombatLog(`${enemy.name}에게 ${finalDamage} 피해! (남은 HP: ${enemy.currentHp})`);

    const updatedEnemies = [...enemies];
    updatedEnemies[enemyIndex] = enemy;

    set({ enemies: updatedEnemies });
  },

  dealDamageToPlayer: (damage: number) => {
    const { playerBlock, playerStatuses } = get();

    // 취약 상태면 50% 추가 피해
    const vulnerable = playerStatuses.find(s => s.type === 'VULNERABLE');
    let finalDamage = damage;
    if (vulnerable && vulnerable.stacks > 0) {
      finalDamage = Math.floor(damage * 1.5);
    }

    // 방어도 먼저 소모
    let remainingDamage = finalDamage;
    let newBlock = playerBlock;

    if (newBlock > 0) {
      if (newBlock >= remainingDamage) {
        newBlock -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= newBlock;
        newBlock = 0;
      }
    }

    set({ playerBlock: newBlock });

    if (remainingDamage > 0) {
      get().addToCombatLog(`${remainingDamage} 피해를 받았습니다!`);
      // gameStore의 HP를 실제로 감소
      useGameStore.getState().modifyHp(-remainingDamage);
    }

    return remainingDamage;
  },

  gainPlayerBlock: (amount: number) => {
    const { playerBlock } = get();
    set({ playerBlock: playerBlock + amount });
    get().addToCombatLog(`방어도 ${amount} 획득!`);
  },

  applyStatusToEnemy: (enemyId: string, status: Status) => {
    const { enemies } = get();
    const enemyIndex = enemies.findIndex(e => e.instanceId === enemyId);

    if (enemyIndex === -1) return;

    const enemy = enemies[enemyIndex];
    const existingStatus = enemy.statuses.find(s => s.type === status.type);

    if (existingStatus) {
      existingStatus.stacks += status.stacks;
    } else {
      enemy.statuses.push({ ...status });
    }

    const updatedEnemies = [...enemies];
    updatedEnemies[enemyIndex] = enemy;

    set({ enemies: updatedEnemies });
    get().addToCombatLog(`${enemy.name}에게 ${status.type} ${status.stacks} 부여!`);
  },

  applyStatusToPlayer: (status: Status) => {
    const { playerStatuses } = get();
    const existingStatus = playerStatuses.find(s => s.type === status.type);

    if (existingStatus) {
      existingStatus.stacks += status.stacks;
      set({ playerStatuses: [...playerStatuses] });
    } else {
      set({ playerStatuses: [...playerStatuses, { ...status }] });
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
  // 간단한 패턴 기반 의도
  if (enemy.templateId === 'cultist') {
    return turn === 1
      ? { type: 'BUFF' }
      : { type: 'ATTACK', damage: 6 };
  }

  if (enemy.templateId === 'jaw_worm') {
    return turn % 3 === 2
      ? { type: 'DEFEND', block: 6 }
      : { type: 'ATTACK', damage: 11 };
  }

  if (enemy.templateId.includes('louse')) {
    return Math.random() < 0.75
      ? { type: 'ATTACK', damage: 5 + Math.floor(Math.random() * 3) }
      : { type: 'BUFF' };
  }

  if (enemy.templateId.includes('slime')) {
    return turn % 2 === 1
      ? { type: 'ATTACK', damage: 8 }
      : { type: 'DEBUFF' };
  }

  if (enemy.templateId === 'gremlin_nob') {
    return turn === 1
      ? { type: 'BUFF' }
      : { type: 'ATTACK', damage: 14 };
  }

  if (enemy.templateId === 'slime_boss') {
    return turn % 3 === 2
      ? { type: 'DEBUFF' }
      : { type: 'ATTACK', damage: 35 };
  }

  // 기본
  return { type: 'ATTACK', damage: 6 };
}
