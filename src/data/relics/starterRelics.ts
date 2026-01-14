import { Relic } from '../../types/relic';

// ==================== STARTER 유물 ====================
export const BURNING_BLOOD: Relic = {
  id: 'burning_blood',
  name: '불타는 피',
  description: '전투 종료 시 HP를 5 회복합니다.',
  rarity: 'STARTER',
  icon: '/sprites/item/불타는피.png',
  effects: [
    {
      trigger: 'ON_COMBAT_END',
      description: 'HP 5 회복',
      execute: (context) => {
        context.heal?.(5);
      },
    },
  ],
};

export const RING_OF_THE_SNAKE: Relic = {
  id: 'ring_of_the_snake',
  name: '뱀의 반지',
  description: '전투 시작 시 카드를 1장 추가로 뽑습니다.',
  rarity: 'STARTER',
  icon: '/sprites/item/뱀의반지.png',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '카드 1장 드로우',
      execute: (context) => {
        context.drawCards?.(1);
      },
    },
  ],
};

export const CRACKED_ARMOR: Relic = {
  id: 'cracked_armor',
  name: '금 간 갑옷',
  description: 'HP 최대치가 15 증가합니다.',
  rarity: 'STARTER',
  icon: '/sprites/item/금간갑옷.png',
  effects: [
    {
      trigger: 'PASSIVE',
      description: 'HP 최대치 +15',
      execute: () => {
        // gameStore에서 처리
      },
    },
  ],
};

// ==================== COMMON 유물 ====================
export const SPELL_SHIELD: Relic = {
  id: 'spell_shield',
  name: '주술방패',
  description: '전투 시작 시 방어도 5를 얻습니다.',
  rarity: 'COMMON',
  icon: '/sprites/item/주술방패.png',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '방어도 5 획득',
      execute: (context) => {
        context.gainBlock?.(5);
      },
    },
  ],
};

export const THORN_ARMOR: Relic = {
  id: 'thorn_armor',
  name: '가시갑옷',
  description: '피해를 받을 때마다 공격자에게 2 피해를 줍니다.',
  rarity: 'COMMON',
  icon: '/sprites/item/가시갑옷.png',
  effects: [
    {
      trigger: 'ON_DAMAGE_TAKEN',
      description: '반격 2 피해',
      execute: () => {
        // combatStore에서 처리
      },
    },
  ],
};

export const VAJRA: Relic = {
  id: 'vajra',
  name: '금강저',
  description: '전투 시작 시 힘 2를 얻습니다.',
  rarity: 'COMMON',
  icon: '/sprites/item/금강저.png',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '힘 2 획득',
      execute: (context) => {
        context.gainStrength?.(2);
      },
    },
  ],
};

export const SWIFT_POTION: Relic = {
  id: 'swift_potion',
  name: '신속의 물약',
  description: '전투 시작 시 민첩 2를 얻습니다.',
  rarity: 'COMMON',
  icon: '/sprites/item/신속의물약.png',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '민첩 2 획득',
      execute: (context) => {
        context.gainDexterity?.(2);
      },
    },
  ],
};

export const HEALING_POTION: Relic = {
  id: 'healing_potion',
  name: '회복포션',
  description: '매 턴 시작 시 HP를 2 회복합니다.',
  rarity: 'COMMON',
  icon: '/sprites/item/회복포션.png',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: 'HP 2 회복',
      execute: (context) => {
        context.heal?.(2);
      },
    },
  ],
};

// ==================== UNCOMMON 유물 ====================
export const LANTERN: Relic = {
  id: 'lantern',
  name: '랜턴',
  description: '매 턴 시작 시 에너지 1을 얻습니다.',
  rarity: 'UNCOMMON',
  icon: '/sprites/item/랜턴.png',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: '에너지 1 획득',
      execute: (context) => {
        context.gainEnergy?.(1);
      },
    },
  ],
};

export const GAMBLERS_DICE: Relic = {
  id: 'gamblers_dice',
  name: '도박꾼의 주사위',
  description: '매 턴 시작 시 -1~2 에너지를 랜덤하게 획득합니다.',
  rarity: 'UNCOMMON',
  icon: '/sprites/item/도박꾼의주사위.png',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: '랜덤 에너지 획득',
      execute: (context) => {
        const roll = Math.floor(Math.random() * 4) - 1; // -1, 0, 1, 2
        context.gainEnergy?.(roll);
      },
    },
  ],
};

export const BLOOD_PACT: Relic = {
  id: 'blood_pact',
  name: '피의 서약',
  description: '매 턴 시작 시 HP 4 손실, 힘 +3 획득.',
  rarity: 'UNCOMMON',
  icon: '/sprites/item/피의서약.png',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: 'HP 손실 & 힘 획득',
      execute: (context) => {
        context.damagePlayer?.(4);
        context.gainStrength?.(3);
      },
    },
  ],
};

export const STRANGE_PILL: Relic = {
  id: 'strange_pill',
  name: '기묘한 알약',
  description: '매 턴 시작 시 HP 4 손실, 카드 2장 추가 드로우.',
  rarity: 'UNCOMMON',
  icon: '/sprites/item/기묘한알약.png',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: 'HP 손실 & 드로우',
      execute: (context) => {
        context.damagePlayer?.(4);
        context.drawCards?.(2);
      },
    },
  ],
};

