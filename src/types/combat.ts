import { CardInstance } from './card';
import { EnemyInstance } from './enemy';

export interface CombatState {
  enemies: EnemyInstance[];
  drawPile: CardInstance[];
  hand: CardInstance[];
  discardPile: CardInstance[];
  exhaustPile: CardInstance[];
  energy: number;
  maxEnergy: number;
  turn: number;
  isPlayerTurn: boolean;
  selectedCardId: string | null;
  targetingMode: boolean;
  combatLog: string[];
  extraDrawNextTurn: number;
  usedCardTypes: string[]; // 이번 전투에서 사용한 카드 종류 (id)
}

export const createInitialCombatState = (): CombatState => ({
  enemies: [],
  drawPile: [],
  hand: [],
  discardPile: [],
  exhaustPile: [],
  energy: 3,
  maxEnergy: 3,
  turn: 1,
  isPlayerTurn: true,
  selectedCardId: null,
  targetingMode: false,
  combatLog: [],
  extraDrawNextTurn: 0,
  usedCardTypes: [],
});
