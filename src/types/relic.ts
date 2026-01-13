export type RelicRarity = 'STARTER' | 'COMMON' | 'UNCOMMON' | 'RARE' | 'UNIQUE' | 'SHOP';

export type RelicTrigger =
  | 'ON_COMBAT_START'
  | 'ON_COMBAT_END'
  | 'ON_TURN_START'
  | 'ON_TURN_END'
  | 'ON_CARD_PLAY'
  | 'ON_DAMAGE_DEALT'
  | 'ON_DAMAGE_TAKEN'
  | 'ON_REST'
  | 'PASSIVE';

export interface RelicEffect {
  trigger: RelicTrigger;
  description: string;
  execute: (context: RelicContext) => void;
}

export interface RelicContext {
  heal?: (amount: number) => void;
  gainGold?: (amount: number) => void;
  gainEnergy?: (amount: number) => void;
  drawCards?: (amount: number) => void;
  gainStrength?: (amount: number) => void;
  gainDexterity?: (amount: number) => void;
  gainBlock?: (amount: number) => void;
  damagePlayer?: (amount: number) => void;
  damageDealt?: number;
  damageTaken?: number;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  rarity: RelicRarity;
  effects: RelicEffect[];
  counter?: number; // 일부 유물은 카운터가 필요
}
