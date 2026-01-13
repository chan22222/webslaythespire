export type CardType = 'ATTACK' | 'SHIELD' | 'SKILL' | 'EFFECT' | 'GADGET' | 'TERRAIN';
export type CardRarity = 'BASIC' | 'COMMON' | 'UNCOMMON' | 'RARE' | 'BOSS';
export type TargetType = 'SINGLE' | 'ALL' | 'SELF' | 'RANDOM';
export type StatusType = 'VULNERABLE' | 'WEAK' | 'STRENGTH' | 'DEXTERITY' | 'POISON' | 'BLOCK_NEXT_TURN' | 'METALLICIZE' | 'STRENGTH_DOWN';

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
    | 'DAMAGE_PER_EXHAUST'
    | 'RETURN_PLAYED_CARDS'
    | 'INVULNERABLE'
    | 'HALVE_ENEMY_HP'
    | 'EXTRA_TURN';
  value: number;
  target?: TargetType;
  status?: StatusType;
  ratio?: number; // 사선에서 카드용 (잃은 HP 비율)
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
}

export interface CardInstance extends Card {
  instanceId: string;
}

export function createCardInstance(card: Card): CardInstance {
  return {
    ...card,
    instanceId: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}
