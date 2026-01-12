import { Card } from '../../types/card';

export const INFLAME: Card = {
  id: 'inflame',
  name: '불타오르다',
  type: 'POWER',
  rarity: 'UNCOMMON',
  cost: 1,
  description: '힘 2를 얻습니다.',
  effects: [{ type: 'APPLY_STATUS', value: 2, target: 'SELF', status: 'STRENGTH' }],
  upgraded: false,
  upgradeEffect: {
    name: '불타오르다+',
    description: '힘 3을 얻습니다.',
    effects: [{ type: 'APPLY_STATUS', value: 3, target: 'SELF', status: 'STRENGTH' }],
  },
};

export const METALLICIZE: Card = {
  id: 'metallicize',
  name: '금속화',
  type: 'POWER',
  rarity: 'UNCOMMON',
  cost: 1,
  description: '매 턴 종료 시 3 방어도를 얻습니다.',
  effects: [{ type: 'APPLY_STATUS', value: 3, target: 'SELF', status: 'METALLICIZE' }],
  upgraded: false,
  upgradeEffect: {
    name: '금속화+',
    description: '매 턴 종료 시 4 방어도를 얻습니다.',
    effects: [{ type: 'APPLY_STATUS', value: 4, target: 'SELF', status: 'METALLICIZE' }],
  },
};

export const BLOODLETTING: Card = {
  id: 'bloodletting',
  name: '방혈',
  type: 'SKILL',
  rarity: 'UNCOMMON',
  cost: 0,
  description: 'HP를 3 잃고 에너지 2를 얻습니다.',
  effects: [{ type: 'GAIN_ENERGY', value: 2 }],
  upgraded: false,
  upgradeEffect: {
    name: '방혈+',
    description: 'HP를 3 잃고 에너지 3을 얻습니다.',
    effects: [{ type: 'GAIN_ENERGY', value: 3 }],
  },
};

export const CARNAGE: Card = {
  id: 'carnage',
  name: '학살',
  type: 'ATTACK',
  rarity: 'UNCOMMON',
  cost: 2,
  description: '소멸. 20 피해를 줍니다.',
  effects: [{ type: 'DAMAGE', value: 20, target: 'SINGLE' }],
  upgraded: false,
  upgradeEffect: {
    name: '학살+',
    description: '소멸. 28 피해를 줍니다.',
    effects: [{ type: 'DAMAGE', value: 28, target: 'SINGLE' }],
  },
};

export const UPPERCUT: Card = {
  id: 'uppercut',
  name: '어퍼컷',
  type: 'ATTACK',
  rarity: 'UNCOMMON',
  cost: 2,
  description: '13 피해를 줍니다. 약화 1과 취약 1을 부여합니다.',
  effects: [
    { type: 'DAMAGE', value: 13, target: 'SINGLE' },
    { type: 'APPLY_STATUS', value: 1, target: 'SINGLE', status: 'WEAK' },
    { type: 'APPLY_STATUS', value: 1, target: 'SINGLE', status: 'VULNERABLE' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '어퍼컷+',
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
  type: 'SKILL',
  rarity: 'UNCOMMON',
  cost: 0,
  description: '카드 3장을 뽑습니다. 이 턴에 더 이상 카드를 뽑을 수 없습니다.',
  effects: [{ type: 'DRAW', value: 3 }],
  upgraded: false,
  upgradeEffect: {
    name: '전투 트랜스+',
    description: '카드 4장을 뽑습니다. 이 턴에 더 이상 카드를 뽑을 수 없습니다.',
    effects: [{ type: 'DRAW', value: 4 }],
  },
};

// 모든 언커먼 카드 목록
export const UNCOMMON_CARDS: Card[] = [
  INFLAME,
  METALLICIZE,
  BLOODLETTING,
  CARNAGE,
  UPPERCUT,
  BATTLE_TRANCE,
];
