import { Relic } from '../../types/relic';

export const BURNING_BLOOD: Relic = {
  id: 'burning_blood',
  name: '불타는 피',
  description: '전투 종료 시 HP를 6 회복합니다.',
  rarity: 'STARTER',
  effects: [
    {
      trigger: 'ON_COMBAT_END',
      description: 'HP 6 회복',
      execute: (context) => {
        context.heal?.(6);
      },
    },
  ],
};

export const RING_OF_THE_SNAKE: Relic = {
  id: 'ring_of_the_snake',
  name: '뱀의 반지',
  description: '전투 시작 시 카드를 2장 추가로 뽑습니다.',
  rarity: 'STARTER',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '카드 2장 드로우',
      execute: (context) => {
        context.drawCards?.(2);
      },
    },
  ],
};

export const CRACKED_CORE: Relic = {
  id: 'cracked_core',
  name: '금 간 핵심',
  description: '매 전투 시작 시 1 에너지를 얻습니다.',
  rarity: 'STARTER',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '에너지 1 획득',
      execute: (context) => {
        context.gainEnergy?.(1);
      },
    },
  ],
};

// 일반 유물들
export const ANCHOR: Relic = {
  id: 'anchor',
  name: '닻',
  description: '매 전투 시작 시 10 방어도를 얻습니다.',
  rarity: 'COMMON',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '방어도 10 획득',
      execute: (context) => {
        context.gainBlock?.(10);
      },
    },
  ],
};

export const BAG_OF_MARBLES: Relic = {
  id: 'bag_of_marbles',
  name: '구슬 주머니',
  description: '매 전투 시작 시 모든 적에게 취약 1을 부여합니다.',
  rarity: 'COMMON',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '모든 적에게 취약 1',
      execute: () => {
        // 컨텍스트에서 처리
      },
    },
  ],
};

export const BRONZE_SCALES: Relic = {
  id: 'bronze_scales',
  name: '청동 비늘',
  description: '피해를 받을 때마다 공격자에게 3 피해를 줍니다.',
  rarity: 'COMMON',
  effects: [
    {
      trigger: 'ON_DAMAGE_TAKEN',
      description: '반격 3 피해',
      execute: () => {
        // 전투 로직에서 처리
      },
    },
  ],
};

export const LANTERN: Relic = {
  id: 'lantern',
  name: '랜턴',
  description: '매 전투 시작 시 에너지 1을 얻습니다.',
  rarity: 'UNCOMMON',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '에너지 1 획득',
      execute: (context) => {
        context.gainEnergy?.(1);
      },
    },
  ],
};

export const VAJRA: Relic = {
  id: 'vajra',
  name: '금강저',
  description: '전투 시작 시 힘 1을 얻습니다.',
  rarity: 'COMMON',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '힘 1 획득',
      execute: (context) => {
        context.gainStrength?.(1);
      },
    },
  ],
};

export const STARTER_RELICS: Relic[] = [BURNING_BLOOD, RING_OF_THE_SNAKE, CRACKED_CORE];

export const COMMON_RELICS: Relic[] = [ANCHOR, BAG_OF_MARBLES, BRONZE_SCALES, VAJRA];

export const UNCOMMON_RELICS: Relic[] = [LANTERN];

export const ALL_RELICS: Relic[] = [...STARTER_RELICS, ...COMMON_RELICS, ...UNCOMMON_RELICS];

// 랜덤 유물 보상 생성
export function generateRelicReward(): Relic {
  const roll = Math.random();
  let pool: Relic[];

  if (roll < 0.5) {
    pool = COMMON_RELICS;
  } else {
    pool = UNCOMMON_RELICS;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
