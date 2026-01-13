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
  description: '매 턴 시작 시 카드를 1장 추가로 뽑습니다.',
  rarity: 'STARTER',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: '카드 1장 드로우',
      execute: (context) => {
        context.drawCards?.(1);
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

// 위험하지만 강력한 유물들 (UNCOMMON)
export const GAMBLERS_DICE: Relic = {
  id: 'gamblers_dice',
  name: '도박꾼의 주사위',
  description: '매 턴 시작 시 0~3 에너지를 랜덤하게 획득합니다.',
  rarity: 'UNCOMMON',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: '랜덤 에너지 획득',
      execute: (context) => {
        const roll = Math.floor(Math.random() * 4); // 0, 1, 2, 3
        context.gainEnergy?.(roll);
      },
    },
  ],
};

export const BLOOD_PACT: Relic = {
  id: 'blood_pact',
  name: '피의 서약',
  description: '전투 시작 시 HP 10 손실, 힘 +3 획득.',
  rarity: 'UNCOMMON',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: 'HP 손실 & 힘 획득',
      execute: (context) => {
        context.damagePlayer?.(10);
        context.gainStrength?.(3);
      },
    },
  ],
};

export const STRANGE_PILL: Relic = {
  id: 'strange_pill',
  name: '기묘한 알약',
  description: '전투 시작 시 HP 5 손실, 카드 3장 추가 드로우.',
  rarity: 'UNCOMMON',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: 'HP 손실 & 드로우',
      execute: (context) => {
        context.damagePlayer?.(5);
        context.drawCards?.(3);
      },
    },
  ],
};

// 위험하지만 강력한 유물들 (RARE)
export const CURSED_COIN: Relic = {
  id: 'cursed_coin',
  name: '저주받은 금화',
  description: '전투 시작 시 HP 8 손실. 전투 종료 시 골드 +25.',
  rarity: 'RARE',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: 'HP 손실',
      execute: (context) => {
        context.damagePlayer?.(8);
      },
    },
    {
      trigger: 'ON_COMBAT_END',
      description: '골드 획득',
      execute: (context) => {
        context.gainGold?.(25);
      },
    },
  ],
};

export const BERSERKER_HELM: Relic = {
  id: 'berserker_helm',
  name: '광전사의 투구',
  description: '전투 시작 시 힘 +5, 민첩 -2.',
  rarity: 'RARE',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '힘 증가 & 민첩 감소',
      execute: (context) => {
        context.gainStrength?.(5);
        context.gainDexterity?.(-2);
      },
    },
  ],
};

export const RING_OF_PAIN: Relic = {
  id: 'ring_of_pain',
  name: '고통의 반지',
  description: '매 턴 시작 시 HP 2 손실, 에너지 +1, 카드 1장 드로우.',
  rarity: 'RARE',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: 'HP 손실 & 보너스',
      execute: (context) => {
        context.damagePlayer?.(2);
        context.gainEnergy?.(1);
        context.drawCards?.(1);
      },
    },
  ],
};

// 보스 유물
export const DEVILS_CONTRACT: Relic = {
  id: 'devils_contract',
  name: '악마의 계약',
  description: '매 턴 시작 시 에너지 +2. 매 턴 종료 시 HP 5 손실.',
  rarity: 'BOSS',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: '에너지 획득',
      execute: (context) => {
        context.gainEnergy?.(2);
      },
    },
    {
      trigger: 'ON_TURN_END',
      description: 'HP 손실',
      execute: (context) => {
        context.damagePlayer?.(5);
      },
    },
  ],
};

export const STARTER_RELICS: Relic[] = [BURNING_BLOOD, RING_OF_THE_SNAKE, CRACKED_CORE];

export const COMMON_RELICS: Relic[] = [ANCHOR, BAG_OF_MARBLES, BRONZE_SCALES, VAJRA];

export const UNCOMMON_RELICS: Relic[] = [LANTERN, GAMBLERS_DICE, BLOOD_PACT, STRANGE_PILL];

export const RARE_RELICS: Relic[] = [CURSED_COIN, BERSERKER_HELM, RING_OF_PAIN];

export const BOSS_RELICS: Relic[] = [DEVILS_CONTRACT];

export const ALL_RELICS: Relic[] = [
  ...STARTER_RELICS,
  ...COMMON_RELICS,
  ...UNCOMMON_RELICS,
  ...RARE_RELICS,
  ...BOSS_RELICS,
];

// 랜덤 유물 보상 생성
export function generateRelicReward(): Relic {
  const roll = Math.random();
  let pool: Relic[];

  if (roll < 0.45) {
    pool = COMMON_RELICS;
  } else if (roll < 0.75) {
    pool = UNCOMMON_RELICS;
  } else {
    pool = RARE_RELICS;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
