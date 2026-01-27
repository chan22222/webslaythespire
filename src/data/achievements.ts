import { PlayerStats } from '../types/stats';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  hidden: boolean; // 숨김 여부 (???로 표기)
  // 통계 기반 조건 (PlayerStats로 체크)
  condition?: (stats: PlayerStats) => boolean;
  // 특수 조건 (전투 중 체크) - achievementChecker에서 처리
  isSpecialCondition?: boolean;
  // 해금되는 카드 ID
  unlocksCard?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // === UNCOMMON 카드 해금 업적 ===
  {
    id: 'first_death',
    name: '유다희 양과의 첫 만남',
    description: '플레이어 첫 사망 시',
    icon: '💀',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'rage', // 분노
  },
  {
    id: 'block_20_in_turn',
    name: '통곡의 벽 기초공사',
    description: '한턴에 방어도 20 이상 모으기',
    icon: '🧱',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'diamond_body', // 금강불괴
  },
  {
    id: 'damage_with_zero_energy',
    name: '살을 주고 뼈를... 아니 에너지를?',
    description: '에너지를 쓰지 않고 피해 입기',
    icon: '💫',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'life_exchange', // 생명 치환
  },
  {
    id: 'heal_3_times',
    name: '슈퍼 마리오 식단',
    description: '회복 카드 3회 사용',
    icon: '🍄',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'wild_mushroom', // 야생 버섯 섭취
  },
  {
    id: 'kill_10_enemies',
    name: '이 구역의 미친X은 나야',
    description: '적 10마리 처치',
    icon: '😈',
    hidden: false,
    condition: (s) => s.totalKills >= 10,
    unlocksCard: 'desperate_strike', // 결사의 일격
  },
  {
    id: 'weak_and_vulnerable',
    name: '수리비 폭탄',
    description: '무기손상과 장비파괴 동시에 걸려보기',
    icon: '🔧',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'critical_wound', // 치명상
  },
  {
    id: 'cards_100_played',
    name: '밑장 빼기 마스터',
    description: '총 카드 100장 이상 사용',
    icon: '🃏',
    hidden: false,
    condition: (s) => s.totalCardsPlayed >= 100,
    unlocksCard: 'battle_trance', // 전투 트랜스
  },
  {
    id: 'damage_3_enemies',
    name: '당근 무료나눔 마스터',
    description: '적 3마리에게 모두 피해를 1이상 입히기',
    icon: '🥕',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'sweeping', // 휩쓸기
  },

  // === RARE 카드 해금 업적 ===
  {
    id: 'strength_30_total',
    name: '3대 500 달성',
    description: '총 얻은 힘 30',
    icon: '💪',
    hidden: false,
    condition: (s) => s.totalStrengthGained >= 30,
    unlocksCard: 'limit_break', // 한계 돌파
  },
  {
    id: 'block_not_reduced',
    name: '기스도 안 났네',
    description: '방어도가 깎이지 않은 상태로 턴종료',
    icon: '🛡️',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'iron_fortress', // 철벽의 요새
  },
  {
    id: 'exactly_1hp',
    name: '솔직히 쫄깃했죠?',
    description: 'HP를 정확히 1 남기기',
    icon: '💓',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'from_the_edge', // 사선에서
  },
  {
    id: 'attack_cards_5_in_hand',
    name: '극딜 준비 완료',
    description: '패에 공격 카드 5장 이상 만들기',
    icon: '🔥',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'tactical_command', // 전술 지휘
  },
  {
    id: 'elite_with_high_hp',
    name: '접대 게임 수준',
    description: 'HP 90 이상으로 엘리트 몹 잡기',
    icon: '🎯',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'blood_festival', // 피의 축제
  },
  {
    id: 'single_damage_30',
    name: '뼈와 살을 분리해주마',
    description: '한번에 30 이상의 피해 입히기',
    icon: '💀',
    hidden: false,
    condition: (s) => s.maxSingleDamage >= 30,
    unlocksCard: 'full_armament', // 완전 무장
  },
  {
    id: 'kill_with_double_strike',
    name: '오라오라오라오라!',
    description: '연속 베기로 적 처치',
    icon: '⚡',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'quad_strike', // 4연속 베기
  },
  {
    id: 'survive_with_1hp',
    name: '형은 죽지 않아.. 1턴만',
    description: 'HP가 1인 상태로 승리',
    icon: '❤️',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'berserker_ring', // 광전사의 반지
  },
  {
    id: 'wild_mushroom_5_times',
    name: '최선의 방어는 맛있어',
    description: '야생 버섯 섭취 카드 5번 사용',
    icon: '🍄',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'best_defense', // 최선의 방어
  },
  {
    id: 'slash_only_victory',
    name: '평타 깎는 노인',
    description: '베기 카드만 사용해서 승리',
    icon: '⚔️',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'basic_mastery', // 기본기 충실
  },

  // === UNCOMMON 카드 해금 업적 (추가) ===
  {
    id: 'kill_with_sweeping',
    name: '예술은 폭발이다!',
    description: '휩쓸기로 적 처치',
    icon: '💥',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'oil_drum', // 기름통
  },
  {
    id: 'block_20_damage',
    name: '다이아는 부서지지 않는다.',
    description: '20이상의 피해를 막아내기',
    icon: '💎',
    hidden: false,
    condition: (s) => s.maxBlockedDamage >= 20,
    unlocksCard: 'diamond_shield', // 다이아몬드 방패
  },
  {
    id: 'kill_with_assault_shield',
    name: '니가 왜 아파해?',
    description: '강습 방패로 적 처치',
    icon: '🛡️',
    hidden: false,
    isSpecialCondition: true,
    unlocksCard: 'needle_armor', // 바늘 갑옷
  },

  // === UNIQUE 카드 해금 업적 (숨김) ===
  {
    id: 'cards_300_played',
    name: '카드가 마르지 않아',
    description: '총 카드를 300장 이상 사용',
    icon: '🎴',
    hidden: true,
    condition: (s) => s.totalCardsPlayed >= 300,
    unlocksCard: 'final_strike', // 종언의 일격
  },
  {
    id: 'energy_500_used',
    name: '백만 스물 하나, 백만 스물 둘',
    description: '총 사용한 에너지 500 이상',
    icon: '⚡',
    hidden: true,
    condition: (s) => s.totalEnergyUsed >= 500,
    unlocksCard: 'infinite_vortex', // 무한의 소용돌이
  },
  {
    id: 'block_1500_total',
    name: 'AT 필드 전개',
    description: '총 쌓은 방어도 1500',
    icon: '🔮',
    hidden: true,
    condition: (s) => s.totalBlockGained >= 1500,
    unlocksCard: 'absolute_defense', // 절대 방어 영역
  },
  {
    id: 'boss_kills_10',
    name: '사장님 면담 10회차',
    description: '처치한 보스 몹 수 10',
    icon: '👔',
    hidden: true,
    condition: (s) => s.bossKills >= 10,
    unlocksCard: 'gods_power', // 신의 권능
  },
  {
    id: 'turn_25_in_battle',
    name: '도르마무, 거래를 하러 왔다',
    description: '전투에서 25턴 진입',
    icon: '⏰',
    hidden: true,
    condition: (s) => s.maxTurnInBattle >= 25,
    unlocksCard: 'time_warp', // 시간 왜곡
  },
  {
    id: 'no_attack_victory',
    name: '공격 카드 팝니다. (미사용품)',
    description: '공격 카드를 쓰지 않고 승리',
    icon: '🕊️',
    hidden: true,
    isSpecialCondition: true,
    unlocksCard: 'shield_hero', // 방패 용사 성공담
  },
];

// 업적 체크 함수 (통계 기반)
export const checkAchievements = (stats: PlayerStats, unlockedIds: string[]): string[] => {
  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.includes(achievement.id) && achievement.condition && achievement.condition(stats)) {
      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
};

// ID로 업적 찾기
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

// 카드 ID로 해금 업적 찾기
export const getAchievementByCardId = (cardId: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.unlocksCard === cardId);
};

// 업적이 해금되었는지 확인
export const isAchievementUnlocked = (achievementId: string, unlockedIds: string[]): boolean => {
  return unlockedIds.includes(achievementId);
};

// 카드가 해금되었는지 확인
export const isCardUnlocked = (cardId: string, unlockedIds: string[]): boolean => {
  const achievement = getAchievementByCardId(cardId);
  if (!achievement) return true; // 업적이 없으면 기본 해금
  return unlockedIds.includes(achievement.id);
};
