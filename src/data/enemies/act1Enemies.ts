import { EnemyTemplate, EnemyIntent, Enemy } from '../../types/enemy';
import { Status } from '../../types/status';

// 컬티스트 - 기본 적, 매 턴 힘을 얻으며 공격
export const CULTIST: EnemyTemplate = {
  id: 'cultist',
  name: '컬티스트',
  minHp: 48,
  maxHp: 54,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn === 1) {
      return { type: 'BUFF' };
    }
    return { type: 'ATTACK', damage: 6 };
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
      dealDamageToPlayer(6 + strength);
    }
  },
};

// 턱 벌레 - 방어와 공격을 번갈아 사용
export const JAW_WORM: EnemyTemplate = {
  id: 'jaw_worm',
  name: '턱 벌레',
  minHp: 40,
  maxHp: 44,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn === 1) {
      return { type: 'ATTACK', damage: 11 };
    }
    const pattern = turn % 3;
    if (pattern === 2) {
      return { type: 'DEFEND', block: 6 };
    }
    return { type: 'ATTACK', damage: 11 };
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      dealDamageToPlayer(enemy.intent.damage || 11);
    } else if (enemy.intent.type === 'DEFEND') {
      enemy.block += enemy.intent.block || 6;
      // 힘도 얻음
      const strengthStatus = enemy.statuses.find(s => s.type === 'STRENGTH');
      if (strengthStatus) {
        strengthStatus.stacks += 3;
      } else {
        enemy.statuses.push({ type: 'STRENGTH', stacks: 3 });
      }
    }
  },
};

// 이 - 약한 적
export const LOUSE_RED: EnemyTemplate = {
  id: 'louse_red',
  name: '붉은 이',
  minHp: 10,
  maxHp: 15,
  getNextIntent: (): EnemyIntent => {
    const roll = Math.random();
    if (roll < 0.75) {
      return { type: 'ATTACK', damage: 5 + Math.floor(Math.random() * 3) };
    }
    return { type: 'BUFF' };
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      const strength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
      dealDamageToPlayer((enemy.intent.damage || 6) + strength);
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

export const LOUSE_GREEN: EnemyTemplate = {
  id: 'louse_green',
  name: '녹색 이',
  minHp: 11,
  maxHp: 17,
  getNextIntent: (): EnemyIntent => {
    const roll = Math.random();
    if (roll < 0.75) {
      return { type: 'ATTACK', damage: 5 + Math.floor(Math.random() * 3) };
    }
    return { type: 'DEBUFF' };
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void, applyStatusToPlayer: (status: Status) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      const strength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
      dealDamageToPlayer((enemy.intent.damage || 6) + strength);
    } else if (enemy.intent.type === 'DEBUFF') {
      applyStatusToPlayer({ type: 'WEAK', stacks: 2 });
    }
  },
};

// 슬라임 - 기본 적
export const ACID_SLIME_M: EnemyTemplate = {
  id: 'acid_slime_m',
  name: '산성 슬라임 (중)',
  minHp: 28,
  maxHp: 32,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn % 3 === 1) {
      return { type: 'ATTACK', damage: 7 };
    } else if (turn % 3 === 2) {
      return { type: 'DEBUFF' };
    }
    return { type: 'ATTACK', damage: 7 };
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void, applyStatusToPlayer: (status: Status) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      dealDamageToPlayer(enemy.intent.damage || 7);
    } else if (enemy.intent.type === 'DEBUFF') {
      applyStatusToPlayer({ type: 'WEAK', stacks: 1 });
    }
  },
};

export const SPIKE_SLIME_M: EnemyTemplate = {
  id: 'spike_slime_m',
  name: '가시 슬라임 (중)',
  minHp: 28,
  maxHp: 32,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn % 2 === 1) {
      return { type: 'ATTACK', damage: 8 };
    }
    return { type: 'DEFEND', block: 5 };
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      dealDamageToPlayer(enemy.intent.damage || 8);
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
    if (turn % 3 === 0) {
      return { type: 'ATTACK', damage: 14 };
    }
    return { type: 'ATTACK', damage: 14 };
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void) => {
    if (enemy.intent.type === 'BUFF') {
      // 분노: 힘 +2, 플레이어가 스킬 사용시 힘 +2
      const strengthStatus = enemy.statuses.find(s => s.type === 'STRENGTH');
      if (strengthStatus) {
        strengthStatus.stacks += 2;
      } else {
        enemy.statuses.push({ type: 'STRENGTH', stacks: 2 });
      }
    } else if (enemy.intent.type === 'ATTACK') {
      const strength = enemy.statuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
      dealDamageToPlayer((enemy.intent.damage || 14) + strength);
    }
  },
};

// 보스: 슬라임 보스
export const SLIME_BOSS: EnemyTemplate = {
  id: 'slime_boss',
  name: '슬라임 보스',
  minHp: 140,
  maxHp: 140,
  getNextIntent: (_enemy: Enemy, turn: number): EnemyIntent => {
    if (turn % 3 === 1) {
      return { type: 'ATTACK', damage: 35 };
    } else if (turn % 3 === 2) {
      return { type: 'DEBUFF' };
    }
    return { type: 'ATTACK', damage: 35 };
  },
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void, applyStatusToPlayer: (status: Status) => void) => {
    if (enemy.intent.type === 'ATTACK') {
      dealDamageToPlayer(enemy.intent.damage || 35);
    } else if (enemy.intent.type === 'DEBUFF') {
      applyStatusToPlayer({ type: 'WEAK', stacks: 2 });
      applyStatusToPlayer({ type: 'VULNERABLE', stacks: 2 });
    }
  },
};

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
