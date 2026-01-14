import { Card } from '../../types/card';
import { createStarterDeck, STRIKE, DEFEND, BASH, BASIC_CARDS } from './starterCards';
import { COMMON_CARDS } from './commonCards';
import { UNCOMMON_CARDS } from './uncommonCards';
import { RARE_CARDS } from './rareCards';
import { UNIQUE_CARDS } from './uniqueCards';

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
export function generateCardRewards(count: number = 3): Card[] {
  const rewards: Card[] = [];
  const availableCards = [...ALL_OBTAINABLE_CARDS];

  for (let i = 0; i < count && availableCards.length > 0; i++) {
    // 희귀도 가중치: COMMON 60%, UNCOMMON 30%, RARE 10%
    const roll = Math.random();
    let targetRarity: Card['rarity'];

    if (roll < 0.60) {
      targetRarity = 'COMMON';
    } else if (roll < 0.90) {
      targetRarity = 'UNCOMMON';
    } else {
      targetRarity = 'RARE';
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
