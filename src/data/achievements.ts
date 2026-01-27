import { Achievement, PlayerStats } from '../types/stats';

export const ACHIEVEMENTS: Achievement[] = [
  // 처치 관련
  {
    id: 'first_blood',
    name: '첫 피',
    description: '첫 적을 처치하세요',
    icon: '🩸',
    condition: (s: PlayerStats) => s.totalKills >= 1,
  },
  {
    id: 'hunter_10',
    name: '사냥꾼',
    description: '적 10마리 처치',
    icon: '🗡️',
    condition: (s: PlayerStats) => s.totalKills >= 10,
  },
  {
    id: 'hunter_100',
    name: '베테랑 사냥꾼',
    description: '적 100마리 처치',
    icon: '⚔️',
    condition: (s: PlayerStats) => s.totalKills >= 100,
  },
  {
    id: 'elite_hunter',
    name: '정예 사냥꾼',
    description: '엘리트 10마리 처치',
    icon: '💀',
    condition: (s: PlayerStats) => s.eliteKills >= 10,
  },
  {
    id: 'boss_slayer',
    name: '보스 슬레이어',
    description: '보스 5마리 처치',
    icon: '👿',
    condition: (s: PlayerStats) => s.bossKills >= 5,
  },

  // 카드 관련
  {
    id: 'card_user',
    name: '카드 유저',
    description: '카드 100장 사용',
    icon: '🃏',
    condition: (s: PlayerStats) => s.totalCardsPlayed >= 100,
  },
  {
    id: 'card_master',
    name: '카드 마스터',
    description: '카드 1000장 사용',
    icon: '🎴',
    condition: (s: PlayerStats) => s.totalCardsPlayed >= 1000,
  },
  {
    id: 'attack_specialist',
    name: '공격 전문가',
    description: '공격 카드 500장 사용',
    icon: '🔥',
    condition: (s: PlayerStats) => s.attackCardsPlayed >= 500,
  },
  {
    id: 'defense_specialist',
    name: '방어 전문가',
    description: '방어 카드 500장 사용',
    icon: '🛡️',
    condition: (s: PlayerStats) => s.shieldCardsPlayed >= 500,
  },

  // 데미지 관련
  {
    id: 'damage_dealer',
    name: '데미지 딜러',
    description: '총 10,000 데미지 입힘',
    icon: '💥',
    condition: (s: PlayerStats) => s.totalDamageDealt >= 10000,
  },
  {
    id: 'damage_master',
    name: '파괴자',
    description: '총 100,000 데미지 입힘',
    icon: '☄️',
    condition: (s: PlayerStats) => s.totalDamageDealt >= 100000,
  },

  // 방어 관련
  {
    id: 'iron_wall',
    name: '철벽',
    description: '총 방어도 5,000 획득',
    icon: '🏰',
    condition: (s: PlayerStats) => s.totalBlockGained >= 5000,
  },
  {
    id: 'fortress',
    name: '요새',
    description: '총 방어도 50,000 획득',
    icon: '🏯',
    condition: (s: PlayerStats) => s.totalBlockGained >= 50000,
  },

  // 힘 관련
  {
    id: 'strong',
    name: '강해짐',
    description: '총 힘 100 획득',
    icon: '💪',
    condition: (s: PlayerStats) => s.totalStrengthGained >= 100,
  },
  {
    id: 'power_overwhelming',
    name: '압도적인 힘',
    description: '총 힘 500 획득',
    icon: '🦾',
    condition: (s: PlayerStats) => s.totalStrengthGained >= 500,
  },

  // HP 손실 관련
  {
    id: 'blood_pact',
    name: '피의 계약',
    description: 'HP 손실 카드로 총 500 HP 소모',
    icon: '💔',
    condition: (s: PlayerStats) => s.totalHpLostByCards >= 500,
  },
  {
    id: 'masochist',
    name: '고통의 대가',
    description: 'HP 손실 카드로 총 2,000 HP 소모',
    icon: '🩹',
    condition: (s: PlayerStats) => s.totalHpLostByCards >= 2000,
  },

  // 회복 관련
  {
    id: 'healer',
    name: '치유사',
    description: '총 1,000 HP 회복',
    icon: '💚',
    condition: (s: PlayerStats) => s.totalHealing >= 1000,
  },

  // 게임 진행 관련
  {
    id: 'first_victory',
    name: '첫 승리',
    description: '게임을 클리어하세요',
    icon: '🏆',
    condition: (s: PlayerStats) => s.totalVictories >= 1,
  },
  {
    id: 'veteran',
    name: '베테랑',
    description: '5번 클리어',
    icon: '🎖️',
    condition: (s: PlayerStats) => s.totalVictories >= 5,
  },
  {
    id: 'floor_climber',
    name: '층 정복자',
    description: '15층 도달',
    icon: '🏔️',
    condition: (s: PlayerStats) => s.highestFloorReached >= 15,
  },
  {
    id: 'adventurer',
    name: '모험가',
    description: '10번 게임 시작',
    icon: '🎮',
    condition: (s: PlayerStats) => s.totalGamesStarted >= 10,
  },

  // 생존 관련
  {
    id: 'survivor',
    name: '생존자',
    description: '총 5,000 데미지 받고 생존',
    icon: '❤️‍🩹',
    condition: (s: PlayerStats) => s.totalDamageTaken >= 5000,
  },
];

// 업적 체크 함수
export const checkAchievements = (stats: PlayerStats, unlockedIds: string[]): string[] => {
  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.includes(achievement.id) && achievement.condition(stats)) {
      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
};

// ID로 업적 찾기
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};
