import { CardInstance } from './card';
import { EnemyInstance } from './enemy';

export type TerrainType =
  | 'toxic_swamp'      // 독성 늪지대
  | 'lava_zone'        // 용암 지대
  | 'sacred_ground'    // 신성한 구역
  | 'gladiator_arena'  // 검투사의 경기장
  | 'zero_gravity'     // 무중력 공간
  | 'thunder_wasteland' // 벼락치는 황야
  | 'ancient_library'  // 고대 도서관
  | null;

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
  activeTerrain: TerrainType; // 활성화된 지형
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
  activeTerrain: null,
});
