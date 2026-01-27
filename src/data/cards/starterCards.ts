import { Card } from '../../types/card';

export const STRIKE: Card = {
  id: 'strike',
  name: '기본 베기',
  type: 'ATTACK',
  rarity: 'BASIC',
  cost: 1,
  image: '/cards/effect/strike.png',
  description: '6 피해를 줍니다.',
  effects: [{ type: 'DAMAGE', value: 6, target: 'SINGLE' }],
  upgraded: false,
  upgradeEffect: {
    name: '기본 베기+',
    description: '9 피해를 줍니다.',
    effects: [{ type: 'DAMAGE', value: 9, target: 'SINGLE' }],
  },
};

export const DEFEND: Card = {
  id: 'defend',
  name: '방어 태세',
  type: 'SHIELD',
  rarity: 'BASIC',
  cost: 1,
  image: '/cards/effect/defend.png',
  description: '5 방어도를 얻습니다.',
  effects: [{ type: 'BLOCK', value: 5 }],
  upgraded: false,
  upgradeEffect: {
    name: '방어 태세+',
    description: '8 방어도를 얻습니다.',
    effects: [{ type: 'BLOCK', value: 8 }],
  },
};

export const BASH: Card = {
  id: 'bash',
  name: '갑옷 파괴',
  type: 'ATTACK',
  rarity: 'BASIC',
  cost: 2,
  image: '/cards/effect/bash.png',
  description: '8 피해를 주고 장비파괴 1을 부여합니다.',
  effects: [
    { type: 'DAMAGE', value: 8, target: 'SINGLE' },
    { type: 'APPLY_STATUS', value: 1, target: 'SINGLE', status: 'VULNERABLE' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '갑옷 파괴+',
    description: '10 피해를 주고 장비파괴 2를 부여합니다.',
    effects: [
      { type: 'DAMAGE', value: 10, target: 'SINGLE' },
      { type: 'APPLY_STATUS', value: 2, target: 'SINGLE', status: 'VULNERABLE' },
    ],
  },
};

export const RELAX: Card = {
  id: 'relax',
  name: '휴식',
  type: 'EFFECT',
  rarity: 'BASIC',
  cost: 2,
  image: '/cards/effect/relax.png',
  description: '4 HP를 얻습니다. 소멸.',
  effects: [{ type: 'HEAL', value: 4 }],
  exhaust: true,
  unique: true, // 게임에서 한 장만 등장
  upgraded: false,
  upgradeEffect: {
    name: '휴식+',
    description: '6 HP를 얻습니다. 소멸.',
    effects: [{ type: 'HEAL', value: 6 }],
    exhaust: true,
  },
};

export const FLEXIBLE_RESPONSE: Card = {
  id: 'flexible_response',
  name: '유연한 대응',
  type: 'SHIELD',
  rarity: 'BASIC',
  cost: 1,
  image: '/cards/effect/flexible_response.png',
  description: '7 방어도를 얻고 카드 1장을 뽑습니다.',
  effects: [
    { type: 'BLOCK', value: 7 },
    { type: 'DRAW', value: 1 },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '유연한 대응+',
    description: '10 방어도를 얻고 카드 1장을 뽑습니다.',
    effects: [
      { type: 'BLOCK', value: 10 },
      { type: 'DRAW', value: 1 },
    ],
  },
};

// 시작 덱 생성
export function createStarterDeck(): Card[] {
  return [
    { ...STRIKE },
    { ...STRIKE },
    { ...STRIKE },
    { ...DEFEND },
    { ...DEFEND },
    { ...DEFEND },
    { ...BASH },
    { ...BASH },
    { ...RELAX },
    { ...FLEXIBLE_RESPONSE },
  ];
}

// 모든 BASIC 카드 목록
export const BASIC_CARDS: Card[] = [
  STRIKE,
  DEFEND,
  BASH,
  RELAX,
  FLEXIBLE_RESPONSE,
];
