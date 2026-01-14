import { Card } from '../../types/card';

export const RAGE: Card = {
  id: 'rage',
  name: '분노',
  type: 'EFFECT',
  rarity: 'UNCOMMON',
  cost: 1,
  image: '/cards/effect/rage.png',
  description: '힘 2를 얻습니다.',
  effects: [{ type: 'APPLY_STATUS', value: 2, target: 'SELF', status: 'STRENGTH' }],
  upgraded: false,
  upgradeEffect: {
    name: '분노+',
    description: '힘 3을 얻습니다.',
    effects: [{ type: 'APPLY_STATUS', value: 3, target: 'SELF', status: 'STRENGTH' }],
  },
};

export const DIAMOND_BODY: Card = {
  id: 'diamond_body',
  name: '금강불괴',
  type: 'SHIELD',
  rarity: 'UNCOMMON',
  cost: 1,
  image: '/cards/effect/diamond_body.png',
  description: '매 턴 종료 시 방어도 2를 얻습니다.',
  effects: [{ type: 'APPLY_STATUS', value: 2, target: 'SELF', status: 'METALLICIZE' }],
  upgraded: false,
  upgradeEffect: {
    name: '금강불괴+',
    description: '매 턴 종료 시 방어도 3을 얻습니다.',
    effects: [{ type: 'APPLY_STATUS', value: 3, target: 'SELF', status: 'METALLICIZE' }],
  },
};

export const LIFE_EXCHANGE: Card = {
  id: 'life_exchange',
  name: '생명 치환',
  type: 'EFFECT',
  rarity: 'UNCOMMON',
  cost: 0,
  image: '/cards/effect/life_exchange.png',
  description: 'HP를 5 잃고 에너지 2를 얻습니다.',
  effects: [
    { type: 'LOSE_HP', value: 5 },
    { type: 'GAIN_ENERGY', value: 2 },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '생명 치환+',
    description: 'HP를 2 잃고 에너지 2를 얻습니다.',
    effects: [
      { type: 'LOSE_HP', value: 2 },
      { type: 'GAIN_ENERGY', value: 2 },
    ],
  },
};

export const DESPERATE_STRIKE: Card = {
  id: 'desperate_strike',
  name: '결사의 일격',
  type: 'ATTACK',
  rarity: 'UNCOMMON',
  cost: 2,
  image: '/cards/effect/desperate_strike.png',
  description: '20 피해를 줍니다.',
  effects: [{ type: 'DAMAGE', value: 20, target: 'SINGLE' }],
  upgraded: false,
  upgradeEffect: {
    name: '결사의 일격+',
    description: '28 피해를 줍니다.',
    effects: [{ type: 'DAMAGE', value: 28, target: 'SINGLE' }],
  },
};

export const FATAL_WOUND: Card = {
  id: 'fatal_wound',
  name: '치명상',
  type: 'ATTACK',
  rarity: 'UNCOMMON',
  cost: 2,
  image: '/cards/effect/fatal_wound.png',
  description: '13 피해를 줍니다. 약화 1과 취약 1을 부여합니다.',
  effects: [
    { type: 'DAMAGE', value: 13, target: 'SINGLE' },
    { type: 'APPLY_STATUS', value: 1, target: 'SINGLE', status: 'WEAK' },
    { type: 'APPLY_STATUS', value: 1, target: 'SINGLE', status: 'VULNERABLE' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '치명상+',
    description: '13 피해를 줍니다. 약화 2와 취약 2를 부여합니다.',
    effects: [
      { type: 'DAMAGE', value: 13, target: 'SINGLE' },
      { type: 'APPLY_STATUS', value: 2, target: 'SINGLE', status: 'WEAK' },
      { type: 'APPLY_STATUS', value: 2, target: 'SINGLE', status: 'VULNERABLE' },
    ],
  },
};

export const BATTLE_TRANCE: Card = {
  id: 'battle_trance',
  name: '전투 트랜스',
  type: 'EFFECT',
  rarity: 'UNCOMMON',
  cost: 0,
  image: '/cards/effect/battle_trance.png',
  description: '카드 2장을 뽑습니다.',
  effects: [{ type: 'DRAW', value: 2 }],
  upgraded: false,
  upgradeEffect: {
    name: '전투 트랜스+',
    description: '카드 3장을 뽑습니다.',
    effects: [{ type: 'DRAW', value: 3 }],
  },
};

export const SWEEPING: Card = {
  id: 'sweeping',
  name: '휩쓸기',
  type: 'ATTACK',
  rarity: 'UNCOMMON',
  cost: 1,
  image: '/cards/effect/sweeping.png',
  description: '모든 적에게 6 피해를 줍니다.',
  effects: [{ type: 'DAMAGE', value: 6, target: 'ALL' }],
  upgraded: false,
  upgradeEffect: {
    name: '휩쓸기+',
    description: '모든 적에게 11 피해를 줍니다.',
    effects: [{ type: 'DAMAGE', value: 11, target: 'ALL' }],
  },
};

// 모든 언커먼 카드 목록
export const UNCOMMON_CARDS: Card[] = [
  RAGE,
  DIAMOND_BODY,
  LIFE_EXCHANGE,
  DESPERATE_STRIKE,
  FATAL_WOUND,
  BATTLE_TRANCE,
  SWEEPING,
];
