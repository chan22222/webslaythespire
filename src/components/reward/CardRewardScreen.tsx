import { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useCombatStore } from '../../stores/combatStore';
import { Card } from '../combat/Card';
import { Card as CardType, createCardInstance } from '../../types/card';
import { generateCardRewards } from '../../data/cards';
import { randomInt } from '../../utils/shuffle';

export function CardRewardScreen() {
  const { setPhase, modifyGold, addCardToDeck } = useGameStore();
  const { resetCombat } = useCombatStore();
  const [cardRewards, setCardRewards] = useState<CardType[]>([]);
  const [goldReward, setGoldReward] = useState(0);
  const [goldCollected, setGoldCollected] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  useEffect(() => {
    setCardRewards(generateCardRewards(3));
    setGoldReward(randomInt(10, 25));
  }, []);

  const handleCollectGold = () => {
    if (!goldCollected) {
      modifyGold(goldReward);
      setGoldCollected(true);
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
    setPhase('MAP');
  };

  const canProceed = goldCollected;

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
      <div className="relative z-10 text-center mb-8">
        <div className="text-6xl mb-4 animate-float">🏆</div>
        <h1
          className="font-title text-5xl text-[var(--gold-light)] mb-2"
          style={{
            textShadow: '0 0 30px var(--gold-glow), 0 4px 8px rgba(0,0,0,0.8)',
          }}
        >
          승리!
        </h1>
        <p className="font-card text-lg text-[var(--gold)]">전투에서 승리했습니다</p>
      </div>

      {/* 골드 보상 */}
      <div className="mb-8 relative z-10">
        <button
          onClick={handleCollectGold}
          disabled={goldCollected}
          className={`
            px-8 py-4 rounded-xl font-title text-xl
            flex items-center gap-4
            transition-all duration-300
            ${goldCollected
              ? 'bg-[var(--bg-dark)] text-gray-500 cursor-not-allowed border-2 border-gray-600'
              : 'btn-game glow-gold hover:scale-105'
            }
          `}
        >
          <span className="text-3xl">💰</span>
          <span>{goldCollected ? '획득 완료!' : `${goldReward} 골드 획득`}</span>
        </button>
      </div>

      {/* 카드 보상 */}
      <div className="mb-8 relative z-10">
        <h2 className="font-title text-xl text-[var(--gold-light)] text-center mb-6">
          {selectedCardIndex !== null
            ? `"${cardRewards[selectedCardIndex].name}" 선택됨 (다시 클릭하여 해제)`
            : '보상 카드를 선택하세요 (선택 안함 가능)'}
        </h2>

        <div className="flex gap-8">
          {cardRewards.map((card, index) => {
            const isSelected = selectedCardIndex === index;
            return (
              <div
                key={index}
                onClick={() => handleSelectCard(index)}
                className={`
                  transition-all duration-300 cursor-pointer
                  ${isSelected
                    ? 'scale-110 -translate-y-6'
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
                      className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #166534 100%)',
                        border: '2px solid #4ade80',
                        boxShadow: '0 0 15px rgba(74, 222, 128, 0.6)',
                      }}
                    >
                      <span className="text-white text-lg">✓</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center font-card text-sm text-gray-400">
          카드를 선택하지 않고 진행할 수 있습니다
        </p>
      </div>

      {/* 진행 버튼 */}
      <button
        onClick={handleProceed}
        disabled={!canProceed}
        className={`
          px-10 py-4 rounded-xl font-title text-xl
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
