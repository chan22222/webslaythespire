import { Card } from '../../types/card';

export const CLEAVE: Card = {
  id: 'cleave',
  name: '휩쓸기',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 1,
  description: '모든 적에게 8 피해를 줍니다.',
  effects: [{ type: 'DAMAGE', value: 8, target: 'ALL' }],
  upgraded: false,
  upgradeEffect: {
    name: '휩쓸기+',
    description: '모든 적에게 11 피해를 줍니다.',
    effects: [{ type: 'DAMAGE', value: 11, target: 'ALL' }],
  },
};

export const POMMEL_STRIKE: Card = {
  id: 'pommel_strike',
  name: '자루 치기',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 1,
  description: '9 피해를 주고 카드 1장을 뽑습니다.',
  effects: [
    { type: 'DAMAGE', value: 9, target: 'SINGLE' },
    { type: 'DRAW', value: 1 },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '자루 치기+',
    description: '10 피해를 주고 카드 2장을 뽑습니다.',
    effects: [
      { type: 'DAMAGE', value: 10, target: 'SINGLE' },
      { type: 'DRAW', value: 2 },
    ],
  },
};

export const SHRUG_IT_OFF: Card = {
  id: 'shrug_it_off',
  name: '어깨 으쓱',
  type: 'SHIELD',
  rarity: 'COMMON',
  cost: 1,
  description: '8 방어도를 얻고 카드 1장을 뽑습니다.',
  effects: [
    { type: 'BLOCK', value: 8 },
    { type: 'DRAW', value: 1 },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '어깨 으쓱+',
    description: '11 방어도를 얻고 카드 1장을 뽑습니다.',
    effects: [
      { type: 'BLOCK', value: 11 },
      { type: 'DRAW', value: 1 },
    ],
  },
};

export const IRON_WAVE: Card = {
  id: 'iron_wave',
  name: '철 파도',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 1,
  description: '5 방어도를 얻고 5 피해를 줍니다.',
  effects: [
    { type: 'BLOCK', value: 5 },
    { type: 'DAMAGE', value: 5, target: 'SINGLE' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '철 파도+',
    description: '7 방어도를 얻고 7 피해를 줍니다.',
    effects: [
      { type: 'BLOCK', value: 7 },
      { type: 'DAMAGE', value: 7, target: 'SINGLE' },
    ],
  },
};

export const TWIN_STRIKE: Card = {
  id: 'twin_strike',
  name: '쌍둥이 타격',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 1,
  description: '5 피해를 2번 줍니다.',
  effects: [
    { type: 'DAMAGE', value: 5, target: 'SINGLE' },
    { type: 'DAMAGE', value: 5, target: 'SINGLE' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '쌍둥이 타격+',
    description: '7 피해를 2번 줍니다.',
    effects: [
      { type: 'DAMAGE', value: 7, target: 'SINGLE' },
      { type: 'DAMAGE', value: 7, target: 'SINGLE' },
    ],
  },
};

export const ANGER: Card = {
  id: 'anger',
  name: '분노',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 0,
  description: '6 피해를 줍니다. 이 카드의 복사본을 버린 카드 더미에 추가합니다.',
  effects: [{ type: 'DAMAGE', value: 6, target: 'SINGLE' }],
  upgraded: false,
  upgradeEffect: {
    name: '분노+',
    description: '8 피해를 줍니다. 이 카드의 복사본을 버린 카드 더미에 추가합니다.',
    effects: [{ type: 'DAMAGE', value: 8, target: 'SINGLE' }],
  },
};

export const ARMAMENTS: Card = {
  id: 'armaments',
  name: '무장',
  type: 'SHIELD',
  rarity: 'COMMON',
  cost: 1,
  description: '5 방어도를 얻습니다. 손에 있는 카드 1장을 업그레이드합니다.',
  effects: [
    { type: 'BLOCK', value: 5 },
    { type: 'UPGRADE_HAND', value: 1 },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '무장+',
    description: '5 방어도를 얻습니다. 손에 있는 모든 카드를 업그레이드합니다.',
    effects: [
      { type: 'BLOCK', value: 5 },
      { type: 'UPGRADE_ALL_HAND', value: 0 },
    ],
  },
};

export const CLOTHESLINE: Card = {
  id: 'clothesline',
  name: '빨랫줄',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 2,
  description: '12 피해를 주고 약화 2를 부여합니다.',
  effects: [
    { type: 'DAMAGE', value: 12, target: 'SINGLE' },
    { type: 'APPLY_STATUS', value: 2, target: 'SINGLE', status: 'WEAK' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '빨랫줄+',
    description: '14 피해를 주고 약화 3을 부여합니다.',
    effects: [
      { type: 'DAMAGE', value: 14, target: 'SINGLE' },
      { type: 'APPLY_STATUS', value: 3, target: 'SINGLE', status: 'WEAK' },
    ],
  },
};

export const FLEX: Card = {
  id: 'flex',
  name: '유연',
  type: 'SHIELD',
  rarity: 'COMMON',
  cost: 0,
  description: '힘 2를 얻습니다. 턴 종료 시 힘 2를 잃습니다.',
  effects: [
    { type: 'APPLY_STATUS', value: 2, target: 'SELF', status: 'STRENGTH' },
    { type: 'APPLY_STATUS', value: 2, target: 'SELF', status: 'STRENGTH_DOWN' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '유연+',
    description: '힘 4를 얻습니다. 턴 종료 시 힘 4를 잃습니다.',
    effects: [
      { type: 'APPLY_STATUS', value: 4, target: 'SELF', status: 'STRENGTH' },
      { type: 'APPLY_STATUS', value: 4, target: 'SELF', status: 'STRENGTH_DOWN' },
    ],
  },
};

export const HEADBUTT: Card = {
  id: 'headbutt',
  name: '박치기',
  type: 'ATTACK',
  rarity: 'COMMON',
  cost: 1,
  description: '9 피해를 줍니다. 버린 카드 더미에서 카드 1장을 뽑기 더미 맨 위에 놓습니다.',
  effects: [{ type: 'DAMAGE', value: 9, target: 'SINGLE' }],
  upgraded: false,
  upgradeEffect: {
    name: '박치기+',
    description: '12 피해를 줍니다. 버린 카드 더미에서 카드 1장을 뽑기 더미 맨 위에 놓습니다.',
    effects: [{ type: 'DAMAGE', value: 12, target: 'SINGLE' }],
  },
};

// 모든 일반 카드 목록
export const COMMON_CARDS: Card[] = [
  CLEAVE,
  POMMEL_STRIKE,
  SHRUG_IT_OFF,
  IRON_WAVE,
  TWIN_STRIKE,
  ANGER,
  ARMAMENTS,
  CLOTHESLINE,
  FLEX,
  HEADBUTT,
];
