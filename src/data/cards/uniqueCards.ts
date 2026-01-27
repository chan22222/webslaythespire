import { Card } from '../../types/card';

export const FINAL_STRIKE: Card = {
  id: 'final_strike',
  name: '종언의 일격',
  type: 'ATTACK',
  rarity: 'UNIQUE',
  cost: 3,
  image: '/cards/effect/final_strike.png',
  description: '모든 적에게 이번 전투에서 사용한 카드 종류당 4 피해를 줍니다. 소멸.',
  effects: [{ type: 'DAMAGE_PER_PLAYED', value: 4, target: 'ALL' }],
  exhaust: true,
  upgraded: false,
  upgradeEffect: {
    name: '종언의 일격+',
    description: '모든 적에게 이번 전투에서 사용한 카드 종류당 6 피해를 줍니다. 소멸.',
    effects: [{ type: 'DAMAGE_PER_PLAYED', value: 6, target: 'ALL' }],
  },
};

export const INFINITE_VORTEX: Card = {
  id: 'infinite_vortex',
  name: '무한의 소용돌이',
  type: 'EFFECT',
  rarity: 'UNIQUE',
  cost: 0,
  image: '/cards/effect/infinite_vortex.png',
  description: '에너지를 최대 3까지 사용해, 사용한 에너지 1당 카드를 2장씩 뽑습니다. 소멸.',
  effects: [{ type: 'CONSUME_ENERGY_DRAW', value: 2, maxConsume: 3 }],
  exhaust: true,
  upgraded: false,
  upgradeEffect: {
    name: '무한의 소용돌이+',
    description: '에너지를 최대 5까지 사용해, 사용한 에너지 1당 카드를 2장씩 뽑습니다. 소멸.',
    effects: [{ type: 'CONSUME_ENERGY_DRAW', value: 2, maxConsume: 5 }],
  },
};

export const ABSOLUTE_DEFENSE: Card = {
  id: 'absolute_defense',
  name: '절대 방어 영역',
  type: 'SHIELD',
  rarity: 'UNIQUE',
  cost: 3,
  image: '/cards/effect/absolute_defense.png',
  description: '2턴 동안 플레이어가 입는 모든 피해를 무효화합니다. 소멸.',
  effects: [{ type: 'INVULNERABLE', value: 2, target: 'SELF' }],
  exhaust: true,
  upgraded: false,
  upgradeEffect: {
    name: '절대 방어 영역+',
    description: '3턴 동안 플레이어가 입는 모든 피해를 무효화합니다. 소멸.',
    effects: [{ type: 'INVULNERABLE', value: 3, target: 'SELF' }],
  },
};

export const DIVINE_POWER: Card = {
  id: 'divine_power',
  name: '신의 권능',
  type: 'ATTACK',
  rarity: 'UNIQUE',
  cost: 4,
  image: '/cards/effect/divine_power.png',
  description: '적의 현재 체력을 절반으로 줄입니다. (최대 100) 소멸.',
  effects: [{ type: 'HALVE_ENEMY_HP', value: 100, target: 'SINGLE' }],
  exhaust: true,
  upgraded: false,
  upgradeEffect: {
    name: '신의 권능+',
    description: '적의 현재 체력을 절반으로 줄입니다. (최대 150) 소멸.',
    effects: [{ type: 'HALVE_ENEMY_HP', value: 150, target: 'SINGLE' }],
  },
};

export const TIME_WARP: Card = {
  id: 'time_warp',
  name: '시간 왜곡',
  type: 'EFFECT',
  rarity: 'UNIQUE',
  cost: 3,
  image: '/cards/effect/time_warp.png',
  description: '턴이 끝나면, 곧바로 자신의 턴을 다시 시작합니다. 소멸.',
  effects: [{ type: 'EXTRA_TURN', value: 0 }],
  exhaust: true,
  upgraded: false,
  upgradeEffect: {
    name: '시간 왜곡+',
    description: '턴이 끝나면, 곧바로 자신의 턴을 다시 시작하며 2에너지를 추가로 얻습니다. 소멸.',
    effects: [
      { type: 'EXTRA_TURN', value: 0 },
      { type: 'GAIN_ENERGY', value: 2 },
    ],
  },
};

export const SHIELD_HERO: Card = {
  id: 'shield_hero',
  name: '방패 용사 성공담',
  type: 'EFFECT',
  rarity: 'UNIQUE',
  cost: 3,
  image: '/cards/effect/shield_hero.png',
  description: '이번 게임에서 공격 사용 불가. 방어도를 얻을 때 50%만큼 무작위로 피해를 입힙니다.',
  effects: [
    { type: 'APPLY_ATTACK_DISABLED', value: 999, target: 'SELF' },
    { type: 'APPLY_BLOCK_TO_DAMAGE', value: 50, target: 'SELF' },
  ],
  unique: true,
  upgraded: false,
  upgradeEffect: {
    name: '방패 용사 성공담+',
    description: '이번 게임에서 공격 사용 불가. 방어도를 얻을 때 75%만큼 무작위로 피해를 입힙니다.',
    effects: [
      { type: 'APPLY_ATTACK_DISABLED', value: 999, target: 'SELF' },
      { type: 'APPLY_BLOCK_TO_DAMAGE', value: 75, target: 'SELF' },
    ],
  },
};

// 모든 유니크 카드 목록
export const UNIQUE_CARDS: Card[] = [
  FINAL_STRIKE,
  INFINITE_VORTEX,
  ABSOLUTE_DEFENSE,
  DIVINE_POWER,
  TIME_WARP,
  SHIELD_HERO,
];
