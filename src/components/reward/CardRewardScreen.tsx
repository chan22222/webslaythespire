import { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useCombatStore } from '../../stores/combatStore';
import { Card } from '../combat/Card';
import { Card as CardType, createCardInstance } from '../../types/card';
import { generateCardRewards } from '../../data/cards';
import { randomInt } from '../../utils/shuffle';

export function CardRewardScreen() {
  const { setPhase, modifyGold, addCardToDeck, getCurrentNode, addNextFloorNode } = useGameStore();
  const { resetCombat, enemies } = useCombatStore();
  const [cardRewards, setCardRewards] = useState<CardType[]>([]);
  const [goldReward, setGoldReward] = useState(0);
  const [bonusGold, setBonusGold] = useState(0);
  const [goldCollected, setGoldCollected] = useState(false);
  const [bonusCollected, setBonusCollected] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  // 이스터에그 적 확인
  const hasEasterEggEnemy = enemies.some(
    e => e.templateId === 'real_tukbug' || e.templateId === 'kkuchu'
  );

  useEffect(() => {
    setCardRewards(generateCardRewards(3));
    setGoldReward(randomInt(10, 25));
    if (hasEasterEggEnemy) {
      setBonusGold(2000);
    }
  }, [hasEasterEggEnemy]);

  const handleCollectGold = () => {
    if (!goldCollected) {
      modifyGold(goldReward);
      setGoldCollected(true);
    }
  };

  const handleCollectBonus = () => {
    if (!bonusCollected && bonusGold > 0) {
      modifyGold(bonusGold);
      setBonusCollected(true);
    }
  };

  const handleSelectCard = (index: number) => {
    // 같은 카드 클릭 시 선택 해제
    if (selectedCardIndex === index) {
      setSelectedCardIndex(null);
    } else {
      setSelectedCardIndex(index);
    }
  };

  const handleProceed = () => {
    // 선택된 카드가 있으면 덱에 추가
    if (selectedCardIndex !== null) {
      addCardToDeck(cardRewards[selectedCardIndex]);
    }
    resetCombat();

    // 보스 클리어 시 NEXT_FLOOR 노드 추가
    const currentNode = getCurrentNode();
    if (currentNode?.type === 'BOSS') {
      addNextFloorNode();
    }

    setPhase('MAP');
  };

  const canProceed = goldCollected && (bonusGold === 0 || bonusCollected);

  return (
    <div className="w-full h-screen bg-[var(--bg-darkest)] texture-noise vignette flex flex-col items-center justify-center relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(201, 162, 39, 0.1) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* 승리 타이틀 */}
      <div className="relative z-10 text-center mb-4 sm:mb-8">
        <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 animate-float">🏆</div>
        <h1
          className="font-title text-3xl sm:text-5xl text-[var(--gold-light)] mb-1 sm:mb-2"
          style={{
            textShadow: '0 0 30px var(--gold-glow), 0 4px 8px rgba(0,0,0,0.8)',
          }}
        >
          승리!
        </h1>
        <p className="font-card text-sm sm:text-lg text-[var(--gold)]">전투에서 승리했습니다</p>
      </div>

      {/* 골드 보상 */}
      <div className="mb-4 sm:mb-8 relative z-10 flex flex-col gap-3">
        <button
          onClick={handleCollectGold}
          disabled={goldCollected}
          className={`
            px-4 sm:px-8 py-2 sm:py-4 rounded-xl font-title text-base sm:text-xl
            flex items-center gap-2 sm:gap-4
            transition-all duration-300
            ${goldCollected
              ? 'bg-[var(--bg-dark)] text-gray-500 cursor-not-allowed border-2 border-gray-600'
              : 'btn-game glow-gold hover:scale-105'
            }
          `}
        >
          <span className="text-xl sm:text-3xl">💰</span>
          <span>{goldCollected ? '획득 완료!' : `${goldReward} 골드 획득`}</span>
        </button>

        {/* 이스터에그 보너스 골드 */}
        {bonusGold > 0 && (
          <button
            onClick={handleCollectBonus}
            disabled={bonusCollected}
            className={`
              px-4 sm:px-8 py-2 sm:py-4 rounded-xl font-title text-base sm:text-xl
              flex items-center gap-2 sm:gap-4
              transition-all duration-300
              ${bonusCollected
                ? 'bg-[var(--bg-dark)] text-gray-500 cursor-not-allowed border-2 border-gray-600'
                : 'hover:scale-105'
              }
            `}
            style={!bonusCollected ? {
              background: 'linear-gradient(180deg, #ffd700 0%, #ff8c00 100%)',
              border: '3px solid #fff700',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 140, 0, 0.5)',
              animation: 'pulse 1s ease-in-out infinite',
            } : {}}
          >
            <span className="text-xl sm:text-3xl">✨</span>
            <span className="text-black font-bold">{bonusCollected ? '보너스 획득!' : `${bonusGold} 보너스 골드!`}</span>
          </button>
        )}
      </div>

      {/* 카드 보상 */}
      <div className="mb-4 sm:mb-8 relative z-10">
        <h2 className="font-title text-sm sm:text-xl text-[var(--gold-light)] text-center mb-3 sm:mb-6 px-2">
          {selectedCardIndex !== null
            ? `"${cardRewards[selectedCardIndex].name}" 선택됨`
            : '보상 카드를 선택하세요'}
        </h2>

        <div className="flex gap-2 sm:gap-8 scale-60 sm:scale-75 md:scale-100 origin-top">
          {cardRewards.map((card, index) => {
            const isSelected = selectedCardIndex === index;
            return (
              <div
                key={index}
                onClick={() => handleSelectCard(index)}
                className={`
                  transition-all duration-300 cursor-pointer
                  ${isSelected
                    ? 'scale-110 -translate-y-4 sm:-translate-y-6'
                    : 'hover:scale-105 hover:-translate-y-2'
                  }
                `}
                style={{
                  filter: selectedCardIndex !== null && !isSelected ? 'brightness(0.5)' : 'none',
                }}
              >
                <div
                  className="relative"
                  style={{
                    boxShadow: isSelected
                      ? '0 0 30px rgba(74, 222, 128, 0.8), 0 0 60px rgba(74, 222, 128, 0.4)'
                      : 'none',
                    borderRadius: '12px',
                  }}
                >
                  <Card
                    card={createCardInstance(card)}
                    isPlayable={true}
                    size="lg"
                  />
                  {isSelected && (
                    <div
                      className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #166534 100%)',
                        border: '2px solid #4ade80',
                        boxShadow: '0 0 15px rgba(74, 222, 128, 0.6)',
                      }}
                    >
                      <span className="text-white text-sm sm:text-lg">✓</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-2 sm:mt-4 text-center font-card text-xs sm:text-sm text-gray-400">
          카드를 선택하지 않고 진행할 수 있습니다
        </p>
      </div>

      {/* 진행 버튼 */}
      <button
        onClick={handleProceed}
        disabled={!canProceed}
        className={`
          px-6 sm:px-10 py-2 sm:py-4 rounded-xl font-title text-base sm:text-xl
          transition-all duration-300
          ${canProceed
            ? 'btn-game text-white hover:scale-105'
            : 'bg-[var(--bg-dark)] text-gray-500 cursor-not-allowed border-2 border-gray-600'
          }
        `}
        style={canProceed ? {
          background: 'linear-gradient(180deg, #22c55e 0%, #166534 100%)',
          borderColor: '#4ade80',
          boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)',
        } : {}}
      >
        계속하기
      </button>
    </div>
  );
}
