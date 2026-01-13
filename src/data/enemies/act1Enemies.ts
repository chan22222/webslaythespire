import { EnemyTemplate, EnemyIntent, Enemy } from '../../types/enemy';
import { Status } from '../../types/status';

// 컬티스트 - 기본 적, 매 턴 힘을 얻으며 공격
export const CULTIST: EnemyTemplate = {
  id: 'cultist',
  name: '컬티스트',
  minHp: 28,
  maxHp: 34,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn === 1) {
      return { type: 'BUFF' };
    }
    return { type: 'ATTACK', damage: 9 + Math.floor(Math.random() * 3) }; // 9-11
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void) => {
    if (enemy.intent.type === 'BUFF') {
      // 의식: 힘 +3
      const strengthStatus = enemy.statuses.find(s => s.type === 'STRENGTH');
      if (strengthStatus) {
        strengthStatus.stacks += 3;
      } else {
        enemy.statuses.push({ type: 'STRENGTH', stacks: 3 });
      }
    } else if (enemy.intent.type === 'ATTACK') {
      const strength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
      dealDamageToPlayer((enemy.intent.damage || 10) + strength);
    }
  },
};

// 턱 벌레 - 방어와 공격을 번갈아 사용
export const JAW_WORM: EnemyTemplate = {
  id: 'jaw_worm',
  name: '턱 벌레',
  minHp: 34,
  maxHp: 38,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn % 2 === 1) {
      return { type: 'DEFEND', block: 7 };
    }
    return { type: 'ATTACK', damage: 7 + Math.floor(Math.random() * 5) }; // 7-11
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      const strength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
      dealDamageToPlayer((enemy.intent.damage || 9) + strength);
    } else if (enemy.intent.type === 'DEFEND') {
      enemy.block += enemy.intent.block || 7;
    }
  },
};

// 붉은 이 - 약한 적
export const LOUSE_RED: EnemyTemplate = {
  id: 'louse_red',
  name: '붉은 이',
  minHp: 10,
  maxHp: 15,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn % 2 === 1) {
      return { type: 'ATTACK', damage: 4 + Math.floor(Math.random() * 3) }; // 4-6
    }
    return { type: 'BUFF' };
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      const strength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
      dealDamageToPlayer((enemy.intent.damage || 5) + strength);
    } else if (enemy.intent.type === 'BUFF') {
      const strengthStatus = enemy.statuses.find(s => s.type === 'STRENGTH');
      if (strengthStatus) {
        strengthStatus.stacks += 3;
      } else {
        enemy.statuses.push({ type: 'STRENGTH', stacks: 3 });
      }
    }
  },
};

// 녹색 이 - 공격 → 약화 → 공격 패턴
export const LOUSE_GREEN: EnemyTemplate = {
  id: 'louse_green',
  name: '녹색 이',
  minHp: 11,
  maxHp: 17,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    const pattern = turn % 3;
    if (pattern === 1) {
      return { type: 'ATTACK', damage: 4 + Math.floor(Math.random() * 3) }; // 4-6
    } else if (pattern === 2) {
      return { type: 'DEBUFF' };
    }
    return { type: 'ATTACK', damage: 4 + Math.floor(Math.random() * 3) }; // 4-6
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void, applyStatusToPlayer: (status: Status) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      const strength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
      dealDamageToPlayer((enemy.intent.damage || 5) + strength);
    } else if (enemy.intent.type === 'DEBUFF') {
      applyStatusToPlayer({ type: 'WEAK', stacks: 1 });
    }
  },
};

// 산성 슬라임 - 중독 → 공격 패턴
export const ACID_SLIME_M: EnemyTemplate = {
  id: 'acid_slime_m',
  name: '산성 슬라임 (중)',
  minHp: 28,
  maxHp: 32,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn % 2 === 1) {
      return { type: 'DEBUFF' }; // 중독
    }
    return { type: 'ATTACK', damage: 10 + Math.floor(Math.random() * 3) }; // 10-12
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void, applyStatusToPlayer: (status: Status) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      dealDamageToPlayer(enemy.intent.damage || 11);
    } else if (enemy.intent.type === 'DEBUFF') {
      applyStatusToPlayer({ type: 'POISON', stacks: 5 });
    }
  },
};

// 가시 슬라임 - 공격 → 방어 패턴
export const SPIKE_SLIME_M: EnemyTemplate = {
  id: 'spike_slime_m',
  name: '가시 슬라임 (중)',
  minHp: 28,
  maxHp: 32,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn % 2 === 1) {
      return { type: 'ATTACK', damage: 9 + Math.floor(Math.random() * 3) }; // 9-11
    }
    return { type: 'DEFEND', block: 5 };
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      dealDamageToPlayer(enemy.intent.damage || 10);
    } else if (enemy.intent.type === 'DEFEND') {
      enemy.block += enemy.intent.block || 5;
    }
  },
};

