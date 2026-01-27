export type CardType = 'ATTACK' | 'SHIELD' | 'EFFECT' | 'GADGET' | 'TERRAIN';
export type CardRarity = 'BASIC' | 'COMMON' | 'UNCOMMON' | 'RARE' | 'UNIQUE';
export type TargetType = 'SINGLE' | 'ALL' | 'SELF' | 'RANDOM';
export type StatusType = 'VULNERABLE' | 'WEAK' | 'STRENGTH' | 'DEXTERITY' | 'POISON' | 'BLOCK_NEXT_TURN' | 'METALLICIZE' | 'STRENGTH_DOWN' | 'BLOCK_RETAIN' | 'INVULNERABLE' | 'HEAL_REDUCTION' | 'UNDEAD';

export interface CardEffect {
  type:
    | 'DAMAGE'
    | 'BLOCK'
    | 'DRAW'
    | 'APPLY_STATUS'
    | 'GAIN_ENERGY'
    | 'HEAL'
    | 'LOSE_HP'
    | 'UPGRADE_HAND'
    | 'UPGRADE_ALL_HAND'
    // RARE 효과
    | 'MULTIPLY_STRENGTH'
    | 'BLOCK_RETAIN'
    | 'DAMAGE_PER_LOST_HP'
    | 'REDUCE_ATTACK_COST'
    | 'GAIN_MAX_HP_ON_KILL'
    // BOSS 효과
    | 'DAMAGE_PER_PLAYED'
    | 'RETURN_PLAYED_CARDS'
    | 'INVULNERABLE'
    | 'HALVE_ENEMY_HP'
    | 'EXTRA_TURN'
    | 'CONSUME_ENERGY_DRAW' // 에너지 소비해서 카드 드로우
    | 'RANDOM_HEAL'; // 랜덤 범위 HP 회복/손실
  value: number;
  target?: TargetType;
  status?: StatusType;
  ratio?: number; // 사선에서 카드용 (잃은 HP 비율)
  maxConsume?: number; // CONSUME_ENERGY_DRAW용 최대 소비 에너지
  min?: number; // RANDOM_HEAL용 최소값
  critChance?: number; // RANDOM_HEAL용 크리티컬 확률 (0~1)
  critDamage?: number; // RANDOM_HEAL용 크리티컬 시 HP 손실량
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  description: string;
  effects: CardEffect[];
  upgraded: boolean;
  upgradeEffect?: Partial<Card>;
  image?: string;
  exhaust?: boolean; // 소멸
  returnToHand?: boolean; // 사용 후 손으로
  unique?: boolean; // 게임에서 한 장만 등장
}

export interface CardInstance extends Card {
  instanceId: string;
  originalCost: number; // 코스트 감소 복구용
}

export function createCardInstance(card: Card): CardInstance {
  return {
    ...card,
    instanceId: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    originalCost: card.cost,
  };
}
