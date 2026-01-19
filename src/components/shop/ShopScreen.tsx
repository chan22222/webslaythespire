import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Card } from '../combat/Card';
import { Card as CardType, createCardInstance } from '../../types/card';
import { Relic } from '../../types/relic';
import { generateCardRewards } from '../../data/cards';
import { generateRelicReward } from '../../data/relics';
import { randomInt } from '../../utils/shuffle';

interface ShopItem {
  type: 'card' | 'relic' | 'remove';
  item?: CardType | Relic;
  price: number;
  sold: boolean;
}

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
  const [selectedItem, setSelectedItem] = useState<{ item: ShopItem; index: number } | null>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);

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
        price: 75,
        sold: false,
      },
    ];

    setShopItems(items);
  }, []);

  const handleSelectItem = (index: number) => {
    const item = shopItems[index];
    if (item.sold || item.type === 'remove') return;
    setSelectedItem({ item, index });
  };

  const handleConfirmBuy = () => {
    if (!selectedItem) return;
    const { item, index } = selectedItem;

    if (player.gold < item.price) {
      setSelectedItem(null);
      return;
    }

    if (item.type === 'card') {
      modifyGold(-item.price);
      addCardToDeck(item.item as CardType);
    } else if (item.type === 'relic') {
      const relic = item.item as Relic;
      if (player.relics.some(r => r.id === relic.id)) {
        setSelectedItem(null);
        return;
      }
      modifyGold(-item.price);
      addRelic(relic);
    }

    const newItems = [...shopItems];
    newItems[index].sold = true;
    setShopItems(newItems);
    setSelectedItem(null);
  };

  const handleBuyRemove = (index: number) => {
    const item = shopItems[index];
    if (item.sold || player.gold < item.price) return;
    setShowRemoveModal(true);
  };

  const handleRemoveCard = (cardInstanceId: string) => {
    const item = shopItems.find(i => i.type === 'remove' && !i.sold);
    if (!item) return;

    modifyGold(-item.price);
    removeCardFromDeck(cardInstanceId);

    const newItems = [...shopItems];
    const removeIndex = newItems.findIndex(i => i.type === 'remove' && !i.sold);
    if (removeIndex !== -1) {
      newItems[removeIndex].sold = true;
    }
    setShopItems(newItems);
    setShowRemoveModal(false);
  };

  const handleLeave = () => {
    setPhase('MAP');
  };

  const saleItems = shopItems.filter(i => i.type === 'card' || i.type === 'relic');
  const removeItem = shopItems.find(i => i.type === 'remove');

  const SCROLL_AMOUNT = 250;

  const handleScrollLeft = () => {
    if (itemsContainerRef.current) {
      itemsContainerRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (itemsContainerRef.current) {
      itemsContainerRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    }
  };

  return (
    <div className="shop-screen w-full h-screen bg-[var(--bg-darkest)] texture-noise flex flex-col items-center relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(201, 162, 39, 0.15) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* 상단: 골드 */}
      <div
        className="shop-gold flex items-center rounded-xl relative z-10"
        style={{
          background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
          border: '2px solid var(--gold)',
          boxShadow: '0 0 20px var(--gold-glow)',
        }}
      >
        <span className="shop-gold-icon">💰</span>
        <span className="shop-gold-text font-title text-[var(--gold-light)]">{player.gold}</span>
      </div>

      <h1
        className="shop-title font-title text-[var(--gold-light)] relative z-10"
        style={{
          textShadow: '0 0 20px var(--gold-glow), 0 4px 8px rgba(0,0,0,0.8)',
        }}
      >
        상점
      </h1>

      {/* 카드 & 유물 판매 - 통합 스크롤 */}
      <div className="shop-items-section relative z-10 flex-1 w-full flex items-center">
        <div className="shop-items-wrapper relative flex items-center w-full">
          {/* 왼쪽 화살표 */}
          <button
            onClick={handleScrollLeft}
            className="shop-nav-btn absolute left-2 z-20 transition-all duration-150 hover:scale-125"
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
                return (
                  <div key={idx} className="flex flex-col items-center shop-item flex-shrink-0">
                    <div
                      onClick={() => handleSelectItem(globalIndex)}
                      className={`
                        transition-all duration-300
                        ${item.sold ? 'opacity-30 scale-95' : player.gold >= item.price ? 'cursor-pointer hover:scale-105 hover:-translate-y-2' : 'opacity-50'}
                      `}
                    >
                      <Card
                        card={createCardInstance(item.item as CardType)}
                        isPlayable={!item.sold && player.gold >= item.price}
                        size="md"
                      />
                    </div>
                    <div
                      className={`shop-price-tag flex items-center rounded-lg font-title ${
                        item.sold ? 'text-gray-500' : player.gold >= item.price ? 'text-[var(--gold-light)]' : 'text-[var(--attack-light)]'
                      }`}
                      style={{
                        background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
                        border: `1px solid ${item.sold ? '#444' : player.gold >= item.price ? 'var(--gold-dark)' : 'var(--attack-dark)'}`,
                      }}
                    >
                      <span>💰</span>
                      <span>{item.sold ? '판매됨' : item.price}</span>
                    </div>
                  </div>
                );
              } else {
                const relic = item.item as Relic;
                const glowColor = getRelicGlowColor(relic.rarity);
                return (
                  <div key={idx} className="flex flex-col items-center shop-item flex-shrink-0">
                    <div
                      onClick={() => handleSelectItem(globalIndex)}
                      className={`
                        shop-relic-card flex flex-col items-center transition-all duration-300 overflow-hidden relative
                        ${item.sold ? 'opacity-30 scale-95' : player.gold >= item.price ? 'cursor-pointer hover:scale-105 hover:-translate-y-2' : 'opacity-50'}
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
                          background: `radial-gradient(circle at center, ${glowColor} 0%, ${glowColor.replace(/[\d.]+\)$/, '0.3)')} 30%, transparent 55%)`,
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
                      className={`shop-price-tag flex items-center rounded-lg font-title ${
                        item.sold ? 'text-gray-500' : player.gold >= item.price ? 'text-[var(--gold-light)]' : 'text-[var(--attack-light)]'
                      }`}
                      style={{
                        background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
                        border: `1px solid ${item.sold ? '#444' : player.gold >= item.price ? 'var(--gold-dark)' : 'var(--attack-dark)'}`,
                      }}
                    >
                      <span>💰</span>
                      <span>{item.sold ? '판매됨' : item.price}</span>
                    </div>
                  </div>
                );
              }
            })}
          </div>

          {/* 오른쪽 화살표 */}
          <button
            onClick={handleScrollRight}
            className="shop-nav-btn absolute right-2 z-20 transition-all duration-150 hover:scale-125"
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
        {/* 카드 제거 서비스 */}
        {removeItem && (
          <button
            onClick={() => handleBuyRemove(shopItems.indexOf(removeItem))}
            disabled={removeItem.sold || player.gold < removeItem.price}
            className={`
              shop-remove-btn rounded-xl font-title flex items-center
              transition-all duration-300
              ${removeItem.sold ? 'opacity-30' :
                player.gold >= removeItem.price ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'}
            `}
            style={{
              background: removeItem.sold ? 'var(--bg-dark)' :
                player.gold >= removeItem.price
                  ? 'linear-gradient(180deg, var(--attack) 0%, var(--attack-dark) 100%)'
                  : 'var(--bg-dark)',
              border: `2px solid ${removeItem.sold ? '#444' :
                player.gold >= removeItem.price ? 'var(--attack-light)' : '#444'}`,
              boxShadow: !removeItem.sold && player.gold >= removeItem.price
                ? '0 0 15px var(--attack-glow)'
                : 'none',
            }}
          >
            <span className="shop-remove-icon">🗑️</span>
            <span className="text-white">
              카드 제거 - 💰 {removeItem.sold ? '판매됨' : removeItem.price}
            </span>
          </button>
        )}

        {/* 나가기 버튼 */}
        <button
          onClick={handleLeave}
          className="shop-leave-btn btn-game"
        >
          상점 나가기
        </button>
      </div>

      {/* 구매 확인 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2">
          <div
            className="shop-confirm-modal rounded-xl flex flex-col items-center"
            style={{
              background: 'linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
              border: '2px solid var(--gold)',
              boxShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 20px var(--gold-glow)',
            }}
          >
            {selectedItem.item.type === 'card' ? (
              <div className="shop-confirm-card">
                <Card
                  card={createCardInstance(selectedItem.item.item as CardType)}
                  isPlayable={true}
                  size="lg"
                />
              </div>
            ) : (
              <div className="shop-confirm-relic flex flex-col items-center">
                <div className="shop-confirm-relic-icon flex items-center justify-center">
                  {(selectedItem.item.item as Relic).icon ? (
                    <img
                      src={(selectedItem.item.item as Relic).icon}
                      alt={(selectedItem.item.item as Relic).name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <span className="text-6xl">❓</span>
                  )}
                </div>
                <span className="shop-confirm-relic-name font-title text-[var(--gold-light)]">
                  {(selectedItem.item.item as Relic).name}
                </span>
                <span className="shop-confirm-relic-desc font-card text-gray-400 text-center">
                  {(selectedItem.item.item as Relic).description}
                </span>
              </div>
            )}

            <div className="shop-confirm-price font-title text-[var(--gold-light)]">
              💰 {selectedItem.item.price}
            </div>

            <div className="shop-confirm-buttons flex">
              <button
                onClick={handleConfirmBuy}
                disabled={player.gold < selectedItem.item.price}
                className={`shop-confirm-buy rounded-lg font-title transition-all ${
                  player.gold >= selectedItem.item.price
                    ? 'hover:scale-105'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{
                  background: player.gold >= selectedItem.item.price
                    ? 'linear-gradient(180deg, #22c55e 0%, #166534 100%)'
                    : 'var(--bg-dark)',
                  border: `2px solid ${player.gold >= selectedItem.item.price ? '#4ade80' : '#444'}`,
                  color: player.gold >= selectedItem.item.price ? 'white' : '#666',
                }}
              >
                구매
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="shop-confirm-cancel rounded-lg font-title text-gray-400 hover:text-white transition-colors"
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
            <h2 className="font-title text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--attack-light)] mb-2 sm:mb-4 md:mb-6 text-center">
              제거할 카드 선택
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 sm:gap-2 md:gap-3 lg:gap-4 scale-60 sm:scale-75 md:scale-90 lg:scale-100 origin-top">
              {player.deck.map(card => (
                <div
                  key={card.instanceId}
                  onClick={() => handleRemoveCard(card.instanceId)}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <Card card={card} size="sm" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRemoveModal(false)}
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
