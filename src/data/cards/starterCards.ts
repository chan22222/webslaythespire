import { Card } from '../../types/card';

export const STRIKE: Card = {
  id: 'strike',
  name: '타격',
  type: 'ATTACK',
  rarity: 'BASIC',
  cost: 1,
  description: '6 피해를 줍니다.',
  effects: [{ type: 'DAMAGE', value: 6, target: 'SINGLE' }],
  upgraded: false,
  upgradeEffect: {
    name: '타격+',
    description: '9 피해를 줍니다.',
    effects: [{ type: 'DAMAGE', value: 9, target: 'SINGLE' }],
  },
};

export const DEFEND: Card = {
  id: 'defend',
  name: '수비',
  type: 'SHIELD',
  rarity: 'BASIC',
  cost: 1,
  description: '5 방어도를 얻습니다.',
  effects: [{ type: 'BLOCK', value: 5 }],
  upgraded: false,
  upgradeEffect: {
    name: '수비+',
    description: '8 방어도를 얻습니다.',
    effects: [{ type: 'BLOCK', value: 8 }],
  },
};

export const BASH: Card = {
  id: 'bash',
  name: '강타',
  type: 'ATTACK',
  rarity: 'BASIC',
  cost: 2,
  description: '8 피해를 주고 취약 2를 부여합니다.',
  effects: [
    { type: 'DAMAGE', value: 8, target: 'SINGLE' },
    { type: 'APPLY_STATUS', value: 2, target: 'SINGLE', status: 'VULNERABLE' },
  ],
  upgraded: false,
  upgradeEffect: {
    name: '강타+',
    description: '10 피해를 주고 취약 3을 부여합니다.',
    effects: [
      { type: 'DAMAGE', value: 10, target: 'SINGLE' },
      { type: 'APPLY_STATUS', value: 3, target: 'SINGLE', status: 'VULNERABLE' },
    ],
  },
};

// 시작 덱 생성
export function createStarterDeck(): Card[] {
  return [
    { ...STRIKE },
    { ...STRIKE },
    { ...STRIKE },
    { ...STRIKE },
    { ...STRIKE },
    { ...DEFEND },
    { ...DEFEND },
    { ...DEFEND },
    { ...DEFEND },
    { ...BASH },
  ];
}
