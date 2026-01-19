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
    setGoldReward(randomInt(20, 50));
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
    <div className="reward-screen w-full h-screen bg-[var(--bg-darkest)] texture-noise vignette flex items-center justify-center relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at center, rgba(201, 162, 39, 0.12) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* 중앙 컨테이너 - 모든 요소를 컴팩트하게 */}
      <div className="reward-panel relative z-10 flex flex-col items-center">
        {/* 승리 헤더 - 더 컴팩트하게 */}
        <div className="reward-header text-center">
          <h1
            className="reward-title font-title text-[var(--gold-light)]"
            style={{
              textShadow: '0 0 20px var(--gold-glow), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            전리품을 선택하세요
          </h1>
        </div>

        {/* 골드 보상 - 가로 배치 */}
        <div className="reward-gold flex flex-row items-center justify-center">
          <button
            onClick={handleCollectGold}
            disabled={goldCollected}
            className={`
              reward-gold-btn rounded-lg font-title flex items-center justify-center
              transition-all duration-200
              ${goldCollected
                ? 'bg-[var(--bg-medium)] text-gray-500 cursor-default border border-gray-600/50'
                : 'btn-game glow-gold hover:scale-105 active:scale-95'
              }
            `}
          >
            <span className="reward-gold-icon">{goldCollected ? '✓' : '💰'}</span>
            <span>{goldCollected ? '획득됨' : `+${goldReward}G`}</span>
          </button>

          {bonusGold > 0 && (
            <button
              onClick={handleCollectBonus}
              disabled={bonusCollected}
              className={`
                reward-gold-btn rounded-lg font-title flex items-center justify-center
                transition-all duration-200
                ${bonusCollected
                  ? 'bg-[var(--bg-medium)] text-gray-500 cursor-default border border-gray-600/50'
                  : 'hover:scale-105 active:scale-95'
                }
              `}
              style={!bonusCollected ? {
                background: 'linear-gradient(180deg, #ffd700 0%, #e6a800 100%)',
                border: '2px solid #fff176',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
              } : {}}
            >
              <span className="reward-gold-icon">{bonusCollected ? '✓' : '✨'}</span>
              <span className={bonusCollected ? '' : 'text-black font-bold'}>{bonusCollected ? '보너스 획득' : `+${bonusGold}G`}</span>
            </button>
          )}
        </div>

        {/* 카드 선택 영역 */}
        <div className="reward-cards">
          <div className="reward-cards-title font-title text-[var(--gold)] text-center">
            {selectedCardIndex !== null
              ? `"${cardRewards[selectedCardIndex].name}" 선택`
              : '카드를 선택해주세요.'}
          </div>

          <div className="reward-cards-container">
            {cardRewards.map((card, index) => {
              const isSelected = selectedCardIndex === index;
              return (
                <div
                  key={index}
                  onClick={() => handleSelectCard(index)}
                  className={`reward-card-item transition-all duration-200 cursor-pointer ${!isSelected ? 'hover:-translate-y-1' : ''}`}
                  style={{
                    opacity: selectedCardIndex !== null && !isSelected ? 0.4 : 1,
                  }}
                >
                  <div className="relative">
                    <Card
                      card={createCardInstance(card)}
                      isPlayable={true}
                      size="lg"
                    />
                    {/* 선택 테두리 오버레이 */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        border: isSelected ? '4px solid #4ade80' : '4px solid transparent',
                        boxShadow: isSelected ? '0 0 24px rgba(74, 222, 128, 0.7), inset 0 0 12px rgba(74, 222, 128, 0.3)' : 'none',
                        borderRadius: '8px',
                        zIndex: 10,
                      }}
                    />
                    {/* 체크 표시 */}
                    {isSelected && (
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          top: '-8px',
                          right: '-8px',
                          width: '24px',
                          height: '24px',
                          background: 'linear-gradient(135deg, #22c55e 0%, #166534 100%)',
                          border: '2px solid #4ade80',
                          borderRadius: '50%',
                          boxShadow: '0 0 10px rgba(74, 222, 128, 0.6)',
                          zIndex: 11,
                        }}
                      >
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 진행 버튼 */}
        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className={`
            reward-proceed-btn rounded-lg font-title transition-all duration-200
            ${canProceed
              ? 'text-white hover:scale-105 active:scale-95'
              : 'bg-[var(--bg-medium)] text-gray-500 cursor-not-allowed border border-gray-600/50'
            }
          `}
          style={canProceed ? {
            background: 'linear-gradient(180deg, #22c55e 0%, #166534 100%)',
            border: '2px solid #4ade80',
            boxShadow: '0 0 16px rgba(74, 222, 128, 0.4)',
          } : {}}
        >
          {canProceed
            ? (selectedCardIndex !== null ? '계속하기 →' : '카드 받지 않기 →')
            : '골드를 획득하세요'}
        </button>
      </div>
    </div>
  );
}
