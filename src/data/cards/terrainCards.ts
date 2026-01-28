import { Card } from '../../types/card';

export const TOXIC_SWAMP: Card = {
  id: 'toxic_swamp',
  name: '독성 늪지대',
  type: 'TERRAIN',
  rarity: 'RARE',
  cost: 1,
  image: '/cards/effect/독늪지대.png',
  description: '턴 종료 시 모든 캐릭터는 중독 2를 얻습니다. 야생 버섯의 독에 면역이 됩니다. 소멸.',
  effects: [{ type: 'TERRAIN_TOXIC_SWAMP', value: 2 }],
  exhaust: true,
  upgraded: false,
};

export const LAVA_ZONE: Card = {
  id: 'lava_zone',
  name: '용암 지대',
  type: 'TERRAIN',
  rarity: 'RARE',
  cost: 1,
  image: '/cards/effect/용암.png',
  description: '턴 종료 시 모든 캐릭터는 데미지 3을 입습니다. 기름통이 강화 됩니다. 소멸.',
  effects: [{ type: 'TERRAIN_LAVA_ZONE', value: 3 }],
  exhaust: true,
  upgraded: false,
};

export const SACRED_GROUND: Card = {
  id: 'sacred_ground',
  name: '신성한 구역',
  type: 'TERRAIN',
  rarity: 'RARE',
  cost: 3,
  image: '/cards/effect/신성.png',
  description: '모든 캐릭터가 받는 모든 방어도가 2배가 됩니다. 소멸.',
  effects: [{ type: 'TERRAIN_SACRED_GROUND', value: 2 }],
  exhaust: true,
  upgraded: false,
};

export const GLADIATOR_ARENA: Card = {
  id: 'gladiator_arena',
  name: '검투사의 경기장',
  type: 'TERRAIN',
  rarity: 'RARE',
  cost: 2,
  image: '/cards/effect/검투사.png',
  description: '모든 캐릭터가 주는 피해가 50% 증가하고, 방어도를 얻을 수 없습니다. 소멸.',
  effects: [{ type: 'TERRAIN_GLADIATOR_ARENA', value: 50 }],
  exhaust: true,
  upgraded: false,
};

export const ZERO_GRAVITY: Card = {
  id: 'zero_gravity',
  name: '무중력 공간',
  type: 'TERRAIN',
  rarity: 'RARE',
  cost: 3,
  image: '/cards/effect/무중력.png',
  description: '모든 카드의 코스트가 무작위(0~3)으로 변합니다. 소멸.',
  effects: [{ type: 'TERRAIN_ZERO_GRAVITY', value: 3 }],
  exhaust: true,
  upgraded: false,
};

export const THUNDER_WASTELAND: Card = {
  id: 'thunder_wasteland',
  name: '벼락치는 황야',
  type: 'TERRAIN',
  rarity: 'RARE',
  cost: 2,
  image: '/cards/effect/벼락.png',
  description: '매 턴 종료 시, 무작위 대상에게 3의 낙뢰 피해를 5번 입힙니다. 소멸.',
  effects: [{ type: 'TERRAIN_THUNDER_WASTELAND', value: 3, target: 'RANDOM' }],
  exhaust: true,
  upgraded: false,
};

export const ANCIENT_LIBRARY: Card = {
  id: 'ancient_library',
  name: '고대 도서관',
  type: 'TERRAIN',
  rarity: 'RARE',
  cost: 3,
  image: '/cards/effect/도서관.png',
  description: "카드를 뽑을 때마다 무작위 피해를 1 입히며, 힘은 절반만 적용됩니다. 카드가 소멸되지 않습니다. 소멸.",
  effects: [{ type: 'TERRAIN_ANCIENT_LIBRARY', value: 1 }],
  exhaust: true,
  upgraded: false,
};

// 모든 지형 카드 목록
export const TERRAIN_CARDS: Card[] = [
  TOXIC_SWAMP,
  LAVA_ZONE,
  SACRED_GROUND,
  GLADIATOR_ARENA,
  ZERO_GRAVITY,
  THUNDER_WASTELAND,
  ANCIENT_LIBRARY,
];
