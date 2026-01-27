import { useStatsStore } from '../stores/statsStore';

// 전투 중 업적 추적 상태
export interface BattleAchievementState {
  attackCardsUsed: number;           // 공격 카드 사용 횟수
  blockGainedThisTurn: number;       // 이 턴에 얻은 방어도
  damagedEnemyIds: Set<string>;      // 피해를 입힌 적 ID들
  blockNotReducedThisTurn: boolean;  // 방어도가 깎이지 않음
  healEffectsUsed: number;           // 회복 효과 사용 횟수
  wildMushroomUsed: number;          // 야생 버섯 섭취 사용 횟수
  onlySlashCards: boolean;           // 베기 카드만 사용했는지
  lastKillCardId: string | null;     // 마지막 처치에 사용한 카드 ID
  lastKillCardName: string | null;   // 마지막 처치에 사용한 카드 이름
  tookDamageWithZeroEnergy: boolean; // 에너지 0일 때 피해 입음
  hasWeakAndVulnerable: boolean;     // 무기손상+장비파괴 동시 부여
  blockBeforeEnemyTurn: number;      // 적 턴 시작 전 방어도
}

// 초기 상태
export const createInitialBattleAchievementState = (): BattleAchievementState => ({
  attackCardsUsed: 0,
  blockGainedThisTurn: 0,
  damagedEnemyIds: new Set(),
  blockNotReducedThisTurn: true,
  healEffectsUsed: 0,
  wildMushroomUsed: 0,
  onlySlashCards: true,
  lastKillCardId: null,
  lastKillCardName: null,
  tookDamageWithZeroEnergy: false,
  hasWeakAndVulnerable: false,
  blockBeforeEnemyTurn: 0,
});

// 전역 상태 (전투 중에만 유효)
let battleState: BattleAchievementState = createInitialBattleAchievementState();

// 전투 시작 시 초기화
export const resetBattleAchievementState = () => {
  battleState = createInitialBattleAchievementState();
};

// 턴 시작 시 초기화
export const resetTurnAchievementState = () => {
  battleState.blockGainedThisTurn = 0;
  battleState.blockNotReducedThisTurn = true;
};

// 상태 가져오기
export const getBattleAchievementState = () => battleState;

// === 이벤트 기록 함수들 ===

// 카드 사용 기록
export const recordCardUsed = (cardId: string, cardName: string, cardType: string) => {
  if (cardType === 'ATTACK') {
    battleState.attackCardsUsed++;
  }

  // 베기 카드가 아닌 다른 카드 사용 시
  if (!cardName.includes('베기')) {
    battleState.onlySlashCards = false;
  }

  // 야생 버섯 섭취
  if (cardId === 'wild_mushroom') {
    battleState.wildMushroomUsed++;
  }
};

// 회복 효과 사용 기록
export const recordHealUsed = () => {
  battleState.healEffectsUsed++;
};

// 방어도 획득 기록
export const recordBlockGained = (amount: number) => {
  battleState.blockGainedThisTurn += amount;
};

// 적에게 피해 입힌 기록
export const recordDamageToEnemy = (enemyId: string, damage: number) => {
  if (damage > 0) {
    battleState.damagedEnemyIds.add(enemyId);
  }
};

// 방어도 감소 기록
export const recordBlockReduced = () => {
  battleState.blockNotReducedThisTurn = false;
};

// 에너지를 쓰지 않고(풀 에너지 상태에서) 피해 입음 기록
export const recordDamageTakenWithFullEnergy = (energy: number, maxEnergy: number) => {
  if (energy === maxEnergy && maxEnergy > 0) {
    battleState.tookDamageWithZeroEnergy = true;
  }
};

// 무기손상+장비파괴 동시 부여 기록
export const recordWeakAndVulnerable = () => {
  battleState.hasWeakAndVulnerable = true;
};

// 적 처치 시 사용한 카드 기록
export const recordKillWithCard = (cardId: string, cardName: string) => {
  battleState.lastKillCardId = cardId;
  battleState.lastKillCardName = cardName;
};

// 적 턴 시작 전 방어도 저장
export const recordBlockBeforeEnemyTurn = (block: number) => {
  battleState.blockBeforeEnemyTurn = block;
};

// === 업적 체크 함수들 ===

