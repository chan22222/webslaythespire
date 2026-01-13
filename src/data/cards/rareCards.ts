import { Card } from '../../types/card';

export const LIMIT_BREAK: Card = {
  id: 'limit_break',
  name: '한계 돌파',
  type: 'SKILL',
  rarity: 'RARE',
  cost: 2,
  description: '현재 보유한 힘을 1.5배로 늘립니다.',
  effects: [{ type: 'MULTIPLY_STRENGTH', value: 1.5, target: 'SELF' }],
  upgraded: false,
  upgradeEffect: {
    name: '한계 돌파+',
    description: '현재 보유한 힘을 2배로 늘립니다.',
    effects: [{ type: 'MULTIPLY_STRENGTH', value: 2, target: 'SELF' }],
  },
};

export const IRON_FORTRESS: Card = {
  id: 'iron_fortress',
  name: '철벽의 요새',
  type: 'EFFECT',
  rarity: 'RARE',
  cost: 1,
  description: '1턴 간 방어도가 사라지지 않습니다.',
  effects: [{ type: 'BLOCK_RETAIN', value: 1, target: 'SELF' }],
  upgraded: false,
  upgradeEffect: {
    name: '철벽의 요새+',
    description: '2턴 간 방어도가 사라지지 않습니다.',
    effects: [{ type: 'BLOCK_RETAIN', value: 2, target: 'SELF' }],
  },
};

export const ON_THE_EDGE: Card = {
  id: 'on_the_edge',
  name: '사선에서',
  type: 'ATTACK',
  rarity: 'RARE',
  cost: 2,
  description: '잃은 HP 3당 2의 피해를 줍니다.',
  effects: [{ type: 'DAMAGE_PER_LOST_HP', value: 2, ratio: 3, target: 'SINGLE' }],
  upgraded: false,
  upgradeEffect: {
    name: '사선에서+',
    description: '잃은 HP 1당 1의 피해를 줍니다.',
    effects: [{ type: 'DAMAGE_PER_LOST_HP', value: 1, ratio: 1, target: 'SINGLE' }],
  },
};

export const TACTICAL_COMMAND: Card = {
  id: 'tactical_command',
  name: '전술 지휘',
  type: 'SKILL',
  rarity: 'RARE',
  cost: 1,
  description: '카드 2장을 뽑습니다. 뽑은 카드가 공격 카드면 코스트를 2 감소 시킵니다.',
  effects: [
    { type: 'DRAW', value: 2 },
    { type: 'REDUCE_ATTACK_COST', value: 2 },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '전술 지휘+',
    description: '카드 3장을 뽑습니다. 뽑은 카드가 공격 카드면 코스트를 2 감소 시킵니다.',
    effects: [
      { type: 'DRAW', value: 3 },
      { type: 'REDUCE_ATTACK_COST', value: 2 },
    ],
  },
};

export const BLOOD_FESTIVAL: Card = {
  id: 'blood_festival',
  name: '피의 축제',
  type: 'ATTACK',
  rarity: 'RARE',
  cost: 2,
  description: '14 피해를 줍니다. 이 공격으로 적 처치 시 최대 HP가 3 증가합니다.',
  effects: [
    { type: 'DAMAGE', value: 14, target: 'SINGLE' },
    { type: 'GAIN_MAX_HP_ON_KILL', value: 3 },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '피의 축제+',
    description: '14 피해를 줍니다. 이 공격으로 적 처치 시 최대 HP가 5 증가합니다.',
    effects: [
      { type: 'DAMAGE', value: 14, target: 'SINGLE' },
      { type: 'GAIN_MAX_HP_ON_KILL', value: 5 },
    ],
  },
};

export const FULL_ARMAMENT: Card = {
  id: 'full_armament',
  name: '완전 무장',
  type: 'SKILL',
  rarity: 'RARE',
  cost: 0,
  description: '힘과 민첩 2를 얻습니다.',
  effects: [
    { type: 'APPLY_STATUS', value: 2, target: 'SELF', status: 'STRENGTH' },
    { type: 'APPLY_STATUS', value: 2, target: 'SELF', status: 'DEXTERITY' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '완전 무장+',
    description: '힘과 민첩 3을 얻습니다.',
    effects: [
      { type: 'APPLY_STATUS', value: 3, target: 'SELF', status: 'STRENGTH' },
      { type: 'APPLY_STATUS', value: 3, target: 'SELF', status: 'DEXTERITY' },
    ],
  },
};

// 모든 레어 카드 목록
export const RARE_CARDS: Card[] = [
  LIMIT_BREAK,
  IRON_FORTRESS,
  ON_THE_EDGE,
  TACTICAL_COMMAND,
  BLOOD_FESTIVAL,
  FULL_ARMAMENT,
];
