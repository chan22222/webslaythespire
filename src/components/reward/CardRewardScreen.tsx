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
  const [cardCollected, setCardCollected] = useState(false);

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

  const handleSelectCard = (card: CardType) => {
    if (!cardCollected) {
      addCardToDeck(card);
      setCardCollected(true);
    }
  };

  const handleSkipCard = () => {
    setCardCollected(true);
  };

  const handleProceed = () => {
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
          {cardCollected ? '카드 선택 완료' : '보상 카드를 선택하세요'}
        </h2>

        <div className="flex gap-8">
          {cardRewards.map((card, index) => (
            <div
              key={index}
              onClick={() => !cardCollected && handleSelectCard(card)}
              className={`
                transition-all duration-300
                ${cardCollected ? 'opacity-40 scale-95' : 'cursor-pointer hover:scale-110 hover:-translate-y-4'}
              `}
            >
              <Card
                card={createCardInstance(card)}
                isPlayable={!cardCollected}
                size="lg"
              />
            </div>
          ))}
        </div>

        {!cardCollected && (
          <button
            onClick={handleSkipCard}
            className="mt-6 px-6 py-2 rounded-lg font-card text-gray-400 hover:text-white transition-colors block mx-auto"
            style={{
              background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
              border: '1px solid var(--gold-dark)',
            }}
          >
            카드 건너뛰기
          </button>
        )}
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
