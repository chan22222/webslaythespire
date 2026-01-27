// 플레이어 통계 타입 정의

export interface PlayerStats {
  // 적 처치
  totalKills: number;
  mobKills: number;
  eliteKills: number;
  bossKills: number;

  // 카드 사용
  totalCardsPlayed: number;
  attackCardsPlayed: number;
  shieldCardsPlayed: number;
  gadgetCardsPlayed: number;
  effectCardsPlayed: number;
  terrainCardsPlayed: number;

  // 데미지
  totalDamageDealt: number;
  totalDamageTaken: number;

  // 방어 및 버프
  totalBlockGained: number;
  totalStrengthGained: number;
  totalHpLostByCards: number;
  totalHealing: number;

  // 게임 진행
  totalGamesStarted: number;
  totalVictories: number;
  totalDefeats: number;
  highestFloorReached: number;

  // 추가 통계 (업적용)
  totalEnergyUsed: number;      // 총 사용한 에너지
  maxSingleDamage: number;      // 한 번에 입힌 최대 피해
  maxBlockInTurn: number;       // 한 턴에 얻은 최대 방어도
  maxTurnInBattle: number;      // 한 전투에서 최대 턴 수
  maxBlockedDamage: number;     // 한 번에 막은 최대 피해

  // 타임스탬프
  lastUpdated: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: PlayerStats) => boolean;
}

export const createInitialStats = (): PlayerStats => ({
  totalKills: 0,
  mobKills: 0,
  eliteKills: 0,
  bossKills: 0,
  totalCardsPlayed: 0,
  attackCardsPlayed: 0,
  shieldCardsPlayed: 0,
  gadgetCardsPlayed: 0,
  effectCardsPlayed: 0,
  terrainCardsPlayed: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  totalBlockGained: 0,
  totalStrengthGained: 0,
  totalHpLostByCards: 0,
  totalHealing: 0,
  totalGamesStarted: 0,
  totalVictories: 0,
  totalDefeats: 0,
  highestFloorReached: 0,
  totalEnergyUsed: 0,
  maxSingleDamage: 0,
  maxBlockInTurn: 0,
  maxTurnInBattle: 0,
  maxBlockedDamage: 0,
  lastUpdated: Date.now(),
});