// 엘리트: 고위 노블레스
export const GREMLIN_NOB: EnemyTemplate = {
  id: 'gremlin_nob',
  name: '고위 노블레스',
  minHp: 82,
  maxHp: 86,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn === 1) {
      return { type: 'BUFF' };
    }
    return { type: 'ATTACK', damage: 13 + Math.floor(Math.random() * 3) }; // 13-15
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void) => {
    if (enemy.intent.type === 'BUFF') {
      // 분노: 힘 +5
      const strengthStatus = enemy.statuses.find(s => s.type === 'STRENGTH');
      if (strengthStatus) {
        strengthStatus.stacks += 5;
      } else {
        enemy.statuses.push({ type: 'STRENGTH', stacks: 5 });
      }
    } else if (enemy.intent.type === 'ATTACK') {
      const strength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
      dealDamageToPlayer((enemy.intent.damage || 14) + strength);
    }
  },
};

// 보스: 슬라임 보스 - 공격 → 중독 5 → 취약 2 패턴 (3턴 주기)
export const SLIME_BOSS: EnemyTemplate = {
  id: 'slime_boss',
  name: '슬라임 보스',
  minHp: 140,
  maxHp: 150,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    const pattern = turn % 3;
    if (pattern === 1) {
      return { type: 'ATTACK', damage: 25 + Math.floor(Math.random() * 6) }; // 25-30
    } else if (pattern === 2) {
      return { type: 'DEBUFF', statusType: 'POISON', statusStacks: 7 }; // 중독 7
    }
    return { type: 'DEBUFF', statusType: 'VULNERABLE', statusStacks: 2 }; // 취약 2
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void, applyStatusToPlayer: (status: Status) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      dealDamageToPlayer(enemy.intent.damage || 27);
    } else if (enemy.intent.type === 'DEBUFF') {
      const statusType = enemy.intent.statusType || 'POISON';
      const stacks = enemy.intent.statusStacks || 7;
      applyStatusToPlayer({ type: statusType, stacks });
    }
  },
};

// ===== 이스터에그 적 =====

// ㄹㅇ턱벌레 - 턱벌레 변형
export const REAL_TUKBUG: EnemyTemplate = {
  id: 'real_tukbug',
  name: 'ㄹㅇ턱벌레',
  minHp: 35,
  maxHp: 40,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn === 1) {
      return { type: 'ATTACK', damage: 8 };
    }
    const pattern = turn % 3;
    if (pattern === 2) {
      return { type: 'DEFEND', block: 5 };
    }
    return { type: 'ATTACK', damage: 8 };
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      dealDamageToPlayer(enemy.intent.damage || 8);
    } else if (enemy.intent.type === 'DEFEND') {
      enemy.block += enemy.intent.block || 5;
      const strengthStatus = enemy.statuses.find(s => s.type === 'STRENGTH');
      if (strengthStatus) {
        strengthStatus.stacks += 2;
      } else {
        enemy.statuses.push({ type: 'STRENGTH', stacks: 2 });
      }
    }
  },
};

// 꾸추 - 특별한 적
export const KKUCHU: EnemyTemplate = {
  id: 'kkuchu',
  name: '꾸추',
  minHp: 30,
  maxHp: 35,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn === 1) {
      return { type: 'BUFF' };
    }
    if (turn % 2 === 0) {
      return { type: 'DEBUFF' };
    }
    return { type: 'ATTACK', damage: 7 };
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void, applyStatusToPlayer: (status: Status) => void) => {
    if (enemy.intent.type === 'BUFF') {
      const strengthStatus = enemy.statuses.find(s => s.type === 'STRENGTH');
      if (strengthStatus) {
        strengthStatus.stacks += 2;
      } else {
        enemy.statuses.push({ type: 'STRENGTH', stacks: 2 });
      }
    } else if (enemy.intent.type === 'ATTACK') {
      const strength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
      dealDamageToPlayer((enemy.intent.damage || 7) + strength);
    } else if (enemy.intent.type === 'DEBUFF') {
      applyStatusToPlayer({ type: 'WEAK', stacks: 1 });
    }
  },
};

// 이스터에그 전투 (파추/권혁찬)
export const EASTER_EGG_ENCOUNTER: EnemyTemplate[] = [REAL_TUKBUG, KKUCHU];

// 적 템플릿 목록
export const NORMAL_ENEMIES: EnemyTemplate[] = [
  CULTIST,
  JAW_WORM,
  LOUSE_RED,
  LOUSE_GREEN,
  ACID_SLIME_M,
  SPIKE_SLIME_M,
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
    return [LOUSE_RED, LOUSE_GREEN, LOUSE_RED];
  }
}
