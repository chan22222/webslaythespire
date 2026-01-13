import { Status, StatusType } from './status';

export type EnemyIntentType = 'ATTACK' | 'DEFEND' | 'BUFF' | 'DEBUFF' | 'UNKNOWN';

export interface EnemyIntent {
  type: EnemyIntentType;
  damage?: number;
  hits?: number;
  block?: number;
  // 버프/디버프 상세 정보
  statusType?: StatusType;
  statusStacks?: number;
}

export interface EnemyAction {
  weight: number;
  intent: EnemyIntent;
  execute: () => void;
}

export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  block: number;
  statuses: Status[];
  intent: EnemyIntent;
  imageUrl?: string;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  minHp: number;
  maxHp: number;
  getNextIntent: (enemy: Enemy, turn: number) => EnemyIntent;
  executeIntent: (enemy: Enemy, dealDamageToPlayer: (damage: number) => void, applyStatusToPlayer: (status: Status) => void) => void;
}

export interface EnemyInstance extends Enemy {
  instanceId: string;
  templateId: string;
}

export function createEnemyInstance(template: EnemyTemplate): EnemyInstance {
  const hp = Math.floor(Math.random() * (template.maxHp - template.minHp + 1)) + template.minHp;
  return {
    id: template.id,
    instanceId: `${template.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    templateId: template.id,
    name: template.name,
    maxHp: hp,
    currentHp: hp,
    block: 0,
    statuses: [],
    intent: { type: 'UNKNOWN' },
  };
}
