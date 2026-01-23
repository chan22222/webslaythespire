import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Card } from '../combat/Card';
import { Card as CardType, createCardInstance } from '../../types/card';
import { Relic } from '../../types/relic';
import { generateCardRewards } from '../../data/cards';
import { generateRelicReward } from '../../data/relics';
import { randomInt } from '../../utils/shuffle';
import { playButtonHover, playButtonClick, playCardBuy } from '../../utils/sound';

interface ShopItem {
  type: 'card' | 'relic' | 'remove';
  item?: CardType | Relic;
  price: number;
  sold: boolean;
}

const MAX_DECK_SIZE = 30;

// 유물 희귀도에 따른 글로우 색상
const getRelicGlowColor = (rarity: string) => {
  switch (rarity) {
    case 'COMMON': return 'rgba(180, 180, 180, 0.7)';
    case 'UNCOMMON': return 'rgba(59, 130, 246, 0.8)';
    case 'RARE': return 'rgba(168, 85, 247, 0.8)';
    case 'UNIQUE': return 'rgba(250, 204, 21, 0.85)';
    default: return 'rgba(180, 180, 180, 0.7)';
  }
};

export function ShopScreen() {
  const { player, setPhase, modifyGold, addCardToDeck, addRelic, removeCardFromDeck } = useGameStore();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedRemoveCardId, setSelectedRemoveCardId] = useState<string | null>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  // 자동 스크롤 중지
  const stopAutoScroll = useCallback(() => {
    setAutoScrollEnabled(false);
  }, []);

  // 자동 스크롤 효과 (한 번만 오른쪽으로 천천히 이동)
  useEffect(() => {
    if (!autoScrollEnabled) return;

    const container = itemsContainerRef.current;
    if (!container) return;

    let animationId: number | null = null;
    const scrollSpeed = 0.8; // 픽셀/프레임

    const animate = () => {
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (maxScroll <= 0 || container.scrollLeft >= maxScroll) {
        return; // 끝에 도달하면 중지
      }

      container.scrollLeft += scrollSpeed;
      animationId = requestAnimationFrame(animate);
    };

    // 0.5초 후 스크롤 시작
    const timeout = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [autoScrollEnabled]);

  // 터치/마우스 이벤트로 자동 스크롤 중지
  useEffect(() => {
    const container = itemsContainerRef.current;
    if (!container) return;

    const handleInteraction = () => {
      stopAutoScroll();
    };

    container.addEventListener('touchstart', handleInteraction);
    container.addEventListener('mousedown', handleInteraction);
    container.addEventListener('wheel', handleInteraction);

    return () => {
      container.removeEventListener('touchstart', handleInteraction);
      container.removeEventListener('mousedown', handleInteraction);
      container.removeEventListener('wheel', handleInteraction);
    };
  }, [stopAutoScroll]);

  useEffect(() => {
    const cards = generateCardRewards(5);

    // 플레이어가 이미 보유한 유물 ID
    const ownedRelicIds = new Set(player.relics.map(r => r.id));

    // 5개의 유물 생성 (중복 방지 + 이미 보유한 유물 제외)
    const relics: Relic[] = [];
    const usedIds = new Set<string>();
    let attempts = 0;
    while (relics.length < 5 && attempts < 50) {
      attempts++;
      const relic = generateRelicReward();
      if (!usedIds.has(relic.id) && !ownedRelicIds.has(relic.id)) {
        relics.push(relic);
        usedIds.add(relic.id);
      }
    }

    const getRelicPrice = (relic: Relic) => {
      switch (relic.rarity) {
        case 'COMMON': return randomInt(140, 160);
        case 'UNCOMMON': return randomInt(200, 240);
        case 'RARE': return randomInt(280, 320);
        case 'UNIQUE': return randomInt(350, 400);
        default: return randomInt(180, 220);
      }
    };

    const items: ShopItem[] = [
      ...cards.map(card => ({
        type: 'card' as const,
        item: card,
        price: card.rarity === 'COMMON' ? randomInt(45, 55) :
          card.rarity === 'UNCOMMON' ? randomInt(68, 82) : randomInt(135, 165),
        sold: false,
      })),
      ...relics.map(relic => ({
        type: 'relic' as const,
        item: relic,
        price: getRelicPrice(relic),
        sold: false,
      })),
      {
        type: 'remove' as const,
        price: 50,
        sold: false,
      },
    ];

    setShopItems(items);
  }, []);

  const isDeckFull = player.deck.length >= MAX_DECK_SIZE;

  const handleSelectItem = (index: number) => {
    const item = shopItems[index];
    if (item.sold || item.type === 'remove') return;
    // 덱이 가득 찬 경우 카드 선택 불가
    if (item.type === 'card' && isDeckFull) return;
    // 토글: 같은 아이템 클릭 시 선택 해제
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const handleBuyItem = (index: number) => {
    const item = shopItems[index];
    if (item.sold || player.gold < item.price) return;

    if (item.type === 'card') {
      // 덱이 가득 찬 경우 카드 구매 불가
      if (isDeckFull) return;
      modifyGold(-item.price);
      addCardToDeck(item.item as CardType);
    } else if (item.type === 'relic') {
      const relic = item.item as Relic;
      if (player.relics.some(r => r.id === relic.id)) {
        setSelectedIndex(null);
        return;
      }
      modifyGold(-item.price);
      addRelic(relic);
    }

    const newItems = [...shopItems];
    newItems[index].sold = true;
    setShopItems(newItems);
    setSelectedIndex(null);
  };

  const handleBuyRemove = (index: number) => {
    const item = shopItems[index];
    if (item.sold || player.gold < item.price) return;
    setShowRemoveModal(true);
  };

  const handleSelectRemoveCard = (cardInstanceId: string) => {
    // 토글: 같은 카드 클릭 시 선택 해제
    setSelectedRemoveCardId(selectedRemoveCardId === cardInstanceId ? null : cardInstanceId);
  };

  const handleConfirmRemoveCard = (cardInstanceId: string) => {
    const item = shopItems.find(i => i.type === 'remove');
    if (!item || player.gold < item.price) return;

    modifyGold(-item.price);
    removeCardFromDeck(cardInstanceId);
    setSelectedRemoveCardId(null);
    // 모달 유지 - 여러 장 제거 가능
  };

  const handleLeave = () => {
    setPhase('MAP');
  };

  const saleItems = shopItems.filter(i => i.type === 'card' || i.type === 'relic');
  const removeItem = shopItems.find(i => i.type === 'remove');

  const SCROLL_AMOUNT = 250;

  const handleScrollLeft = () => {
    stopAutoScroll();
    if (itemsContainerRef.current) {
      itemsContainerRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    stopAutoScroll();
    if (itemsContainerRef.current) {
      itemsContainerRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    }
  };

  return (
    <div className="shop-screen w-full h-screen flex flex-col items-center relative overflow-hidden">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/maps/shop1.png)',
          backgroundSize: 'auto 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'var(--bg-darkest)',
        }}
      />
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* 상단: 골드 - 맵 스타일 */}
      <div className="shop-gold-wrapper flex items-center justify-center relative z-10">
        <span className="shop-gold-text tabular-nums">
          {player.gold}
        </span>
      </div>

      <h1 className="shop-title text-[var(--gold-light)] relative z-10">
        상점
      </h1>

      {/* 카드 & 유물 판매 - 통합 스크롤 */}
      <div className="shop-items-section relative z-10 flex-1 w-full flex items-center">
        <div className="shop-items-wrapper relative flex items-center w-full">
          {/* 왼쪽 화살표 */}
          <button
            onClick={handleScrollLeft}
            className="shop-nav-btn absolute left-0 z-30 transition-all duration-150 hover:scale-125"
          >
            <img
              src="/sprites/icon/left_arrow.png"
              alt="Left"
              className="shop-nav-arrow"
              style={{ imageRendering: 'pixelated' }}
              draggable={false}
            />
          </button>

          {/* 아이템 컨테이너 */}
          <div
            ref={itemsContainerRef}
            className="shop-items-container flex overflow-x-auto scrollbar-hide mx-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {saleItems.map((item, idx) => {
              const globalIndex = shopItems.indexOf(item);

              if (item.type === 'card') {
                const isSelected = selectedIndex === globalIndex;
                const canBuyCard = !item.sold && player.gold >= item.price && !isDeckFull;
                return (
                  <div key={idx} className="flex flex-col items-center shop-item flex-shrink-0 relative">
                    <div
                      onClick={() => handleSelectItem(globalIndex)}
                      onMouseEnter={() => canBuyCard && playButtonHover()}
                      className={`
                        transition-all duration-300
                        ${item.sold ? 'opacity-30 scale-95' : canBuyCard ? 'cursor-pointer hover:scale-105 hover:-translate-y-2' : 'opacity-50 cursor-not-allowed'}
                        ${isSelected ? 'scale-105 -translate-y-2' : ''}
                      `}
                    >
                      <Card
                        card={createCardInstance(item.item as CardType)}
                        isPlayable={canBuyCard}
                        size="md"
                      />
                    </div>
                    {/* 덱 가득 참 메시지 */}
                    {isDeckFull && !item.sold && (
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-2 py-1 rounded"
                        style={{
                          background: 'rgba(0, 0, 0, 0.85)',
                          border: '1px solid var(--attack)',
                          whiteSpace: 'nowrap',
                          zIndex: 10,
                        }}
                      >
                        <span className="text-xs font-title text-[var(--attack-light)]">덱 30장</span>
                      </div>
                    )}
                    <div
                      onMouseEnter={() => isSelected && playButtonHover()}
                      onClick={() => { if (isSelected) { playCardBuy(); handleBuyItem(globalIndex); } }}
                      className={`shop-price-tag flex items-center rounded-lg font-title transition-all duration-200 ${
                        item.sold ? 'text-gray-500' :
                        isDeckFull ? 'text-gray-500' :
                        isSelected ? 'text-white cursor-pointer hover:brightness-110' :
                        player.gold >= item.price ? 'text-[var(--gold-light)]' : 'text-[var(--attack-light)]'
                      }`}
                      style={{
                        background: isSelected && !isDeckFull
                          ? 'linear-gradient(180deg, #22c55e 0%, #166534 100%)'
                          : 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
                        border: `2px solid ${item.sold || isDeckFull ? '#444' : isSelected ? '#4ade80' : player.gold >= item.price ? 'var(--gold-dark)' : 'var(--attack-dark)'}`,
                        boxShadow: isSelected && !isDeckFull ? '0 0 12px rgba(74, 222, 128, 0.5)' : 'none',
                      }}
                    >
                      <span>{isSelected && !isDeckFull ? '✓' : '💰'}</span>
                      <span>{item.sold ? '판매됨' : isDeckFull ? '덱 초과' : isSelected ? '구매' : item.price}</span>
                    </div>
                  </div>
                );
              } else {
                const relic = item.item as Relic;
                const glowColor = getRelicGlowColor(relic.rarity);
                const isSelected = selectedIndex === globalIndex;
                return (
                  <div key={idx} className="flex flex-col items-center shop-item flex-shrink-0">
                    <div
                      onClick={() => handleSelectItem(globalIndex)}
                      onMouseEnter={() => !item.sold && player.gold >= item.price && playButtonHover()}
                      className={`
                        shop-relic-card flex flex-col items-center transition-all duration-300 overflow-hidden relative
                        ${item.sold ? 'opacity-30 scale-95' : player.gold >= item.price ? 'cursor-pointer hover:scale-105 hover:-translate-y-2' : 'opacity-50'}
                        ${isSelected ? 'scale-105 -translate-y-2' : ''}
                      `}
                    >
                      {/* 배경 이미지 */}
                      <img
                        src="/cards/shop_relic.png"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ imageRendering: 'pixelated' }}
                        draggable={false}
                      />
                      {/* 아이콘 영역 */}
                      <div
                        className="shop-relic-icon-area flex items-center justify-center relative z-10"
                        style={{
                          background: `radial-gradient(circle at center, ${glowColor} 0%, ${glowColor.replace(/[\d.]+\)$/, '0.6)')} 25%, transparent 50%)`,
                        }}
                      >
                        {relic.icon ? (
                          <img
                            src={relic.icon}
                            alt={relic.name}
                            className="shop-relic-icon"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <span className="shop-relic-icon-placeholder">❓</span>
                        )}
                      </div>
                      {/* 설명 영역 */}
                      <div
                        className="shop-relic-desc-area flex-1 w-full relative z-10"
                        style={{
                          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)',
                        }}
                      >
                        <p className="shop-relic-desc font-card text-gray-200 text-center leading-tight">
                          {relic.description}
                        </p>
                      </div>
                    </div>
                    <div
                      onMouseEnter={() => isSelected && playButtonHover()}
                      onClick={() => { if (isSelected) { playCardBuy(); handleBuyItem(globalIndex); } }}
                      className={`shop-price-tag flex items-center rounded-lg font-title transition-all duration-200 ${
                        item.sold ? 'text-gray-500' :
                        isSelected ? 'text-white cursor-pointer hover:brightness-110' :
                        player.gold >= item.price ? 'text-[var(--gold-light)]' : 'text-[var(--attack-light)]'
                      }`}
                      style={{
                        background: isSelected
                          ? 'linear-gradient(180deg, #22c55e 0%, #166534 100%)'
                          : 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
                        border: `2px solid ${item.sold ? '#444' : isSelected ? '#4ade80' : player.gold >= item.price ? 'var(--gold-dark)' : 'var(--attack-dark)'}`,
                        boxShadow: isSelected ? '0 0 12px rgba(74, 222, 128, 0.5)' : 'none',
                      }}
                    >
                      <span>{isSelected ? '✓' : '💰'}</span>
                      <span>{item.sold ? '판매됨' : isSelected ? '구매' : item.price}</span>
                    </div>
                  </div>
                );
              }
            })}
          </div>

          {/* 오른쪽 화살표 */}
          <button
            onClick={handleScrollRight}
            className="shop-nav-btn absolute right-0 z-30 transition-all duration-150 hover:scale-125"
          >
            <img
              src="/sprites/icon/right_arrow.png"
              alt="Right"
              className="shop-nav-arrow"
              style={{ imageRendering: 'pixelated' }}
              draggable={false}
            />
          </button>
        </div>
      </div>

      {/* 하단 버튼들 */}
      <div className="shop-bottom-section relative z-10 flex items-center gap-4">
        {/* 카드 제거 서비스 (여러 장 가능) */}
        {removeItem && (
          <button
            onMouseEnter={() => player.gold >= removeItem.price && playButtonHover()}
            onClick={() => { if (player.gold >= removeItem.price) { playButtonClick(); handleBuyRemove(shopItems.indexOf(removeItem)); } }}
            disabled={player.gold < removeItem.price}
            className={`
              shop-action-btn shop-remove-btn relative flex items-center justify-center
              transition-all duration-300
              ${player.gold >= removeItem.price ? 'hover:scale-105 hover:brightness-110' : 'opacity-50 cursor-not-allowed'}
            `}
          >
            <img
              src="/button_long.png"
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                imageRendering: 'pixelated',
                filter: 'sepia(1) saturate(3) hue-rotate(-10deg) brightness(0.8)',
              }}
              draggable={false}
            />
            <span className="shop-btn-text relative z-10 text-white font-bold">
              카드 제거 - {removeItem.price}G
            </span>
          </button>
        )}

        {/* 나가기 버튼 */}
        <button
          onMouseEnter={playButtonHover}
          onClick={() => { playButtonClick(); handleLeave(); }}
          className="shop-action-btn shop-leave-btn relative flex items-center justify-center transition-all duration-300 hover:scale-105 hover:brightness-110"
        >
          <img
            src="/button_long.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
          <span className="shop-btn-text relative z-10 text-white font-bold">
            상점 나가기
          </span>
        </button>
      </div>

      {/* 카드 제거 모달 */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-1 sm:p-2 md:p-4">
          <div
            className="rounded-xl p-2 sm:p-4 md:p-6 lg:p-8 max-w-4xl max-h-[90vh] overflow-auto"
            style={{
              background: 'linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
              border: '2px solid var(--attack)',
              boxShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 20px var(--attack-glow)',
            }}
          >
            <h2 className="font-title text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--attack-light)] mb-1 sm:mb-2 md:mb-3 text-center">
              제거할 카드 선택
            </h2>
            <p className="font-card text-sm text-[var(--gold)] mb-2 sm:mb-4 md:mb-6 text-center">
              비용: 50G | 보유: {player.gold}G
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 sm:gap-2 md:gap-3 lg:gap-4 scale-60 sm:scale-75 md:scale-90 lg:scale-100 origin-top">
              {player.deck.map(card => {
                const isSelected = selectedRemoveCardId === card.instanceId;
                return (
                  <div
                    key={card.instanceId}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      onClick={() => handleSelectRemoveCard(card.instanceId)}
                      onMouseEnter={playButtonHover}
                      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'scale-110 -translate-y-1' : 'hover:scale-105'}`}
                    >
                      <Card card={card} size="sm" />
                    </div>
                    <button
                      onMouseEnter={() => isSelected && player.gold >= 50 && playButtonHover()}
                      onClick={() => { if (isSelected && player.gold >= 50) { playCardBuy(); handleConfirmRemoveCard(card.instanceId); } }}
                      disabled={!isSelected || player.gold < 50}
                      className={`px-2 py-1 rounded font-title text-xs transition-all duration-200 ${
                        isSelected && player.gold >= 50
                          ? 'text-white cursor-pointer hover:brightness-110'
                          : 'text-gray-500'
                      }`}
                      style={{
                        background: isSelected && player.gold >= 50
                          ? 'linear-gradient(180deg, #ef4444 0%, #991b1b 100%)'
                          : 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
                        border: `2px solid ${isSelected && player.gold >= 50 ? '#f87171' : '#444'}`,
                        boxShadow: isSelected && player.gold >= 50 ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none',
                      }}
                    >
                      {isSelected ? (player.gold >= 50 ? '✓ 제거' : '골드 부족') : '선택'}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onMouseEnter={playButtonHover}
              onClick={() => { playButtonClick(); setShowRemoveModal(false); }}
              className="mt-2 sm:mt-4 md:mt-6 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg font-card text-xs sm:text-sm md:text-base text-gray-400 hover:text-white transition-colors block mx-auto"
              style={{
                background: 'linear-gradient(180deg, var(--bg-light) 0%, var(--bg-dark) 100%)',
                border: '1px solid var(--gold-dark)',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
