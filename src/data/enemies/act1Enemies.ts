import { EnemyTemplate } from '../../types/enemy';

// 고블린 - 힘+3 → 공격 → 공격 (3턴 주기)
export const GOBLIN: EnemyTemplate = {
  id: 'goblin',
  name: '고블린',
  minHp: 32,
  maxHp: 38,
};

// 스켈레톤 - 방어 10 후 공격
export const SKELETON: EnemyTemplate = {
  id: 'skeleton',
  name: '스켈레톤',
  minHp: 40,
  maxHp: 48,
};

// 플라잉아이 - 공격 → 장비파괴 1 (2~3마리 교차 등장)
export const FLYING_EYE: EnemyTemplate = {
  id: 'flying_eye',
  name: '플라잉아이',
  minHp: 15,
  maxHp: 20,
};

// 그린 플라잉아이 - 공격 → 무기손상 1 (2~3마리 교차 등장)
export const GREEN_FLYING_EYE: EnemyTemplate = {
  id: 'green_flying_eye',
  name: '그린 플라잉아이',
  minHp: 16,
  maxHp: 21,
};

// 산성 머쉬룸 - 중독 4 → 공격 패턴
export const ACID_MUSHROOM: EnemyTemplate = {
  id: 'acid_mushroom',
  name: '산성 머쉬룸',
  minHp: 32,
  maxHp: 36,
};

// 머쉬룸 - 공격 → 방어 9 패턴
export const MUSHROOM: EnemyTemplate = {
  id: 'mushroom',
  name: '머쉬룸',
  minHp: 32,
  maxHp: 36,
};

// 엘리트: 이블 위자드 - 힘+4 → 공격 → 언데드화 (3턴 주기)
export const GREMLIN_NOB: EnemyTemplate = {
  id: 'gremlin_nob',
  name: '이블 위자드',
  minHp: 105,
  maxHp: 115,
};

// 보스: 나이트본 - 공격 → 중독 7 → 취약 2 패턴 (3턴 주기)
export const SLIME_BOSS: EnemyTemplate = {
  id: 'slime_boss',
  name: '나이트본',
  minHp: 205,
  maxHp: 210,
};

// ===== 이스터에그 적 =====

// ㄹㅇ턱벌레 - 턱벌레 변형
export const REAL_TUKBUG: EnemyTemplate = {
  id: 'real_tukbug',
  name: 'ㄹㅇ턱벌레',
  minHp: 35,
  maxHp: 40,
};

// 꾸추 - 특별한 적
export const KKUCHU: EnemyTemplate = {
  id: 'kkuchu',
  name: '꾸추',
  minHp: 30,
  maxHp: 35,
};

// 이스터에그 전투 (파추/권혁찬)
export const EASTER_EGG_ENCOUNTER: EnemyTemplate[] = [REAL_TUKBUG, KKUCHU];

// 적 템플릿 목록
export const NORMAL_ENEMIES: EnemyTemplate[] = [
  GOBLIN,
  SKELETON,
  FLYING_EYE,
  GREEN_FLYING_EYE,
  ACID_MUSHROOM,
  MUSHROOM,
];

export const ELITE_ENEMIES: EnemyTemplate[] = [GREMLIN_NOB];

export const BOSS_ENEMIES: EnemyTemplate[] = [SLIME_BOSS];

// 랜덤 일반 적 조합 생성
export function generateNormalEncounter(): EnemyTemplate[] {
  const roll = Math.random();

  if (roll < 0.3) {
    // 단일 적
    return [NORMAL_ENEMIES[Math.floor(Math.random() * NORMAL_ENEMIES.length)]];
  } else if (roll < 0.7) {
    // 2마리
    const enemy1 = NORMAL_ENEMIES[Math.floor(Math.random() * NORMAL_ENEMIES.length)];
    const enemy2 = NORMAL_ENEMIES[Math.floor(Math.random() * NORMAL_ENEMIES.length)];
    return [enemy1, enemy2];
  } else {
    // 3마리 약한 적
    return [FLYING_EYE, GREEN_FLYING_EYE, FLYING_EYE];
  }
}
