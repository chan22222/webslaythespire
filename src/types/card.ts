export type CardType = 'ATTACK' | 'SHIELD' | 'GADGET' | 'EFFECT' | 'TERRAIN';
export type CardRarity = 'BASIC' | 'COMMON' | 'UNCOMMON' | 'RARE';
export type TargetType = 'SINGLE' | 'ALL' | 'SELF' | 'RANDOM';
export type StatusType = 'VULNERABLE' | 'WEAK' | 'STRENGTH' | 'DEXTERITY' | 'POISON' | 'BLOCK_NEXT_TURN' | 'METALLICIZE';

export interface CardEffect {
  type: 'DAMAGE' | 'BLOCK' | 'DRAW' | 'APPLY_STATUS' | 'GAIN_ENERGY' | 'HEAL' | 'LOSE_HP' | 'UPGRADE_HAND' | 'UPGRADE_ALL_HAND';
  value: number;
  target?: TargetType;
  status?: StatusType;
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
