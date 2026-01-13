import { Card } from '../../types/card';

export const FINAL_STRIKE: Card = {
  id: 'final_strike',
  name: '종언의 일격',
  type: 'ATTACK',
  rarity: 'BOSS',
  cost: 3,
  description: '모든 적에게 이번 전투에서 소멸된 카드 한 장당 피해를 5 줍니다.',
  effects: [{ type: 'DAMAGE_PER_EXHAUST', value: 5, target: 'ALL' }],
  upgraded: false,
  upgradeEffect: {
    name: '종언의 일격+',
    description: '모든 적에게 이번 전투에서 소멸된 카드 한 장당 피해를 7 줍니다.',
    effects: [{ type: 'DAMAGE_PER_EXHAUST', value: 7, target: 'ALL' }],
  },
};

export const INFINITE_VORTEX: Card = {
  id: 'infinite_vortex',
  name: '무한의 소용돌이',
  type: 'EFFECT',
  rarity: 'BOSS',
  cost: 1,
  description: '이번 턴에 사용한 카드 5장을 다시 손으로 가져옵니다.',
  effects: [{ type: 'RETURN_PLAYED_CARDS', value: 5 }],
  upgraded: false,
  upgradeEffect: {
    name: '무한의 소용돌이+',
    description: '이번 턴에 사용한 카드 8장을 다시 손으로 가져옵니다.',
    effects: [{ type: 'RETURN_PLAYED_CARDS', value: 8 }],
  },
};

export const ABSOLUTE_DEFENSE: Card = {
  id: 'absolute_defense',
  name: '절대 방어 영역',
  type: 'SHIELD',
  rarity: 'BOSS',
  cost: 3,
  description: '2턴 동안 플레이어가 입는 모든 피해를 무효화합니다.',
  effects: [{ type: 'INVULNERABLE', value: 2, target: 'SELF' }],
  upgraded: false,
  upgradeEffect: {
    name: '절대 방어 영역+',
    description: '3턴 동안 플레이어가 입는 모든 피해를 무효화합니다.',
    effects: [{ type: 'INVULNERABLE', value: 3, target: 'SELF' }],
  },
};

export const DIVINE_POWER: Card = {
  id: 'divine_power',
  name: '신의 권능',
  type: 'ATTACK',
  rarity: 'BOSS',
  cost: 4,
  description: '적의 현재 체력을 절반으로 줄입니다. (최대 100)',
  effects: [{ type: 'HALVE_ENEMY_HP', value: 100, target: 'SINGLE' }],
  upgraded: false,
  upgradeEffect: {
    name: '신의 권능+',
    description: '적의 현재 체력을 절반으로 줄입니다. (최대 150)',
    effects: [{ type: 'HALVE_ENEMY_HP', value: 150, target: 'SINGLE' }],
  },
};

export const TIME_WARP: Card = {
  id: 'time_warp',
  name: '시간 왜곡',
  type: 'EFFECT',
  rarity: 'BOSS',
  cost: 3,
  description: '턴을 종료하고, 즉시 자신의 턴을 다시 시작합니다.',
  effects: [{ type: 'EXTRA_TURN', value: 0 }],
  upgraded: false,
  upgradeEffect: {
    name: '시간 왜곡+',
    description: '턴을 종료하고, 즉시 자신의 턴을 다시 시작하며 2에너지를 추가로 얻습니다.',
    effects: [
      { type: 'EXTRA_TURN', value: 0 },
      { type: 'GAIN_ENERGY', value: 2 },
    ],
  },
};

// 모든 보스 카드 목록
export const BOSS_CARDS: Card[] = [
  FINAL_STRIKE,
  INFINITE_VORTEX,
  ABSOLUTE_DEFENSE,
  DIVINE_POWER,
  TIME_WARP,
];
