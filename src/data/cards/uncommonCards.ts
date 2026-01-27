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
  description: '13 피해를 줍니다. 무기손상 1과 장비파괴 1을 부여합니다.',
  effects: [
    { type: 'DAMAGE', value: 13, target: 'SINGLE' },
    { type: 'APPLY_STATUS', value: 1, target: 'SINGLE', status: 'WEAK' },
    { type: 'APPLY_STATUS', value: 1, target: 'SINGLE', status: 'VULNERABLE' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '치명상+',
    description: '13 피해를 줍니다. 무기손상 2와 장비파괴 2를 부여합니다.',
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
  cost: 1,
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

export const WILD_MUSHROOM: Card = {
  id: 'wild_mushroom',
  name: '야생 버섯 섭취',
  type: 'EFFECT',
  rarity: 'UNCOMMON',
  cost: 1,
  image: '/cards/effect/mushroom.png',
  description: '-2 ~ 5 HP를 얻습니다. 3% 확률로 HP를 10 잃습니다.',
  effects: [{ type: 'RANDOM_HEAL', value: 5, min: -2, critChance: 0.03, critDamage: 10 }],
  upgraded: false,
  upgradeEffect: {
    name: '야생 버섯 섭취+',
    description: '-3 ~ 8 HP를 얻습니다. 3% 확률로 HP를 10 잃습니다.',
    effects: [{ type: 'RANDOM_HEAL', value: 8, min: -3, critChance: 0.03, critDamage: 10 }],
  },
};

export const OIL_DRUM: Card = {
  id: 'oil_drum',
  name: '기름통',
  type: 'EFFECT',
  rarity: 'UNCOMMON',
  cost: 1,
  image: '/cards/effect/oil_drum.png',
  description: '해당 적 처치 시 모든 적에게 8의 피해를 줍니다.',
  effects: [{ type: 'APPLY_OIL', value: 1, explosionDamage: 8, target: 'SINGLE' }],
  upgraded: false,
  upgradeEffect: {
    name: '기름통+',
    description: '해당 적 처치 시 모든 적에게 12의 피해를 줍니다.',
    effects: [{ type: 'APPLY_OIL', value: 1, explosionDamage: 12, target: 'SINGLE' }],
  },
};

export const DIAMOND_SHIELD: Card = {
  id: 'diamond_shield',
  name: '다이아몬드 방패',
  type: 'SHIELD',
  rarity: 'UNCOMMON',
  cost: 2,
  image: '/cards/effect/diamond_shield.png',
  description: '방어도 12를 두 번 얻습니다.',
  effects: [
    { type: 'BLOCK', value: 12 },
    { type: 'BLOCK', value: 12 },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '다이아몬드 방패+',
    description: '방어도 16을 두 번 얻습니다.',
    effects: [
      { type: 'BLOCK', value: 16 },
      { type: 'BLOCK', value: 16 },
    ],
  },
};

export const NEEDLE_ARMOR: Card = {
  id: 'needle_armor',
  name: '바늘 갑옷',
  type: 'EFFECT',
  rarity: 'UNCOMMON',
  cost: 2,
  image: '/cards/effect/needle_armor.png',
  description: '피격 시 감소된 방어도의 20%만큼 적에게 피해를 입힙니다.',
  effects: [{ type: 'APPLY_THORNS', value: 20, target: 'SELF' }],
  upgraded: false,
  upgradeEffect: {
    name: '바늘 갑옷+',
    description: '피격 시 감소된 방어도의 30%만큼 적에게 피해를 입힙니다.',
    effects: [{ type: 'APPLY_THORNS', value: 30, target: 'SELF' }],
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
  WILD_MUSHROOM,
  OIL_DRUM,
  DIAMOND_SHIELD,
  NEEDLE_ARMOR,
];