// 특수 조건 업적 체크 (전투 승리 시 호출)
export const checkBattleEndAchievements = (
  playerHp: number,
  _maxHp: number,
  nodeType: string
) => {
  const statsStore = useStatsStore.getState();

  // 공격 카드를 쓰지 않고 승리
  if (battleState.attackCardsUsed === 0) {
    statsStore.unlockAchievement('no_attack_victory');
  }

  // HP가 1인 상태로 승리
  if (playerHp === 1) {
    statsStore.unlockAchievement('survive_with_1hp');
  }

  // 베기 카드만 사용해서 승리
  if (battleState.onlySlashCards && battleState.attackCardsUsed > 0) {
    statsStore.unlockAchievement('slash_only_victory');
  }

  // HP 90 이상으로 엘리트 몹 잡기
  if (nodeType === 'ELITE' && playerHp >= 90) {
    statsStore.unlockAchievement('elite_with_high_hp');
  }
};

// 즉시 체크하는 업적들 (이벤트 발생 시 호출)
export const checkImmediateAchievements = () => {
  const statsStore = useStatsStore.getState();

  // 한턴에 방어도 20 이상 모으기
  if (battleState.blockGainedThisTurn >= 20) {
    statsStore.unlockAchievement('block_20_in_turn');
  }

  // 적 3마리에게 모두 피해를 1이상 입히기
  if (battleState.damagedEnemyIds.size >= 3) {
    statsStore.unlockAchievement('damage_3_enemies');
  }

  // 에너지를 쓰지 않고 피해 입기
  if (battleState.tookDamageWithZeroEnergy) {
    statsStore.unlockAchievement('damage_with_zero_energy');
  }

  // 무기손상과 장비파괴 동시에 걸려보기
  if (battleState.hasWeakAndVulnerable) {
    statsStore.unlockAchievement('weak_and_vulnerable');
  }

  // 회복 카드 3회 사용
  if (battleState.healEffectsUsed >= 3) {
    statsStore.unlockAchievement('heal_3_times');
  }

  // 야생 버섯 섭취 카드 5번 사용
  if (battleState.wildMushroomUsed >= 5) {
    statsStore.unlockAchievement('wild_mushroom_5_times');
  }
};

// 플레이어 턴 시작 시 방어도 체크 (적 턴 후)
export const checkBlockNotReducedAchievement = (currentBlock: number) => {
  const statsStore = useStatsStore.getState();

  // 이전 턴에 방어도가 있었고, 적 턴을 거친 후에도 방어도가 줄지 않았으면 달성
  if (battleState.blockBeforeEnemyTurn > 0 && currentBlock >= battleState.blockBeforeEnemyTurn) {
    statsStore.unlockAchievement('block_not_reduced');
  }

  // 체크 후 초기화
  battleState.blockBeforeEnemyTurn = 0;
};

// 턴 종료 시 체크 (현재 사용 안 함, 호환성 유지)
export const checkTurnEndAchievements = (_currentBlock: number) => {
  // 방어도 관련 업적은 checkBlockNotReducedAchievement로 이동
};

// HP 변경 시 체크
export const checkHpChangeAchievements = (currentHp: number) => {
  const statsStore = useStatsStore.getState();

  // HP를 정확히 1 남기기
  if (currentHp === 1) {
    statsStore.unlockAchievement('exactly_1hp');
  }
};

// 손패 변경 시 체크
export const checkHandAchievements = (hand: { type: string }[]) => {
  const statsStore = useStatsStore.getState();

  // 패에 공격 카드 5장 이상 만들기
  const attackCards = hand.filter(c => c.type === 'ATTACK').length;
  if (attackCards >= 5) {
    statsStore.unlockAchievement('attack_cards_5_in_hand');
  }
};

// 적 처치 시 체크
export const checkKillAchievements = (cardId: string | null, cardName: string | null) => {
  const statsStore = useStatsStore.getState();

  if (!cardId || !cardName) return;

  // 연속 베기로 적 처치
  if (cardId === 'double_strike') {
    statsStore.unlockAchievement('kill_with_double_strike');
  }

  // 휩쓸기로 적 처치
  if (cardId === 'sweeping') {
    statsStore.unlockAchievement('kill_with_sweeping');
  }

  // 강습 방패로 적 처치
  if (cardId === 'assault_shield') {
    statsStore.unlockAchievement('kill_with_assault_shield');
  }
};
