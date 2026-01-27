import { Card } from '../../types/card';
import { createStarterDeck, STRIKE, DEFEND, BASH, BASIC_CARDS } from './starterCards';
import { COMMON_CARDS } from './commonCards';
import { UNCOMMON_CARDS } from './uncommonCards';
import { RARE_CARDS } from './rareCards';
import { UNIQUE_CARDS } from './uniqueCards';
import { isCardUnlocked } from '../achievements';

export { createStarterDeck, STRIKE, DEFEND, BASH, BASIC_CARDS };
export { COMMON_CARDS };
export { UNCOMMON_CARDS };
export { RARE_CARDS };
export { UNIQUE_CARDS };

// 모든 획득 가능한 카드 (BASIC 제외)
export const ALL_OBTAINABLE_CARDS: Card[] = [
  ...COMMON_CARDS,
  ...UNCOMMON_CARDS,
  ...RARE_CARDS,
  ...UNIQUE_CARDS,
];

// 모든 카드 (유니크 카드 포함)
export const ALL_CARDS: Card[] = [
  ...BASIC_CARDS,
  ...ALL_OBTAINABLE_CARDS,
  ...UNIQUE_CARDS,
];

// 희귀도별 카드 풀
export function getCardsByRarity(rarity: Card['rarity']): Card[] {
  return ALL_CARDS.filter(card => card.rarity === rarity);
}

// 랜덤 카드 보상 생성 (3장)
// deckCardIds: 덱에 있는 카드 ID 배열 (unique 카드 필터링용)
// unlockedAchievements: 해금된 업적 ID 배열 (해금된 카드만 등장)
// isGuest: 연습모드 여부 (true면 모든 카드 해금)
export function generateCardRewards(count: number = 3, deckCardIds: string[] = [], unlockedAchievements: string[] = [], isGuest: boolean = false): Card[] {
  const rewards: Card[] = [];
  // unique 카드가 이미 덱에 있거나, 해금되지 않은 카드는 보상 후보에서 제외
  const availableCards = ALL_OBTAINABLE_CARDS.filter(card => {
    // unique 카드가 이미 덱에 있으면 제외
    if (card.unique && deckCardIds.includes(card.id)) {
      return false;
    }
    // 연습모드가 아닐 때만 해금 체크
    if (!isGuest && !isCardUnlocked(card.id, unlockedAchievements)) {
      return false;
    }
    return true;
  });

  for (let i = 0; i < count && availableCards.length > 0; i++) {
    // 희귀도 가중치: COMMON 55%, UNCOMMON 30%, RARE 12%, UNIQUE 3%
    const roll = Math.random();
    let targetRarity: Card['rarity'];

    if (roll < 0.55) {
      targetRarity = 'COMMON';
    } else if (roll < 0.85) {
      targetRarity = 'UNCOMMON';
    } else if (roll < 0.97) {
      targetRarity = 'RARE';
    } else {
      targetRarity = 'UNIQUE';
    }

    const eligibleCards = availableCards.filter(c => c.rarity === targetRarity);
    if (eligibleCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * eligibleCards.length);
      const selectedCard = eligibleCards[randomIndex];
      rewards.push({ ...selectedCard });

      // 같은 카드가 두 번 나오지 않도록 제거
      const indexToRemove = availableCards.findIndex(c => c.id === selectedCard.id);
      if (indexToRemove !== -1) {
        availableCards.splice(indexToRemove, 1);
      }
    } else {
      // 해당 희귀도 카드가 없으면 아무거나 선택
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      rewards.push({ ...availableCards[randomIndex] });
      availableCards.splice(randomIndex, 1);
    }
  }

  return rewards;
}
