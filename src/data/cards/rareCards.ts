import { Card } from '../../types/card';

export const LIMIT_BREAK: Card = {
  id: 'limit_break',
  name: '한계 돌파',
  type: 'EFFECT',
  rarity: 'RARE',
  cost: 2,
  image: '/cards/effect/limit_break.png',
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
  type: 'SHIELD',
  rarity: 'RARE',
  cost: 1,
  image: '/cards/effect/iron_fortress.png',
  description: '이번 턴의 방어도가 사라지지 않습니다.',
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
  cost: 3,
  image: '/cards/effect/on_the_edge.png',
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
  type: 'EFFECT',
  rarity: 'RARE',
  cost: 2,
  image: '/cards/effect/tactical_command.png',
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
  cost: 3,
  image: '/cards/effect/blood_festival.png',
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
  type: 'EFFECT',
  rarity: 'RARE',
  cost: 2,
  image: '/cards/effect/full_armament.png',
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

export const QUAD_STRIKE: Card = {
  id: 'quad_strike',
  name: '4연속 베기',
  type: 'ATTACK',
  rarity: 'RARE',
  cost: 2,
  image: '/cards/effect/quad_strike.png',
  description: '8 피해를 4번 줍니다.',
  effects: [
    { type: 'DAMAGE', value: 8, target: 'SINGLE' },
    { type: 'DAMAGE', value: 8, target: 'SINGLE' },
    { type: 'DAMAGE', value: 8, target: 'SINGLE' },
    { type: 'DAMAGE', value: 8, target: 'SINGLE' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '4연속 베기+',
    description: '12 피해를 4번 줍니다.',
    effects: [
      { type: 'DAMAGE', value: 12, target: 'SINGLE' },
      { type: 'DAMAGE', value: 12, target: 'SINGLE' },
      { type: 'DAMAGE', value: 12, target: 'SINGLE' },
      { type: 'DAMAGE', value: 12, target: 'SINGLE' },
    ],
  },
};

export const BERSERKER_RING: Card = {
  id: 'berserker_ring',
  name: '광전사의 반지',
  type: 'EFFECT',
  rarity: 'RARE',
  cost: 2,
  image: '/cards/effect/berserker_ring.png',
  description: '1턴 동안, 어떠한 피해에도 HP가 1 아래로 내려가지 않습니다.',
  effects: [{ type: 'APPLY_UNDYING', value: 1, target: 'SELF' }],
  upgraded: false,
  upgradeEffect: {
    name: '광전사의 반지+',
    description: '2턴 동안, 어떠한 피해에도 HP가 1 아래로 내려가지 않습니다.',
    effects: [{ type: 'APPLY_UNDYING', value: 2, target: 'SELF' }],
  },
};

export const BEST_DEFENSE: Card = {
  id: 'best_defense',
  name: '최선의 방어',
  type: 'EFFECT',
  rarity: 'RARE',
  cost: 3,
  image: '/cards/effect/best_defense.png',
  description: '공격 카드를 사용할 때 마다 방어도 1을 얻습니다.',
  effects: [{ type: 'APPLY_BLOCK_ON_ATTACK', value: 1, target: 'SELF' }],
  upgraded: false,
  upgradeEffect: {
    name: '최선의 방어+',
    description: '공격 카드를 사용할 때 마다 방어도 2를 얻습니다.',
    effects: [{ type: 'APPLY_BLOCK_ON_ATTACK', value: 2, target: 'SELF' }],
  },
};

export const BASIC_MASTERY: Card = {
  id: 'basic_mastery',
  name: '기본기 충실',
  type: 'EFFECT',
  rarity: 'RARE',
  cost: 3,
  image: '/cards/effect/basic_mastery.png',
  description: "이번 전투에서 '베기'라는 이름이 포함된 모든 카드의 코스트를 1 감소시킵니다. 소멸.",
  effects: [{ type: 'REDUCE_SLASH_COST', value: 1 }],
  exhaust: true,
  upgraded: false,
  upgradeEffect: {
    name: '기본기 충실+',
    description: "이번 전투에서 '베기'라는 이름이 포함된 모든 카드의 코스트를 2 감소시킵니다. 소멸.",
    effects: [{ type: 'REDUCE_SLASH_COST', value: 2 }],
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
  QUAD_STRIKE,
  BERSERKER_RING,
  BEST_DEFENSE,
  BASIC_MASTERY,
];
