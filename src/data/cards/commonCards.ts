import { Card } from '../../types/card';

export const COMBO_ATTACK: Card = {
  id: 'combo_attack',
  name: '연계 공격',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 1,
  image: '/cards/effect/combo_attack.png',
  description: '8 피해를 주고 카드 1장을 뽑습니다.',
  effects: [
    { type: 'DAMAGE', value: 8, target: 'SINGLE' },
    { type: 'DRAW', value: 1 },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '연계 공격+',
    description: '12 피해를 주고 카드 1장을 뽑습니다.',
    effects: [
      { type: 'DAMAGE', value: 12, target: 'SINGLE' },
      { type: 'DRAW', value: 1 },
    ],
  },
};

export const ASSAULT_SHIELD: Card = {
  id: 'assault_shield',
  name: '강습 방패',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 1,
  image: '/cards/effect/assault_shield.png',
  description: '5 방어도를 얻고 5 피해를 줍니다.',
  effects: [
    { type: 'BLOCK', value: 5 },
    { type: 'DAMAGE', value: 5, target: 'SINGLE' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '강습 방패+',
    description: '7 방어도를 얻고 7 피해를 줍니다.',
    effects: [
      { type: 'BLOCK', value: 7 },
      { type: 'DAMAGE', value: 7, target: 'SINGLE' },
    ],
  },
};

export const DOUBLE_STRIKE: Card = {
  id: 'double_strike',
  name: '이연격',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 2,
  image: '/cards/effect/double_strike.png',
  description: '7 피해를 2번 줍니다.',
  effects: [
    { type: 'DAMAGE', value: 7, target: 'SINGLE' },
    { type: 'DAMAGE', value: 7, target: 'SINGLE' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '이연격+',
    description: '10 피해를 2번 줍니다.',
    effects: [
      { type: 'DAMAGE', value: 10, target: 'SINGLE' },
      { type: 'DAMAGE', value: 10, target: 'SINGLE' },
    ],
  },
};

export const EQUIPMENT_CHECK: Card = {
  id: 'equipment_check',
  name: '장비 점검',
  type: 'SHIELD',
  rarity: 'COMMON',
  cost: 1,
  image: '/cards/effect/equipment_check.png',
  description: '4 방어도를 얻습니다. 손에 있는 카드 1장을 업그레이드합니다.',
  effects: [
    { type: 'BLOCK', value: 4 },
    { type: 'UPGRADE_HAND', value: 1 },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '장비 점검+',
    description: '4 방어도를 얻습니다. 손에 있는 카드 2장을 업그레이드합니다.',
    effects: [
      { type: 'BLOCK', value: 4 },
      { type: 'UPGRADE_HAND', value: 2 },
    ],
  },
};

export const NEUTRALIZE: Card = {
  id: 'neutralize',
  name: '무력화',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 1,
  image: '/cards/effect/neutralize.png',
  description: '10 피해를 주고 약화 2를 부여합니다.',
  effects: [
    { type: 'DAMAGE', value: 10, target: 'SINGLE' },
    { type: 'APPLY_STATUS', value: 2, target: 'SINGLE', status: 'WEAK' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '무력화+',
    description: '14 피해를 주고 약화 2를 부여합니다.',
    effects: [
      { type: 'DAMAGE', value: 14, target: 'SINGLE' },
      { type: 'APPLY_STATUS', value: 2, target: 'SINGLE', status: 'WEAK' },
    ],
  },
};

export const INSTANT_FOCUS: Card = {
  id: 'instant_focus',
  name: '순간 집중',
  type: 'EFFECT',
  rarity: 'COMMON',
  cost: 0,
  image: '/cards/effect/instant_focus.png',
  description: '힘 2를 얻습니다. 턴 종료 시 힘 2를 잃습니다.',
  effects: [
    { type: 'APPLY_STATUS', value: 2, target: 'SELF', status: 'STRENGTH' },
    { type: 'APPLY_STATUS', value: 2, target: 'SELF', status: 'STRENGTH_DOWN' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '순간 집중+',
    description: '힘 4를 얻습니다. 턴 종료 시 힘 4를 잃습니다.',
    effects: [
      { type: 'APPLY_STATUS', value: 4, target: 'SELF', status: 'STRENGTH' },
      { type: 'APPLY_STATUS', value: 4, target: 'SELF', status: 'STRENGTH_DOWN' },
    ],
  },
};

export const TACTICAL_REVIEW: Card = {
  id: 'tactical_review',
  name: '전술 복기',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 1,
  image: '/cards/effect/tactical_review.png',
  description: '5 피해를 줍니다. 사용한 후 다시 손으로 가져옵니다.',
  effects: [{ type: 'DAMAGE', value: 5, target: 'SINGLE' }],
  returnToHand: true,
  upgraded: false,
  upgradeEffect: {
    name: '전술 복기+',
    description: '5 피해를 줍니다. 사용한 후 다시 손으로 가져옵니다.',
    effects: [{ type: 'DAMAGE', value: 5, target: 'SINGLE' }],
  },
};

// 모든 일반 카드 목록
export const COMMON_CARDS: Card[] = [
  COMBO_ATTACK,
  ASSAULT_SHIELD,
  DOUBLE_STRIKE,
  EQUIPMENT_CHECK,
  NEUTRALIZE,
  INSTANT_FOCUS,
  TACTICAL_REVIEW,
];