export const BERSERKER_HELM: Relic = {
  id: 'berserker_helm',
  name: '광전사 투구',
  description: '전투 시작 시 힘 +6, 민첩 -2.',
  rarity: 'UNCOMMON',
  icon: '/sprites/item/광전사투구.png',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '힘 증가 & 민첩 감소',
      execute: (context) => {
        context.gainStrength?.(6);
        context.gainDexterity?.(-2);
      },
    },
  ],
};

// ==================== RARE 유물 ====================
export const CURSED_COIN: Relic = {
  id: 'cursed_coin',
  name: '저주받은 금화',
  description: '전투 종료 시 골드 +50. (HP 50% 이하 시 2배)',
  rarity: 'RARE',
  icon: '/sprites/item/저주받은금화.png',
  effects: [
    {
      trigger: 'ON_COMBAT_END',
      description: '골드 획득',
      execute: (context) => {
        // 조건부 보상은 gameStore에서 처리
        context.gainGold?.(50);
      },
    },
  ],
};

export const MAGIC_RING: Relic = {
  id: 'magic_ring',
  name: '마법 반지',
  description: '전투 시작 시 에너지 +3 획득.',
  rarity: 'RARE',
  icon: '/sprites/item/마법반지.png',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '에너지 3 획득',
      execute: (context) => {
        context.gainEnergy?.(3);
      },
    },
  ],
};

export const MYSTIC_ORB: Relic = {
  id: 'mystic_orb',
  name: '신비한 구슬',
  description: '전투 시작 시 모든 적에게 취약 1을 부여합니다.',
  rarity: 'RARE',
  icon: '/sprites/item/신비한구슬.png',
  effects: [
    {
      trigger: 'ON_COMBAT_START',
      description: '모든 적에게 취약 1',
      execute: () => {
        // combatStore에서 처리
      },
    },
  ],
};

export const ELIXIR: Relic = {
  id: 'elixir',
  name: '엘릭서',
  description: '매 턴 시작 시 HP 4를 회복합니다.',
  rarity: 'RARE',
  icon: '/sprites/item/엘릭서.png',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: 'HP 4 회복',
      execute: (context) => {
        context.heal?.(4);
      },
    },
  ],
};

export const VAMPIRE_FANG: Relic = {
  id: 'vampire_fang',
  name: '흡혈귀의 이빨',
  description: '공격 피해의 10%만큼 HP를 회복합니다.',
  rarity: 'RARE',
  icon: '/sprites/item/흡혈귀의이빨.png',
  effects: [
    {
      trigger: 'ON_DAMAGE_DEALT',
      description: '흡혈 10%',
      execute: (context) => {
        if (context.damageDealt) {
          const healAmount = Math.floor(context.damageDealt * 0.1);
          if (healAmount > 0) {
            context.heal?.(healAmount);
          }
        }
      },
    },
  ],
};

// ==================== UNIQUE 유물 ====================
export const DEVILS_CONTRACT: Relic = {
  id: 'devils_contract',
  name: '악마의 계약',
  description: '매 턴 에너지 +3. 매 턴 종료 시 HP 8 손실.',
  rarity: 'UNIQUE',
  icon: '/sprites/item/악마의계약.png',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: '에너지 획득',
      execute: (context) => {
        context.gainEnergy?.(3);
      },
    },
    {
      trigger: 'ON_TURN_END',
      description: 'HP 손실',
      execute: (context) => {
        context.damagePlayer?.(8);
      },
    },
  ],
};

export const ANGELS_TOUCH: Relic = {
  id: 'angels_touch',
  name: '천사의 손길',
  description: '매 턴 시작 시 HP 7을 회복합니다.',
  rarity: 'UNIQUE',
  icon: '/sprites/item/천사의손길.png',
  effects: [
    {
      trigger: 'ON_TURN_START',
      description: 'HP 7 회복',
      execute: (context) => {
        context.heal?.(7);
      },
    },
  ],
};

// ==================== 유물 목록 ====================
export const STARTER_RELICS: Relic[] = [BURNING_BLOOD, RING_OF_THE_SNAKE, CRACKED_ARMOR];

export const COMMON_RELICS: Relic[] = [SPELL_SHIELD, THORN_ARMOR, VAJRA, SWIFT_POTION, HEALING_POTION];

export const UNCOMMON_RELICS: Relic[] = [LANTERN, GAMBLERS_DICE, BLOOD_PACT, STRANGE_PILL, BERSERKER_HELM];

export const RARE_RELICS: Relic[] = [CURSED_COIN, MAGIC_RING, MYSTIC_ORB, ELIXIR, VAMPIRE_FANG];

export const UNIQUE_RELICS: Relic[] = [DEVILS_CONTRACT, ANGELS_TOUCH];

export const ALL_RELICS: Relic[] = [
  ...STARTER_RELICS,
  ...COMMON_RELICS,
  ...UNCOMMON_RELICS,
  ...RARE_RELICS,
  ...UNIQUE_RELICS,
];

// 랜덤 유물 보상 생성
export function generateRelicReward(): Relic {
  const roll = Math.random();
  let pool: Relic[];

  if (roll < 0.45) {
    pool = COMMON_RELICS;
  } else if (roll < 0.75) {
    pool = UNCOMMON_RELICS;
  } else if (roll < 0.95) {
    pool = RARE_RELICS;
  } else {
    // 5% 확률로 유니크 유물
    pool = UNIQUE_RELICS;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
