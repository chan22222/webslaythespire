import { StatusType } from './card';
export type { StatusType };

export interface Status {
  type: StatusType;
  stacks: number;
  duration?: number; // undefined = 영구, 숫자 = 턴 후 사라짐
}

export const STATUS_INFO: Record<StatusType, { name: string; description: string; isDebuff: boolean }> = {
  VULNERABLE: {
    name: '장비파괴',
    description: '받는 피해가 50% 증가합니다.',
    isDebuff: true,
  },
  WEAK: {
    name: '무기손상',
    description: '주는 피해가 25% 감소합니다.',
    isDebuff: true,
  },
  STRENGTH: {
    name: '힘',
    description: '공격 피해가 증가합니다.',
    isDebuff: false,
  },
  DEXTERITY: {
    name: '민첩',
    description: '방어력 획득이 증가합니다.',
    isDebuff: false,
  },
  POISON: {
    name: '중독',
    description: '턴 시작 시 중독 수치만큼 피해를 받고 1 감소합니다.',
    isDebuff: true,
  },
  BLOCK_NEXT_TURN: {
    name: '다음 턴 방어',
    description: '다음 턴 시작 시 방어력을 얻습니다.',
    isDebuff: false,
  },
  METALLICIZE: {
    name: '금속화',
    description: '매 턴 종료 시 방어도를 얻습니다.',
    isDebuff: false,
  },
  STRENGTH_DOWN: {
    name: '힘 감소',
    description: '턴 종료 시 힘이 감소합니다.',
    isDebuff: true,
  },
  BLOCK_RETAIN: {
    name: '방어도 유지',
    description: '방어도가 턴 종료 시 사라지지 않습니다.',
    isDebuff: false,
  },
  INVULNERABLE: {
    name: '무적',
    description: '모든 피해를 받지 않습니다.',
    isDebuff: false,
  },
  HEAL_REDUCTION: {
    name: '치유 감소',
    description: '받는 치유량이 50% 감소합니다.',
    isDebuff: true,
  },
  UNDEAD: {
    name: '언데드화',
    description: '회복이 피해로 전환됩니다.',
    isDebuff: true,
  },
  UNDYING: {
    name: '불사',
    description: 'HP가 1 아래로 내려가지 않습니다.',
    isDebuff: false,
  },
  GAIN_BLOCK_ON_ATTACK: {
    name: '최선의 방어',
    description: '공격 카드 사용 시 방어도를 얻습니다.',
    isDebuff: false,
  },
  THORNS: {
    name: '바늘 갑옷',
    description: '피격 시 감소된 방어도의 일정%를 적에게 반사합니다.',
    isDebuff: false,
  },
  OIL_MARKED: {
    name: '기름',
    description: '처치 시 모든 적에게 폭발 피해를 줍니다.',
    isDebuff: true,
  },
  ATTACK_DISABLED: {
    name: '공격 봉인',
    description: '공격 카드를 사용할 수 없습니다.',
    isDebuff: true,
  },
  BLOCK_TO_DAMAGE: {
    name: '방패 전환',
    description: '방어도 획득 시 일정 비율로 무작위 적에게 피해를 줍니다.',
    isDebuff: false,
  },
};
