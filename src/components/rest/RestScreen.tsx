import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Card } from '../combat/Card';
import { playButtonHover, playButtonClick, playCardBuy } from '../../utils/sound';

export function RestScreen() {
  const { player, setPhase, healPlayer, upgradeCard } = useGameStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [actionTaken, setActionTaken] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const healAmount = Math.floor(player.maxHp * 0.3);
  const upgradableCards = player.deck.filter(card => !card.upgraded && card.upgradeEffect);

  const handleRest = () => {
    healPlayer(healAmount);
    setActionTaken(true);
  };

  const handleUpgrade = () => {
    if (upgradableCards.length > 0) {
      setShowUpgradeModal(true);
      setSelectedCardId(null);
    }
  };

  const handleCardClick = (cardInstanceId: string) => {
    setSelectedCardId(cardInstanceId);
  };

  const handleConfirmUpgrade = () => {
    if (selectedCardId) {
      upgradeCard(selectedCardId);
      setShowUpgradeModal(false);
      setActionTaken(true);
    }
  };

  const handleProceed = () => {
    setPhase('MAP');
  };

  return (
    <div className="rest-screen w-full h-screen bg-[var(--bg-darkest)] texture-noise vignette flex flex-col items-center justify-center relative overflow-hidden">
      {/* 배경 - 따뜻한 불빛 효과 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center bottom, rgba(230, 126, 34, 0.2) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* 모닥불 */}
      <div className="rest-fire relative z-10">
        <div className="rest-fire-icon animate-float" style={{ filter: 'drop-shadow(0 0 30px rgba(230, 126, 34, 0.8))' }}>
          🔥
        </div>
        {/* 불빛 글로우 */}
        <div
          className="absolute inset-0 -z-10 animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle, var(--energy-glow) 0%, transparent 70%)',
            transform: 'scale(2)',
          }}
        />
      </div>

      <h1
        className="rest-title font-title text-[var(--energy-light)] relative z-10"
        style={{
          textShadow: '0 0 30px var(--energy-glow), 0 4px 8px rgba(0,0,0,0.8)',
        }}
      >
        휴식처
      </h1>

      {!actionTaken ? (
        <div className="rest-options flex relative z-10">
          {/* 휴식 옵션 */}
          <button
            onClick={() => { playCardBuy(); handleRest(); }}
            onMouseEnter={playButtonHover}
            className="rest-option-btn group flex flex-col items-center rounded-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #2a1515 0%, #1a0a0a 100%)',
              border: '2px solid var(--hp)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
            }}
          >
            <span className="rest-option-icon group-hover:scale-110 transition-transform">💤</span>
            <span className="rest-option-title font-title text-[var(--hp-light)]">휴식</span>
            <span className="rest-option-desc font-card text-gray-300">
              HP <span className="text-[var(--hp-light)] font-bold">{healAmount}</span> 회복
            </span>
            <span className="rest-option-hint font-card text-gray-500">
              (최대 HP의 30%)
            </span>
          </button>

          {/* 대장간 옵션 */}
          <button
            onClick={() => { if (upgradableCards.length > 0) { playButtonClick(); handleUpgrade(); } }}
            onMouseEnter={() => { if (upgradableCards.length > 0) playButtonHover(); }}
            disabled={upgradableCards.length === 0}
            className={`
              rest-option-btn group flex flex-col items-center rounded-xl transition-all duration-300
              ${upgradableCards.length > 0 ? 'hover:scale-105' : 'opacity-40 cursor-not-allowed'}
            `}
            style={{
              background: upgradableCards.length > 0
                ? 'linear-gradient(135deg, #2a2515 0%, #1a1508 100%)'
                : 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
              border: `2px solid ${upgradableCards.length > 0 ? 'var(--gold)' : '#444'}`,
              boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
            }}
          >
            <span className="rest-option-icon group-hover:scale-110 transition-transform">⚒️</span>
            <span className="rest-option-title font-title text-[var(--gold-light)]">대장간</span>
            <span className="rest-option-desc font-card text-gray-300">
              카드 업그레이드
            </span>
            <span className="rest-option-hint font-card text-gray-500">
              ({upgradableCards.length}장 가능)
            </span>
          </button>
        </div>
      ) : (
        <div className="rest-complete text-center relative z-10">
          <div
            className="rest-complete-text text-green-400 font-title"
            style={{ textShadow: '0 0 20px rgba(74, 222, 128, 0.5)' }}
          >
            휴식 완료!
          </div>
          <button
            onClick={() => { playButtonClick(); handleProceed(); }}
            onMouseEnter={playButtonHover}
            className="rest-proceed-btn rounded-xl font-title text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(180deg, #22c55e 0%, #166534 100%)',
              border: '2px solid #4ade80',
              boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)',
            }}
          >
            계속하기
          </button>
        </div>
      )}

      {/* 업그레이드 모달 */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div
            className="rest-upgrade-modal rounded-xl max-h-[90vh] overflow-auto"
            style={{
              background: 'linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
              border: '2px solid var(--gold-dark)',
              boxShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 20px var(--gold-glow)',
            }}
          >
            <h2 className="rest-upgrade-title text-[var(--gold-light)] text-center">
              업그레이드할 카드 선택
            </h2>
            <p className="rest-upgrade-hint text-center text-gray-400">
              {selectedCardId ? '선택 버튼을 눌러 확정하세요' : '카드를 선택하세요'}
            </p>

            <div className="rest-upgrade-grid">
              {upgradableCards.map(card => {
                const isSelected = selectedCardId === card.instanceId;
                return (
                  <div
                    key={card.instanceId}
                    onClick={() => { playButtonClick(); handleCardClick(card.instanceId); }}
                    onMouseEnter={playButtonHover}
                    className="cursor-pointer transition-all duration-200 relative inline-flex"
                    style={{
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      opacity: selectedCardId && !isSelected ? 0.5 : 1,
                      width: 100,
                      height: 139,
                    }}
                  >
                    <Card card={card} size="sm" />
                    {isSelected && (
                      <div
                        className="absolute pointer-events-none rounded-lg"
                        style={{
                          top: 0,
                          left: 0,
                          width: 100,
                          height: 139,
                          border: '3px solid #4ade80',
                          boxShadow: '0 0 20px rgba(74, 222, 128, 0.6)',
                          zIndex: 10,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => { if (selectedCardId) { playCardBuy(); handleConfirmUpgrade(); } }}
                onMouseEnter={() => { if (selectedCardId) playButtonHover(); }}
                disabled={!selectedCardId}
                className={`rest-upgrade-cancel rounded-lg transition-colors ${selectedCardId ? 'text-white hover:scale-105' : 'text-gray-600 cursor-not-allowed'}`}
                style={{
                  background: selectedCardId
                    ? 'linear-gradient(180deg, #22c55e 0%, #166534 100%)'
                    : 'linear-gradient(180deg, var(--bg-light) 0%, var(--bg-dark) 100%)',
                  border: selectedCardId ? '2px solid #4ade80' : '1px solid #444',
                  boxShadow: selectedCardId ? '0 0 15px rgba(74, 222, 128, 0.4)' : 'none',
                }}
              >
                선택
              </button>
              <button
                onClick={() => { playButtonClick(); setShowUpgradeModal(false); }}
                onMouseEnter={playButtonHover}
                className="rest-upgrade-cancel rounded-lg text-gray-400 hover:text-white transition-colors"
                style={{
                  background: 'linear-gradient(180deg, var(--bg-light) 0%, var(--bg-dark) 100%)',
                  border: '1px solid var(--gold-dark)',
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
